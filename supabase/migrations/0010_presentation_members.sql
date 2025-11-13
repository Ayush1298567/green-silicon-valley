create table if not exists presentation_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  presentation_id uuid references presentations(id) on delete cascade,
  role text default 'member',
  created_at timestamptz default now(),
  unique (user_id, presentation_id)
);

create index if not exists idx_presentation_members_p on presentation_members(presentation_id);
create index if not exists idx_presentation_members_u on presentation_members(user_id);


