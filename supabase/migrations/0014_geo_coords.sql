alter table schools add column if not exists lat double precision;
alter table schools add column if not exists lng double precision;
create index if not exists idx_schools_latlng on schools(lat, lng);

alter table chapters add column if not exists lat double precision;
alter table chapters add column if not exists lng double precision;
create index if not exists idx_chapters_latlng on chapters(lat, lng);


