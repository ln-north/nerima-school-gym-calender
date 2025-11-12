/**
 * 体育館開放イベントの型定義
 */
export interface GymEvent {
  id: string;
  schoolName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sports: string[];
  url: string;
}

/**
 * 学校情報の型定義
 */
export interface School {
  name: string;
  events: GymEvent[];
}

/**
 * スポーツ種目の型定義
 */
export interface Sport {
  name: string;
  events: GymEvent[];
}

/**
 * カレンダーイベント（react-big-calendar用）
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: GymEvent;
}

/**
 * フィルターオプション
 */
export interface FilterOptions {
  schools: string[];
  sports: string[];
}
