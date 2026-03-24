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
  notes text,
  payment_frequency text not null default 'monthly' check (payment_frequency in ('monthly', 'semi_monthly')),
  grace_period_days integer not null default 0,
  penalty_type text check (penalty_type in ('percentage', 'fixed_amount')),
  penalty_rate numeric(10,2) default 0,
  penalty_frequency text check (penalty_frequency in ('daily', 'monthly', 'one_time')),
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
  paid_at timestamptz,
  penalty_amount numeric(12,2) not null default 0,
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

-- ============================================
-- Penalty Computation Functions & Triggers
-- ============================================

-- Compute penalties for a single loan (used by triggers)
create or replace function public.compute_loan_penalties(p_loan_id uuid)
returns void as $$
declare
  rec record;
  loan_rec record;
  days_late integer;
  penalty_days integer;
  months_late integer;
  computed_penalty numeric(12,2);
begin
  select grace_period_days, penalty_type, penalty_rate, penalty_frequency
    into loan_rec
    from public.loan_entries
    where id = p_loan_id;

  if loan_rec is null
    or loan_rec.grace_period_days is null or loan_rec.grace_period_days = 0
    or loan_rec.penalty_rate is null or loan_rec.penalty_rate = 0
    or loan_rec.penalty_type is null
  then
    update public.payment_schedules set penalty_amount = 0
      where loan_id = p_loan_id and penalty_amount <> 0;
    return;
  end if;

  for rec in
    select id as schedule_id, amount as schedule_amount, due_date
    from public.payment_schedules
    where loan_id = p_loan_id and status = 'pending'
  loop
    if rec.due_date >= current_date then
      update public.payment_schedules set penalty_amount = 0
        where id = rec.schedule_id and penalty_amount <> 0;
      continue;
    end if;

    days_late := current_date - rec.due_date;

    if days_late <= loan_rec.grace_period_days then
      update public.payment_schedules set penalty_amount = 0
        where id = rec.schedule_id and penalty_amount <> 0;
      continue;
    end if;

    penalty_days := days_late - loan_rec.grace_period_days;

    if loan_rec.penalty_type = 'percentage' then
      if loan_rec.penalty_frequency = 'daily' then
        computed_penalty := rec.schedule_amount * (loan_rec.penalty_rate / 100.0) * penalty_days;
      elsif loan_rec.penalty_frequency = 'monthly' then
        months_late := greatest(1, penalty_days / 30);
        computed_penalty := rec.schedule_amount * (loan_rec.penalty_rate / 100.0) * months_late;
      else
        computed_penalty := rec.schedule_amount * (loan_rec.penalty_rate / 100.0);
      end if;
    else
      if loan_rec.penalty_frequency = 'daily' then
        computed_penalty := loan_rec.penalty_rate * penalty_days;
      elsif loan_rec.penalty_frequency = 'monthly' then
        months_late := greatest(1, penalty_days / 30);
        computed_penalty := loan_rec.penalty_rate * months_late;
      else
        computed_penalty := loan_rec.penalty_rate;
      end if;
    end if;

    computed_penalty := round(computed_penalty, 2);

    update public.payment_schedules
      set penalty_amount = computed_penalty
      where id = rec.schedule_id
        and penalty_amount is distinct from computed_penalty;
  end loop;
end;
$$ language plpgsql security definer;

-- Global compute (all loans — for manual runs)
create or replace function public.compute_penalties()
returns void as $$
declare
  lid uuid;
begin
  for lid in
    select distinct id from public.loan_entries
    where grace_period_days > 0 and penalty_rate > 0
      and penalty_type is not null and status in ('active', 'overdue')
  loop
    perform public.compute_loan_penalties(lid);
  end loop;
end;
$$ language plpgsql security definer;

-- Trigger functions
create or replace function public.trigger_compute_loan_penalties()
returns trigger as $$
begin
  perform public.compute_loan_penalties(new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.trigger_compute_schedule_penalties()
returns trigger as $$
begin
  perform public.compute_loan_penalties(new.loan_id);
  return new;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger compute_penalties_on_loan_change
  after insert or update of grace_period_days, penalty_type, penalty_rate, penalty_frequency, status
  on public.loan_entries
  for each row execute function public.trigger_compute_loan_penalties();

create trigger compute_penalties_on_schedule_change
  after insert or update of status, due_date
  on public.payment_schedules
  for each row execute function public.trigger_compute_schedule_penalties();

-- To manually recompute all penalties:
--   select public.compute_penalties();
--
-- Optionally schedule with pg_cron (if enabled):
--   select cron.schedule('compute-penalties', '0 1 * * *', 'select public.compute_penalties()');
