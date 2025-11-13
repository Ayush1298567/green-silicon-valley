-- Messaging core tables
create extension if not exists pgcrypto;

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  name text,
  type text, -- 'public','private','chapter','team','department'
  description text,
  created_by uuid references users(id) on delete set null,
  members jsonb default '[]'::jsonb,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  last_message_at timestamptz
);

create index if not exists idx_channels_name on channels using gin (to_tsvector('english', coalesce(name,'')));

create table if not exists channel_members (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text, -- 'member','moderator','owner'
  muted_until timestamptz,
  joined_at timestamptz default now()
);
create index if not exists idx_channel_members_channel on channel_members(channel_id);
create unique index if not exists uq_channel_members on channel_members(channel_id, user_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete set null,
  channel_id uuid references channels(id) on delete cascade,
  recipient_id uuid references users(id) on delete set null, -- for DMs
  reply_to_id uuid references messages(id) on delete set null,
  content text,
  reactions jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  read_by jsonb default '[]'::jsonb,
  deleted boolean default false,
  created_at timestamptz default now(),
  edited_at timestamptz
);
create index if not exists idx_messages_channel_created on messages(channel_id, created_at);
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_messages_recipient on messages(recipient_id);
create index if not exists idx_messages_content_fts on messages using gin (to_tsvector('english', coalesce(content,'')));

create table if not exists message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  filename text,
  url text,
  uploaded_by uuid references users(id) on delete set null,
  uploaded_at timestamptz default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  posted_by uuid references users(id) on delete set null,
  scope text,
  created_at timestamptz default now(),
  expires_at timestamptz,
  pinned boolean default false
);

create table if not exists message_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  payload jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_message_logs_event on message_logs(event_type);

-- Scheduled announcements (optional)
create table if not exists scheduled_announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  scope text,
  scheduled_for timestamptz not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  published boolean default false
);


