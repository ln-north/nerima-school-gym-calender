import { ScheduleEvent, CalendarEvent, ScheduleData, School, Sport } from './types';
import { parse, format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * ScheduleEventをCalendarEventに変換
 */
export function toCalendarEvent(event: ScheduleEvent): CalendarEvent {
  const dateStr = event.date;
  const startDateTime = parse(
    `${dateStr} ${event.startTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  );
  const endDateTime = parse(
    `${dateStr} ${event.endTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  );

  return {
    id: event.id,
    title: `${event.schoolName} (${event.sports.join(', ')})`,
    start: startDateTime,
    end: endDateTime,
    resource: event,
  };
}

/**
 * ScheduleEventの配列をCalendarEventの配列に変換
 */
export function toCalendarEvents(events: ScheduleEvent[]): CalendarEvent[] {
  return events.map(toCalendarEvent);
}

/**
 * 日付を日本語フォーマットに変換
 */
export function formatDateJa(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy年MM月dd日(E)', { locale: ja });
}

/**
 * 時刻をフォーマット
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * イベントをフィルタリング
 */
export function filterEvents(
  events: ScheduleEvent[],
  schools?: string[],
  sports?: string[]
): ScheduleEvent[] {
  return events.filter((event) => {
    const schoolMatch = !schools || schools.length === 0 || schools.includes(event.schoolName);
    const sportMatch =
      !sports || sports.length === 0 || event.sports.some((s) => sports.includes(s));
    return schoolMatch && sportMatch;
  });
}

/**
 * イベントから学校リストを生成
 */
export function extractSchools(events: ScheduleEvent[]): School[] {
  const schoolMap = new Map<string, ScheduleEvent[]>();

  events.forEach((event) => {
    if (!schoolMap.has(event.schoolName)) {
      schoolMap.set(event.schoolName, []);
    }
    schoolMap.get(event.schoolName)!.push(event);
  });

  return Array.from(schoolMap.entries())
    .map(([name, events]) => ({
      name,
      events: events.sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * イベントからスポーツリストを生成
 */
export function extractSports(events: ScheduleEvent[]): Sport[] {
  const sportMap = new Map<string, ScheduleEvent[]>();

  events.forEach((event) => {
    event.sports.forEach((sport) => {
      if (!sportMap.has(sport)) {
        sportMap.set(sport, []);
      }
      sportMap.get(sport)!.push(event);
    });
  });

  return Array.from(sportMap.entries())
    .map(([name, events]) => ({
      name,
      events: events.sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * イベント配列からScheduleDataを生成
 */
export function createScheduleData(events: ScheduleEvent[]): ScheduleData {
  return {
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
    schools: extractSchools(events),
    sports: extractSports(events),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * 学校名のリストを取得
 */
export function getSchoolNames(data: ScheduleData): string[] {
  return data.schools.map((school) => school.name);
}

/**
 * スポーツ種目のリストを取得
 */
export function getSportNames(data: ScheduleData): string[] {
  return data.sports.map((sport) => sport.name);
}

/**
 * 日付範囲でイベントをフィルタリング
 */
export function filterEventsByDateRange(
  events: ScheduleEvent[],
  startDate?: string,
  endDate?: string
): ScheduleEvent[] {
  return events.filter((event) => {
    const eventDate = event.date;
    const afterStart = !startDate || eventDate >= startDate;
    const beforeEnd = !endDate || eventDate <= endDate;
    return afterStart && beforeEnd;
  });
}

/**
 * 特定の学校のイベントを取得
 */
export function getEventsBySchool(
  data: ScheduleData,
  schoolName: string
): ScheduleEvent[] {
  const school = data.schools.find((s) => s.name === schoolName);
  return school ? school.events : [];
}

/**
 * 特定のスポーツのイベントを取得
 */
export function getEventsBySport(data: ScheduleData, sportName: string): ScheduleEvent[] {
  const sport = data.sports.find((s) => s.name === sportName);
  return sport ? sport.events : [];
}
