/**
 * 体育館開放スケジュールイベントの型定義
 */
export interface ScheduleEvent {
  id: string;
  schoolName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sports: string[];
  url: string;
}

/**
 * 後方互換性のためのエイリアス
 * @deprecated ScheduleEventを使用してください
 */
export type GymEvent = ScheduleEvent;

/**
 * 学校情報の型定義
 */
export interface School {
  name: string;
  events: ScheduleEvent[];
}

/**
 * スポーツ種目の型定義
 */
export interface Sport {
  name: string;
  events: ScheduleEvent[];
}

/**
 * 全体のスケジュールデータの型定義
 */
export interface ScheduleData {
  events: ScheduleEvent[];
  schools: School[];
  sports: Sport[];
  lastUpdated: string; // ISO 8601形式
}

/**
 * カレンダーイベント（react-big-calendar用）
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ScheduleEvent;
}

/**
 * フィルターオプション
 */
export interface FilterOptions {
  schools: string[];
  sports: string[];
}
