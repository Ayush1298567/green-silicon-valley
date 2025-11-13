-- RLS helpers
create or replace function public.user_role()
returns text
language sql
stable
as $$
  select role from public.users where id = auth.uid();
$$;

-- Enable RLS and baseline policies
-- Schools: public read, allow inserts from forms, founder full access
alter table schools enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='schools_select_public') then
    create policy schools_select_public on schools for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname='schools_insert_anyform') then
    create policy schools_insert_anyform on schools for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where polname='schools_all_founder') then
    create policy schools_all_founder on schools for all using (user_role() = 'founder');
  end if;
end $$;

-- Presentations: public read, founder/intern write
alter table presentations enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='presentations_select_public') then
    create policy presentations_select_public on presentations for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname='presentations_write_staff') then
    create policy presentations_write_staff on presentations for insert with check (user_role() in ('founder','intern'));
    create policy presentations_update_staff on presentations for update using (user_role() in ('founder','intern'));
    create policy presentations_delete_founder on presentations for delete using (user_role() = 'founder');
  end if;
end $$;

-- Chapters: public read, founder write
alter table chapters enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='chapters_select_public') then
    create policy chapters_select_public on chapters for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname='chapters_founder_write') then
    create policy chapters_founder_insert on chapters for insert with check (user_role() = 'founder');
    create policy chapters_founder_update on chapters for update using (user_role() = 'founder');
    create policy chapters_founder_delete on chapters for delete using (user_role() = 'founder');
  end if;
end $$;

-- Volunteers: authenticated read own, founder read/write all, public insert (signup)
alter table volunteers enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='volunteers_select_self') then
    create policy volunteers_select_self on volunteers for select
      using (user_role() = 'founder' or user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where polname='volunteers_insert_public_signup') then
    create policy volunteers_insert_public_signup on volunteers for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where polname='volunteers_founder_write') then
    create policy volunteers_founder_update on volunteers for update using (user_role() = 'founder');
    create policy volunteers_founder_delete on volunteers for delete using (user_role() = 'founder');
  end if;
end $$;

-- Intern projects: interns/founders read/write, public insert (applications)
alter table intern_projects enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='intern_projects_read_staff') then
    create policy intern_projects_read_staff on intern_projects for select using (user_role() in ('founder','intern'));
  end if;
  if not exists (select 1 from pg_policies where polname='intern_projects_insert_public') then
    create policy intern_projects_insert_public on intern_projects for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where polname='intern_projects_write_staff') then
    create policy intern_projects_write_staff on intern_projects for update using (user_role() in ('founder','intern'));
    create policy intern_projects_delete_founder on intern_projects for delete using (user_role() = 'founder');
  end if;
end $$;

-- Resources: public read, authenticated upload, founder delete
alter table resources enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='resources_select_public') then
    create policy resources_select_public on resources for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname='resources_insert_auth') then
    create policy resources_insert_auth on resources for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where polname='resources_delete_founder') then
    create policy resources_delete_founder on resources for delete using (user_role() = 'founder');
  end if;
end $$;

-- Rules & bylaws: public read, founders write
alter table rules_bylaws enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='rules_bylaws_select_public') then
    create policy rules_bylaws_select_public on rules_bylaws for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname='rules_bylaws_founder_write') then
    create policy rules_bylaws_founder_insert on rules_bylaws for insert with check (user_role() = 'founder');
    create policy rules_bylaws_founder_update on rules_bylaws for update using (user_role() = 'founder');
    create policy rules_bylaws_founder_delete on rules_bylaws for delete using (user_role() = 'founder');
  end if;
end $$;

-- Grants & donations: founders read/write
alter table grants enable row level security;
alter table donations enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='grants_founder_all') then
    create policy grants_founder_all on grants for all using (user_role() = 'founder');
  end if;
  if not exists (select 1 from pg_policies where polname='donations_founder_all') then
    create policy donations_founder_all on donations for all using (user_role() = 'founder');
  end if;
end $$;

-- Settings: founders only
alter table settings enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='settings_founder_all') then
    create policy settings_founder_all on settings for all using (user_role() = 'founder');
  end if;
end $$;

-- System logs: public insert allowed only for contact messages, founders read
alter table system_logs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='system_logs_founder_select') then
    create policy system_logs_founder_select on system_logs for select using (user_role() = 'founder');
  end if;
  if not exists (select 1 from pg_policies where polname='system_logs_public_contact_insert') then
    create policy system_logs_public_contact_insert on system_logs for insert
      with check (new.event_type = 'contact_message');
  end if;
  if not exists (select 1 from pg_policies where polname='system_logs_staff_insert') then
    create policy system_logs_staff_insert on system_logs for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Messaging tables minimal RLS: members can read channel messages
alter table channels enable row level security;
alter table channel_members enable row level security;
alter table messages enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='channel_select_auth') then
    create policy channel_select_auth on channels for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where polname='channel_members_self') then
    create policy channel_members_self on channel_members for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where polname='messages_read_member_or_dm') then
    create policy messages_read_member_or_dm on messages for select using (
      (recipient_id is not null and (recipient_id = auth.uid() or sender_id = auth.uid()))
      or
      (channel_id is not null and exists (
        select 1 from channel_members cm where cm.channel_id = messages.channel_id and cm.user_id = auth.uid()
      ))
    );
  end if;
  if not exists (select 1 from pg_policies where polname='messages_insert_member_or_dm') then
    create policy messages_insert_member_or_dm on messages for insert with check (
      (recipient_id is not null and auth.role() = 'authenticated')
      or
      (channel_id is not null and exists (
        select 1 from channel_members cm where cm.channel_id = messages.channel_id and cm.user_id = auth.uid()
      ))
    );
  end if;
end $$;


