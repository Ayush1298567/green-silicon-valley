import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { emailService } from "@/lib/email/email-service";
import { withErrorHandling, ValidationError } from "@/lib/errors/error-handler";

async function handleUrgentContact(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();

  const { name, email, phone, schoolName, urgency, subject, message } = body;

  // Validate required fields
  if (!name || !email || !phone || !schoolName || !subject || !message) {
    throw new ValidationError('All fields are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Create urgent contact record
  const { data: contact, error: insertError } = await supabase
    .from('urgent_contacts')
    .insert({
      name,
      email,
      phone,
      school_name: schoolName,
      urgency: urgency || 'medium',
      subject,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create contact record: ${insertError.message}`);
  }

  // Send urgent contact alert email to support team
  try {
    await emailService.sendUrgentContactAlert({
      name,
      email,
      phone,
      schoolName,
      urgency: urgency || 'medium',
      subject,
      message
    });
  } catch (emailError) {
    console.error('Failed to send urgent contact email:', emailError);
    // Don't fail the request if email fails - contact is still saved
  }

  // Create notification for founders
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: null, // Will be sent to all founders
        type: 'urgent_contact',
        title: `Urgent: ${subject}`,
        message: `${name} from ${schoolName} needs immediate assistance`,
        priority: urgency === 'high' ? 'urgent' : 'high',
        related_entity_id: email,
        related_entity_type: 'urgent_contact',
        created_at: new Date().toISOString()
      });
  } catch (notificationError) {
    console.error('Failed to create notification:', notificationError);
    // Don't fail the request if notification fails
  }

  return NextResponse.json({
    success: true,
    message: 'Urgent contact request submitted successfully',
    contactId: contact.id
  });
}

export const POST = withErrorHandling(handleUrgentContact);
