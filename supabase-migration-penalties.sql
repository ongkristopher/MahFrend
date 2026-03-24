-- ============================================
-- Migration: Add penalty system to MahFrend
-- Run this in the Supabase SQL Editor
-- ============================================

-- Step 1: Add penalty_amount column to payment_schedules
ALTER TABLE public.payment_schedules
  ADD COLUMN IF NOT EXISTS penalty_amount numeric(12,2) NOT NULL DEFAULT 0;

-- Step 2: Create penalty computation for a single loan (efficient, used by triggers)
CREATE OR REPLACE FUNCTION public.compute_loan_penalties(p_loan_id uuid)
RETURNS void AS $$
DECLARE
  rec record;
  loan_rec record;
  days_late integer;
  penalty_days integer;
  months_late integer;
  computed_penalty numeric(12,2);
BEGIN
  -- Get loan penalty rules
  SELECT grace_period_days, penalty_type, penalty_rate, penalty_frequency
    INTO loan_rec
    FROM public.loan_entries
    WHERE id = p_loan_id;

  -- If no penalty rules, reset any existing penalties and exit
  IF loan_rec IS NULL
    OR loan_rec.grace_period_days IS NULL
    OR loan_rec.grace_period_days = 0
    OR loan_rec.penalty_rate IS NULL
    OR loan_rec.penalty_rate = 0
    OR loan_rec.penalty_type IS NULL
  THEN
    UPDATE public.payment_schedules
      SET penalty_amount = 0
      WHERE loan_id = p_loan_id AND penalty_amount <> 0;
    RETURN;
  END IF;

  -- Compute penalties for each pending overdue schedule of this loan
  FOR rec IN
    SELECT id AS schedule_id, amount AS schedule_amount, due_date
    FROM public.payment_schedules
    WHERE loan_id = p_loan_id
      AND status = 'pending'
  LOOP
    -- Not overdue yet → reset
    IF rec.due_date >= current_date THEN
      IF EXISTS (SELECT 1 FROM public.payment_schedules WHERE id = rec.schedule_id AND penalty_amount <> 0) THEN
        UPDATE public.payment_schedules SET penalty_amount = 0 WHERE id = rec.schedule_id;
      END IF;
      CONTINUE;
    END IF;

    days_late := current_date - rec.due_date;

    -- Within grace period → reset
    IF days_late <= loan_rec.grace_period_days THEN
      IF EXISTS (SELECT 1 FROM public.payment_schedules WHERE id = rec.schedule_id AND penalty_amount <> 0) THEN
        UPDATE public.payment_schedules SET penalty_amount = 0 WHERE id = rec.schedule_id;
      END IF;
      CONTINUE;
    END IF;

    penalty_days := days_late - loan_rec.grace_period_days;

    IF loan_rec.penalty_type = 'percentage' THEN
      IF loan_rec.penalty_frequency = 'daily' THEN
        computed_penalty := rec.schedule_amount * (loan_rec.penalty_rate / 100.0) * penalty_days;
      ELSIF loan_rec.penalty_frequency = 'monthly' THEN
        months_late := greatest(1, penalty_days / 30);
        computed_penalty := rec.schedule_amount * (loan_rec.penalty_rate / 100.0) * months_late;
      ELSE -- one_time
        computed_penalty := rec.schedule_amount * (loan_rec.penalty_rate / 100.0);
      END IF;
    ELSE -- fixed_amount
      IF loan_rec.penalty_frequency = 'daily' THEN
        computed_penalty := loan_rec.penalty_rate * penalty_days;
      ELSIF loan_rec.penalty_frequency = 'monthly' THEN
        months_late := greatest(1, penalty_days / 30);
        computed_penalty := loan_rec.penalty_rate * months_late;
      ELSE -- one_time
        computed_penalty := loan_rec.penalty_rate;
      END IF;
    END IF;

    computed_penalty := round(computed_penalty, 2);

    UPDATE public.payment_schedules
      SET penalty_amount = computed_penalty
      WHERE id = rec.schedule_id
        AND penalty_amount IS DISTINCT FROM computed_penalty;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Global compute (recomputes all loans — for manual runs)
CREATE OR REPLACE FUNCTION public.compute_penalties()
RETURNS void AS $$
DECLARE
  loan_id uuid;
BEGIN
  FOR loan_id IN
    SELECT DISTINCT le.id
    FROM public.loan_entries le
    WHERE le.grace_period_days > 0
      AND le.penalty_rate > 0
      AND le.penalty_type IS NOT NULL
      AND le.status IN ('active', 'overdue')
  LOOP
    PERFORM public.compute_loan_penalties(loan_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Trigger function — fires on loan_entries changes
CREATE OR REPLACE FUNCTION public.trigger_compute_loan_penalties()
RETURNS trigger AS $$
BEGIN
  PERFORM public.compute_loan_penalties(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Trigger function — fires on payment_schedules changes
CREATE OR REPLACE FUNCTION public.trigger_compute_schedule_penalties()
RETURNS trigger AS $$
BEGIN
  PERFORM public.compute_loan_penalties(NEW.loan_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create triggers

-- Recompute penalties when a loan entry is created or its penalty rules change
DROP TRIGGER IF EXISTS compute_penalties_on_loan_change ON public.loan_entries;
CREATE TRIGGER compute_penalties_on_loan_change
  AFTER INSERT OR UPDATE OF grace_period_days, penalty_type, penalty_rate, penalty_frequency, status
  ON public.loan_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_compute_loan_penalties();

-- Recompute penalties when a payment schedule is created or its status changes
DROP TRIGGER IF EXISTS compute_penalties_on_schedule_change ON public.payment_schedules;
CREATE TRIGGER compute_penalties_on_schedule_change
  AFTER INSERT OR UPDATE OF status, due_date
  ON public.payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_compute_schedule_penalties();

-- Step 7: Run immediately to compute current penalties for all loans
SELECT public.compute_penalties();
