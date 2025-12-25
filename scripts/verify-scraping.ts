import { readFileSync } from 'fs';
import { join } from 'path';
import type { ScheduleData } from '../lib/types';

/**
 * 責務：スクレイピング結果の動的検証
 * 動作：固定の期待値ではなく、データの整合性と妥当性をチェックする
 *
 * 練馬区のサイトはURLを使い回すため、月が変わるとデータも変わる。
 * そのため、特定の月・日付を期待するのではなく、以下を検証する：
 * - 十分なイベント数があるか
 * - 学校名・種目・時間が正しくパースされているか
 * - 日付が妥当な範囲にあるか
 * - 複数月のデータが含まれているか
 */

/** 検証の閾値 */
const VALIDATION_THRESHOLDS = {
  /** 最小イベント数 */
  MIN_EVENTS: 100,
  /** 最小学校数 */
  MIN_SCHOOLS: 10,
  /** 最小種目数 */
  MIN_SPORTS: 3,
  /** 最小月数（複数月のデータがあることを確認） */
  MIN_MONTHS: 2,
  /** 日付の許容範囲（過去何ヶ月前まで） */
  MAX_MONTHS_IN_PAST: 1,
  /** 日付の許容範囲（未来何ヶ月先まで） */
  MAX_MONTHS_IN_FUTURE: 3,
};

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * イベント数の検証
 */
function validateEventCount(data: ScheduleData): ValidationResult {
  const count = data.events.length;
  const passed = count >= VALIDATION_THRESHOLDS.MIN_EVENTS;
  return {
    name: 'イベント数',
    passed,
    message: passed
      ? `${count}件のイベント（閾値: ${VALIDATION_THRESHOLDS.MIN_EVENTS}件以上）`
      : `イベント数が少なすぎます: ${count}件（閾値: ${VALIDATION_THRESHOLDS.MIN_EVENTS}件以上）`,
  };
}

/**
 * 学校数の検証
 */
function validateSchoolCount(data: ScheduleData): ValidationResult {
  const schools = new Set(data.events.map((e) => e.schoolName));
  const count = schools.size;
  const passed = count >= VALIDATION_THRESHOLDS.MIN_SCHOOLS;
  return {
    name: '学校数',
    passed,
    message: passed
      ? `${count}校（閾値: ${VALIDATION_THRESHOLDS.MIN_SCHOOLS}校以上）`
      : `学校数が少なすぎます: ${count}校（閾値: ${VALIDATION_THRESHOLDS.MIN_SCHOOLS}校以上）`,
  };
}

/**
 * 種目数の検証
 */
function validateSportsCount(data: ScheduleData): ValidationResult {
  const sports = new Set(data.events.flatMap((e) => e.sports));
  const count = sports.size;
  const passed = count >= VALIDATION_THRESHOLDS.MIN_SPORTS;
  return {
    name: '種目数',
    passed,
    message: passed
      ? `${count}種目（閾値: ${VALIDATION_THRESHOLDS.MIN_SPORTS}種目以上）`
      : `種目数が少なすぎます: ${count}種目（閾値: ${VALIDATION_THRESHOLDS.MIN_SPORTS}種目以上）`,
  };
}

/**
 * 月の分布検証（複数月のデータがあるか）
 */
function validateMonthDistribution(data: ScheduleData): ValidationResult {
  const months = new Set(
    data.events.map((e) => {
      const date = new Date(e.date);
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    })
  );
  const count = months.size;
  const passed = count >= VALIDATION_THRESHOLDS.MIN_MONTHS;
  return {
    name: '月の分布',
    passed,
    message: passed
      ? `${count}ヶ月分のデータ: ${Array.from(months).join(', ')}（閾値: ${VALIDATION_THRESHOLDS.MIN_MONTHS}ヶ月以上）`
      : `月数が少なすぎます: ${count}ヶ月（閾値: ${VALIDATION_THRESHOLDS.MIN_MONTHS}ヶ月以上）`,
  };
}

