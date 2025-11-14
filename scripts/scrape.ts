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
  try {
    const html = await fetchPage(DATA_SOURCE.INDEX_URL);
    const $ = cheerio.load(html);
    const urls: string[] = [];

    // 「学校体育館個人開放日程表」のリンクを抽出
    $('a').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const text = $link.text();

      // 「学校体育館個人開放日程表」または「kojinkaihounittei」「taiikukannkaihou」を含むリンクを対象
      if (
        href &&
        (text.includes('学校体育館個人開放日程表') ||
          href.includes('kojinkaihounittei') ||
          href.includes('taiikukannkaihou'))
      ) {
        const fullUrl = href.startsWith('http')
          ? href
          : new URL(href, DATA_SOURCE.BASE_URL).toString();

        if (!urls.includes(fullUrl) && fullUrl.includes('gakkokaiho')) {
          console.log(`Found schedule page: ${text.trim()} -> ${fullUrl}`);
          urls.push(fullUrl);
        }
      }
    });

    if (urls.length === 0) {
      console.warn('No monthly schedule pages found. Falling back to known URLs.');
      // フォールバック: 既知のURLを直接指定
      urls.push('https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/kojinkaihounittei.html'); // 10月
      urls.push('https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/taiikukannkaihou3.html'); // 11月
    }

    console.log(`Found ${urls.length} monthly pages:`, urls);
    return urls;
  } catch (error) {
    console.error('Error fetching monthly page URLs:', error);
    // エラー時も既知のURLを返す
    console.log('Using fallback URLs');
    return [
      'https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/kojinkaihounittei.html',
      'https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/taiikukannkaihou3.html',
    ];
  }
}

/**
 * URLから年月を推測
 */
function getYearMonthFromUrl(url: string): { year: number; month: number } {
  const currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth() + 1;

  // URLやコンテキストから月を推測
  // 10月のページの場合
  if (url.includes('kojinkaihounittei.html')) {
    month = 10;
  }
  // 11月のページの場合
  else if (url.includes('taiikukannkaihou3.html')) {
    month = 11;
  }

  // 年をまたぐ場合の処理（例: 12月に翌年1月のデータがある場合）
  if (month < currentDate.getMonth() + 1 && month <= 3) {
    year += 1;
  }

  return { year, month };
}

/**
 * 月別ページからイベント情報を抽出
 */
async function parseMonthlyPage(url: string): Promise<ScheduleEvent[]> {
  await delay(SCRAPING_CONFIG.REQUEST_DELAY);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const events: ScheduleEvent[] = [];
  const { year, month } = getYearMonthFromUrl(url);

  console.log(`Parsing page for ${year}年${month}月: ${url}`);

  // テーブル構造: 学校名 | 内容 | 時間 | 日 | 備考
  $('table tr').each((_, row) => {
    try {
      const $row = $(row);
      const cells = $row.find('td');

      if (cells.length < 4) return; // データ行でない場合はスキップ

      const schoolNameRaw = $(cells[0]).text().trim();
      const contentText = $(cells[1]).text().trim(); // 種目
      const timeText = $(cells[2]).text().trim();
      const daysText = $(cells[3]).text().trim();

      if (!schoolNameRaw || !contentText || !timeText || !daysText) return;

      // 学校名の正規化（「練馬区立」を追加）
      const schoolName = schoolNameRaw.includes('練馬区立')
        ? schoolNameRaw
        : `練馬区立${schoolNameRaw}`;

      // 時間のパース（例: "19：00～21：00" or "19:00～21:00"）
      const timeMatch = timeText.match(/(\d+)[：:](\d+).*?(\d+)[：:](\d+)/);
      if (!timeMatch) {
        console.warn(`Failed to parse time: ${timeText}`);
        return;
      }

      const startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`;
      const endTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4].padStart(2, '0')}`;

      // 日付のパース（例: "2（日）、30（日）" or "3（月）"）
      const dayMatches = daysText.matchAll(/(\d+)[（(]/g);
      const days: number[] = [];
      for (const match of dayMatches) {
        days.push(parseInt(match[1], 10));
      }

      if (days.length === 0) {
        console.warn(`Failed to parse days: ${daysText}`);
        return;
      }

      // 種目のパース（複数ある場合もある）
      const sports = [contentText.trim()];

      // 各日付に対してイベントを生成
      for (const day of days) {
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

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
      }
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
