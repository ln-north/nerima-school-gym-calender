import { readFileSync } from 'fs';
import { join } from 'path';
import type { ScheduleData } from '../lib/types';

/**
 * スクレイピング結果の検証スクリプト
 *
 * 既知の情報と照合して、データが正しく取得できているかチェックします
 */

interface KnownEvent {
  school: string;
  sport: string;
  month: number;
  days: number[];
  description: string;
}

// 手動で確認した既知のイベント（サンプル）
const knownEvents: KnownEvent[] = [
  {
    school: '上石神井北小学校',
    sport: 'バドミントン',
    month: 11,
    days: [5, 12, 19],
    description: '上石神井北小学校の11月バドミントン（水曜日）',
  },
  {
    school: '北町西小学校',
    sport: '軽スポーツ',
    month: 11,
    days: [7, 14, 21],
    description: '北町西小学校の11月軽スポーツ（金曜日）',
  },
  {
    school: '上石神井北小学校',
    sport: 'ソフトバレーボール',
    month: 11,
    days: [3, 10, 17],
    description: '上石神井北小学校の11月ソフトバレーボール（月曜日）',
  },
];

async function verifyScrapedData() {
  console.log('========== スクレイピング結果の検証 ==========\n');

  // JSONデータを読み込む
  const dataPath = join(process.cwd(), 'public', 'data', 'schedule.json');
  const data: ScheduleData = JSON.parse(readFileSync(dataPath, 'utf-8'));

  console.log(`総イベント数: ${data.events.length}`);

  let passCount = 0;
  let failCount = 0;

  // 既知のイベントを検証
  for (const knownEvent of knownEvents) {
    console.log(`\n検証中: ${knownEvent.description}`);
    console.log(`  期待: ${knownEvent.school} - ${knownEvent.sport} - ${knownEvent.month}月 - ${knownEvent.days.join(', ')}日`);

    const matchingEvents = data.events.filter((event) => {
      const eventDate = new Date(event.date);
      const eventMonth = eventDate.getMonth() + 1;
      const eventDay = eventDate.getDate();

      return (
        event.schoolName === knownEvent.school &&
        event.sports.includes(knownEvent.sport) &&
        eventMonth === knownEvent.month &&
        knownEvent.days.includes(eventDay)
      );
    });

    const foundDays = matchingEvents.map((e) => new Date(e.date).getDate()).sort((a, b) => a - b);
    const expectedDays = [...knownEvent.days].sort((a, b) => a - b);

    const isMatch =
      foundDays.length === expectedDays.length &&
      foundDays.every((day, index) => day === expectedDays[index]);

    if (isMatch) {
      console.log(`  ✓ 成功: ${foundDays.join(', ')}日のイベントが見つかりました`);
      passCount++;
    } else {
      console.log(`  ✗ 失敗: 期待=${expectedDays.join(', ')}日, 実際=${foundDays.join(', ')}日`);
      failCount++;
    }
  }

  // 統計情報を表示
  console.log('\n========== 検証結果 ==========');
  console.log(`成功: ${passCount} / ${knownEvents.length}`);
  console.log(`失敗: ${failCount} / ${knownEvents.length}`);

  if (failCount > 0) {
    console.error('\n⚠️  検証に失敗したイベントがあります。スクレイピング処理を見直してください。');
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
