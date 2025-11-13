-- Extend volunteer_hours policies to accept presentation_members mapping too
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
    and (
      exists (
        select 1
        from presentations p
        join team_members tm on tm.team_name = p.volunteer_team and tm.user_id = auth.uid()
        where p.id = volunteer_hours.presentation_id
      )
      or
      exists (
        select 1
        from presentation_members pm
        where pm.presentation_id = volunteer_hours.presentation_id
          and pm.user_id = auth.uid()
      )
    )
  );

create policy vol_hours_update_pending_self on volunteer_hours for update
  using (
    status = 'pending'
    and submitted_by = auth.uid()
    and (
      exists (
        select 1
        from presentations p
        join team_members tm on tm.team_name = p.volunteer_team and tm.user_id = auth.uid()
        where p.id = volunteer_hours.presentation_id
      )
      or
      exists (
        select 1
        from presentation_members pm
        where pm.presentation_id = volunteer_hours.presentation_id
          and pm.user_id = auth.uid()
      )
    )
  );


