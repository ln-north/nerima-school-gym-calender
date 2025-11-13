import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import type { ScheduleEvent } from '../lib/types';
import { createScheduleData } from '../lib/utils';
import { DATA_SOURCE, SCRAPING_CONFIG } from '../lib/constants';

/**
 * ページを取得してHTMLを返す
 */
async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': SCRAPING_CONFIG.USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * 遅延処理
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * インデックスページから月別ページのURLリストを取得
 */
async function getMonthlyPageUrls(): Promise<string[]> {
  const html = await fetchPage(DATA_SOURCE.INDEX_URL);
  const $ = cheerio.load(html);
  const urls: string[] = [];

  // インデックスページから月別ページへのリンクを抽出
  // 実際のHTMLの構造に応じて調整が必要
  $('a[href*="gakkokaiho"]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && href !== 'index.html' && !href.includes('#')) {
      const fullUrl = href.startsWith('http')
        ? href
        : new URL(href, DATA_SOURCE.BASE_URL).toString();

      if (!urls.includes(fullUrl)) {
        urls.push(fullUrl);
      }
    }
  });

  console.log(`Found ${urls.length} monthly pages`);
  return urls;
}

/**
 * 月別ページからイベント情報を抽出
 */
async function parseMonthlyPage(url: string): Promise<ScheduleEvent[]> {
  await delay(SCRAPING_CONFIG.REQUEST_DELAY);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const events: ScheduleEvent[] = [];

  // テーブルからデータを抽出
  // 実際のHTMLの構造に応じて調整が必要
  $('table tr').each((_, row) => {
    try {
      const $row = $(row);
      const cells = $row.find('td');

      if (cells.length === 0) return; // ヘッダー行をスキップ

      // 各列からデータを抽出（実際の構造に合わせて調整）
      const dateText = $(cells[0]).text().trim();
      const schoolName = $(cells[1]).text().trim();
      const timeText = $(cells[2]).text().trim();
      const sportsText = $(cells[3]).text().trim();

      if (!dateText || !schoolName || !timeText) return;

      // 日付のパース（例: "12月15日(金)" -> "2024-12-15"）
      const dateMatch = dateText.match(/(\d+)月(\d+)日/);
      if (!dateMatch) return;

      const currentYear = new Date().getFullYear();
      const month = dateMatch[1].padStart(2, '0');
      const day = dateMatch[2].padStart(2, '0');
      const date = `${currentYear}-${month}-${day}`;

      // 時間のパース（例: "18:00～20:00"）
      const timeMatch = timeText.match(/(\d+:\d+).*?(\d+:\d+)/);
      if (!timeMatch) return;

      const startTime = timeMatch[1];
      const endTime = timeMatch[2];

      // スポーツ種目のパース
      const sports = sportsText
        .split(/[、,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (sports.length === 0) return;

      const event: ScheduleEvent = {
        id: nanoid(),
        schoolName,
        date,
        startTime,
        endTime,
        sports,
        url,
      };

      events.push(event);
    } catch (error) {
      console.error('Error parsing row:', error);
    }
  });

  console.log(`Extracted ${events.length} events from ${url}`);
  return events;
}

/**
 * すべてのイベントをスクレイピング
 */
async function scrapeAllEvents(): Promise<ScheduleEvent[]> {
  console.log('Starting scraping...');

  const monthlyUrls = await getMonthlyPageUrls();
  const allEvents: ScheduleEvent[] = [];

  for (const url of monthlyUrls) {
    try {
      const events = await parseMonthlyPage(url);
      allEvents.push(...events);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }

  console.log(`Total events scraped: ${allEvents.length}`);
  return allEvents;
}

/**
 * データを保存
 */
function saveData(events: ScheduleEvent[]): void {
  const outputDir = join(process.cwd(), 'public', 'data');

  // ディレクトリが存在しない場合は作成
  mkdirSync(outputDir, { recursive: true });

  // ScheduleDataを生成
  const scheduleData = createScheduleData(events);

  // JSONファイルとして保存
  const outputPath = join(outputDir, 'schedule.json');
  writeFileSync(outputPath, JSON.stringify(scheduleData, null, 2), 'utf-8');

  console.log(`Data saved to ${outputPath}`);
  console.log(`Total events: ${scheduleData.events.length}`);
  console.log(`Total schools: ${scheduleData.schools.length}`);
  console.log(`Total sports: ${scheduleData.sports.length}`);
}

/**
 * メイン処理
 */
async function main() {
  try {
    const events = await scrapeAllEvents();
    saveData(events);
    console.log('Scraping completed successfully!');
  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmainを実行
if (require.main === module) {
  main();
}

export { scrapeAllEvents, saveData };
