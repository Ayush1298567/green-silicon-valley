create table if not exists volunteer_hours (
  id bigserial primary key,
  volunteer_id uuid references users(id) on delete cascade,
  presentation_id uuid references presentations(id) on delete cascade,
  hours_logged numeric(5,2) not null,
  feedback text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  submitted_by uuid references users(id) on delete set null,
  approved_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  approved_at timestamptz
);

create index if not exists idx_volunteer_hours_presentation on volunteer_hours(presentation_id);
create index if not exists idx_volunteer_hours_status on volunteer_hours(status);

alter table volunteer_hours enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where polname='vol_hours_volunteer_insert') then
    create policy vol_hours_volunteer_insert on volunteer_hours for insert
      with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where polname='vol_hours_staff_update') then
    create policy vol_hours_staff_update on volunteer_hours for update
      using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('founder','intern')));
  end if;
  if not exists (select 1 from pg_policies where polname='vol_hours_member_read') then
    create policy vol_hours_member_read on volunteer_hours for select
      using (
        submitted_by = auth.uid()
        or exists (select 1 from users u where u.id = auth.uid() and u.role in ('founder','intern'))
      );
  end if;
end $$;


