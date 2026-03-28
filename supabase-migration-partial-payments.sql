-- Migration: Add amount_paid and penalty_paid to payment_schedules
-- Run this in your Supabase SQL editor

-- 1. Add amount_paid column (tracks how much principal has been paid toward this schedule)
alter table public.payment_schedules
  add column if not exists amount_paid numeric(12,2) not null default 0;

-- 2. Add penalty_paid column (permanent record of penalty collected — not affected by trigger)
alter table public.payment_schedules
  add column if not exists penalty_paid numeric(12,2) not null default 0;

-- 3. Backfill: paid schedules have amount_paid = amount (fully paid)
update public.payment_schedules
  set amount_paid = amount
  where status = 'paid' and amount_paid = 0;

-- 4. Backfill: paid schedules that had a penalty_amount at time of payment
--    (penalty_amount on paid schedules is the best approximation we have)
update public.payment_schedules
  set penalty_paid = penalty_amount
  where status = 'paid' and penalty_amount > 0 and penalty_paid = 0;

-- 5. Backfill partial payments: for each loan, if loan.amount_paid > sum of paid schedules,
--    the remainder is a partial payment on the first pending schedule.
do $$
declare
  loan_rec record;
  paid_total numeric;
  partial_remainder numeric;
  first_pending_id uuid;
begin
  for loan_rec in
    select id, amount_paid from public.loan_entries where amount_paid > 0
  loop
    -- Sum of fully-paid schedule amounts for this loan
    select coalesce(sum(amount), 0) into paid_total
      from public.payment_schedules
      where loan_id = loan_rec.id and status = 'paid';

    partial_remainder := loan_rec.amount_paid - paid_total;

    if partial_remainder > 0 then
      -- Find the first pending schedule
      select id into first_pending_id
        from public.payment_schedules
        where loan_id = loan_rec.id and status = 'pending'
        order by due_date asc
        limit 1;

      if first_pending_id is not null then
        update public.payment_schedules
          set amount_paid = partial_remainder
          where id = first_pending_id;
      end if;
    end if;
  end loop;
end $$;

-- 6. Atomic increment function for partial payments (avoids read-then-write bugs)
create or replace function public.increment_schedule_payment(
  p_schedule_id uuid,
  p_amount_paid numeric,
  p_penalty_paid numeric
) returns void as $$
  update public.payment_schedules
  set amount_paid = amount_paid + p_amount_paid,
      penalty_paid = penalty_paid + p_penalty_paid
  where id = p_schedule_id;
$$ language sql security definer;

-- 7. Mark schedule as fully paid with final amounts
create or replace function public.mark_schedule_paid(
  p_schedule_id uuid,
  p_penalty_collected numeric
) returns void as $$
  update public.payment_schedules
  set status = 'paid',
      paid_at = now(),
      amount_paid = amount,
      penalty_paid = penalty_paid + p_penalty_collected
  where id = p_schedule_id;
$$ language sql security definer;
