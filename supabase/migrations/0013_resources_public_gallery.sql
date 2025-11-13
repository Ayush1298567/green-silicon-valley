alter table resources add column if not exists is_public boolean default false;

do $$ begin
  if exists (select 1 from pg_policies where polname='resources_select_roles') then
    drop policy resources_select_roles on resources;
  end if;
end $$;

create policy resources_select_public_or_roles on resources for select
  using (
    is_public = true
    or user_role() in ('founder','intern','volunteer')
  );


