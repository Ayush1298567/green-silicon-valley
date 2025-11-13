create table if not exists email_templates (
  id bigserial primary key,
  key text unique not null,
  subject text not null,
  body text not null,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz default now()
);

alter table email_templates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='email_tpl_select_auth') then
    create policy email_tpl_select_auth on email_templates for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where polname='email_tpl_write_founder') then
    create policy email_tpl_write_founder on email_templates for all using (user_role() = 'founder');
  end if;
end $$;


