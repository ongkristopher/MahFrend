-- ============================================
-- MahFrend Database Schema for Supabase
-- Run this in the Supabase SQL Editor
-- ============================================

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lending Configuration
create table public.lending_configurations (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid references public.profiles(id) on delete cascade not null,
  total_loanable_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lender_id)
);

alter table public.lending_configurations enable row level security;

create policy "Users can manage own config"
  on public.lending_configurations for all
  using (auth.uid() = lender_id);

-- Borrowers
create table public.borrowers (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.borrowers enable row level security;

create policy "Users can manage own borrowers"
  on public.borrowers for all
  using (auth.uid() = lender_id);

-- Loan Entries
create table public.loan_entries (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid references public.profiles(id) on delete cascade not null,
  borrower_id uuid references public.borrowers(id) on delete cascade not null,
  principal_amount numeric(12,2) not null,
  interest_rate numeric(5,2) not null default 0,
  duration_months integer,
  total_amount numeric(12,2) not null,
  amount_paid numeric(12,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'paid', 'overdue', 'defaulted')),
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.loan_entries enable row level security;

create policy "Users can manage own loans"
  on public.loan_entries for all
  using (auth.uid() = lender_id);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references public.loan_entries(id) on delete cascade not null,
  lender_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can manage own payments"
  on public.payments for all
  using (auth.uid() = lender_id);

-- Payment Schedules (auto-generated monthly installments)
create table public.payment_schedules (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references public.loan_entries(id) on delete cascade not null,
  lender_id uuid references public.profiles(id) on delete cascade not null,
  borrower_id uuid references public.borrowers(id) on delete cascade not null,
  due_date date not null,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

alter table public.payment_schedules enable row level security;

create policy "Users can manage own payment schedules"
  on public.payment_schedules for all
  using (auth.uid() = lender_id);

-- Updated_at trigger function
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_lending_configurations_updated_at
  before update on public.lending_configurations
  for each row execute function public.update_updated_at();

create trigger update_borrowers_updated_at
  before update on public.borrowers
  for each row execute function public.update_updated_at();

create trigger update_loan_entries_updated_at
  before update on public.loan_entries
  for each row execute function public.update_updated_at();
