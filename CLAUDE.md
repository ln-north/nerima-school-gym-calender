# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

練馬区の学校体育館個人開放日程をスクレイピングし、カレンダー形式で表示するNext.jsアプリケーション。GitHub Actionsで毎日自動更新。

## 開発コマンド

### 基本コマンド
```bash
npm run dev          # 開発サーバー起動（http://localhost:3000）
npm run lint         # ESLint実行
npm run typecheck    # TypeScriptの型チェック
```

**⚠️ 重要な注意事項**

- **`npm run build` は開発中に実行しないでください**
  - 実行すると `npm run dev` が壊れます
  - ビルドは GitHub Actions で自動実行されます（deploy-pages.yml）
  - ローカルでの動作確認は `npm run dev` のみを使用してください

### データ更新コマンド
```bash
npm run scrape              # スクレイピング実行 → public/data/schedule.json生成
npm run scrape:verify       # スクレイピング + 検証を連続実行
npm run verify              # スクレイピング結果の検証（データ欠損チェック）
npm run generate-ical       # iCalendarファイル生成 → public/ical/*.ics生成
```

### 完全なデータ更新フロー（ローカル開発時）
```bash
npm run scrape && npm run generate-ical
```

※ ビルドは GitHub Actions で自動実行されるため、ローカルでは不要

## アーキテクチャ

### データフロー

```
練馬区Webサイト
  ↓ (scrape.ts)
public/data/schedule.json
  ↓ (generate-ical.ts)
public/ical/*.ics
  ↓ (Next.js App Router)
静的サイト (out/)
```

### 主要な処理フロー

1. **スクレイピング（scripts/scrape.ts）**
   - インデックスページから月別ページURLを動的取得
   - 各月ページのHTMLテーブルをパース（学校名・時間・日付・種目）
   - rowspan対応：学校名が複数行にまたがる場合、前の行の学校名を保持
   - JSONデータ生成（ScheduleData型）

