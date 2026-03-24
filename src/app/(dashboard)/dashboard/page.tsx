'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, DollarSign, Wallet, TrendingUp, AlertTriangle,
  ChevronLeft, ChevronRight, Clock, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
} from 'date-fns';
import type { LoanEntry, PaymentSchedule, Borrower } from '@/types/database';

interface Stats {
  active_borrowers: number;
  total_lent: number;
  available_to_lend: number;
  total_interest: number;
  total_penalties: number;
}

interface ActiveLoan extends LoanEntry {
  borrower: Borrower;
}

interface ScheduleWithBorrower extends PaymentSchedule {
  borrower: Borrower;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    active_borrowers: 0,
    total_lent: 0,
    available_to_lend: 0,
    total_interest: 0,
    total_penalties: 0,
  });
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [monthSchedules, setMonthSchedules] = useState<ScheduleWithBorrower[]>([]);
  const [allSchedules, setAllSchedules] = useState<ScheduleWithBorrower[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [borrowersRes, loansRes, configRes, schedulesRes, paymentsRes] = await Promise.all([
        supabase
          .from('borrowers')
          .select('id', { count: 'exact' })
          .eq('lender_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('loan_entries')
          .select('*, borrower:borrowers(full_name)')
          .eq('lender_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('lending_configurations')
          .select('total_loanable_amount')
          .eq('lender_id', user.id)
          .single(),
        supabase
          .from('payment_schedules')
          .select('*, borrower:borrowers(full_name)')
          .eq('lender_id', user.id)
          .order('due_date', { ascending: true }),
        supabase
          .from('payments')
          .select('amount')
          .eq('lender_id', user.id),
      ]);

      const loans = (loansRes.data || []) as unknown as ActiveLoan[];
      const config = configRes.data;
      const schedules = (schedulesRes.data || []) as unknown as ScheduleWithBorrower[];
      const payments = paymentsRes.data || [];

      const activeBorrowers = borrowersRes.count || 0;

      const totalLent = loans
        .filter((l) => l.status !== 'paid')
        .reduce((sum, l) => sum + Number(l.principal_amount), 0);

      const totalLoanable = config?.total_loanable_amount || 0;
      const availableToLend = Math.max(0, Number(totalLoanable) - totalLent);

      const totalInterest = loans.reduce(
        (sum, l) => sum + (Number(l.total_amount) - Number(l.principal_amount)), 0
      );

      // Total penalties = sum of penalty_amount on paid schedules (collected)
      // + we can also look at total payments minus what would have been owed without penalties
      // Simplest: sum penalty_amount from all schedules that were paid (penalty was collected)
      const totalPenalties = schedules
        .filter(s => s.status === 'paid')
        .reduce((sum, s) => sum + Number(s.penalty_amount), 0);

      setStats({
        active_borrowers: activeBorrowers,
        total_lent: totalLent,
        available_to_lend: availableToLend,
        total_interest: totalInterest,
        total_penalties: totalPenalties,
      });

      setActiveLoans(loans.filter(l => l.status === 'active' || l.status === 'overdue'));
      setAllSchedules(schedules);

      // This month's pending schedules
      const now = new Date();
      const monthPending = schedules.filter(s =>
        s.status === 'pending' && isSameMonth(new Date(s.due_date), now)
      );
      setMonthSchedules(monthPending);

      setLoading(false);
    };

    fetchAll();
  }, [supabase]);

  // Calendar helpers
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getSchedulesForDate = (date: Date) =>
    allSchedules.filter(s => isSameDay(new Date(s.due_date), date));

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  const placeholder = (h: number) => (
    <div className={`bg-surface-lowest rounded-md animate-pulse`} style={{ height: h }} />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-label-md text-muted-foreground">Overview</p>
        <h1 className="text-display-md text-on-surface">Lending Dashboard</h1>
      </div>

      {/* Stat Cards — 2-col grid on mobile, 5-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-surface-lowest rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-muted-foreground">Active Borrowers</p>
            <Users size={16} className="text-muted-foreground" />
          </div>
          <p className={`text-headline-lg text-on-surface ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '—' : stats.active_borrowers}
          </p>
        </div>

        <div className="bg-surface-lowest rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-muted-foreground">Total Lent</p>
            <DollarSign size={16} className="text-muted-foreground" />
          </div>
          <p className={`text-headline-lg text-on-surface ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '—' : formatCurrency(stats.total_lent)}
          </p>
        </div>

        <div className="bg-surface-lowest rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-muted-foreground">Available to Lend</p>
            <Wallet size={16} className="text-muted-foreground" />
          </div>
          <p className={`text-headline-lg text-on-surface ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '—' : formatCurrency(stats.available_to_lend)}
          </p>
        </div>

        <div className="bg-surface-lowest rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-muted-foreground">Total Interest</p>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className={`text-headline-lg text-green-500 ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '—' : formatCurrency(stats.total_interest)}
          </p>
        </div>

        <div className="bg-surface-lowest rounded-md p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-muted-foreground">Penalties Collected</p>
            <AlertTriangle size={16} className="text-status-overdue" />
          </div>
          <p className={`text-headline-lg text-status-overdue ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '—' : formatCurrency(stats.total_penalties)}
          </p>
        </div>
      </div>

      {/* Quick Actions — vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="h-12 flex-1 btn-primary-gradient text-on-primary font-medium"
          onClick={() => router.push('/loans/new')}
        >
          <span className="mr-2">+</span> Create Loan
        </Button>
        <Button
          variant="secondary"
          className="h-12 flex-1 bg-surface-lowest text-on-surface font-medium"
          onClick={() => router.push('/payments/new')}
        >
          <span className="mr-2">+</span> Record Payment
        </Button>
        <Button
          variant="secondary"
          className="h-12 flex-1 bg-surface-lowest text-on-surface font-medium"
          onClick={() => router.push('/users')}
        >
          <span className="mr-2">+</span> Add User
        </Button>
      </div>

      {/* Main content — calendar + widgets side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">
              {format(calendarMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-surface-lowest rounded-md p-3">
            <div className="grid grid-cols-7 mb-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {calDays.map((day) => {
                const daySchedules = getSchedulesForDate(day);
                const inMonth = isSameMonth(day, calendarMonth);
                const isSel = selectedDate && isSameDay(day, selectedDate);
                const isT = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center py-1.5 rounded transition-colors text-xs ${
                      !inMonth ? 'opacity-30' : ''
                    } ${isSel ? 'bg-primary text-primary-foreground' : ''} ${
                      isT && !isSel ? 'bg-surface-low' : ''
                    }`}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    {daySchedules.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {daySchedules.slice(0, 3).map((s) => {
                          const overdue = s.status === 'pending' && isBefore(new Date(s.due_date), new Date()) && !isSameDay(new Date(s.due_date), new Date());
                          return (
                            <div
                              key={s.id}
                              className={`w-1 h-1 rounded-full ${
                                s.status === 'paid' ? 'bg-muted-foreground' : overdue ? 'bg-status-overdue' : 'bg-status-ontime'
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date events */}
          {selectedDate && selectedDateSchedules.length > 0 && (
            <div className="space-y-2">
              <p className="text-label-sm text-muted-foreground">{format(selectedDate, 'MMMM d, yyyy')}</p>
              {selectedDateSchedules.map((s) => {
                const penalty = Number(s.penalty_amount) || 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/loans/${s.loan_id}`)}
                    className="w-full bg-surface-lowest rounded-md p-3 flex items-center justify-between text-left hover:bg-surface-low/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm text-on-surface">
                        {formatCurrency(Number(s.amount) + penalty)} · {(s.borrower as unknown as { full_name: string })?.full_name}
                      </p>
                      {penalty > 0 && (
                        <p className="text-[10px] text-status-overdue">includes {formatCurrency(penalty)} penalty</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      s.status === 'paid' ? 'text-muted-foreground bg-muted-foreground/10' : 'text-status-ontime bg-status-ontime/10'
                    }`}>
                      {s.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Loans + Monthly Collections */}
        <div className="space-y-6">
          {/* Active Loans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm text-on-surface">Active Loans</h2>
              <button
                onClick={() => router.push('/loans')}
                className="text-xs text-muted-foreground hover:text-on-surface transition-colors"
              >
                View all
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="bg-surface-lowest rounded-md h-16 animate-pulse" />)}</div>
            ) : activeLoans.length === 0 ? (
              <div className="bg-surface-lowest rounded-md p-6 text-center">
                <p className="text-sm text-muted-foreground">No active loans.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {activeLoans.slice(0, 10).map((loan) => {
                  const borrowerName = (loan.borrower as unknown as { full_name: string })?.full_name ?? 'Unknown';
                  const paid = Number(loan.amount_paid);
                  const total = Number(loan.total_amount);
                  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
                  const isOverdue = loan.status === 'overdue';
                  return (
                    <button
                      key={loan.id}
                      onClick={() => router.push(`/loans/${loan.id}`)}
                      className="w-full bg-surface-lowest rounded-md p-3 flex items-center gap-3 text-left hover:bg-surface-low/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-on-surface truncate">{borrowerName}</p>
                          {isOverdue && <AlertTriangle size={12} className="text-status-overdue shrink-0" />}
                        </div>
                        <div className="mt-1 h-1 w-full bg-surface-low rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatCurrency(paid)} / {formatCurrency(total)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(loan.due_date), 'MMM d')}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* This Month's Upcoming Collections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm text-on-surface">
                {format(new Date(), 'MMMM')} Collections
              </h2>
              <span className="text-label-sm text-muted-foreground">
                {monthSchedules.length} pending
              </span>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="bg-surface-lowest rounded-md h-14 animate-pulse" />)}</div>
            ) : monthSchedules.length === 0 ? (
              <div className="bg-surface-lowest rounded-md p-6 text-center">
                <p className="text-sm text-muted-foreground">No pending collections this month.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {monthSchedules.map((s) => {
                  const borrowerName = (s.borrower as unknown as { full_name: string })?.full_name ?? 'Unknown';
                  const penalty = Number(s.penalty_amount) || 0;
                  const isOverdue = isBefore(new Date(s.due_date), new Date()) && !isSameDay(new Date(s.due_date), new Date());
                  return (
                    <button
                      key={s.id}
                      onClick={() => router.push(`/loans/${s.loan_id}`)}
                      className="w-full bg-surface-lowest rounded-md p-3 flex items-center justify-between text-left hover:bg-surface-low/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isOverdue ? (
                          <AlertTriangle size={14} className="text-status-overdue shrink-0" />
                        ) : (
                          <Clock size={14} className="text-status-ontime shrink-0" />
                        )}
                        <div>
                          <p className="text-sm text-on-surface">{borrowerName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Due {format(new Date(s.due_date), 'MMM d')}
                            {isOverdue && ' · overdue'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-on-surface">
                          {formatCurrency(Number(s.amount) + penalty)}
                        </p>
                        {penalty > 0 && (
                          <p className="text-[10px] text-status-overdue">+{formatCurrency(penalty)}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
                <div className="px-3 pt-1">
                  <p className="text-label-sm text-muted-foreground">
                    Total: {formatCurrency(monthSchedules.reduce((sum, s) => sum + Number(s.amount) + (Number(s.penalty_amount) || 0), 0))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
