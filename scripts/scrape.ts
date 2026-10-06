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
 * 令和年を西暦に変換
 */
function reiwaToGregorian(reiwaYear: number): number {
  return 2018 + reiwaYear;
}

/**
 * HTMLコンテンツから年月を抽出
 * ページタイトルや見出しから「令和X年Y月」を探す
 */
function extractYearMonthFromHtml(html: string): { year: number; month: number } | null {
  // 「令和X年Y月」パターンを検索
  const reiwaMatch = html.match(/令和(\d+)年(\d+)月/);
  if (reiwaMatch) {
    const reiwaYear = parseInt(reiwaMatch[1], 10);
    const month = parseInt(reiwaMatch[2], 10);
    const year = reiwaToGregorian(reiwaYear);
    return { year, month };
  }

  // 「XXXX年Y月」パターンを検索
  const gregorianMatch = html.match(/(\d{4})年(\d+)月/);
  if (gregorianMatch) {
    const year = parseInt(gregorianMatch[1], 10);
    const month = parseInt(gregorianMatch[2], 10);
    return { year, month };
  }

  return null;
}

/**
 * URLから年月を推測（フォールバック用）
 */
function getYearMonthFromUrl(url: string): { year: number; month: number } {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // デフォルトで現在の年月を返す
  return { year, month };
}

/**
 * ページ内の全テーブルの rowspan / colspan を展開し、各行を列位置の揃ったセル文字列の配列にする
 *
 * 結合セルの値は、結合範囲に含まれるすべての行・列へ複製する。
 * 複数テーブルがある場合は文書順に行を連結する。
 * 返り値は新規に生成した配列で、行は th / td の両方を含む。完全実装。
 */
function readTableRows($: cheerio.CheerioAPI): string[][] {
  const rows: string[][] = [];

  $('table').each((_, table) => {
    const grid: string[][] = [];

    $(table)
      .find('tr')
      .each((rowIndex, row) => {
        grid[rowIndex] ??= [];
        let column = 0;

        $(row)
          .find('th, td')
          .each((_, cell) => {
            // 上の行からの rowspan で埋まっている列を飛ばす
            while (grid[rowIndex][column] !== undefined) column++;

            const $cell = $(cell);
            const text = $cell.text().trim();
            const rowspan = parseInt($cell.attr('rowspan') ?? '1', 10);
            const colspan = parseInt($cell.attr('colspan') ?? '1', 10);

            for (let rowOffset = 0; rowOffset < rowspan; rowOffset++) {
              grid[rowIndex + rowOffset] ??= [];
              for (let columnOffset = 0; columnOffset < colspan; columnOffset++) {
                grid[rowIndex + rowOffset][column + columnOffset] = text;
              }
            }
            column += colspan;
          });
      });

    rows.push(...grid);
  });

  return rows;
}

/**
 * 月別ページからイベント情報を抽出
 */
async function parseMonthlyPage(url: string): Promise<ScheduleEvent[]> {
  await delay(SCRAPING_CONFIG.REQUEST_DELAY);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const events: ScheduleEvent[] = [];

  // HTMLから年月を抽出、失敗したらURLから推測
  const extracted = extractYearMonthFromHtml(html);
  const { year, month } = extracted || getYearMonthFromUrl(url);

  console.log(`Parsing page for ${year}年${month}月: ${url}`);

  // 列の並びは月によって変わる（例: 「学校名|内容|時間|日|備考」「学校名|内容|曜日|時間|実施日」）ため、
  // 見出し行の列名から各列の位置を決める
  const rows = readTableRows($);
  const header = rows.find((cells) => cells.includes('学校名'));
  if (!header) {
    console.warn(`Header row not found: ${url}`);
    return events;
  }
  const schoolColumn = header.indexOf('学校名');
  const contentColumn = header.indexOf('内容');
  const timeColumn = header.indexOf('時間');
  const daysColumn = header.findIndex((label) => label === '日' || label === '実施日');

  for (const cells of rows) {
    try {
      if (cells === header || cells.length < header.length) continue;

      const schoolNameRaw = cells[schoolColumn];
      const contentText = cells[contentColumn];
      const timeText = cells[timeColumn];
      const daysText = cells[daysColumn];

      if (!schoolNameRaw || !contentText || !timeText || !daysText) continue;

      // 学校名をそのまま使用
      const schoolName = schoolNameRaw;

      // 時間のパース（例: "19：00～21：00" or "19:00～21:00"）
      const timeMatch = timeText.match(/(\d+)[：:](\d+).*?(\d+)[：:](\d+)/);
      if (!timeMatch) {
        console.warn(`Failed to parse time: ${timeText}`);
        continue;
      }

      const startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`;
      const endTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4].padStart(2, '0')}`;

      // 日付のパース（例: "2（日）、30（日）" or "11日、25日"）
      const dayMatches = daysText.matchAll(/(\d+)(?:[（(]|日)/g);
      const days: number[] = [];
      for (const match of dayMatches) {
        days.push(parseInt(match[1], 10));
      }

      if (days.length === 0) {
        console.warn(`Failed to parse days: ${daysText}`);
        continue;
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
  }

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

  // 統計情報を計算（ログ出力用）
  const uniqueSchools = new Set(events.map(e => e.schoolName)).size;
  const uniqueSports = new Set(events.flatMap(e => e.sports)).size;

  // JSONファイルとして保存
  const outputPath = join(outputDir, 'schedule.json');
  writeFileSync(outputPath, JSON.stringify(scheduleData, null, 2), 'utf-8');

  console.log(`Data saved to ${outputPath}`);
  console.log(`Total events: ${scheduleData.events.length}`);
  console.log(`Total schools: ${uniqueSchools}`);
  console.log(`Total sports: ${uniqueSports}`);
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
