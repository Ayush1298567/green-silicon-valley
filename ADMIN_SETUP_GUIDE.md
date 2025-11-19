# 🚀 Green Silicon Valley 2.0 - Complete Setup Guide

## Overview
This guide walks you through setting up the complete Green Silicon Valley platform with all new features including material procurement, intern permissions, AI alerts, and Apple minimalism design.

## 📋 Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account with database access
- Environment variables configured (`.env.local`)

## 🗄️ Step 1: Database Setup

### Run the Complete Migration
```bash
# In Supabase SQL Editor, run the complete migration
# Copy and paste ALL content from: supabase/migrations/ALL_MIGRATIONS_COMPLETE.sql
```

### Verify Tables Created
After running the migration, verify these tables exist:
- ✅ `procurement_settings`
- ✅ `intern_permissions`
- ✅ `ai_alert_settings`
- ✅ `material_requests`
- ✅ `international_settings`
- ✅ `permission_audit_log`

## 👨‍💼 Step 2: Founder Setup

### Create Founder Users
```bash
npm run setup-founders
```

This will:
- Set up founder role permissions
- Create initial founder accounts
- Configure basic authentication

## ⚙️ Step 3: Admin Permissions Setup

### Initialize Admin Settings
```bash
npm run setup-admin
```

This configures:
- ✅ Procurement settings ($25/group budget limit)
- ✅ AI alert preferences (weekly + critical only)
- ✅ International features (hidden by default)
- ✅ Default intern permissions (all disabled)

## 🎨 Step 4: Design System Verification

