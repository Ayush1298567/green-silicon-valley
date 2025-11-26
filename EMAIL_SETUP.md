# Email Service Setup Guide

This guide explains how to set up email functionality for the Green Silicon Valley platform using SendGrid.

## Prerequisites

1. **SendGrid Account**: Sign up at [sendgrid.com](https://sendgrid.com)
2. **Verified Sender**: Set up a verified sender email address
3. **API Key**: Generate an API key with full access

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@greensiliconvalley.org

# Optional: Cron jobs for automated emails
CRON_SECRET_KEY=your_secure_cron_secret_key
```

## SendGrid Setup Steps

### 1. Create SendGrid Account
- Go to [sendgrid.com](https://sendgrid.com) and create an account
- Verify your email address

### 2. Verify Sender Identity
- In SendGrid dashboard, go to "Settings" → "Sender Authentication"
- Choose "Verify a Single Sender"
- Enter your sender details:
  - From Email: `noreply@greensiliconvalley.org`
  - From Name: `Green Silicon Valley`
  - Reply To: `support@greensiliconvalley.org`

### 3. Generate API Key
- Go to "Settings" → "API Keys"
- Click "Create API Key"
- Name: "GSV-Production"
- Permissions: "Full Access"
- Copy the API key (starts with `SG.`)

### 4. Update Environment Variables
Add the API key to your `.env.local`:

```bash
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=noreply@greensiliconvalley.org
```

## Email Templates

The platform includes professionally designed email templates for:

### 1. Volunteer Welcome Emails
- Sent when volunteer applications are approved
- Includes onboarding packet link
- Personalized with team assignment

### 2. Teacher Presentation Confirmations
- Sent when presentations are scheduled
- Includes all presentation details
- Links to preparation resources

### 3. Urgent Contact Alerts
- High-priority alerts for support team
- Color-coded by urgency level
- Direct contact information included

### 4. Newsletter Confirmations
- Welcome emails for new subscribers
- Clear expectations and unsubscribe info

### 5. Presentation Reminders
- Automated reminders (1 week, 3 days, 1 day before)
- Includes preparation checklists
- Links to required materials

### 6. Hours Approval Notifications
- Approval/rejection notifications
- Detailed feedback and notes
- Direct links to volunteer dashboard

## Testing Email Functionality

### 1. Development Testing
Without SendGrid configured, emails will be logged to console:
```bash
# Email simulation mode (default)
Email simulation: Welcome to Green Silicon Valley! to: volunteer@example.com
```

### 2. Production Testing
With SendGrid configured, test emails are sent:
```bash
# Real email sending
Email sent successfully: 200
```

### 3. Manual Testing
You can test email templates by:
1. Submitting a newsletter signup
2. Creating an urgent contact request
3. Approving volunteer hours
4. Triggering onboarding automation

## Email Features

### Automated Workflows
- **Volunteer Onboarding**: Welcome emails sent automatically
- **Presentation Scheduling**: Confirmation emails to teachers
- **Reminder System**: Automated presentation reminders
- **Newsletter**: Welcome and management emails

### Template Customization
All email templates are fully customizable by editing the HTML in:
- `lib/email/email-service.ts`

### Error Handling
- Failed emails are logged but don't break application flow
- Retry logic for temporary failures
- Fallback to manual follow-up for critical communications

## Security Considerations

### API Key Protection
- Never commit API keys to version control
- Use environment variables only
- Rotate keys regularly
- Monitor SendGrid usage for unauthorized access

### Email Content Security
- No sensitive data in email templates
- Secure unsubscribe links
- Proper email headers to prevent spoofing

## Troubleshooting

### Common Issues

**Emails not sending in production:**
- Check SendGrid API key is correct
- Verify sender email is authenticated
- Check SendGrid dashboard for delivery status

**Emails going to spam:**
- Ensure proper SPF/DKIM/DMARC records
- Use consistent sender information
- Monitor domain reputation

**Template rendering issues:**
- Check HTML syntax in templates
- Test with different email clients
- Use table-based layouts for better compatibility

### Monitoring

**SendGrid Dashboard:**
- Delivery rates and statistics
- Bounce and complaint tracking
- Geographic delivery data

**Application Logs:**
- Email sending success/failure
- Template rendering errors
- Delivery status updates

## Cost Considerations

**SendGrid Free Tier:**
- 100 emails/day
- 2,000 contacts
- Basic analytics

**Paid Plans (starting at $14.95/month):**
- Higher sending limits
- Advanced analytics
- Dedicated IP addresses
- Priority support

For a growing nonprofit, the $14.95/month plan provides good value for 50,000 emails/month.

## Next Steps

1. Set up SendGrid account and API key
2. Configure environment variables
3. Test email functionality
4. Monitor delivery rates
5. Customize email templates as needed
6. Set up automated cron jobs for reminders

## Support

For email setup issues:
- Check SendGrid documentation
- Review application logs
- Contact SendGrid support for account-specific issues
