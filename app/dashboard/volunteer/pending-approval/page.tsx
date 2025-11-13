import { getServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, Clock, Mail, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const supabase = getServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/login");
  }

  const email = session.user.email || "";
  
  // Check if user has a pending volunteer application
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id, team_name, application_status, submitted_at, group_members")
    .or(`email.eq.${email},group_members->>email.eq.${email}`)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  // Check if user is part of an approved team
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("volunteer_team_id")
    .eq("user_id", session.user.id)
    .single();

  if (teamMember || volunteer?.application_status === "approved") {
    redirect("/dashboard/volunteer");
  }

  return (
    <div className="container py-14">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-4">
            Application Pending Approval
          </h1>
          
          <p className="text-gsv-gray mb-6 text-lg">
            Thank you for submitting your volunteer application! Your team's application is currently being reviewed by our team.
          </p>

          {volunteer && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-lg mb-4">Application Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gsv-gray">Team Name:</span>
                  <span className="font-medium">{volunteer.team_name || "Pending"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gsv-gray">Status:</span>
                  <span className="font-medium capitalize">{volunteer.application_status || "pending"}</span>
                </div>
                {volunteer.submitted_at && (
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Submitted:</span>
                    <span className="font-medium">
                      {new Date(volunteer.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {volunteer.group_members && Array.isArray(volunteer.group_members) && (
                  <div className="flex justify-between">
                    <span className="text-gsv-gray">Team Members:</span>
                    <span className="font-medium">{volunteer.group_members.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What Happens Next?
            </h3>
            <ul className="text-left text-blue-800 space-y-2 text-sm">
              <li>• Our team will review your application within 48 hours</li>
              <li>• You'll receive an email notification once your application is approved</li>
              <li>• Once approved, you'll get access to your volunteer dashboard</li>
              <li>• You'll be able to start the onboarding process and select your presentation topic</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <p className="text-sm text-gsv-gray mb-4">
              If you have questions or haven't heard back within 48 hours, please contact us:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:greensiliconvalley27@gmail.com" className="flex items-center gap-2 text-gsv-green hover:underline">
                <Mail className="w-4 h-4" />
                greensiliconvalley27@gmail.com
              </a>
              <a href="tel:4086476201" className="flex items-center gap-2 text-gsv-green hover:underline">
                <Phone className="w-4 h-4" />
                (408) 647-6201
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

