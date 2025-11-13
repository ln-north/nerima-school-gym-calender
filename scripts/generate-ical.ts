import ical, { ICalCalendar, ICalEventData } from 'ical-generator';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { ScheduleData, ScheduleEvent } from '../lib/types';
import { ICAL_CONFIG } from '../lib/constants';

/**
 * ScheduleEventをiCalイベントデータに変換
 */
function eventToICalData(event: ScheduleEvent): ICalEventData {
  const [year, month, day] = event.date.split('-').map(Number);
  const [startHour, startMinute] = event.startTime.split(':').map(Number);
  const [endHour, endMinute] = event.endTime.split(':').map(Number);

  const start = new Date(year, month - 1, day, startHour, startMinute);
  const end = new Date(year, month - 1, day, endHour, endMinute);

  return {
    id: event.id,
    start,
    end,
    summary: `${event.schoolName} - ${event.sports.join(', ')}`,
    description: `学校: ${event.schoolName}\n種目: ${event.sports.join(', ')}\n詳細: ${event.url}`,
    location: event.schoolName,
    url: event.url,
  };
}

/**
 * iCalendarを生成
 */
function createCalendar(events: ScheduleEvent[], name: string): ICalCalendar {
  const calendar = ical({
    name,
    prodId: ICAL_CONFIG.PRODUCT_ID,
    timezone: ICAL_CONFIG.TIMEZONE,
  });

  events.forEach((event) => {
    calendar.createEvent(eventToICalData(event));
  });

  return calendar;
}

/**
 * 全イベントのiCalendarを生成
 */
function generateAllEventsCalendar(data: ScheduleData, outputDir: string): void {
  const calendar = createCalendar(data.events, ICAL_CONFIG.CALENDAR_NAME);
  const outputPath = join(outputDir, 'all.ics');

  writeFileSync(outputPath, calendar.toString(), 'utf-8');
  console.log(`Generated: ${outputPath} (${data.events.length} events)`);
}

/**
 * 学校ごとのiCalendarを生成
 */
function generateSchoolCalendars(data: ScheduleData, outputDir: string): void {
  const schoolsDir = join(outputDir, 'schools');
  mkdirSync(schoolsDir, { recursive: true });

  data.schools.forEach((school) => {
    const calendar = createCalendar(
      school.events,
      `${ICAL_CONFIG.CALENDAR_NAME} - ${school.name}`
    );

    // ファイル名用に学校名をサニタイズ
    const sanitizedName = school.name
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');

    const outputPath = join(schoolsDir, `${sanitizedName}.ics`);
    writeFileSync(outputPath, calendar.toString(), 'utf-8');

    console.log(`Generated: ${outputPath} (${school.events.length} events)`);
  });
}

/**
 * スポーツ種目ごとのiCalendarを生成
 */
function generateSportCalendars(data: ScheduleData, outputDir: string): void {
  const sportsDir = join(outputDir, 'sports');
  mkdirSync(sportsDir, { recursive: true });

  data.sports.forEach((sport) => {
    const calendar = createCalendar(
      sport.events,
      `${ICAL_CONFIG.CALENDAR_NAME} - ${sport.name}`
    );

    // ファイル名用にスポーツ名をサニタイズ
    const sanitizedName = sport.name
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');

    const outputPath = join(sportsDir, `${sanitizedName}.ics`);
    writeFileSync(outputPath, calendar.toString(), 'utf-8');

    console.log(`Generated: ${outputPath} (${sport.events.length} events)`);
  });
}

/**
 * すべてのiCalendarファイルを生成
 */
function generateAllCalendars(data: ScheduleData, outputDir: string): void {
  console.log('Generating iCalendar files...');

  // 出力ディレクトリを作成
  mkdirSync(outputDir, { recursive: true });

  // 全イベントのカレンダー
  generateAllEventsCalendar(data, outputDir);

  // 学校ごとのカレンダー
  generateSchoolCalendars(data, outputDir);

  // スポーツ種目ごとのカレンダー
  generateSportCalendars(data, outputDir);

  console.log('iCalendar generation completed!');
}

/**
 * メイン処理
 */
async function main() {
  try {
    // JSONデータを読み込む
    const dataPath = join(process.cwd(), 'public', 'data', 'schedule.json');
    const data: ScheduleData = JSON.parse(readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded data: ${data.events.length} events`);

    // iCalendarファイルを生成
    const outputDir = join(process.cwd(), 'public', 'ical');
    generateAllCalendars(data, outputDir);

    console.log('\nSummary:');
    console.log(`- Total events: ${data.events.length}`);
    console.log(`- Schools: ${data.schools.length}`);
    console.log(`- Sports: ${data.sports.length}`);
  } catch (error) {
    console.error('iCalendar generation failed:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmainを実行
if (require.main === module) {
  main();
}

export { generateAllCalendars, createCalendar };
