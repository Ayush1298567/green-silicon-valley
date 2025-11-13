-- Marketing Automations Tables

create extension if not exists pgcrypto;

create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  campaign_type text not null default 'newsletter',
  audience text not null default 'all',
  status text not null default 'draft',
  subject text not null,
  body text not null,
  send_at timestamptz,
  sent_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists marketing_logs (
  id bigserial primary key,
  campaign_id uuid references marketing_campaigns(id) on delete cascade,
  recipient text,
  status text,
  detail text,
  created_at timestamptz default now()
);

create index if not exists idx_marketing_campaigns_status on marketing_campaigns(status);
create index if not exists idx_marketing_campaigns_send_at on marketing_campaigns(send_at);
create index if not exists idx_marketing_logs_campaign on marketing_logs(campaign_id);

alter table marketing_campaigns enable row level security;
alter table marketing_logs enable row level security;

-- RLS Policies
drop policy if exists "Campaigns readable by staff" on marketing_campaigns;
create policy "Campaigns readable by staff" on marketing_campaigns for select
  using (
    exists (
      select 1 from users where id = auth.uid() and role = 'founder'
    )
  );

drop policy if exists "Campaigns manageable by founders" on marketing_campaigns;
create policy "Campaigns manageable by founders" on marketing_campaigns for all
  using (
    exists (
      select 1 from users where id = auth.uid() and role = 'founder'
    )
  );

drop policy if exists "Logs readable by staff" on marketing_logs;
create policy "Logs readable by staff" on marketing_logs for select
  using (
    exists (
      select 1 from users where id = auth.uid() and role = 'founder'
    )
  );

drop policy if exists "Logs insertable by service" on marketing_logs;
create policy "Logs insertable by service" on marketing_logs for insert
  with check (true);

-- Trigger to keep updated_at current
create or replace function set_marketing_campaigns_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_marketing_campaigns_updated_at on marketing_campaigns;
create trigger trg_marketing_campaigns_updated_at before update on marketing_campaigns
for each row execute function set_marketing_campaigns_updated_at();
