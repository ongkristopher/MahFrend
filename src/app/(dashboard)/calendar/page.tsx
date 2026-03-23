'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
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
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaymentSchedule, Borrower } from '@/types/database';

interface CalendarSchedule extends PaymentSchedule {
  borrower: Borrower;
  display_status: 'on-time' | 'approaching' | 'overdue' | 'paid';
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [schedules, setSchedules] = useState<CalendarSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('payment_schedules')
        .select('*, borrower:borrowers(*)')
        .eq('lender_id', user.id);

      if (data) {
        const today = new Date();
        const enriched = data.map((schedule) => {
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
      setLoading(false);
    };

    fetchSchedules();
  }, [supabase]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSchedulesForDate = (date: Date) =>
    schedules.filter((s) => isSameDay(new Date(s.due_date), date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-status-overdue';
      case 'approaching': return 'bg-status-approaching';
      case 'paid': return 'bg-muted-foreground';
      default: return 'bg-status-ontime';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle size={14} className="text-status-overdue" />;
      case 'approaching': return <Clock size={14} className="text-status-approaching" />;
      case 'paid': return <CheckCircle size={14} className="text-muted-foreground" />;
      default: return <CheckCircle size={14} className="text-status-ontime" />;
    }
  };

  const pendingSchedules = schedules.filter((s) => s.status === 'pending');
  const overdueSchedules = pendingSchedules.filter((s) => s.display_status === 'overdue');
  const approachingSchedules = pendingSchedules.filter((s) => s.display_status === 'approaching');
  const upcomingSchedules = pendingSchedules.filter((s) => s.display_status === 'on-time');

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

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
            const daySchedules = getSchedulesForDate(day);
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
                {daySchedules.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {daySchedules.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(s.display_status)}`}
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
      {selectedDate && selectedDateSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          {selectedDateSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-surface-lowest rounded-md p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="text-headline-sm text-on-surface">
                  ₱{Number(schedule.amount).toLocaleString()} · {schedule.borrower?.full_name}
                </p>
                <p className="text-body-md text-muted-foreground">
                  Due {format(new Date(schedule.due_date), 'MMM d')} · {schedule.status === 'paid' ? 'Paid' : 'Pending'}
                </p>
              </div>
              {getStatusIcon(schedule.display_status)}
            </div>
          ))}
        </div>
      )}

      {/* Overdue */}
      {overdueSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-status-overdue">Overdue Payments</h2>
          {overdueSchedules.map((s) => (
            <div
              key={s.id}
              className="bg-surface-lowest rounded-md p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="text-headline-sm text-on-surface">
                  ₱{Number(s.amount).toLocaleString()} · {s.borrower?.full_name}
                </p>
                <p className="text-body-md text-muted-foreground">
                  Due {format(new Date(s.due_date), 'MMM d')} · {Math.abs(differenceInDays(new Date(s.due_date), new Date()))} days late
                </p>
              </div>
              <AlertTriangle size={16} className="text-status-overdue mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Approaching */}
      {approachingSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-status-approaching">Upcoming (7 days)</h2>
          {approachingSchedules.map((s) => (
            <div
              key={s.id}
              className="bg-surface-lowest rounded-md p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="text-headline-sm text-on-surface">
                  ₱{Number(s.amount).toLocaleString()} · {s.borrower?.full_name}
                </p>
                <p className="text-body-md text-muted-foreground">
                  Due {format(new Date(s.due_date), 'MMM d')}
                </p>
              </div>
              <Clock size={16} className="text-status-approaching mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Scheduled */}
      {upcomingSchedules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-label-md text-muted-foreground">Scheduled</h2>
          {upcomingSchedules.map((s) => (
            <div
              key={s.id}
              className="bg-surface-lowest rounded-md p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="text-headline-sm text-on-surface">
                  ₱{Number(s.amount).toLocaleString()} · {s.borrower?.full_name}
                </p>
                <p className="text-body-md text-muted-foreground">
                  Due {format(new Date(s.due_date), 'MMM d')}
                </p>
              </div>
              <CheckCircle size={16} className="text-status-ontime mt-1" />
            </div>
          ))}
        </div>
      )}

      {!loading && schedules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-body-md">
            No payment schedules yet. Create a loan to see monthly payment events here.
          </p>
        </div>
      )}
    </div>
  );
}
