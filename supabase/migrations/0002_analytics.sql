-- Analytics cache table
create table if not exists analytics_cache (
  id bigserial primary key,
  metric_name text not null,
  metric_value numeric,
  date_generated timestamptz default now()
);

create index if not exists idx_analytics_cache_metric_date
  on analytics_cache(metric_name, date_generated desc);


