-- Restrict resources to authenticated interns/volunteers/founders
do $$ begin
  if exists (select 1 from pg_policies where polname='resources_select_public') then
    drop policy resources_select_public on resources;
  end if;
  if exists (select 1 from pg_policies where polname='resources_insert_auth') then
    drop policy resources_insert_auth on resources;
  end if;
  if exists (select 1 from pg_policies where polname='resources_delete_founder') then
    drop policy resources_delete_founder on resources;
  end if;
end $$;

alter table resources enable row level security;

create policy resources_select_roles on resources for select
  using (user_role() in ('founder','intern','volunteer'));

create policy resources_insert_roles on resources for insert
  with check (user_role() in ('founder','intern'));

create policy resources_update_roles on resources for update
  using (user_role() in ('founder','intern'));

create policy resources_delete_founder on resources for delete
  using (user_role() = 'founder');


