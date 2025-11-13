-- Add unique constraint for volunteers.team_name so it can be referenced
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'uq_volunteers_team_name'
  ) then
    alter table volunteers
      add constraint uq_volunteers_team_name unique (team_name);
  end if;
end $$;

-- Add FK from presentations.volunteer_team -> volunteers.team_name
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_presentations_volunteer_team'
  ) then
    alter table presentations
      add constraint fk_presentations_volunteer_team
      foreign key (volunteer_team) references volunteers(team_name) on update cascade on delete set null;
  end if;
end $$;

-- Add leader_user_id to chapters and reference users(id)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='chapters' and column_name='leader_user_id'
  ) then
    alter table chapters add column leader_user_id uuid references users(id) on delete set null;
    create index if not exists idx_chapters_leader_user on chapters(leader_user_id);
  end if;
end $$;