2. **iCalendar生成（scripts/generate-ical.ts）**
   - all.ics: 全イベント
   - schools/*.ics: 学校ごとにフィルタ
   - sports/*.ics: 種目ごとにフィルタ

3. **カレンダー表示（app/page.tsx）**
   - クライアントサイドで schedule.json を fetch
   - URL クエリパラメーター（?schools=...&sports=...）でフィルタ状態を保持
   - デフォルトフィルター: バドミントン（初回訪問時）
   - react-big-calendar でカレンダーUI表示

### ディレクトリ構造の重要ポイント

```
app/                      # Next.js App Router（クライアントコンポーネント）
  ├── page.tsx           # メインページ（フィルタ・カレンダー表示）
  └── layout.tsx         # 共通レイアウト

components/               # Reactコンポーネント
  ├── Calendar.tsx       # react-big-calendar ラッパー
  ├── Filter.tsx         # 学校・種目フィルター（チップ形式UI）
  └── EventDetail.tsx    # イベント詳細モーダル

lib/                      # 共通ロジック・型定義
  ├── types.ts           # 型定義（ScheduleEvent, CalendarEvent, FilterOptions等）
  ├── utils.ts           # フィルタリング・データ変換ユーティリティ
  ├── constants.ts       # 定数（URL、設定値）
  └── index.ts           # エクスポート

scripts/                  # Node.jsスクリプト（GitHub Actionsで実行）
  ├── scrape.ts          # Webスクレイピング
  ├── verify-scraping.ts # データ検証
  └── generate-ical.ts   # iCalendar生成

public/
  ├── data/
  │   └── schedule.json  # スクレイピング結果（自動生成）
  └── ical/
      ├── all.ics        # 全イベント（自動生成）
      ├── schools/*.ics  # 学校ごと（自動生成）
      └── sports/*.ics   # 種目ごと（自動生成）
```

## 型システムの理解

### 主要な型（lib/types.ts）

- **ScheduleEvent**: スクレイピング結果の基本単位（学校名・日付・時間・種目）
- **CalendarEvent**: react-big-calendar用（Date型に変換 + resource に ScheduleEvent を保持）
- **ScheduleData**: 全体データ（events配列 + lastUpdated）
- **FilterOptions**: フィルタ状態（schools配列 + sports配列）

### データ変換パイプライン

```typescript
// スクレイピング結果
ScheduleEvent[]
  ↓ (createScheduleData in utils.ts)
ScheduleData { events, lastUpdated }
  ↓ (filterEvents in utils.ts)
ScheduleEvent[] (フィルタ済み)
  ↓ (app/page.tsx内で変換)
CalendarEvent[] (カレンダー表示用)
```

## スクレイピングの特殊処理

### HTMLテーブル構造の理解

練馬区のWebサイトは以下の構造：

```
<tr>
  <td rowspan="2">学校名</td>  <!-- rowspanで複数行をまたぐ -->
  <td>バドミントン</td>
  <td>19:00～21:00</td>
  <td>2（日）、30（日）</td>
</tr>
<tr>
  <!-- 学校名セルなし（rowspanのため） -->
  <td>卓球</td>
  <td>19:00～21:00</td>
  <td>3（月）</td>
</tr>
```

### scrape.ts の重要なロジック

- **cells.length === 5**: 学校名がある行 → currentSchoolName を更新
- **cells.length === 4**: 学校名なし（rowspan） → 前の currentSchoolName を使用
- **日付パース**: "2（日）、30（日）" から複数の日付を抽出 → 各日付ごとに ScheduleEvent を生成
- **時間パース**: 全角コロン（：）と半角コロン（:）の両方に対応

## GitHub Actions自動化

### update-data.yml（毎日午前9時JST実行）

1. `npm run scrape` → schedule.json生成
2. `npm run verify` → データ検証（欠損チェック）
3. `npm run generate-ical` → iCalファイル生成
4. 変更があれば自動コミット＆プッシュ

### deploy-pages.yml（mainブランチプッシュ時）

- 静的サイトビルド → GitHub Pagesにデプロイ

## 重要な設計判断

### なぜクライアントサイドでJSONをfetch？

- 静的サイト生成（Static Export）を使用
- GitHub Pagesでホスティング可能
- ビルド時にデータを埋め込まず、ランタイムで取得することでデータ更新とデプロイを分離

### なぜURLクエリパラメーターでフィルタ状態を管理？

- ページリロード時にフィルタ状態を保持
- URLを共有することで特定のフィルタ状態を共有可能
- ブラウザの戻る/進むボタンでフィルタ履歴を追跡

### デフォルトでバドミントンを選択する理由

- 空のカレンダーを表示するよりユーザーフレンドリー
- 最も人気のある種目（想定）
- URLパラメーターがない場合のみ適用（明示的なフィルタは優先）

## よくあるタスク

### 新しいスポーツ絵文字を追加

`components/Filter.tsx` の `SPORT_EMOJI` オブジェクトに追加:

```typescript
const SPORT_EMOJI: Record<string, string> = {
  'バドミントン': '🏸',
  // ...新しい種目を追加
};
```

### スクレイピング対象月を変更

練馬区のサイト構造が変わった場合、`scripts/scrape.ts` の以下を修正:

- `getYearMonthFromUrl()`: URL→年月のマッピング
- `getMonthlyPageUrls()`: インデックスページのリンク検出ロジック

### カレンダーUIのカスタマイズ

- `components/Calendar.tsx`: react-big-calendar の設定
- `lib/constants.ts` の `CALENDAR_CONFIG`: 表示テキスト・ビュー設定

## トラブルシューティング

### npm run dev が動かない

**原因**: `npm run build` を実行してしまった場合、開発サーバーが壊れることがあります。

**対処法**:
1. `out/` ディレクトリを削除
2. `.next/` ディレクトリを削除
3. `npm run dev` を再実行

```bash
rm -rf out .next
npm run dev
```

### データが表示されない

1. `public/data/schedule.json` が存在するか確認
2. ブラウザコンソールで fetch エラーを確認
3. `NEXT_PUBLIC_BASE_PATH` 環境変数の設定確認（GitHub Pages用）

### スクレイピングが失敗する

1. `npm run scrape:verify` で詳細なエラー確認
2. 練馬区のWebサイトURL・HTML構造が変更されていないか確認
3. `scripts/verify-scraping.ts` で検証基準を調整

### GitHub Actionsが失敗する

1. Actions タブでログ確認
2. `permissions: contents: write` が設定されているか確認
3. データ検証（verify）が通っているか確認
