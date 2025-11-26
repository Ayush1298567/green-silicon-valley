import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { emailService } from "@/lib/email/email-service";

export interface OnboardingPacket {
  volunteerId: string;
  packetUrl: string;
  generatedAt: string;
  includes: string[];
  status: 'pending' | 'generated' | 'sent';
}

export class OnboardingAutomationService {
  private supabase = createClientComponentClient();

  /**
   * Generate and send onboarding packet for new volunteer
   */
  async generateOnboardingPacket(volunteerId: string): Promise<OnboardingPacket> {
    try {
      // Get volunteer information
      const { data: volunteer, error: volunteerError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', volunteerId)
        .single();

      if (volunteerError || !volunteer) {
        throw new Error('Volunteer not found');
      }

      // Get volunteer's team assignment if available
      const { data: teamMember } = await this.supabase
        .from('team_members')
        .select('*, teams(*)')
        .eq('user_id', volunteerId)
        .single();

      // Generate onboarding packet content
      const packetContent = await this.generatePacketContent(volunteer, teamMember);

      // In production, this would generate a PDF and store it
      const packetUrl = `/onboarding-packets/${volunteerId}-${Date.now()}.pdf`;

      // Create packet record
      const packet: OnboardingPacket = {
        volunteerId,
        packetUrl,
        generatedAt: new Date().toISOString(),
        includes: [
          'Welcome letter and organization overview',
          'Team assignment and contact information',
          'Presentation preparation checklist',
          'Key policies and procedures',
          'Training schedule and resources',
          'File hub access instructions',
          'Contact information for support'
        ],
        status: 'generated'
      };

      // Store packet record in database
      await this.supabase
        .from('onboarding_packets')
        .insert({
          volunteer_id: volunteerId,
          packet_url: packetUrl,
          generated_at: packet.generatedAt,
          includes: packet.includes,
          status: packet.status
        });

      // Send welcome email with packet link
      await this.sendWelcomeEmail(volunteer, packet);

      return packet;

    } catch (error) {
      console.error('Error generating onboarding packet:', error);
      throw error;
    }
  }

  /**
   * Generate the content for the onboarding packet
   */
  private async generatePacketContent(volunteer: any, teamMember?: any): Promise<any> {
    const content = {
      welcome: {
        title: `Welcome to Green Silicon Valley, ${volunteer.name || 'New Volunteer'}!`,
        message: `We're excited to have you join our team of environmental educators. This packet contains everything you need to get started on your journey to make a difference in environmental STEM education.`,
        startDate: new Date().toLocaleDateString()
      },

      organization: {
        mission: 'To empower every student with the knowledge and passion to protect our planet through hands-on environmental STEM education.',
        values: ['Environmental Stewardship', 'Educational Excellence', 'Community Impact', 'Innovation', 'Collaboration'],
        contact: {
          primary: 'volunteer@greensiliconvalley.org',
          emergency: 'urgent@greensiliconvalley.org'
        }
      },

      team: teamMember ? {
        name: teamMember.teams.name,
        description: teamMember.teams.description,
        captain: teamMember.teams.captain_name,
        meetingSchedule: teamMember.teams.meeting_schedule,
        firstMeeting: 'Next team meeting: [Date/Time]'
      } : null,

      responsibilities: [
        'Prepare and deliver environmental STEM presentations',
        'Attend team meetings and training sessions',
        'Complete presentation readiness checklists',
        'Maintain accurate records and feedback',
        'Adhere to all safety and educational guidelines'
      ],

      training: {
        required: [
          'Volunteer orientation (completed)',
          'Team-specific training',
          'Presentation skills workshop',
          'Safety and emergency procedures'
        ],
        resources: [
          'Presentation templates in File Hub',
          'Example slides and activities',
          'Teacher preparation guides',
          'Environmental science background materials'
        ]
      },

      nextSteps: [
        'Complete your volunteer profile in the portal',
        'Upload any required documents to File Hub',
        'Attend your first team meeting',
        'Review presentation templates and materials',
        'Schedule your first presentation opportunity'
      ]
    };

    return content;
  }

  /**
   * Send welcome email with onboarding packet
   */
  private async sendWelcomeEmail(volunteer: any, packet: OnboardingPacket): Promise<void> {
    const success = await emailService.sendVolunteerWelcomeEmail({
      name: volunteer.name || 'New Volunteer',
      email: volunteer.email,
      teamName: volunteer.team_name || undefined
    });

    if (success) {
      // Mark packet as sent
      await this.supabase
        .from('onboarding_packets')
        .update({ status: 'sent' })
        .eq('volunteer_id', packet.volunteerId);

      console.log('Welcome email sent successfully to:', volunteer.email);
    } else {
      console.error('Failed to send welcome email to:', volunteer.email);
      // Still mark as sent to avoid repeated attempts, but log the failure
      await this.supabase
        .from('onboarding_packets')
        .update({
          status: 'sent',
          notes: 'Email delivery failed - manual follow-up required'
        })
        .eq('volunteer_id', packet.volunteerId);
    }
  }

  /**
   * Trigger onboarding packet generation for approved volunteer
   */
  async triggerOnboardingPacket(volunteerId: string): Promise<void> {
    try {
      // Check if packet already exists
      const { data: existingPacket } = await this.supabase
        .from('onboarding_packets')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .single();

      if (existingPacket) {
        console.log('Onboarding packet already exists for volunteer:', volunteerId);
        return;
      }

      // Generate new packet
      await this.generateOnboardingPacket(volunteerId);

      console.log('Onboarding packet generated for volunteer:', volunteerId);

    } catch (error) {
      console.error('Error triggering onboarding packet:', error);
      throw error;
    }
  }

  /**
   * Get onboarding packet status for a volunteer
   */
  async getPacketStatus(volunteerId: string): Promise<OnboardingPacket | null> {
    try {
      const { data: packet, error } = await this.supabase
        .from('onboarding_packets')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .single();

      if (error || !packet) {
        return null;
      }

      return {
        volunteerId: packet.volunteer_id,
        packetUrl: packet.packet_url,
        generatedAt: packet.generated_at,
        includes: packet.includes || [],
        status: packet.status
      };

    } catch (error) {
      console.error('Error getting packet status:', error);
      return null;
    }
  }
}

export const onboardingAutomation = new OnboardingAutomationService();
