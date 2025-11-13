-- Content blocks
create table if not exists content_blocks (
  id bigserial primary key,
  key text unique not null,
  title text,
  content text,
  version integer default 1,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz default now()
);

alter table content_blocks enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='cb_select_public') then
    create policy cb_select_public on content_blocks for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname='cb_write_founder') then
    create policy cb_write_founder on content_blocks for all using (user_role() = 'founder');
  end if;
end $$;

-- Navigation links
create table if not exists nav_links (
  id bigserial primary key,
  label text not null,
  href text not null,
  link_order integer default 0,
  role_visibility text default 'public', -- public, auth, founder, intern, volunteer, teacher, partner
  enabled boolean default true
);

alter table nav_links enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='nav_select') then
    create policy nav_select on nav_links for select
      using (
        enabled = true and (
          role_visibility = 'public'
          or (auth.role() = 'authenticated' and role_visibility in ('auth','founder','intern','volunteer','teacher','partner'))
        )
      );
  end if;
  if not exists (select 1 from pg_policies where polname='nav_write_founder') then
    create policy nav_write_founder on nav_links for all using (user_role() = 'founder');
  end if;
end $$;

-- Blog posts
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  author_id uuid references users(id) on delete set null,
  cover_image text,
  category text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table blog_posts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='blog_select') then
    create policy blog_select on blog_posts for select
      using (published = true or user_role() in ('founder','intern'));
  end if;
  if not exists (select 1 from pg_policies where polname='blog_write_staff') then
    create policy blog_write_staff on blog_posts for all using (user_role() in ('founder','intern'));
  end if;
end $$;

-- Bulletin posts
create table if not exists bulletin_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  author_id uuid references users(id) on delete cascade,
  audience text default 'all',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table bulletin_posts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname='bulletin_read_all') then
    create policy bulletin_read_all on bulletin_posts for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where polname='bulletin_write_admins') then
    create policy bulletin_write_admins on bulletin_posts for all using (user_role() in ('founder','intern'));
  end if;
end $$;


