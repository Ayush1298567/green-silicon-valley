import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ApprovalNotificationData {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
}

export class ApprovalNotificationService {
  private supabase = createClientComponentClient();

  /**
   * Send approval/rejection notification to user
   */
  async sendApprovalNotification(data: ApprovalNotificationData): Promise<void> {
    try {
      const {
        userId,
        userName,
        userEmail,
        userRole,
        status,
        rejectionReason,
        approvedBy
      } = data;

      // Create in-app notification
      await this.createInAppNotification(data);

      // Send email notification (would integrate with email service)
      await this.sendEmailNotification(data);

      // Log the notification
      await this.logNotification(data);

    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }

  /**
   * Create in-app notification for the user
   */
  private async createInAppNotification(data: ApprovalNotificationData): Promise<void> {
    const { userId, status, rejectionReason, userRole } = data;

    let title: string;
    let message: string;
    let actionUrl: string;

    if (status === 'approved') {
      title = '🎉 Account Approved!';
      message = `Welcome to Green Silicon Valley! Your ${userRole} account has been approved and you now have access to all features.`;
      actionUrl = '/dashboard';
    } else {
      title = 'Account Update';
      message = `Unfortunately, your ${userRole} application was not approved${rejectionReason ? `: ${rejectionReason}` : '.'}`;
      actionUrl = '/';
    }

    await this.supabase.from('notifications').insert({
      user_id: userId,
      notification_type: 'account_approval',
      title,
      message,
      action_url: actionUrl,
      metadata: {
        approval_status: status,
        rejection_reason: rejectionReason,
        user_role: userRole
      }
    });
  }

  /**
   * Send email notification (integrates with email service)
   */
  private async sendEmailNotification(data: ApprovalNotificationData): Promise<void> {
    const { userEmail, userName, status, rejectionReason, userRole } = data;

    try {
      if (status === 'approved') {
        await this.sendApprovalEmail(userEmail, userName, userRole);
      } else {
        await this.sendRejectionEmail(userEmail, userName, userRole, rejectionReason);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw - email failure shouldn't break the approval process
    }
  }

  /**
   * Send approval email
   */
  private async sendApprovalEmail(email: string, name: string, role: string): Promise<void> {
    const subject = 'Welcome to Green Silicon Valley - Account Approved!';
    const htmlContent = this.generateApprovalEmailHTML(name, role);

    // This would integrate with your email service (SendGrid, etc.)
    console.log('Sending approval email to:', email);
    console.log('Subject:', subject);
    console.log('Content:', htmlContent);

    // Placeholder for actual email sending
    // await sendEmail({ to: email, subject, html: htmlContent });
  }

  /**
   * Send rejection email
   */
  private async sendRejectionEmail(
    email: string,
    name: string,
    role: string,
    reason?: string
  ): Promise<void> {
    const subject = 'Green Silicon Valley - Account Update';
    const htmlContent = this.generateRejectionEmailHTML(name, role, reason);

    console.log('Sending rejection email to:', email);
    console.log('Subject:', subject);
    console.log('Content:', htmlContent);

    // Placeholder for actual email sending
    // await sendEmail({ to: email, subject, html: htmlContent });
  }

  /**
   * Generate approval email HTML
   */
  private generateApprovalEmailHTML(name: string, role: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Green Silicon Valley</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Green Silicon Valley!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Great news! Your ${role} application has been approved. Welcome to the Green Silicon Valley community!</p>

              <p>You now have access to:</p>
              <ul>
                <li>Your personalized dashboard</li>
                <li>Community resources and tools</li>
                <li>Team collaboration features</li>
                <li>Environmental education materials</li>
              </ul>

              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://greensiliconvalley.org'}/dashboard" class="button">
                Access Your Dashboard
              </a>

              <p>If you have any questions, feel free to reach out to our team at <a href="mailto:hello@greensiliconvalley.org">hello@greensiliconvalley.org</a>.</p>

              <p>We're excited to have you join our mission to make environmental STEM education accessible to all students!</p>

              <p>Best regards,<br>The Green Silicon Valley Team</p>
            </div>
            <div class="footer">
              <p>Green Silicon Valley - Environmental STEM Education</p>
              <p>This email was sent to ${email}. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate rejection email HTML
   */
  private generateRejectionEmailHTML(name: string, role: string, reason?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Green Silicon Valley - Account Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Update</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for your interest in joining Green Silicon Valley as a ${role}.</p>

              <p>After careful review, we regret to inform you that your application was not approved at this time${reason ? ` for the following reason: ${reason}` : '.'}.</p>

              <p>We appreciate your interest in environmental STEM education and encourage you to apply again in the future or explore other ways to get involved with our mission.</p>

              <p>You can learn more about our programs and how to get involved at:</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://greensiliconvalley.org'}/get-involved" class="button">
                Explore Opportunities
              </a>

              <p>If you have questions about this decision or would like feedback on your application, please contact us at <a href="mailto:hello@greensiliconvalley.org">hello@greensiliconvalley.org</a>.</p>

              <p>Thank you for your interest in our mission to make environmental STEM education accessible to all students.</p>

              <p>Best regards,<br>The Green Silicon Valley Team</p>
            </div>
            <div class="footer">
              <p>Green Silicon Valley - Environmental STEM Education</p>
              <p>This email was sent to ${email}. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Log notification for audit trail
   */
  private async logNotification(data: ApprovalNotificationData): Promise<void> {
    await this.supabase.from('user_activity_log').insert({
      user_id: data.userId,
      email: data.userEmail,
      activity_type: data.status === 'approved' ? 'account_approved' : 'account_rejected',
      activity_source: 'admin_action',
      user_category: data.userRole,
      metadata: {
        approved_by: data.approvedBy,
        rejection_reason: data.rejectionReason
      }
    });
  }

  /**
   * Send bulk approval notifications (for future use)
   */
  async sendBulkApprovalNotifications(
    users: ApprovalNotificationData[]
  ): Promise<void> {
    const promises = users.map(user => this.sendApprovalNotification(user));
    await Promise.allSettled(promises);
  }

  /**
   * Send reminder notifications for pending approvals
   */
  async sendPendingApprovalReminders(): Promise<void> {
    try {
      // Get users who have been pending for more than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: pendingUsers } = await this.supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('status', 'pending_approval')
        .lt('created_at', sevenDaysAgo.toISOString());

      if (!pendingUsers || pendingUsers.length === 0) return;

      // Send reminder notifications to admins
      const adminNotification = {
        title: 'Pending User Approvals Reminder',
        message: `${pendingUsers.length} user application(s) have been pending approval for more than 7 days.`,
        action_url: '/admin/user-approvals',
        metadata: {
          pending_count: pendingUsers.length,
          pending_users: pendingUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
        }
      };

      // Get all founders and send them the reminder
      const { data: founders } = await this.supabase
        .from('users')
        .select('id')
        .eq('role', 'founder');

      if (founders) {
        const notifications = founders.map(founder => ({
          ...adminNotification,
          user_id: founder.id,
          notification_type: 'admin_reminder'
        }));

        await this.supabase.from('notifications').insert(notifications);
      }

    } catch (error) {
      console.error('Error sending pending approval reminders:', error);
    }
  }
}

// Export singleton instance
export const approvalNotificationService = new ApprovalNotificationService();
