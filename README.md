# 練馬区 学校体育館個人開放カレンダー

練馬区の学校体育館個人開放日程をカレンダー形式で表示するWebアプリケーションです。

## 技術スタック

- **Next.js 14+** (App Router, Static Export)
- **TypeScript**
- **Tailwind CSS**
- **react-big-calendar** - カレンダーUI
- **Cheerio** - スクレイピング
- **ical-generator** - iCalendar生成
- **GitHub Actions** - 週1自動更新

## データソース

- インデックス: https://www.city.nerima.tokyo.jp/kankomoyoshi/shogaigakushu/gakkokaiho/index.html
- 各月のページへのリンクをインデックスから取得

## 主要機能

1. GitHub Actionsで週1回自動スクレイピング
2. JSONデータとiCalendarファイル（全体・体育館ごと・種目ごと）を生成
3. カレンダーUI（フィルタ機能付き）
4. 静的サイトとしてエクスポート

## プロジェクト構成

```
.
├── .github/
│   └── workflows/
│       └── scrape.yml          # GitHub Actions定義
├── app/                        # Next.jsアプリ
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                 # Reactコンポーネント
├── lib/                        # 型定義、ユーティリティ
│   └── types.ts
├── scripts/                    # スクレイピング、iCal生成スクリプト
│   ├── scrape.ts
│   └── generate-ical.ts
├── public/
│   ├── data/                   # JSONデータ
│   └── ical/                   # iCalendarファイル
│       ├── all.ics             # 全体
│       ├── schools/            # 体育館ごと
│       └── sports/             # 種目ごと
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

## 開発

### セットアップ

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### ビルド

```bash
npm run build
```

### スクレイピング実行

練馬区のWebサイトから体育館開放日程をスクレイピングし、JSONファイルを生成します。

```bash
npm run scrape
```

生成されるファイル: `public/data/schedule.json`

### iCalendar生成

JSONデータからiCalendarファイルを生成します。

```bash
npm run generate-ical
```

生成されるファイル:
- `public/ical/all.ics` - 全イベント
- `public/ical/schools/[学校名].ics` - 学校ごと
- `public/ical/sports/[種目名].ics` - スポーツ種目ごと

### データ更新の流れ

```bash
# 1. スクレイピング実行
npm run scrape

# 2. iCalendar生成
npm run generate-ical

# 3. ビルド
npm run build
```

## 自動更新

GitHub Actionsを使用して、週1回自動的にデータを更新します。

### 設定ファイル

`.github/workflows/update-data.yml`

### スケジュール

- **自動実行**: 毎週月曜日 午前9時（JST）
- **手動実行**: GitHubのActionsタブから「Run workflow」で実行可能

### 実行内容

1. スクレイピングスクリプトを実行（`npm run scrape`）
2. iCalendarファイルを生成（`npm run generate-ical`）
3. 変更があれば自動的にコミット＆プッシュ
4. サイトをビルドしてアーティファクトとして保存

### 手動実行方法

1. GitHubリポジトリの「Actions」タブを開く
2. 「Update Gym Schedule Data」ワークフローを選択
3. 「Run workflow」ボタンをクリック
4. ブランチを選択して実行

### 必要な権限

- `contents: write` - データファイルをコミットするために必要

## デプロイ

### GitHub Pages

このプロジェクトはGitHub Pagesに自動デプロイされます。

#### 初回セットアップ

1. GitHubリポジトリの「Settings」→「Pages」を開く
2. 「Source」で「GitHub Actions」を選択
3. mainブランチにプッシュすると自動的にデプロイされます

#### デプロイワークフロー

`.github/workflows/deploy-pages.yml`

- **自動実行**: mainブランチへのプッシュ時
- **手動実行**: GitHubのActionsタブから実行可能
- **デプロイURL**: `https://[ユーザー名].github.io/nerima-school-gym-calender/`

### その他のホスティングサービス

静的サイトとしてエクスポートされるため、Netlify、Vercelなどの静的ホスティングサービスにもデプロイ可能です。

```bash
npm run build
```

`out/` ディレクトリに静的ファイルが生成されます。

## ライセンス

MIT
