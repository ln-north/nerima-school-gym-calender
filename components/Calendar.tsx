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

// カスタムイベントコンポーネント
const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const title = event.title;
  // 時間部分を抽出（最後のスペース以降）
  const timeMatch = title.match(/^(.+)\s(\d{2}:\d{2}-\d{2}:\d{2})$/);

  if (timeMatch) {
    const [, mainText, time] = timeMatch;
    return (
      <div>
        <span>{mainText}</span>
        <span className="text-[0.7rem] opacity-75 ml-1">{time}</span>
      </div>
    );
  }

  return <div>{title}</div>;
};

// カスタムツールバーコンポーネント
const CustomToolbar = ({ label, onNavigate }: any) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => onNavigate('PREV')}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="前の月"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h2 className="text-lg font-bold text-gray-800">{label}</h2>

      <button
        onClick={() => onNavigate('NEXT')}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="次の月"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

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
    // 当月かどうかを判定
    const eventDate = new Date(event.start);
    const isCurrentMonth = eventDate.getMonth() === date.getMonth() &&
                          eventDate.getFullYear() === date.getFullYear();

    const style = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
      opacity: isCurrentMonth ? 0.9 : 0.4,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  return (
    <div className="h-full">
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
        views={['month']}
        messages={CALENDAR_CONFIG.MESSAGES}
        culture="ja"
        showAllEvents={true}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
        }}
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
