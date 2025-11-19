"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ActivitySelectionCard from "@/components/volunteer/ActivitySelectionCard";
import OnboardingProgressBar from "@/components/volunteer/OnboardingProgressBar";
import InteractiveChecklist from "@/components/volunteer/InteractiveChecklist";
import { ArrowRight, CheckCircle2, FileText, MessageSquare, Presentation, Download } from "lucide-react";
import Link from "next/link";

interface Topic {
  id: number;
  name: string;
  description: string;
  category: string;
  color: string;
}

interface TopicResource {
  id: number;
  resource_type: string;
  title: string;
  description: string;
  file_url: string;
  storage_path: string;
  file_type: string;
  is_required?: boolean;
}

const ONBOARDING_STEPS = [
  { id: "activity_selected", name: "Choose Activity", status: "pending" as const },
  { id: "resources_viewed", name: "View Resources", status: "pending" as const },
  { id: "group_chat_setup", name: "Group Chat", status: "pending" as const },
  { id: "presentation_created", name: "Create Presentation", status: "pending" as const },
  { id: "submitted_for_review", name: "Submit for Review", status: "pending" as const },
];

export default function VolunteerOnboardingPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [resources, setResources] = useState<TopicResource[]>([]);
  const [volunteerData, setVolunteerData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState("activity_selected");
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupChannelId, setGroupChannelId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Load volunteer data - try by user_id first, then by email in group_members
      let volunteer = null;
      const { data: volunteerByUser } = await supabase
        .from("volunteers")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (volunteerByUser) {
        volunteer = volunteerByUser;
      } else {
        // Try to find by email in group_members
        const { data: userData } = await supabase
          .from("users")
          .select("email")
          .eq("id", session.user.id)
          .single();

        if (userData?.email) {
          // Search volunteers by group_members email (using JSONB contains)
          const { data: volunteers } = await supabase
            .from("volunteers")
            .select("*");

          if (volunteers) {
            // Filter in JavaScript since JSONB contains is complex
            volunteer = volunteers.find((v: any) => {
              const members = v.group_members || [];
              return members.some((m: any) => m.email === userData.email);
            });
          }
        }
      }

      if (volunteer) {
        setVolunteerData({
          ...volunteer,
          slides_shared: volunteer.slides_shared || false
        });
        setSelectedTopic(volunteer.selected_topic_id);
        setGroupChannelId(volunteer.group_channel_id);
        setCurrentStep(volunteer.onboarding_step || "activity_selected");
        setGroupMembers(volunteer.group_members || []);

        // Load resources if topic is selected
        if (volunteer.selected_topic_id) {
          loadResources(volunteer.selected_topic_id);
        }
      } else {
        // No volunteer record found - might be a new application
        // Set default step
        setCurrentStep("activity_selected");
      }

      // Load available topics
      const { data: topicsData } = await supabase
        .from("presentation_topics")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (topicsData) {
        setTopics(topicsData);

        // Load resource counts
        for (const topic of topicsData) {
          const { count } = await supabase
            .from("topic_resources")
            .select("*", { count: "exact", head: true })
            .eq("topic_id", topic.id);
          // We'll display this in the card
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async (topicId: number) => {
    const { data } = await supabase
      .from("topic_resources")
      .select("*")
      .eq("topic_id", topicId)
      .order("display_order");

    if (data) {
      setResources(data);
    }
  };

  const handleSelectTopic = async (topicId: number) => {
    try {
      const response = await fetch("/api/volunteer-onboarding/select-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || "Failed to select topic");
      }

      setSelectedTopic(topicId);
      setCurrentStep("resources_viewed");
      await loadResources(topicId);
      
      // Reload volunteer data
      await loadData();
    } catch (error: any) {
      console.error("Error selecting topic:", error);
      alert(error.message || "Failed to select topic. Please try again.");
    }
  };

  const handleCreateGroupChat = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Create channel via API
      const response = await fetch("/api/volunteer-onboarding/create-group-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: volunteerData?.id,
          groupMembers: groupMembers,
        }),
      });

      const result = await response.json();
      if (!result.ok) throw new Error(result.error);

      setGroupChannelId(result.channelId);
      setCurrentStep("presentation_created");

      // Update volunteer record
      await supabase
        .from("volunteers")
        .update({
          group_channel_id: result.channelId,
          onboarding_step: "presentation_created",
        })
        .eq("user_id", session.user.id);
    } catch (error: any) {
      console.error("Error creating group chat:", error);
      alert(error.message || "Failed to create group chat. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container py-14">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Determine which step to show
  const showActivitySelection = !selectedTopic;
  const showResources = selectedTopic && currentStep === "resources_viewed";
  const showGroupChat = selectedTopic && currentStep === "group_chat_setup";
  const showPresentation = currentStep === "presentation_created" || currentStep === "submitted_for_review";

  return (
    <div className="container py-14">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Volunteer Onboarding</h1>
          <p className="text-gsv-gray">
            Welcome! Let&apos;s get you set up to deliver your first presentation.
          </p>
        </div>

        <OnboardingProgressBar steps={ONBOARDING_STEPS} currentStep={currentStep} />

        {/* Step 1: Activity Selection */}
        {showActivitySelection && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gsv-charcoal mb-4">Step 1: Choose Your Activity</h2>
            <p className="text-gsv-gray mb-6">
              Select a presentation topic that interests you and your group. You&apos;ll receive resources
              and guides to help you create your presentation.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <ActivitySelectionCard
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedTopic === topic.id}
                  onSelect={handleSelectTopic}
                  resourceCount={0} // TODO: Load actual count
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: View Resources */}
        {showResources && selectedTopic && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gsv-charcoal">Step 2: Resources & Materials</h2>
              <button
                onClick={() => setCurrentStep("group_chat_setup")}
                className="text-gsv-green hover:underline"
              >
                Skip to Group Chat →
              </button>
            </div>
            <p className="text-gsv-gray mb-6">
              Here are the resources to help you create your presentation. Download the base
              presentation template and activity guide.
            </p>

            {resources.length === 0 ? (
              <div className="text-center py-8 text-gsv-gray">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No resources available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gsv-green transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {resource.resource_type === "base_presentation" && (
                            <Presentation className="w-5 h-5 text-gsv-green" />
                          )}
                          {resource.resource_type === "activity_guide" && (
                            <FileText className="w-5 h-5 text-blue-500" />
                          )}
                          {resource.resource_type === "rubric" && (
                            <FileText className="w-5 h-5 text-purple-500" />
                          )}
                          <h3 className="font-semibold text-gsv-charcoal">{resource.title}</h3>
                          {resource.is_required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {resource.description && (
                          <p className="text-sm text-gsv-gray mb-2">{resource.description}</p>
                        )}
                        <div className="text-xs text-gsv-gray">
                          Type: {resource.file_type} • {resource.resource_type.replace("_", " ")}
                        </div>
                      </div>
                      <a
                        href={resource.file_url || `/api/resources/download?path=${resource.storage_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep("group_chat_setup")}
                className="w-full md:w-auto px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center justify-center gap-2"
              >
                Continue to Group Chat Setup
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Group Chat Setup */}
        {showGroupChat && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gsv-charcoal mb-4">Step 3: Group Chat Setup</h2>
            <p className="text-gsv-gray mb-6">
              We&apos;ll create a group chat for your team. Please make sure all group members text the
              group chat with their name and phone number.
            </p>

            {groupChannelId ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Group Chat Created!</span>
                </div>
                <p className="text-sm text-green-600 mb-4">
                  Your group chat has been created. Share this link with your team members.
                </p>
                <Link
                  href={`/channels/${groupChannelId}`}
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Open Group Chat
                </Link>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Group Members</h3>
                  <div className="space-y-2">
                    {groupMembers.map((member: any, index: number) => (
                      <div key={index} className="text-sm text-blue-800">
                        {member.name} - {member.email} - {member.phone || "No phone"}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                    <li>Click &quot;Create Group Chat&quot; below</li>
                    <li>Share the group chat link with all your team members</li>
                    <li>Ask each member to text the group chat with their name and phone number</li>
                    <li>Once everyone has joined, you can start coordinating your presentation</li>
                  </ol>
                </div>

                <button
                  onClick={handleCreateGroupChat}
                  className="w-full px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Create Group Chat
                </button>
              </div>
            )}

            {groupChannelId && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep("presentation_created")}
                  className="w-full md:w-auto px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition flex items-center justify-center gap-2"
                >
                  Continue to Presentation Creation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Presentation Creation */}
        {showPresentation && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gsv-charcoal mb-4">Step 4: Create Your Presentation</h2>
            <p className="text-gsv-gray mb-6">
              Use the base presentation template you downloaded to create your presentation. Once
              you&apos;re done, submit it for review.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Slides Presentation Link
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/presentation/..."
                  className="w-full border rounded-lg px-3 py-2"
                  defaultValue={volunteerData?.presentation_draft_url || ""}
                  onChange={async (e) => {
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (session) {
                      // Validate Google Slides URL
                      const url = e.target.value;
                      const isValidGoogleSlides = url.includes('docs.google.com/presentation') || url.includes('docs.google.com/spreadsheets') || url.includes('docs.google.com/document');
                      
                      if (url && !isValidGoogleSlides) {
                        e.target.setCustomValidity("Please enter a valid Google Slides, Docs, or Sheets URL");
                        return;
                      } else {
                        e.target.setCustomValidity("");
                      }
                      
                      await supabase
                        .from("volunteers")
                        .update({ presentation_draft_url: e.target.value })
                        .eq("user_id", session.user.id);
                    }
                  }}
                  onBlur={(e) => {
                    const url = e.target.value;
                    if (url) {
                      const isValidGoogleSlides = url.includes('docs.google.com/presentation') || url.includes('docs.google.com/spreadsheets') || url.includes('docs.google.com/document');
                      if (!isValidGoogleSlides) {
                        e.target.setCustomValidity("Please enter a valid Google Slides, Docs, or Sheets URL");
                      } else {
                        e.target.setCustomValidity("");
                      }
                    }
                  }}
                />
                <p className="text-xs text-gsv-gray mt-1">
                  Share your Google Slides presentation and paste the link here
                </p>
              </div>

              {/* Sharing Reminder */}
              {volunteerData?.presentation_draft_url && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        Important: Share Your Presentation
                      </h3>
                      <p className="text-sm text-yellow-800 mb-3">
                        Make sure your Google Slides is shared with <strong>greensiliconvalley27@gmail.com</strong> with <strong>&apos;Viewer&apos;</strong> or <strong>&apos;Commenter&apos;</strong> access.
                      </p>
                      <a
                        href="https://support.google.com/docs/answer/2494822"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-yellow-900 underline hover:text-yellow-700 mb-3 inline-block"
                      >
                        Learn how to share Google Slides →
                      </a>
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={volunteerData?.slides_shared || false}
                          onChange={async (e) => {
                            const {
                              data: { session },
                            } = await supabase.auth.getSession();
                            if (session) {
                              await supabase
                                .from("volunteers")
                                .update({ 
                                  slides_shared: e.target.checked,
                                  slides_shared_at: e.target.checked ? new Date().toISOString() : null
                                })
                                .eq("user_id", session.user.id);
                              setVolunteerData({ ...volunteerData, slides_shared: e.target.checked });
                            }
                          }}
                          className="w-4 h-4 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm font-medium text-yellow-900">
                          I have shared the presentation with greensiliconvalley27@gmail.com
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {volunteerData?.presentation_draft_url && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Presentation Link Saved</span>
                  </div>
                  <a
                    href={volunteerData.presentation_draft_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline block mb-2"
                  >
                    {volunteerData.presentation_draft_url}
                  </a>
                  <button
                    onClick={() => window.open(volunteerData.presentation_draft_url, '_blank')}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Open in New Tab
                  </button>
                </div>
              )}

              <button
                onClick={async () => {
                  if (!volunteerData?.presentation_draft_url) {
                    alert("Please enter your presentation link first");
                    return;
                  }

                  if (!volunteerData?.slides_shared) {
                    alert("Please confirm that you have shared the presentation with greensiliconvalley27@gmail.com");
                    return;
                  }

                  const {
                    data: { session },
                  } = await supabase.auth.getSession();
                  if (!session) return;

                  // Update status and create notification for founders
                  await supabase
                    .from("volunteers")
                    .update({ 
                      onboarding_step: "submitted_for_review",
                      presentation_status: "submitted_for_review"
                    })
                    .eq("user_id", session.user.id);

                  // Create notification for founders
                  const { data: founders } = await supabase
                    .from("users")
                    .select("id")
                    .eq("role", "founder");

                  if (founders && founders.length > 0) {
                    const notifications = founders.map(founder => ({
                      user_id: founder.id,
                      notification_type: "presentation_submitted",
                      title: "New Presentation Submitted",
                      message: `Team ${volunteerData?.team_name || 'Unknown'} submitted their presentation for review`,
                      action_url: `/dashboard/founder/volunteers/${volunteerData?.id}/review`,
                      related_id: volunteerData?.id,
                      related_type: "volunteer"
                    }));

                    await supabase.from("notifications").insert(notifications);
                  }

                  setCurrentStep("submitted_for_review");

                  alert("Presentation submitted for review! We'll contact you soon.");
                }}
                disabled={!volunteerData?.presentation_draft_url || !volunteerData?.slides_shared}
                className="w-full md:w-auto px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit for Review
              </button>
            </div>
          </div>
        )}

        {/* Completed State */}
        {currentStep === "submitted_for_review" && (
          <div className="card p-6 bg-green-50 border-2 border-green-200">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Presentation Submitted!</h2>
              <p className="text-green-700 mb-6">
                Your presentation has been submitted for review. We&apos;ll contact you within 48 hours
                with feedback and next steps.
              </p>
              <Link
                href="/dashboard/volunteer"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Interactive Progress Checklist */}
        {volunteerData?.id && (
          <div className="mt-8">
            <InteractiveChecklist
              volunteerTeamId={volunteerData.id}
              onItemComplete={(itemId, completed) => {
                // Reload data when checklist is updated
                loadData();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

