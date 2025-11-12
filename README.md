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

```bash
npm run scrape
```

### iCalendar生成

```bash
npm run generate-ical
```

## デプロイ

静的サイトとしてエクスポートされるため、GitHub Pages、Netlify、Vercelなどの静的ホスティングサービスにデプロイ可能です。

```bash
npm run build
```

`out/` ディレクトリに静的ファイルが生成されます。

## ライセンス

MIT
