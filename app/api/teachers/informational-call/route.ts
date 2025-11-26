import { NextRequest, NextResponse } from "next/server";
import { getServerComponentClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    const body = await request.json();
    const { teacherName, email, phone, schoolName, preferredTime, notes } = body;

    // Create the informational call request
    const { data: callRequest, error } = await supabase
      .from("teacher_informational_calls")
      .insert({
        teacher_name: teacherName,
        email,
        phone,
        school_name: schoolName,
        preferred_time: preferredTime,
        notes,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send confirmation email to teacher
    // TODO: Send notification email to GSV team about new call request

    return NextResponse.json({
      success: true,
      requestId: callRequest.id,
      message: "Informational call request submitted successfully. We'll contact you within 3-5 business days."
    });
  } catch (error) {
    console.error("Error submitting informational call request:", error);
    return NextResponse.json(
      { error: "Failed to submit informational call request" },
      { status: 500 }
    );
  }
}
