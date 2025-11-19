import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Collect all user data
    const exportData: any = {
      exportDate: new Date().toISOString(),
      userId: userId,
      data: {}
    };

    // User profile
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (user) {
      exportData.data.user = user;
    }

    // User preferences
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (preferences) {
      exportData.data.preferences = preferences;
    }

    // Volunteer data (if applicable)
    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (volunteer) {
      exportData.data.volunteer = volunteer;
    }

    // Presentations
    const { data: presentations } = await supabase
      .from("presentations")
      .select("*")
      .eq("school_id", userId); // If user is a teacher/school

    if (presentations && presentations.length > 0) {
      exportData.data.presentations = presentations;
    }

    // Applications/Documents
    const { data: documents } = await supabase
      .from("volunteer_documents")
      .select("*")
      .eq("volunteer_id", userId);

    if (documents && documents.length > 0) {
      exportData.data.documents = documents;
    }

    // Emergency contacts
    const { data: emergencyContacts } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId);

    if (emergencyContacts && emergencyContacts.length > 0) {
      exportData.data.emergencyContacts = emergencyContacts;
    }

    // Budget transactions (if founder/intern)
    const { data: budgetTransactions } = await supabase
      .from("budget_transactions")
      .select("*")
      .eq("created_by", userId);

    if (budgetTransactions && budgetTransactions.length > 0) {
      exportData.data.budgetTransactions = budgetTransactions;
    }

    // Safety incidents (if staff)
    const { data: safetyIncidents } = await supabase
      .from("safety_incidents")
      .select("*")
      .eq("reported_by", userId);

    if (safetyIncidents && safetyIncidents.length > 0) {
      exportData.data.safetyIncidents = safetyIncidents;
    }

    // Equipment checkouts
    const { data: equipmentCheckouts } = await supabase
      .from("equipment_checkout")
      .select("*")
      .or(`checked_out_by.eq.${userId},checked_out_to.eq.${userId}`);

    if (equipmentCheckouts && equipmentCheckouts.length > 0) {
      exportData.data.equipmentCheckouts = equipmentCheckouts;
    }

    // Certifications
    const { data: certifications } = await supabase
      .from("volunteer_certifications")
      .select("*")
      .eq("volunteer_id", userId);

    if (certifications && certifications.length > 0) {
      exportData.data.certifications = certifications;
    }

    // Login history (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: loginHistory } = await supabase
      .from("password_reset_history")
      .select("*")
      .eq("user_id", userId)
      .gte("reset_requested_at", ninetyDaysAgo.toISOString())
      .order("reset_requested_at", { ascending: false });

    if (loginHistory && loginHistory.length > 0) {
      exportData.data.loginHistory = loginHistory;
    }

    // Convert to JSON and create downloadable response
    const jsonData = JSON.stringify(exportData, null, 2);
    const filename = `gsv-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
