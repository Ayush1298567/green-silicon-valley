"use client";

import { useState, useEffect } from "react";
import { validateVolunteerForm, getFieldError, type ValidationError } from "@/lib/validation";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface GroupMember {
  name: string;
  email: string;
  phone: string;
  highschool: string;
}

export default function VolunteerSignupForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [groupSize, setGroupSize] = useState(3);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  const totalSections = 12;

  // Initialize group members on mount
  useEffect(() => {
    if (groupMembers.length === 0) {
      const members: GroupMember[] = [];
      for (let i = 0; i < 7; i++) {
        members.push({ name: "", email: "", phone: "", highschool: "" });
      }
      setGroupMembers(members);
    }
  }, []);

  const handleGroupSizeChange = (size: number) => {
    setGroupSize(size);
    // Initialize group members array - always create 7 slots, but only require first &apos;size&apos; members
    const members: GroupMember[] = [];
    for (let i = 0; i < 7; i++) {
      members.push({ name: "", email: "", phone: "", highschool: "" });
    }
    setGroupMembers(members);
  };


  const handleMemberChange = (index: number, field: keyof GroupMember, value: string) => {
    const updated = [...groupMembers];
    updated[index] = { ...updated[index], [field]: value };
    setGroupMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setValidationErrors([]);

    const formData = new FormData(e.currentTarget);

    // Validate group members
    const validMembers = groupMembers.filter(
      (m) => m.name && m.email && m.phone && m.highschool && m.name !== "N/A"
    );

    const data = {
      email: formData.get("email"),
      group_city: formData.get("group_city"),
      group_size: groupSize,
      group_year: formData.get("group_year"),
      group_members: validMembers,
      primary_contact_phone: formData.get("primary_contact_phone"),
      preferred_grade_level: formData.get("preferred_grade_level"),
      in_santa_clara_usd: formData.get("in_santa_clara_usd") === "yes",
      how_heard: formData.get("how_heard"),
      why_volunteer: formData.get("why_volunteer"),
    };

    // Validate form
    const validation = validateVolunteerForm(data);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setSubmitting(false);
      // Scroll to first error
      if (validation.errors.length > 0) {
        const firstErrorField = document.querySelector(`[name="${validation.errors[0].field}"]`);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
          (firstErrorField as HTMLElement).focus();
        }
      }
      return;
    }

    try {
      const response = await fetch("/api/forms/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-6 max-w-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gsv-green mb-2">Application Submitted!</h2>
          <p className="text-gsv-gray mb-4">
            Thank you for your interest in volunteering with Green Silicon Valley!
          </p>
          <p className="text-sm text-gsv-gray mb-4">
            You will receive an email from us within 48 hours. Please check your emails! 
            We will also make a group chat with you all to communicate.
          </p>
          <p className="text-sm text-gsv-gray">
            If you do not receive a response in 48 hours, please text: (408) 647-6201
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Environmental STEM Outreach Volunteer Sign-Up</h1>
          <span className="text-sm text-gsv-gray">
            Section {currentSection} of {totalSections}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gsv-green h-2 rounded-full transition-all"
            style={{ width: `${(currentSection / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Introduction */}
        {currentSection === 1 && (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gsv-gray mb-4">
                Hey! Thanks for your interest in volunteering with us! The directions for filling out 
                the form are below - make sure to read before filling out the form!
              </p>
              <p className="text-gsv-gray mb-4">
                We&apos;re running a continuation of an organization that received a 5k grant from Silicon 
                Valley Power a couple years ago where high school students create short, fun STEM 
                presentations and activities for younger students all focused on how STEM can be used 
                to help the environment. Please read the directions below, this should only take 10-15 
                mins to fill out. This is an extremely rewarding volunteer process.
              </p>
              <h3 className="font-semibold mb-2">Here&apos;s how it works:</h3>
              <ul className="list-disc list-inside text-gsv-gray mb-4 ml-4 space-y-1">
                <li>You&apos;ll make a group of 3-7 students from your school.</li>
                <li>Put together a short Google Slides presentation + activity for middle or elementary students. (We will give you a base presentation + rubric that you can then edit to fit to how you would like to present)</li>
                <li>We&apos;ll have 2-3 quick meetings (5-10 mins each) with you before you present.</li>
                <li>Once approved by us you will present it at a school - we&apos;ll connect your group with one of the schools/teachers we&apos;ve partnered with</li>
                <li>Overall it should be a pretty quick, simple, and fun process!</li>
              </ul>
              <h3 className="font-semibold mb-2">What you&apos;ll get:</h3>
              <ul className="list-disc list-inside text-gsv-gray mb-4 ml-4 space-y-1">
                <li>Earn 6–8 volunteer hours per session (and you can present as many times as you want).</li>
                <li>Build leadership & teamwork skills.</li>
                <li>A rewarding experience mentoring the youth.</li>
                <li>Looks great on college apps</li>
              </ul>
              <p className="text-sm text-gsv-gray mb-4">
                You will get your hours signed by an administrator of the Wilcox Business Experience. 
                This organization is run by the Wilcox Business Experience through a 5k grant from 
                Silicon Valley Power that we received 1 year ago. You will have an excused absence 
                slip that a Wilcox Business Club administrator will issue to you, when you are 
                approved by GSV to present.
              </p>
              <h3 className="font-semibold mb-2">What Happens After You Submit:</h3>
              <p className="text-gsv-gray mb-4">
                - You will get an email from one of us here at Green Silicon Valley. Please check your 
                emails! We will also make a group chat with you guys to communicate. If you do not 
                receive a response in 48 hours please text this number: (408) 647-6201
              </p>
              <p className="font-semibold text-gsv-gray mb-4">
                Remember: ONLY ONE PERSON FILLS THIS FORM OUT PER GROUP!!! Fill out this form with
                your group info and choices. Once you submit, we&apos;ll send you next steps within 48 hours!
              </p>
            </div>
            <FormField
              label="Email"
              required
              error={getFieldError("email", validationErrors)}
              helpText="This form is collecting emails. Change settings"
            >
              <input
                type="email"
                name="email"
                required
                className={`w-full border rounded-lg px-3 py-2 ${
                  getFieldError("email", validationErrors) ? "border-red-500" : ""
                }`}
                placeholder="your.email@example.com"
              />
            </FormField>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentSection(2)}
                className="flex-1 rounded-lg bg-gsv-green px-4 py-2 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Group Member General Information */}
        {currentSection === 2 && (
          <div className="space-y-4">
            <p className="text-gsv-gray mb-4">
              We will make a group chat on messages or slack to coordinate with you all. We will
              contact you all through email first. If we don&apos;t get a reply within 5 days of sending
              out an email we will try to reach you all on messages.
            </p>
            <FormField
              label="What city is the majority of your group located in?"
              required
              error={getFieldError("group_city", validationErrors)}
            >
              <input
                type="text"
                name="group_city"
                required
                className={`w-full border rounded-lg px-3 py-2 ${
                  getFieldError("group_city", validationErrors) ? "border-red-500" : ""
                }`}
                placeholder="e.g., San Jose, Santa Clara"
              />
            </FormField>
            <div>
              <label className="block text-sm font-medium mb-1">
                How many people are in your group? <span className="text-red-500">*</span>
              </label>
              <select
                name="group_size"
                required
                value={groupSize}
                onChange={(e) => handleGroupSizeChange(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="3">3 people</option>
                <option value="4">4 people</option>
                <option value="5">5 people</option>
                <option value="6">6 people</option>
                <option value="7">7 people</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                What year of high school is the majority of your group in? <span className="text-red-500">*</span>
              </label>
              <select
                name="group_year"
                required
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentSection(1)}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentSection(3)}
                className="flex-1 rounded-lg bg-gsv-green px-4 py-2 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Sections 3-9: Member Information */}
        {currentSection >= 3 && currentSection <= 9 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Member {currentSection - 2} Information
            </h2>
            {currentSection - 3 >= groupSize && (
              <p className="text-sm text-gsv-gray mb-4">
                Put N/A if not applicable
              </p>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Member {currentSection - 2} name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required={currentSection - 3 < groupSize}
                value={groupMembers[currentSection - 3]?.name || ""}
                onChange={(e) => handleMemberChange(currentSection - 3, "name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={currentSection - 3 >= groupSize ? "N/A" : "Full name"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Member {currentSection - 2} email: <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required={currentSection - 3 < groupSize}
                value={groupMembers[currentSection - 3]?.email || ""}
                onChange={(e) => handleMemberChange(currentSection - 3, "email", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={currentSection - 3 >= groupSize ? "N/A" : "email@example.com"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Member {currentSection - 2} phone number: {currentSection - 3 < groupSize && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                required={currentSection - 3 < groupSize}
                value={groupMembers[currentSection - 3]?.phone || ""}
                onChange={(e) => handleMemberChange(currentSection - 3, "phone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={currentSection - 3 >= groupSize ? "N/A" : "(408) 555-1234"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Highschool? {currentSection - 3 < groupSize && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                required={currentSection - 3 < groupSize}
                value={groupMembers[currentSection - 3]?.highschool || ""}
                onChange={(e) => handleMemberChange(currentSection - 3, "highschool", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={currentSection - 3 >= groupSize ? "N/A" : "School name"}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection - 1)}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                className="flex-1 rounded-lg bg-gsv-green px-4 py-2 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Section 10: Volunteering Details */}
        {currentSection === 10 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                What grade level do you prefer to present to? (may not get first choice) <span className="text-red-500">*</span>
              </label>
              <select
                name="preferred_grade_level"
                required
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select grade level</option>
                <option value="Elementary (K–5)">Elementary (K–5)</option>
                <option value="Middle School (6–8)">Middle School (6–8)</option>
                <option value="No preference">No preference</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Are you in Santa Clara Unified School District? <span className="text-red-500">*</span>
              </label>
              <select
                name="in_santa_clara_usd"
                required
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Please put the phone number of one group member below. We may need to contact this person before we send out a group email. <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="primary_contact_phone"
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="(408) 555-1234"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentSection(9)}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentSection(11)}
                className="flex-1 rounded-lg bg-gsv-green px-4 py-2 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Section 11: Additional */}
        {currentSection === 11 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                How did you hear about us? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="how_heard"
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., School announcement, friend, social media"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                In 1-2 sentences summarize why you would like to volunteer with us. (doesn&apos;t need to be an essay) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="why_volunteer"
                required
                rows={4}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Tell us why you&apos;re interested..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentSection(10)}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentSection(12)}
                className="flex-1 rounded-lg bg-gsv-green px-4 py-2 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Section 12: Final Review */}
        {currentSection === 12 && (
          <div className="space-y-4">
            <p className="text-gsv-gray mb-4">
              Make sure your group checks their emails for the next 48 hours, we will contact your 
              group within that time! If your group does not respond within 5 days we will try again 
              to reach out through the phone number provided, if that does not work, we will disregard 
              the application.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentSection(11)}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-gsv-green px-4 py-2 text-white font-medium hover:bg-gsv-greenDark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

