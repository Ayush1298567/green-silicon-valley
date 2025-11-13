import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getUserRoleServer } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const role = await getUserRoleServer(supabase as any);
    
    if (role !== "founder" && role !== "intern") {
      return NextResponse.json(
        { ok: false, error: "Forbidden: Only founders and interns can approve volunteers" },
        { status: 403 }
      );
    }

    const volunteerId = parseInt(params.id);
    if (!volunteerId || isNaN(volunteerId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid volunteer ID" },
        { status: 400 }
      );
    }

    // Get volunteer record with group members
    const { data: volunteer, error: fetchError } = await supabase
      .from("volunteers")
      .select("*")
      .eq("id", volunteerId)
      .single();

    if (fetchError || !volunteer) {
      return NextResponse.json(
        { ok: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    if (volunteer.application_status === "approved") {
      return NextResponse.json(
        { ok: false, error: "Volunteer team already approved" },
        { status: 400 }
      );
    }

    const groupMembers = volunteer.group_members || [];
    if (!Array.isArray(groupMembers) || groupMembers.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Invalid group members data" },
        { status: 400 }
      );
    }

    // Use admin client to create auth users
    const adminSupabase = getAdminSupabase();
    const createdUsers: Array<{ user_id: string; email: string; name: string }> = [];
    const errors: Array<{ email: string; error: string }> = [];

    // Create user accounts for all team members
    for (const member of groupMembers) {
      if (!member.email || !member.name) continue;

      try {
        // Check if user already exists
        let userId: string;
        let isNewUser = false;
        
        try {
          const { data: existingUser } = await adminSupabase.auth.admin.getUserByEmail(member.email);
          
          if (existingUser?.user) {
            // User already exists, use their ID
            userId = existingUser.user.id;
          } else {
            // Create new auth user with temporary password
            isNewUser = true;
            const tempPassword = generateTempPassword();
            const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
              email: member.email,
              password: tempPassword,
              email_confirm: true, // Auto-confirm email
              user_metadata: {
                full_name: member.name,
                phone: member.phone || "",
                highschool: member.highschool || "",
              },
            });

            if (createError || !newUser.user) {
              errors.push({ email: member.email, error: createError?.message || "Failed to create user" });
              continue;
            }

            userId = newUser.user.id;

            // Send welcome email with login credentials
            if (process.env.SMTP_URL) {
              try {
                await sendEmail({
                  to: member.email,
                  subject: "Welcome to Green Silicon Valley - Your Account is Ready!",
                  text: `Hello ${member.name},

Your volunteer application has been approved! Your account has been created.

Login credentials:
Email: ${member.email}
Temporary Password: ${tempPassword}

Please log in at ${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"}/login and change your password immediately.

You are part of the team: ${volunteer.team_name || "Volunteer Team"}

Welcome aboard!
Green Silicon Valley Team`,
                });
              } catch (emailError) {
                console.error(`Failed to send email to ${member.email}:`, emailError);
              }
            }
          }
        } catch (authError: any) {
          errors.push({ email: member.email, error: authError.message || "Auth error" });
          continue;
        }

        // Create or update users table entry
        const { error: upsertError } = await supabase
          .from("users")
          .upsert({
            id: userId,
            email: member.email,
            name: member.name,
            role: "volunteer",
            user_category: "volunteer",
            permissions: [],
            status: "active",
          }, {
            onConflict: "id",
          });

        if (upsertError) {
          errors.push({ email: member.email, error: upsertError.message });
          continue;
        }

        // Link user to team
        const isPrimaryContact = member.email === volunteer.email || member.phone === volunteer.primary_contact_phone;
        
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .upsert({
            volunteer_team_id: volunteerId,
            user_id: userId,
            member_name: member.name,
            member_email: member.email,
            member_phone: member.phone || null,
            member_highschool: member.highschool || null,
            is_primary_contact: isPrimaryContact,
          }, {
            onConflict: "volunteer_team_id,user_id",
          });

        if (teamMemberError) {
          console.error(`Failed to link ${member.email} to team:`, teamMemberError);
        }

        // Record signup source
        await supabase.from("user_signup_sources").upsert({
          user_id: userId,
          email: member.email,
          source_type: "volunteer_form",
          source_reference_id: volunteerId,
          source_metadata: { team_name: volunteer.team_name },
        }, {
          onConflict: "user_id,source_type",
        });

        createdUsers.push({
          user_id: userId,
          email: member.email,
          name: member.name,
        });
      } catch (error: any) {
        errors.push({ email: member.email, error: error.message || "Unknown error" });
      }
    }

    if (createdUsers.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Failed to create any user accounts", errors },
        { status: 500 }
      );
    }

    // Update volunteer status to approved
    const { error: updateError } = await supabase
      .from("volunteers")
      .update({
        application_status: "approved",
        status: "active",
        approved_at: new Date().toISOString(),
        onboarding_step: "activity_selected", // Start onboarding flow
      })
      .eq("id", volunteerId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Log the approval
    await supabase.from("system_logs").insert({
      event_type: "volunteer_approved",
      description: JSON.stringify({
        volunteer_id: volunteerId,
        team_name: volunteer.team_name,
        members_created: createdUsers.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
    });

    return NextResponse.json({
      ok: true,
      message: `Successfully approved team and created ${createdUsers.length} user account(s)`,
      created_users: createdUsers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to approve volunteer" },
      { status: 500 }
    );
  }
}

function generateTempPassword(): string {
  // Generate a secure temporary password
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

