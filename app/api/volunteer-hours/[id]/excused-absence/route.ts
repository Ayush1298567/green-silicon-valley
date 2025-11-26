import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the volunteer hours record
    const { data: hours, error } = await supabase
      .from("volunteer_hours")
      .select(`
        id,
        hours_logged,
        activity,
        status,
        excused_absence_pdf_url,
        verification_method,
        presentations (
          topic,
          scheduled_date,
          schools (
            name,
            teacher_name
          )
        ),
        volunteers (
          team_name
        ),
        users!submitted_by (
          name
        )
      `)
      .eq("id", params.id)
      .eq("submitted_by", session.user.id) // Only allow access to own hours
      .single();

    if (error || !hours) {
      return NextResponse.json({ ok: false, error: "Hours record not found" }, { status: 404 });
    }

    if (hours.status !== "verified") {
      return NextResponse.json({ ok: false, error: "Hours must be verified before downloading excused absence" }, { status: 403 });
    }

    if (!hours.excused_absence_pdf_url) {
      return NextResponse.json({ ok: false, error: "Excused absence PDF not available" }, { status: 404 });
    }

    // Read the PDF file
    const pdfPath = hours.excused_absence_pdf_url;
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ ok: false, error: "PDF file not found" }, { status: 404 });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="excused_absence_${hours.users.name}_${params.id}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("Error downloading excused absence PDF:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
