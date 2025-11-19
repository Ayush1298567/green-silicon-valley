export type UserRole = "founder" | "intern" | "volunteer" | "teacher" | "partner";
export type UserStatus = "active" | "inactive" | "pending" | "suspended";

export interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  permissions: any;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  profile_image: string | null;
  profile_image_url: string | null;
  school_affiliation: string | null;
  notes: string | null;
  last_login: string | null;
  last_login_at: string | null;
  user_category: string | null; // 'newsletter', 'volunteer', 'intern', 'founder', 'teacher', 'partner', 'guest'
  created_at: string;
  updated_at: string;
}

export interface SchoolRow {
  id: number;
  name: string;
  address: string | null;
  district: string | null;
  teacher_name: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  zip: string | null;
  phone: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  total_presentations_hosted: number;
  latitude: number | null;
  longitude: number | null;
  lat: number | null;
  lng: number | null;
  last_presentation_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface VolunteerRow {
  id: string;
  user_id: string | null;
  team_name: string | null;
  hours_total: number;
  status: string;
  skills: string[] | null;
  availability: any | null;
  presentations_completed: number;
  orientation_completed: boolean;
  orientation_date: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  skills_interests: any | null;
  milestones: any | null;
  // Enhanced form fields
  group_city: string | null;
  group_size: number | null;
  group_year: string | null;
  group_members: any[] | null; // JSONB array of member objects
  primary_contact_phone: string | null;
  preferred_grade_level: string | null;
  in_santa_clara_usd: boolean | null;
  how_heard: string | null;
  why_volunteer: string | null;
  application_status: string | null; // 'pending', 'contacted', 'approved', 'rejected', 'active'
  submitted_at: string | null;
  contacted_at: string | null;
  approved_at: string | null;
  // Onboarding fields
  selected_topic_id: number | null;
  selected_topic_at: string | null;
  group_channel_id: string | null;
  onboarding_step: string | null;
  presentation_draft_url: string | null;
  group_member_contacts: any | null;
  email: string | null; // Primary contact email
  created_at: string;
  updated_at: string | null;
}

export interface VolunteerHoursRow {
  id: number;
  volunteer_id: string; // References volunteers.id (UUID)
  presentation_id: string | null; // References presentations.id (UUID)
  date: string | null;
  hours_logged: number;
  activity: string | null;
  activity_description: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  submitted_by: string | null;
  feedback: string | null;
  created_at: string;
}

export interface PresentationRow {
  id: string;
  school_id: number | null;
  scheduled_date: string | null;
  date: string | null;
  status: string;
  student_count: number | null;
  grade_level: string | null;
  topic: string | null;
  notes: string | null;
  volunteer_team: string | null;
  volunteer_team_id: number | null;
  hours: number | null;
  feedback: string | null;
  files: any | null;
  requesting_teacher_name: string | null;
  requesting_teacher_email: string | null;
  teacher_rating: number | null;
  confirmation_sent: boolean | null;
  reminder_sent: boolean | null;
  created_at: string;
  updated_at: string | null;
}

export interface ChapterRow {
  id: number;
  name: string;
  region: string | null;
  leader: string | null;
  leader_user_id: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  lead_id: string | null;
  volunteers_count: number | null;
  last_meeting_date: string | null;
  next_review_date: string | null;
  co_leaders: any | null;
  contact_email: string | null;
  established_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BlogPostsRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
}

export interface BulletinPostsRow {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  priority: string;
  published: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface EmailTemplatesRow {
  id: string;
  name: string;
  subject: string;
  content: string;
  body_html: string | null;
  body_text: string | null;
  category: string | null;
  description: string | null;
  variables: any;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface InternProjectRow {
  id: number;
  intern_id: string | null;
  department: string | null;
  task: string | null;
  title: string | null;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  notes: string | null;
  assigned_to: string | null;
  completion_date: string | null;
  attachments: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface MediaFileRow {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface ResourceRow {
  id: number;
  title: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  file_url: string | null;
  filename: string | null;
  file_type: string | null;
  upload_date: string | null;
  uploader_id: string | null;
  file_size_bytes: number | null;
  version_number: number | null;
  replaces_resource_id: number | null;
  tags: any | null;
  last_accessed_at: string | null;
  created_at: string;
  download_count: number | null;
}

export interface SystemLogRow {
  id: number;
  event_type: string | null;
  action: string | null;
  actor_id: string | null;
  details: string | null;
  description: string | null;
  target_table: string | null;
  target_id: string | null;
  metadata: any | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface PageSectionRow {
  id: string;
  page: string;
  type: string;
  title: string;
  content: any;
  order: number;
  visible: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface ScheduledTasksRow {
  id: string;
  name: string;
  description: string | null;
  task_type: string;
  task_name: string;
  task_data: any;
  cron_expression: string;
  schedule_type: string;
  status: string;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
  next_run_at: string | null;
  execution_count: number;
  parameters: any;
  created_at: string;
  updated_at: string;
}


export interface RuleBylawRow {
  id: number;
  title: string | null;
  content: string | null;
  revision_date: string | null;
  editor_id: string | null;
  section: string | null;
  version_number: number | null;
  replaces_rule_id: number | null;
  effective_date: string | null;
  approval_status: string | null;
  tags: any | null;
  created_at: string;
}

export interface GrantRow {
  id: number;
  name: string | null;
  deadline: string | null;
  status: string | null;
  report_due: string | null;
  notes: string | null;
  grantor_organization: string | null;
  amount_requested: number | null;
  amount_awarded: number | null;
  application_deadline: string | null;
  point_person_id: string | null;
  application_file_url: string | null;
  report_file_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DonationRow {
  id: number;
  donor_name: string | null;
  amount: number | null;
  date: string | null;
  donation_date: string | null;
  acknowledgment_sent: boolean | null;
  donor_email: string | null;
  donor_address: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  acknowledgment_sent_date: string | null;
  tax_receipt_sent: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TeamMemberRow {
  id: number;
  volunteer_team_id: number;
  user_id: string;
  member_name: string;
  member_email: string;
  member_phone: string | null;
  member_highschool: string | null;
  is_primary_contact: boolean;
  joined_at: string;
}

export interface UserActivityLogRow {
  id: number;
  user_id: string | null;
  email: string;
  activity_type: string; // 'signup', 'login', 'logout', 'page_view', 'form_submit'
  activity_source: string | null; // 'magic_link', 'google_oauth', 'email_signup', 'form_submission'
  user_category: string | null; // 'newsletter', 'volunteer', 'intern', 'founder', 'teacher', 'guest'
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  metadata: any | null;
  created_at: string;
}

export interface UserSignupSourceRow {
  id: number;
  user_id: string;
  email: string;
  source_type: string; // 'volunteer_form', 'intern_form', 'teacher_form', 'newsletter', 'direct_signup', 'invited'
  source_reference_id: number | null;
  source_metadata: any | null;
  first_signup_at: string;
}

export interface UserRoutingPreferencesRow {
  id: number;
  user_id: string;
  default_redirect_path: string | null;
  onboarding_completed: boolean;
  onboarding_step: string | null;
  last_login_at: string | null;
  login_count: number;
  preferred_dashboard: string | null; // 'volunteer', 'intern', 'founder', 'teacher'
  updated_at: string;
}

