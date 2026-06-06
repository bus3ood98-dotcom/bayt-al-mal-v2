-- بيت المال — إنشاء الجداول

create table if not exists expenses (
  id text primary key,
  amount numeric not null,
  place text not null,
  category integer not null default 15,
  note text default '',
  date timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists salary (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null default 0,
  pay_day integer not null default 24,
  extra_income numeric not null default 0,
  extra_note text default '',
  updated_at timestamptz default now()
);

create table if not exists goals (
  id text primary key,
  title text not null,
  icon text default '🎯',
  target_amount numeric not null,
  current_amount numeric not null default 0,
  target_date timestamptz,
  created_at timestamptz default now()
);

-- السماح بالقراءة والكتابة بدون تسجيل دخول
alter table expenses enable row level security;
alter table salary enable row level security;
alter table goals enable row level security;

create policy "allow all expenses" on expenses for all using (true) with check (true);
create policy "allow all salary" on salary for all using (true) with check (true);
create policy "allow all goals" on goals for all using (true) with check (true);
