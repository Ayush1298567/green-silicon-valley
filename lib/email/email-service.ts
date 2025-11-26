import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found - email functionality will be disabled');
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  attachments?: any[];
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export class EmailService {
  private readonly defaultFrom: EmailRecipient = {
    email: process.env.FROM_EMAIL || 'noreply@greensiliconvalley.org',
    name: 'Green Silicon Valley'
  };

  private readonly supportEmail: EmailRecipient = {
    email: 'support@greensiliconvalley.org',
    name: 'GSV Support Team'
  };

  private readonly urgentEmail: EmailRecipient = {
    email: 'urgent@greensiliconvalley.org',
    name: 'GSV Urgent Support'
  };

  /**
   * Send an email using SendGrid
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('Email simulation:', options.subject, 'to:', options.to);
        return true; // Simulate success for development
      }

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const msg = {
        to: recipients.map(r => ({ email: r.email, name: r.name })),
        from: options.from || this.defaultFrom,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments,
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData
      };

      const result = await sgMail.send(msg);
      console.log('Email sent successfully:', result[0]?.statusCode);
      return true;

    } catch (error: any) {
      console.error('Email sending failed:', error);
      if (error.response) {
        console.error('SendGrid error response:', error.response.body);
      }
      return false;
    }
  }

  /**
   * Send welcome email to new volunteer
   */
  async sendVolunteerWelcomeEmail(volunteer: {
    name: string;
    email: string;
    teamName?: string;
  }): Promise<boolean> {
    const subject = `Welcome to Green Silicon Valley, ${volunteer.name}!`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Green Silicon Valley!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey in environmental STEM education starts now</p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${volunteer.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            We're thrilled to welcome you to our community of environmental educators! Your application has been approved, and we're excited to have you join our mission to empower every student with the knowledge and passion to protect our planet.
          </p>

          ${volunteer.teamName ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 18px;">Your Team Assignment</h3>
            <p style="margin: 0; color: #166534; font-size: 16px;">You've been assigned to: <strong>${volunteer.teamName}</strong></p>
          </div>
          ` : ''}

          <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li style="margin-bottom: 8px;">Complete your profile in the volunteer portal</li>
              <li style="margin-bottom: 8px;">Review your onboarding materials in the File Hub</li>
              <li style="margin-bottom: 8px;">Attend your first team meeting</li>
              <li style="margin-bottom: 8px;">Schedule your first presentation opportunity</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal"
               style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions? Reply to this email or contact us at ${this.supportEmail.email}
          </p>
        </div>
      </div>
    `;

    const text = `
Welcome to Green Silicon Valley, ${volunteer.name}!

We're thrilled to welcome you to our community of environmental educators! Your application has been approved.

${volunteer.teamName ? `You've been assigned to: ${volunteer.teamName}` : ''}

Next Steps:
1. Complete your profile in the volunteer portal
2. Review your onboarding materials in the File Hub
3. Attend your first team meeting
4. Schedule your first presentation opportunity

Access your dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/portal

Questions? Contact us at ${this.supportEmail.email}
    `;

    return this.sendEmail({
      to: { email: volunteer.email, name: volunteer.name },
      subject,
      html,
      text,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send teacher presentation confirmation
   */
  async sendTeacherConfirmationEmail(teacher: {
    name: string;
    email: string;
    schoolName: string;
    presentationDate: string;
    presentationTime: string;
    teamName: string;
    gradeLevel: string;
    studentCount: number;
  }): Promise<boolean> {
    const subject = `Your Green Silicon Valley Presentation is Confirmed!`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Presentation Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Environmental STEM education is coming to ${teacher.schoolName}</p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${teacher.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Great news! Your request for an environmental STEM presentation has been confirmed. The ${teacher.teamName} team will be visiting ${teacher.schoolName} to deliver an engaging, hands-on learning experience for your ${teacher.gradeLevel} students.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Presentation Details</h3>
            <div style="color: #4b5563; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${new Date(teacher.presentationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${teacher.presentationTime}</p>
              <p style="margin: 0 0 8px 0;"><strong>Grade Level:</strong> ${teacher.gradeLevel}</p>
              <p style="margin: 0 0 8px 0;"><strong>Expected Students:</strong> ${teacher.studentCount}</p>
              <p style="margin: 0 0 8px 0;"><strong>Presenting Team:</strong> ${teacher.teamName}</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">📋 What to Expect</h4>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
              <li>45-60 minute interactive presentation</li>
              <li>Hands-on environmental science activities</li>
              <li>STEM concepts explained in engaging ways</li>
              <li>Take-home materials and resources</li>
              <li>Follow-up support available</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers/presentation-day"
               style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 15px;">
              View Presentation Guide
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact"
               style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Contact Support
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions about your presentation? Reply to this email or call us at (555) 123-HELP.
            <br><br>
            We're excited to partner with you in inspiring the next generation of environmental stewards!
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: teacher.email, name: teacher.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send urgent contact notification to support team
   */
  async sendUrgentContactAlert(contact: {
    name: string;
    email: string;
    phone: string;
    schoolName: string;
    urgency: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const urgencyColors = {
      high: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
      medium: { bg: '#fef3c7', border: '#fcd34d', text: '#d97706' },
      low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' }
    };

    const colors = urgencyColors[contact.urgency as keyof typeof urgencyColors] || urgencyColors.medium;

    const subject = `URGENT: ${contact.urgency.toUpperCase()} - ${contact.subject}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 10px; padding: 30px; margin: 20px 0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: ${colors.text}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
              ${contact.urgency} Priority
            </span>
          </div>

          <h1 style="color: ${colors.text}; margin: 0 0 20px 0; text-align: center; font-size: 24px;">
            Urgent Teacher Support Request
          </h1>

          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Contact Information</h2>
            <div style="color: #4b5563; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${contact.name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${contact.email}" style="color: #22c55e;">${contact.email}</a></p>
              <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> <a href="tel:${contact.phone}" style="color: #22c55e;">${contact.phone}</a></p>
              <p style="margin: 0 0 8px 0;"><strong>School:</strong> ${contact.schoolName}</p>
            </div>
          </div>

          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Issue Details</h2>
            <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">${contact.subject}</h3>
            <div style="background: #f9fafb; border-radius: 6px; padding: 15px; border-left: 3px solid ${colors.border};">
              <p style="margin: 0; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${contact.email}"
               style="background: ${colors.text}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 10px;">
              Reply to ${contact.name}
            </a>
            <a href="tel:${contact.phone}"
               style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Call ${contact.name}
            </a>
          </div>

          <div style="background: #f9fafb; border-radius: 6px; padding: 15px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
              <strong>Response Time Guidelines:</strong><br>
              High Priority: Within 2 hours • Medium Priority: Within 4 hours • Low Priority: Within 24 hours
            </p>
          </div>
        </div>
      </div>
    `;

    // Send to support team
    const supportTeam = [
      'support@greensiliconvalley.org',
      'urgent@greensiliconvalley.org',
      'admin@greensiliconvalley.org'
    ];

    let successCount = 0;
    for (const email of supportTeam) {
      const success = await this.sendEmail({
        to: { email },
        subject,
        html,
        replyTo: { email: contact.email, name: contact.name }
      });
      if (success) successCount++;
    }

    return successCount > 0;
  }

  /**
   * Send volunteer hours approval/rejection notification
   */
  async sendHoursApprovalEmail(volunteer: {
    name: string;
    email: string;
  }, hoursData: {
    hours: number;
    presentation: string;
    date: string;
    status: 'approved' | 'rejected';
    notes?: string;
    adjustedHours?: number;
  }): Promise<boolean> {
    const statusColors = {
      approved: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', button: '#22c55e' },
      rejected: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', button: '#dc2626' }
    };

    const colors = statusColors[hoursData.status];

    const subject = hoursData.status === 'approved'
      ? `Your volunteer hours have been approved!`
      : `Update on your volunteer hours submission`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 10px; padding: 40px 30px; text-align: center;">
          <h1 style="color: ${colors.text}; margin: 0 0 10px 0; font-size: 24px;">
            ${hoursData.status === 'approved' ? '✅ Hours Approved!' : '❌ Hours Update'}
          </h1>
          <p style="color: ${colors.text}; margin: 0; font-size: 16px;">
            ${hoursData.status === 'approved'
              ? `${hoursData.adjustedHours || hoursData.hours} hours have been added to your total`
              : 'There was an issue with your hours submission'
            }
          </p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${volunteer.name},
          </p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Submission Details</h3>
            <div style="color: #4b5563; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;"><strong>Presentation:</strong> ${hoursData.presentation}</p>
              <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${new Date(hoursData.date).toLocaleDateString()}</p>
              <p style="margin: 0 0 8px 0;"><strong>Hours Submitted:</strong> ${hoursData.hours}</p>
              ${hoursData.adjustedHours && hoursData.adjustedHours !== hoursData.hours
                ? `<p style="margin: 0 0 8px 0;"><strong>Hours Approved:</strong> ${hoursData.adjustedHours}</p>`
                : ''
              }
              <p style="margin: 0 0 8px 0;"><strong>Status:</strong>
                <span style="color: ${colors.button}; font-weight: bold;"> ${hoursData.status.charAt(0).toUpperCase() + hoursData.status.slice(1)}</span>
              </p>
            </div>
          </div>

          ${hoursData.notes ? `
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">📝 Review Notes</h4>
            <p style="margin: 0; color: #92400e; line-height: 1.6;">${hoursData.notes}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/volunteer"
               style="background: ${colors.button}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              View Your Dashboard
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions about this approval? Reply to this email or contact volunteer support.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: volunteer.email, name: volunteer.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send presentation reminder emails
   */
  async sendPresentationReminder(volunteer: {
    name: string;
    email: string;
  }, reminderData: {
    presentationTitle: string;
    schoolName: string;
    date: string;
    time: string;
    daysUntil: number;
    teamName: string;
  }): Promise<boolean> {
    const reminderText = reminderData.daysUntil === 1 ? 'Tomorrow!' :
                        reminderData.daysUntil === 3 ? '3 Days Away' :
                        reminderData.daysUntil === 7 ? '1 Week Away' : 'Coming Up';

    const subject = `Presentation Reminder: ${reminderData.presentationTitle} - ${reminderText}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">📅 Presentation Reminder</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${reminderText}</p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${volunteer.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            This is a friendly reminder about your upcoming environmental STEM presentation. Your team is making a difference in students' lives!
          </p>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Presentation Details</h3>
            <div style="color: #1e40af; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;"><strong>School:</strong> ${reminderData.schoolName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${new Date(reminderData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${reminderData.time}</p>
              <p style="margin: 0 0 8px 0;"><strong>Team:</strong> ${reminderData.teamName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Days Until:</strong> ${reminderData.daysUntil}</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">🔍 Pre-Presentation Checklist</h4>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
              <li>Review presentation materials in File Hub</li>
              <li>Confirm equipment and supplies are ready</li>
              <li>Check weather/transportation plans</li>
              <li>Review student information and special needs</li>
              <li>Coordinate with your presentation team</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/volunteer"
               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-right: 15px;">
              View Dashboard
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/volunteer/file-hub"
               style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Access Files
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Need help or have questions? Contact your team captain or reply to this email.
            <br><br>
            Thank you for your dedication to environmental STEM education! 🌱
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: volunteer.email, name: volunteer.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send application approval email to volunteer
   */
  async sendVolunteerApplicationApproval(volunteer: {
    name: string;
    email: string;
    teamName?: string;
  }): Promise<boolean> {
    const subject = `Your Volunteer Application Has Been Approved! 🎉`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Application Approved!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome to Green Silicon Valley</p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${volunteer.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Great news! Your volunteer application has been approved. We&apos;re excited to have you join our mission to bring environmental STEM education to students!
          </p>

          ${volunteer.teamName ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px;">Your Team</h3>
            <p style="margin: 0; color: #166534; line-height: 1.6;">
              <strong>Team Name:</strong> ${volunteer.teamName}
            </p>
          </div>
          ` : ''}

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8;">
              <li>Complete your onboarding process</li>
              <li>Choose your presentation topic</li>
              <li>Set up your team communication</li>
              <li>Start preparing your first presentation!</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/volunteer/onboarding"
               style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Start Onboarding
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions? Reply to this email or contact volunteer support. We&apos;re here to help!
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: volunteer.email, name: volunteer.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send application rejection email to volunteer
   */
  async sendVolunteerApplicationRejection(volunteer: {
    name: string;
    email: string;
    reason?: string;
  }): Promise<boolean> {
    const subject = `Update on Your Volunteer Application`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Application Update</h1>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${volunteer.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Thank you for your interest in volunteering with Green Silicon Valley. After careful review, we&apos;re unable to approve your application at this time.
          </p>

          ${volunteer.reason ? `
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Reason</h4>
            <p style="margin: 0; color: #92400e; line-height: 1.6;">${volunteer.reason}</p>
          </div>
          ` : ''}

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            We encourage you to reapply in the future as our program grows and new opportunities become available.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/get-involved"
               style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Learn More
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you have questions about this decision, please reply to this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: volunteer.email, name: volunteer.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send teacher request approval/contact email
   */
  async sendTeacherRequestContact(teacher: {
    name: string;
    email: string;
    schoolName: string;
    requestType?: string;
  }): Promise<boolean> {
    const subject = `We&apos;d Love to Work With ${teacher.schoolName}!`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Thank You for Your Interest!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We&apos;re excited to bring environmental STEM education to your students</p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${teacher.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Thank you for requesting a presentation from Green Silicon Valley! We&apos;ve received your request and our team will be in touch soon to coordinate details.
          </p>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Request Details</h3>
            <div style="color: #1e40af; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;"><strong>School:</strong> ${teacher.schoolName}</p>
              ${teacher.requestType ? `<p style="margin: 0 0 8px 0;"><strong>Request Type:</strong> ${teacher.requestType}</p>` : ''}
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px;">What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #166534; line-height: 1.8;">
              <li>Our outreach team will contact you within 2-3 business days</li>
              <li>We&apos;ll discuss your preferred dates and topics</li>
              <li>We&apos;ll match you with a volunteer team</li>
              <li>You&apos;ll receive confirmation and preparation materials</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers"
               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Learn More About Our Program
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions? Reply to this email or contact us at support@greensiliconvalley.org
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: teacher.email, name: teacher.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send teacher request waitlist/rejection email
   */
  async sendTeacherRequestWaitlist(teacher: {
    name: string;
    email: string;
    schoolName: string;
    reason?: string;
  }): Promise<boolean> {
    const subject = `Update on Your Presentation Request`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Request Status Update</h1>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Hi ${teacher.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Thank you for your interest in bringing Green Silicon Valley presentations to ${teacher.schoolName}. Due to high demand and limited volunteer availability, we&apos;re unable to schedule a presentation at this time.
          </p>

          ${teacher.reason ? `
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Additional Information</h4>
            <p style="margin: 0; color: #92400e; line-height: 1.6;">${teacher.reason}</p>
          </div>
          ` : ''}

          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">What This Means</h3>
            <p style="margin: 0; color: #92400e; line-height: 1.6;">
              Your request has been added to our waitlist. We&apos;ll contact you as soon as volunteer teams become available in your area. In the meantime, you can explore our educational resources and stay updated on our newsletter.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/resources"
               style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              View Educational Resources
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions? Reply to this email or contact us at support@greensiliconvalley.org
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: teacher.email, name: teacher.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }

  /**
   * Send newsletter subscription confirmation
   */
  async sendNewsletterConfirmation(subscriber: {
    email: string;
    name?: string;
  }): Promise<boolean> {
    const subject = 'Welcome to Green Silicon Valley Newsletter!';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🎉 You're Subscribed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Stay connected with environmental STEM education</p>
        </div>

        <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          ${subscriber.name ? `<p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">Hi ${subscriber.name},</p>` : ''}

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            Thank you for subscribing to the Green Silicon Valley newsletter! You'll receive updates about our environmental education programs, volunteer opportunities, and the impact we're making in schools.
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px;">What to Expect</h3>
            <ul style="margin: 0; padding-left: 20px; color: #166534; line-height: 1.6;">
              <li>Monthly program updates and success stories</li>
              <li>Volunteer recruitment announcements</li>
              <li>Educational resource highlights</li>
              <li>Partnership opportunities and events</li>
              <li>Impact metrics and growth updates</li>
            </ul>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
              <strong>Privacy Note:</strong> We respect your privacy and will never share your email address.
              You can unsubscribe at any time using the link at the bottom of our emails.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}"
               style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Visit Our Website
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            Green Silicon Valley • Environmental STEM Education for All
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: { email: subscriber.email, name: subscriber.name },
      subject,
      html,
      replyTo: this.supportEmail
    });
  }
}

export const emailService = new EmailService();
