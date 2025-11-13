-- Demo users (ids to be replaced with real auth.users ids when available)
insert into users (id, name, email, role)
values
  (gen_random_uuid(), 'Founder One', 'founder@example.com', 'founder'),
  (gen_random_uuid(), 'Intern One', 'intern@example.com', 'intern'),
  (gen_random_uuid(), 'Volunteer One', 'volunteer@example.com', 'volunteer')
on conflict do nothing;

insert into schools (name, district, teacher_name, email)
values
  ('Maple Elementary', 'Santa Clara USD', 'Ms. Lee', 'mlee@school.org'),
  ('Cedar Middle', 'San Jose USD', 'Mr. Chen', 'mchen@school.org')
on conflict do nothing;

insert into chapters (name, region, leader, volunteers_count, status)
values
  ('San Jose', 'California', 'A. Rivera', 18, 'active'),
  ('Sunnyvale', 'California', 'S. Patel', 12, 'active')
on conflict do nothing;

insert into system_logs (event_type, description)
values
  ('seed', 'Seed data inserted');


