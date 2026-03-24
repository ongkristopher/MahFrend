'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  differenceInDays,
  isBefore,
} from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle, Banknote, ArrowDownCircle, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { PaymentSchedule, Borrower } from '@/types/database';

interface CalendarSchedule extends PaymentSchedule {
  borrower: Borrower;
  display_status: 'on-time' | 'approaching' | 'overdue' | 'paid';
}

interface CalendarPayment {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  loan_id: string;
  borrower_name: string;
  created_at: string;
}

interface CalendarLoan {
  id: string;
  principal_amount: number;
  total_amount: number;
  interest_rate: number;
  status: string;
  notes: string | null;
  borrower_name: string;
  created_at: string;
}

type CalendarEvent =
  | { type: 'schedule'; data: CalendarSchedule }
  | { type: 'payment'; data: CalendarPayment }
  | { type: 'loan'; data: CalendarLoan };

// Returns a Tailwind bg class for the event's color marker
function getEventColor(evt: CalendarEvent): string {
  if (evt.type === 'loan') return 'bg-orange-500';
  if (evt.type === 'payment') return 'bg-green-500';
  // schedule
  switch (evt.data.display_status) {
    case 'overdue': return 'bg-status-overdue';
    case 'approaching': return 'bg-status-approaching';
    case 'paid': return 'bg-muted-foreground';
    default: return 'bg-status-ontime';
  }
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [schedules, setSchedules] = useState<CalendarSchedule[]>([]);
  const [payments, setPayments] = useState<CalendarPayment[]>([]);
  const [loans, setLoans] = useState<CalendarLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [schedulesRes, paymentsRes, loansRes] = await Promise.all([
        supabase
          .from('payment_schedules')
          .select('*, borrower:borrowers(*)')
          .eq('lender_id', user.id),
        supabase
          .from('payments')
          .select('id, amount, payment_date, notes, loan_id, created_at, loan:loan_entries(borrower:borrowers(full_name))')
          .eq('lender_id', user.id),
        supabase
          .from('loan_entries')
          .select('id, principal_amount, total_amount, interest_rate, status, notes, created_at, borrower:borrowers(full_name)')
          .eq('lender_id', user.id),
      ]);

      if (schedulesRes.data) {
        const today = new Date();
        const enriched = schedulesRes.data.map((schedule) => {
          const dueDate = new Date(schedule.due_date);

          let display_status: 'on-time' | 'approaching' | 'overdue' | 'paid';
          if (schedule.status === 'paid') {
            display_status = 'paid';
          } else if (isBefore(dueDate, today) && !isSameDay(dueDate, today)) {
            display_status = 'overdue';
          } else if (differenceInDays(dueDate, today) <= 7) {
            display_status = 'approaching';
          } else {
            display_status = 'on-time';
          }

          return { ...schedule, display_status } as CalendarSchedule;
        });
        setSchedules(enriched);
      }

      if (paymentsRes.data) {
        const mapped = paymentsRes.data.map((p: Record<string, unknown>) => {
          const loan = p.loan as { borrower?: { full_name?: string } } | null;
          return {
            id: p.id as string,
            amount: p.amount as number,
            payment_date: p.payment_date as string,
            notes: p.notes as string | null,
            loan_id: p.loan_id as string,
            borrower_name: loan?.borrower?.full_name ?? 'Unknown',
            created_at: p.created_at as string,
          };
        });
        setPayments(mapped);
      }

      if (loansRes.data) {
        const mapped = loansRes.data.map((l: Record<string, unknown>) => {
          const borrower = l.borrower as { full_name?: string } | null;
          return {
            id: l.id as string,
            principal_amount: l.principal_amount as number,
            total_amount: l.total_amount as number,
            interest_rate: l.interest_rate as number,
            status: l.status as string,
            notes: l.notes as string | null,
            borrower_name: borrower?.full_name ?? 'Unknown',
            created_at: l.created_at as string,
          };
        });
        setLoans(mapped);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSchedulesForDate = (date: Date) =>
    schedules.filter((s) => isSameDay(new Date(s.due_date), date));

  const getPaymentsForDate = (date: Date) =>
    payments.filter((p) => isSameDay(new Date(p.payment_date), date));

  const getLoansForDate = (date: Date) =>
    loans.filter((l) => isSameDay(new Date(l.created_at), date));

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const l = getLoansForDate(date).map((d) => ({ type: 'loan' as const, data: d }));
    const s = getSchedulesForDate(date).map((d) => ({ type: 'schedule' as const, data: d }));
    const p = getPaymentsForDate(date).map((d) => ({ type: 'payment' as const, data: d }));
    return [...l, ...s, ...p];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle size={14} className="text-status-overdue" />;
      case 'approaching': return <Clock size={14} className="text-status-approaching" />;
      case 'paid': return <CheckCircle size={14} className="text-muted-foreground" />;
      default: return <CheckCircle size={14} className="text-status-ontime" />;
    }
  };

  const formatTime = (dateStr: string) => format(new Date(dateStr), 'h:mm a');

  const handleRecordPayment = (e: React.MouseEvent, schedule: CalendarSchedule) => {
    e.stopPropagation();
    router.push(`/payments/new?borrower=${schedule.borrower_id}&loan=${schedule.loan_id}`);
  };

  // Filter schedules to current month only
  const monthPendingSchedules = useMemo(() =>
    schedules.filter((s) => s.status === 'pending' && isSameMonth(new Date(s.due_date), currentMonth)),
    [schedules, currentMonth]
  );
  const overdueSchedules = monthPendingSchedules.filter((s) => s.display_status === 'overdue');
  const approachingSchedules = monthPendingSchedules.filter((s) => s.display_status === 'approaching');
  const upcomingSchedules = monthPendingSchedules.filter((s) => s.display_status === 'on-time');

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg text-on-surface">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          Loan Created
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Payment
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-ontime" />
          On Time
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-approaching" />
          Upcoming
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-overdue" />
          Overdue
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          Paid
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface-lowest rounded-md p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-label-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today_ = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col items-center py-2 rounded-md transition-colors ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${isSelected ? 'bg-primary text-primary-foreground' : ''} ${
                  today_ && !isSelected ? 'bg-surface-low' : ''
                }`}
              >
                <span className="text-sm font-medium">{format(day, 'd')}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 4).map((evt) => (
                      <div
                        key={evt.data.id}
                        className={`w-1.5 h-1.5 rounded-full ${getEventColor(evt)}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          {selectedDateEvents.map((evt) => {
            if (evt.type === 'loan') {
              return (
                <button
                  key={`l-${evt.data.id}`}
                  onClick={() => router.push(`/loans/${evt.data.id}`)}
                  className="w-full bg-surface-lowest rounded-md overflow-hidden flex text-left hover:bg-surface-low/50 transition-colors"
                >
                  <div className={`w-1 shrink-0 ${getEventColor(evt)}`} />
                  <div className="flex-1 p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-headline-sm text-on-surface">
                        {formatCurrency(evt.data.total_amount)} · {evt.data.borrower_name}
                      </p>
                      <p className="text-body-md text-muted-foreground">
                        Loan created · {formatCurrency(evt.data.principal_amount)} principal
                        {Number(evt.data.interest_rate) > 0 && ` · ${Number(evt.data.interest_rate)}% interest`}
                      </p>
                      {evt.data.notes && (
                        <p className="text-xs text-muted-foreground/80 italic">{evt.data.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatTime(evt.data.created_at)}</p>
                    </div>
                    <FilePlus2 size={16} className="text-orange-500 mt-1 shrink-0" />
                  </div>
                </button>
              );
            }

            if (evt.type === 'payment') {
              return (
                <button
                  key={`p-${evt.data.id}`}
                  onClick={() => router.push(`/loans/${evt.data.loan_id}`)}
                  className="w-full bg-surface-lowest rounded-md overflow-hidden flex text-left hover:bg-surface-low/50 transition-colors"
                >
                  <div className={`w-1 shrink-0 ${getEventColor(evt)}`} />
                  <div className="flex-1 p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-headline-sm text-green-500">
                        {formatCurrency(evt.data.amount, { sign: true })} · {evt.data.borrower_name}
                      </p>
                      <p className="text-body-md text-muted-foreground">
                        Payment received{evt.data.notes ? ` · ${evt.data.notes}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTime(evt.data.created_at)}</p>
                    </div>
                    <ArrowDownCircle size={16} className="text-green-500 mt-1 shrink-0" />
                  </div>
                </button>
              );
            }

            // schedule
            return (
              <button
                key={`s-${evt.data.id}`}
                onClick={() => router.push(`/loans/${evt.data.loan_id}`)}
                className="w-full bg-surface-lowest rounded-md overflow-hidden flex text-left hover:bg-surface-low/50 transition-colors"
              >
                <div className={`w-1 shrink-0 ${getEventColor(evt)}`} />
                <div className="flex-1 p-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-headline-sm text-on-surface">
                      {formatCurrency(evt.data.amount)} · {evt.data.borrower?.full_name}
                    </p>
                    <p className="text-body-md text-muted-foreground">
                      Due {format(new Date(evt.data.due_date), 'MMM d')} · {evt.data.status === 'paid' ? 'Paid' : 'Pending'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(evt.data.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {evt.data.status === 'pending' && (
                      <span
                        role="button"
                        onClick={(e) => handleRecordPayment(e, evt.data)}
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Banknote size={12} /> Pay
                      </span>
                    )}
                    {getStatusIcon(evt.data.display_status)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Overdue (current month) */}
      {overdueSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-status-overdue">Overdue Payments</h2>
          {overdueSchedules.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/loans/${s.loan_id}`)}
              className="w-full bg-surface-lowest rounded-md overflow-hidden flex text-left hover:bg-surface-low/50 transition-colors"
            >
              <div className="w-1 shrink-0 bg-status-overdue" />
              <div className="flex-1 p-4 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-headline-sm text-on-surface">
                    {formatCurrency(s.amount)} · {s.borrower?.full_name}
                  </p>
                  <p className="text-body-md text-muted-foreground">
                    Due {format(new Date(s.due_date), 'MMM d')} · {Math.abs(differenceInDays(new Date(s.due_date), new Date()))} days late
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    role="button"
                    onClick={(e) => handleRecordPayment(e, s)}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Banknote size={12} /> Pay
                  </span>
                  <AlertTriangle size={16} className="text-status-overdue mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Approaching (current month) */}
      {approachingSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-status-approaching">Upcoming (7 days)</h2>
          {approachingSchedules.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/loans/${s.loan_id}`)}
              className="w-full bg-surface-lowest rounded-md overflow-hidden flex text-left hover:bg-surface-low/50 transition-colors"
            >
              <div className="w-1 shrink-0 bg-status-approaching" />
              <div className="flex-1 p-4 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-headline-sm text-on-surface">
                    {formatCurrency(s.amount)} · {s.borrower?.full_name}
                  </p>
                  <p className="text-body-md text-muted-foreground">
                    Due {format(new Date(s.due_date), 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    role="button"
                    onClick={(e) => handleRecordPayment(e, s)}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Banknote size={12} /> Pay
                  </span>
                  <Clock size={16} className="text-status-approaching mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Scheduled (current month) */}
      {upcomingSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-muted-foreground">Scheduled</h2>
          {upcomingSchedules.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/loans/${s.loan_id}`)}
              className="w-full bg-surface-lowest rounded-md overflow-hidden flex text-left hover:bg-surface-low/50 transition-colors"
            >
              <div className="w-1 shrink-0 bg-status-ontime" />
              <div className="flex-1 p-4 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-headline-sm text-on-surface">
                    {formatCurrency(s.amount)} · {s.borrower?.full_name}
                  </p>
                  <p className="text-body-md text-muted-foreground">
                    Due {format(new Date(s.due_date), 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    role="button"
                    onClick={(e) => handleRecordPayment(e, s)}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Banknote size={12} /> Pay
                  </span>
                  <CheckCircle size={16} className="text-status-ontime mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && schedules.length === 0 && payments.length === 0 && loans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-body-md">
            No events yet. Create a loan to see activity here.
          </p>
        </div>
      )}
    </div>
  );
}
