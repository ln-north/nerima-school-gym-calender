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

  // 1日あたりの最大イベント数を計算
  const maxEventsPerDay = useMemo(() => {
    const eventsByDate = new Map<string, number>();

    events.forEach((event) => {
      const count = eventsByDate.get(event.date) || 0;
      eventsByDate.set(event.date, count + 1);
    });

    return Math.max(...Array.from(eventsByDate.values()), 0);
  }, [events]);

  // 最大イベント数に基づいて動的に高さを計算
  // 1イベント = 30px、ヘッダー = 100px、週数 = 5 (通常の月)
  const calendarHeight = useMemo(() => {
    const eventHeight = 30; // 1イベントあたりの高さ
    const baseHeight = 150; // ヘッダーやツールバーの高さ
    const weekCount = 5; // 1ヶ月の週数（最大6週だが、通常5週で計算）
    const cellPadding = 40; // セルのパディングと日付表示

    const minCellHeight = cellPadding + (maxEventsPerDay * eventHeight);
    const totalHeight = baseHeight + (minCellHeight * weekCount);

    // 最小800px、最大2400pxに制限
    return Math.min(Math.max(totalHeight, 800), 2400);
  }, [maxEventsPerDay]);

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
    <div className="bg-white rounded-lg shadow-lg p-4" style={{ height: `${calendarHeight}px` }}>
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
        showAllEvents={true}
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
