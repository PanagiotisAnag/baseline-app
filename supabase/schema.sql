-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workout logs
create table if not exists workout_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  duration_minutes integer not null,
  calories_burned integer,
  notes text,
  logged_at date not null default current_date,
  created_at timestamptz default now()
);

-- Diet logs
create table if not exists diet_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  meal_name text not null,
  calories integer not null,
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  logged_at date not null default current_date,
  created_at timestamptz default now()
);

-- Diet goals
create table if not exists diet_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  daily_calories integer not null,
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1)
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  amount numeric(10,2) not null,
  type text check (type in ('income', 'expense')) not null,
  category text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Work sessions
create table if not exists work_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  duration_minutes integer not null,
  notes text,
  logged_at date not null default current_date,
  created_at timestamptz default now()
);

-- Todos
create table if not exists todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date date,
  created_at timestamptz default now()
);

-- Activities
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text not null,
  duration_minutes integer,
  notes text,
  logged_at date not null default current_date,
  created_at timestamptz default now()
);

-- Row Level Security
alter table workout_logs enable row level security;
alter table diet_logs enable row level security;
alter table diet_goals enable row level security;
alter table transactions enable row level security;
alter table work_sessions enable row level security;
alter table todos enable row level security;
alter table activities enable row level security;

-- RLS Policies (users can only access their own data)
create policy "Users own workout_logs" on workout_logs for all using (auth.uid() = user_id);
create policy "Users own diet_logs" on diet_logs for all using (auth.uid() = user_id);
create policy "Users own diet_goals" on diet_goals for all using (auth.uid() = user_id);
create policy "Users own transactions" on transactions for all using (auth.uid() = user_id);
create policy "Users own work_sessions" on work_sessions for all using (auth.uid() = user_id);
create policy "Users own todos" on todos for all using (auth.uid() = user_id);
create policy "Users own activities" on activities for all using (auth.uid() = user_id);
