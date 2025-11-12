/**
 * アプリケーション定数
 */

/**
 * データソースURL
 */
export const DATA_SOURCE = {
  INDEX_URL: 'https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/index.html',
  BASE_URL: 'https://www.city.nerima.tokyo.jp',
} as const;

/**
 * データファイルパス
 */
export const DATA_PATHS = {
  SCHEDULE_JSON: '/data/schedule.json',
  ICAL_ALL: '/ical/all.ics',
  ICAL_SCHOOLS_DIR: '/ical/schools',
  ICAL_SPORTS_DIR: '/ical/sports',
} as const;

/**
 * カレンダー設定
 */
export const CALENDAR_CONFIG = {
  DEFAULT_VIEW: 'month',
  VIEWS: ['month', 'week', 'day', 'agenda'] as const,
  MESSAGES: {
    today: '今日',
    previous: '前へ',
    next: '次へ',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時間',
    event: 'イベント',
    noEventsInRange: 'この期間にイベントはありません',
    showMore: (total: number) => `+${total} 件`,
  },
} as const;

/**
 * スクレイピング設定
 */
export const SCRAPING_CONFIG = {
  USER_AGENT: 'Mozilla/5.0 (compatible; NerimaGymCalendarBot/1.0)',
  REQUEST_DELAY: 1000, // ミリ秒
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // ミリ秒
} as const;

/**
 * iCalendar設定
 */
export const ICAL_CONFIG = {
  PRODUCT_ID: '-//Nerima Gym Calendar//NONSGML v1.0//EN',
  CALENDAR_NAME: '練馬区 学校体育館個人開放',
  TIMEZONE: 'Asia/Tokyo',
} as const;

/**
 * アプリケーション情報
 */
export const APP_INFO = {
  NAME: '練馬区 学校体育館個人開放カレンダー',
  DESCRIPTION: '練馬区の学校体育館個人開放日程をカレンダー形式で表示',
  VERSION: '1.0.0',
  REPOSITORY: 'https://github.com/ln-north/nerima-school-gym-calender',
} as const;