/**
 * 日付の妥当性検証
 */
function validateDateRange(data: ScheduleData): ValidationResult {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setMonth(minDate.getMonth() - VALIDATION_THRESHOLDS.MAX_MONTHS_IN_PAST);
  const maxDate = new Date(now);
  maxDate.setMonth(maxDate.getMonth() + VALIDATION_THRESHOLDS.MAX_MONTHS_IN_FUTURE);

  const invalidEvents = data.events.filter((e) => {
    const date = new Date(e.date);
    return date < minDate || date > maxDate;
  });

  const passed = invalidEvents.length === 0;
  return {
    name: '日付範囲',
    passed,
    message: passed
      ? `全イベントが妥当な日付範囲内`
      : `${invalidEvents.length}件のイベントが日付範囲外（${minDate.toISOString().slice(0, 10)} 〜 ${maxDate.toISOString().slice(0, 10)}）`,
  };
}

/**
 * 学校名の検証（空でないか）
 */
function validateSchoolNames(data: ScheduleData): ValidationResult {
  const invalidEvents = data.events.filter(
    (e) => !e.schoolName || e.schoolName.trim() === ''
  );
  const passed = invalidEvents.length === 0;
  return {
    name: '学校名',
    passed,
    message: passed
      ? `全イベントに学校名あり`
      : `${invalidEvents.length}件のイベントに学校名がありません`,
  };
}

/**
 * 種目の検証（空でないか）
 */
function validateSports(data: ScheduleData): ValidationResult {
  const invalidEvents = data.events.filter(
    (e) => !e.sports || e.sports.length === 0 || e.sports.some((s) => !s || s.trim() === '')
  );
  const passed = invalidEvents.length === 0;
  return {
    name: '種目',
    passed,
    message: passed
      ? `全イベントに種目あり`
      : `${invalidEvents.length}件のイベントに種目がありません`,
  };
}

/**
 * 時間の検証（正しい形式か）
 */
function validateTimeFormat(data: ScheduleData): ValidationResult {
  const timePattern = /^\d{1,2}:\d{2}$/;
  const invalidEvents = data.events.filter(
    (e) => !timePattern.test(e.startTime) || !timePattern.test(e.endTime)
  );
  const passed = invalidEvents.length === 0;
  return {
    name: '時間形式',
    passed,
    message: passed
      ? `全イベントの時間形式が正常`
      : `${invalidEvents.length}件のイベントの時間形式が不正`,
  };
}

async function verifyScrapedData() {
  console.log('========== スクレイピング結果の検証 ==========\n');

  // JSONデータを読み込む
  const dataPath = join(process.cwd(), 'public', 'data', 'schedule.json');
  const data: ScheduleData = JSON.parse(readFileSync(dataPath, 'utf-8'));

  console.log(`総イベント数: ${data.events.length}`);
  console.log(`最終更新: ${data.lastUpdated}\n`);

  // 全ての検証を実行
  const validations: ValidationResult[] = [
    validateEventCount(data),
    validateSchoolCount(data),
    validateSportsCount(data),
    validateMonthDistribution(data),
    validateDateRange(data),
    validateSchoolNames(data),
    validateSports(data),
    validateTimeFormat(data),
  ];

  let passCount = 0;
  let failCount = 0;

  for (const result of validations) {
    const icon = result.passed ? '✓' : '✗';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.passed) {
      passCount++;
    } else {
      failCount++;
    }
  }

  // 統計情報を表示
  console.log('\n========== 検証結果 ==========');
  console.log(`成功: ${passCount} / ${validations.length}`);
  console.log(`失敗: ${failCount} / ${validations.length}`);

  if (failCount > 0) {
    console.error('\n⚠️  検証に失敗した項目があります。スクレイピング処理を見直してください。');
    process.exit(1);
  } else {
    console.log('\n✓ 全ての検証項目が成功しました。');
  }
}

// スクリプトとして実行された場合のみmainを実行
if (require.main === module) {
  verifyScrapedData();
}

export { verifyScrapedData };