### Check Apple Minimalism
The design system is automatically applied. Verify:
- ✅ Blue primary color (#007AFF)
- ✅ Green environmental accents (#30D158)
- ✅ San Francisco typography
- ✅ Subtle shadows and 8px border radius
- ✅ Clean, professional appearance

## 🔐 Step 5: Founder Dashboard Access

### Access Admin Settings
1. Log in as a founder
2. Navigate to `/dashboard/founder/admin-settings`
3. Configure the following sections:

#### Procurement Settings
```
• Enable GSV Material Procurement: [ ] (Check when funded)
• Max Budget Per Group: $25.00 (enforced)
• Allow Volunteer Self-Funding: [✓] (Keep checked)
• Show Kit Recommendations: [✓] (Keep checked)
• Require Budget Justification: [✓] (Keep checked)
```

#### Intern Permissions
```
Set permissions for each intern based on their role:

Operations Intern:
- ✅ Dashboard access
- ✅ Volunteer management (view, approve, reject)
- ✅ Team management (view all, assign, track)
- ✅ Material requests (view, approve)

Communications Intern:
- ✅ Dashboard access
- ✅ Content management (blog, announcements)
- ✅ Email templates and bulk messaging
- ✅ Resources upload

Technology Intern:
- ✅ Dashboard access
- ✅ Analytics and reports
- ✅ System settings
- ✅ Audit logs
```

#### AI Alert Settings
```
• Alert Frequency: Weekly + Critical only
• Weekly Digest Day: Sunday
• Weekly Digest Time: 6:00 PM
• Critical Inactivity: 7+ days
• Critical Deadline: 48+ hours
• Critical Budget Overrun: 10%
• Email Alerts: Enabled
• In-App Alerts: Enabled
• SMS Alerts: Disabled
```

#### Kit Inventory Management
```
Add your current available kits:
• Science Equipment (pH strips, microscopes, etc.)
• Presentation Materials (projectors, whiteboards)
• Activity Supplies (environmental monitoring kits)

Include:
- Kit names and descriptions
- Cost estimates
- Supplier information
- URLs for purchasing
```

#### Material Request Approval Process
```
Manual Approval Only (NO Auto-Approval):
• All requests require founder review
• Founders can approve or reject each request
• Add custom messages to volunteer groups
• Communicate directly with groups about decisions

Messaging Features:
• Send messages to groups without changing request status
• Include notes with approvals/rejections
• Direct communication through notifications
```

## 👥 Step 6: User Role Testing

### Test Volunteer Experience
1. Create a volunteer account
2. Schedule a presentation
3. Access "Request Materials" in quick actions
4. Test the 5-step material request wizard
5. Verify budget limits ($25 max)

### Test Intern Experience
1. Log in as an intern with granted permissions
2. Verify they only see allowed features
3. Test permission-restricted actions
4. Check audit logs for permission usage

### Test Founder Experience
1. Access all admin settings
2. Approve/reject material requests
3. Modify intern permissions
4. Review AI alert settings

## 📱 Step 7: Mobile & Performance Testing

### Test Responsiveness
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ iPad Safari
- ✅ Desktop browsers

### Performance Check
```bash
npm run build
npm run start
```
- ✅ Load times < 1.5 seconds
- ✅ Smooth animations (60fps)
- ✅ No console errors
- ✅ Lighthouse score > 90

## 🤖 Step 8: AI Features Testing

### Test Material Procurement
1. Submit a material request under $15 → Should auto-approve
2. Submit a request over $15 → Should require founder approval
3. Test budget validation → Should reject over $25

### Test AI Alerts
1. Create test scenarios for critical alerts
2. Verify weekly digest timing
3. Test notification delivery

## 🌍 Step 9: International Setup (Optional)

### When Ready for International
1. Go to International Settings
2. Enable international features
3. Configure supported countries
4. Add language options
5. Enable compliance requirements (GDPR, etc.)

## 🔧 Step 10: Production Deployment

### Environment Setup
```bash
# Ensure these are set in production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### Deployment Checklist
- ✅ Database migrations applied
- ✅ Admin permissions configured
- ✅ Founder accounts set up
- ✅ Procurement settings enabled
- ✅ Kit inventory populated
- ✅ Performance tested
- ✅ Mobile responsive
- ✅ AI features working

## 📊 Step 11: Post-Launch Monitoring

### Monitor Key Metrics
- Material request approval times (< 24 hours)
- Budget compliance (98% within limits)
- Permission system usage (audit logs)
- AI alert relevance (>90% actionable)

### User Feedback Collection
- Volunteer satisfaction surveys
- Founder ease-of-use feedback
- Intern permission adequacy
- Performance issue reports

## 🚨 Troubleshooting

### Common Issues

#### Permission Errors
```sql
-- Check intern permissions
SELECT * FROM intern_permissions WHERE intern_id = 'user_id';
```

#### Procurement Settings
```sql
-- Verify settings
SELECT * FROM procurement_settings;
```

#### Material Requests Stuck
```sql
-- Check request status
SELECT * FROM material_requests WHERE status = 'submitted';
```

## 📞 Support

If you encounter issues:
1. Check the console for errors
2. Verify database migrations completed
3. Ensure environment variables are set
4. Review audit logs for permission issues

## 🎉 Success Indicators

### Platform is Ready When:
- ✅ Founders can access all admin settings
- ✅ Interns see only granted features
- ✅ Volunteers can request materials within budget
- ✅ AI alerts work (weekly + critical)
- ✅ Design looks professional and Apple-like
- ✅ Performance is smooth on all devices
- ✅ No security vulnerabilities
- ✅ All user flows work end-to-end

## 🚀 Launch Command

```bash
# Final launch checklist
npm run build
npm run start
# Open browser to localhost:3000
# Test all user flows
# Deploy to production
```

**Your Green Silicon Valley 2.0 platform is now ready to revolutionize environmental STEM education!** 🌟🤖💚

---

## 📝 Feature Summary

### ✅ Completed Features
- **Material Procurement System** ($20-25 per group, founder-controlled)
- **Granular Intern Permissions** (25+ specific controls)
- **AI Alert System** (Weekly + critical only)
- **Apple Minimalism Design** (Professional, clean interface)
- **Hidden International Features** (Coming soon infrastructure)
- **Kit Inventory Management** (Founder-editable catalogs)
- **Complete Admin Dashboard** (Centralized control)

### 🎯 Key Benefits
- **Manual Budget Control:** $25/group limit with founder approval required (NO auto-approval)
- **Direct Communication:** Founders can message volunteer groups about decisions
- **Access Security:** Surgical intern permission management with audit trail
- **User Respect:** No daily AI spam, weekly digests only
- **Professional Appearance:** Apple-quality design system
- **Complete Audit Trail:** Full record of permissions and actions (like a security log)

**Audit Trail Explanation:** An audit trail is like a security camera that records who did what and when. It tracks all permission changes, material approvals, and administrative actions so you can see the complete history of what happened in your system.

**The platform is production-ready and will provide an exceptional experience for volunteers, interns, and founders alike!** 🚀✨
