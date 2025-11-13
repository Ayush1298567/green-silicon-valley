-- Replace permissive policies with membership-based checks
-- Drop existing insert/update policies if they exist
do $$ begin
  if exists (select 1 from pg_policies where polname='vol_hours_volunteer_insert') then
    drop policy vol_hours_volunteer_insert on volunteer_hours;
  end if;
  if exists (select 1 from pg_policies where polname='vol_hours_staff_update') then
    drop policy vol_hours_staff_update on volunteer_hours;
  end if;
end $$;

-- Volunteers can insert only if they belong to the presentation's team
create policy vol_hours_insert_member on volunteer_hours for insert
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1
      from presentations p
      join volunteers v on v.team_name = p.volunteer_team
      where p.id = volunteer_hours.presentation_id
        and v.user_id = auth.uid()
    )
  );

-- Volunteers can update their own submission while pending (e.g., fix typos)
create policy vol_hours_update_pending_self on volunteer_hours for update
  using (
    status = 'pending'
    and submitted_by = auth.uid()
    and exists (
      select 1
      from presentations p
      join volunteers v on v.team_name = p.volunteer_team
      where p.id = volunteer_hours.presentation_id
        and v.user_id = auth.uid()
    )
  );

-- Staff (founder/intern) can update any (approve/reject)
create policy vol_hours_update_staff on volunteer_hours for update
  using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('founder','intern')));


