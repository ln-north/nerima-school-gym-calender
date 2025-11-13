'use client';

import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import type { CalendarEvent, ScheduleEvent } from '@/lib/types';
import { toCalendarEvents } from '@/lib/utils';
import { CALENDAR_CONFIG } from '@/lib/constants';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarProps {
  events: ScheduleEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

export default function Calendar({ events, onSelectEvent }: CalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const calendarEvents = useMemo(() => toCalendarEvents(events), [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  return (
    <div className="h-[700px] bg-white rounded-lg shadow-lg p-4">
      <BigCalendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={CALENDAR_CONFIG.MESSAGES}
        culture="ja"
        formats={{
          dateFormat: 'dd',
          dayFormat: 'dd(E)',
          weekdayFormat: 'E',
          monthHeaderFormat: 'yyyy年MM月',
          dayHeaderFormat: 'M月d日(E)',
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, 'M月d日', { locale: ja })} - ${format(end, 'M月d日', { locale: ja })}`,
        }}
      />
    </div>
  );
}
