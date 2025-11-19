import { ScheduleEvent, CalendarEvent, ScheduleData, School, Sport } from './types';
import { parse, format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * スポーツ名に対応する絵文字を返す
 * 対応する絵文字がない場合はスポーツ名をそのまま返す
 */
export function getSportIcon(sport: string): string {
  const iconMap: Record<string, string> = {
    'バドミントン': '🏸',
    '卓球': '🏓',
    'バレーボール': '🏐',
    'バスケットボール': '🏀',
    'テニス': '🎾',
    'サッカー': '⚽',
    '野球': '⚾',
  };
  return iconMap[sport] || sport;
}

/**
 * ScheduleEventをCalendarEventに変換
 * 複数のスポーツがある場合は、各スポーツごとに個別のイベントを作成
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

  // スポーツは絵文字のみで表示（スペース節約のため）
  const sportsIcons = event.sports.map(sport => getSportIcon(sport)).join('');

  return {
    id: event.id,
    title: `${sportsIcons} ${formatSchoolName(event.schoolName)}`,
    start: startDateTime,
    end: endDateTime,
    resource: event,
  };
}

/**
 * ScheduleEventの配列をCalendarEventの配列に変換
 * 複数のスポーツがある場合は、各スポーツごとに個別のイベントを作成
 */
export function toCalendarEvents(events: ScheduleEvent[]): CalendarEvent[] {
  const calendarEvents: CalendarEvent[] = [];

  events.forEach((event) => {
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

    // 各スポーツごとに個別のイベントを作成
    event.sports.forEach((sport, index) => {
      calendarEvents.push({
        id: `${event.id}-${index}`,
        title: `${getSportIcon(sport)} ${formatSchoolName(event.schoolName)} ${event.startTime}-${event.endTime}`,
        start: startDateTime,
        end: endDateTime,
        resource: event,
      });
    });
  });

  return calendarEvents;
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
 * 件数が多い順に並び替える
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
    .sort((a, b) => b.events.length - a.events.length); // 件数の多い順
}

/**
 * イベント配列からScheduleDataを生成
 */
export function createScheduleData(events: ScheduleEvent[]): ScheduleData {
  return {
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * 学校名のリストを取得
 */
export function getSchoolNames(data: ScheduleData): string[] {
  const schools = extractSchools(data.events);
  return schools.map((school) => school.name);
}

/**
 * スポーツ種目のリストを取得
 */
export function getSportNames(data: ScheduleData): string[] {
  const sports = extractSports(data.events);
  return sports.map((sport) => sport.name);
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
  return data.events.filter((event) => event.schoolName === schoolName);
}

/**
 * 特定のスポーツのイベントを取得
 */
export function getEventsBySport(data: ScheduleData, sportName: string): ScheduleEvent[] {
  return data.events.filter((event) => event.sports.includes(sportName));
}

/**
 * 学校名を短縮形式に変換
 * 例: 「仲町小学校」→「仲町小」、「石神井中学校」→「石神井中」
 */
export function formatSchoolName(schoolName: string): string {
  return schoolName.replace(/小学校$/, '小').replace(/中学校$/, '中');
}
