create table if not exists team_members (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  team_name text not null,
  unique(user_id, team_name)
);

-- Update volunteer_hours policies to use team_members mapping
do $$ begin
  if exists (select 1 from pg_policies where polname='vol_hours_insert_member') then
    drop policy vol_hours_insert_member on volunteer_hours;
  end if;
  if exists (select 1 from pg_policies where polname='vol_hours_update_pending_self') then
    drop policy vol_hours_update_pending_self on volunteer_hours;
  end if;
end $$;

create policy vol_hours_insert_member on volunteer_hours for insert
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1
      from presentations p
      join team_members tm on tm.team_name = p.volunteer_team and tm.user_id = auth.uid()
      where p.id = volunteer_hours.presentation_id
    )
  );

create policy vol_hours_update_pending_self on volunteer_hours for update
  using (
    status = 'pending'
    and submitted_by = auth.uid()
    and exists (
      select 1
      from presentations p
      join team_members tm on tm.team_name = p.volunteer_team and tm.user_id = auth.uid()
      where p.id = volunteer_hours.presentation_id
    )
  );


