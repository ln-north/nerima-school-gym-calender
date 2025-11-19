# 全画面アプリ化とレスポンシブレイアウト実装 - 開発詳細

このドキュメントは、親Claudeがどのファイルを読めばいいか、どう実装すればいいかをナビゲートするためのものです。

## 現在の構成

### アプリケーション構造

**app/page.tsx** (188行):
- メインコンポーネント（HomeContent + Suspenseラッパー）
- 役割：データ取得、フィルター状態管理、URL同期、コンポーネント配置
- 現在のレイアウト：
  - `<main className="min-h-screen bg-gray-50 p-4 md:p-8">` で全体をラップ
  - `<div className="max-w-7xl mx-auto">` でコンテンツを中央配置
  - header → Filter → Calendar → EventDetail の順に縦並び配置
- データフロー：
  1. useEffect で `/data/schedule.json` を fetch
  2. URL クエリパラメーターからフィルター状態を復元
  3. フィルター変更時に URL を更新（router.push）
  4. filteredEvents を Calendar に渡す

**app/layout.tsx** (19行):
- 非常にシンプル、基本的な HTML 構造のみ
- `<html lang="ja"><body>{children}</body></html>`
- レイアウトに関する処理なし

**components/Filter.tsx** (196行):
- 役割：スポーツ種目と学校のフィルター機能
- 現在のUI：
  - スポーツ種目：チップ形式（横スクロール対応）
  - 学校：「学校を絞り込む」ボタン → モーダル
- 構造：
  - `<div className="bg-white rounded-lg shadow-md p-4 mb-6">` でカード化
  - `<div className="flex items-center gap-2 overflow-x-auto">` でチップを横並び
  - 初期表示は4つのスポーツ、「もっと見る」で全表示
  - 学校選択モーダル（fixed inset-0 で全画面オーバーレイ）
- 状態管理：
  - selectedSchools, selectedSports を内部で管理
  - 変更時に onFilterChange コールバックを呼び出す

**components/Calendar.tsx** (138行):
- 役割：react-big-calendar のラッパー
- 現在のUI：
  - `<div className="bg-white rounded-lg shadow-lg p-4" style={{ height: ${calendarHeight}px }}>` でカード化
  - 動的高さ計算（maxEventsPerDay に基づく、最小800px、最大2400px）
- カスタマイズ：
  - CustomEvent コンポーネントでイベント表示をカスタマイズ
  - eventStyleGetter で当月/他月の透明度を変更
  - 日本語ローカライゼーション（date-fns, ja locale）

**components/EventDetail.tsx** (109行):
- 役割：イベント詳細をモーダル表示
- 構造：`fixed inset-0` で全画面オーバーレイ
- 変更不要（全画面レイアウトでも動作）

### スタイリング

**app/globals.css** (82行):
- Tailwind CSS ベース
- react-big-calendar のスタイルカスタマイズ
- 重要な設定：
  - `.rbc-show-more { display: none; }`: "+N more" を非表示
  - `.rbc-month-row { overflow: visible; }`: すべてのイベントを表示

**tailwind.config.ts** (14行):
- 標準的な Tailwind CSS 設定
- カスタマイズなし

### 技術スタック

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **react-big-calendar 1.8.0**
- **date-fns 3.0.0**
- 静的サイトエクスポート（output: 'export' in next.config.js）

### レスポンシブ対応の現状

- padding のみ（`p-4 md:p-8`）
- Filter は `overflow-x-auto` で横スクロール
- Calendar は固定レイアウト（レスポンシブ最適化なし）
- すべて縦並び（1カラム）のみ

## 技術的な考慮点

### 1. 全画面アプリ化の実装

**課題**:
- 現在は `min-h-screen` で最小高さのみ設定
- ページ全体がスクロール可能（ブラウザのスクロールバーが表示）

**実装方針**:
- `min-h-screen` → `h-screen` に変更
- `overflow-hidden` でページ全体のスクロールを無効化
- サイドバーとメインエリアに `overflow-y-auto` を設定

**注意点**:
- `h-screen` は viewport の高さ（100vh）
- モバイルブラウザのアドレスバー分が引かれる場合があるため、`h-dvh`（dynamic viewport height）の使用も検討
- ただし、Tailwind CSS v3.4 以降でサポート（package.json では v3.4.0 なので使用可能）

### 2. レスポンシブレイアウトの実装

**ブレークポイント**:
- Tailwind CSS の `lg:` ブレークポイント（1024px）を使用
- `lg:` 以上: PC/Tablet（2カラムレイアウト）
- `lg:` 未満: スマートフォン（1カラムレイアウト）

**レイアウト構造**:

**PC/Tablet（lg: 以上）**:
```
┌─────────────────────────────────┐
│ Header (固定 or サイドバー上部) │
├──────────┬──────────────────────┤
│          │                      │
│ Sidebar  │  Main Area           │
│ (Filter) │  (Calendar)          │
│          │                      │
│ スクロール │  スクロール可能        │
│ 可能      │                      │
└──────────┴──────────────────────┘
```

**SP（lg: 未満）**:
```
┌─────────────────────────────────┐
│ Header (固定)                    │
├─────────────────────────────────┤
│ Filter (固定 or スクロール可能)   │
├─────────────────────────────────┤
│                                 │
│ Main Area (Calendar)            │
│ スクロール可能                   │
│                                 │
└─────────────────────────────────┘
```

**実装方法**:
- CSS Grid または Flexbox を使用
- Grid の場合: `grid grid-cols-1 lg:grid-cols-[280px_1fr]`
- Flex の場合: `flex flex-col lg:flex-row`

### 3. フィルターUIの変更

**PC/Tablet 向けサイドバーUI**:

現在のチップ形式は横スクロールが前提のため、サイドバーには不適切。以下のUIに変更：

1. **スポーツ種目**:
   - 縦並びリスト形式
   - すべて表示（「もっと見る」ボタン削除）
   - チェックボックス or ボタン形式

2. **学校選択**:
   - モーダルではなく、サイドバー内に展開
   - スクロール可能なリスト
   - または、折りたたみ可能なアコーディオン

**SP 向けフィルターUI**:

現在のチップ形式を維持しつつ、以下の改善を検討：

1. **現在のUIを維持**:
   - チップ形式（横スクロール）
   - 「もっと見る」ボタンで展開
   - 学校選択はモーダル（変更なし）

2. **または、ドロップダウン形式**:
   - スポーツ種目と学校をドロップダウンで選択
   - 画面幅を節約

3. **または、モーダルベース**:
   - 「フィルター」ボタン → モーダルで両方選択
   - メルカリのような UI

**実装方針**:
- Filter コンポーネント内で `lg:` ブレークポイントを使用して UI を切り替え
- または、FilterSidebar と FilterMobile の2つのコンポーネントに分割

### 4. カレンダー高さの調整

**現在の実装**:
- `maxEventsPerDay` に基づいて動的に高さを計算
- `style={{ height: ${calendarHeight}px }}`
- 最小800px、最大2400px

**問題**:
- 全画面レイアウトでは親要素（メインエリア）の高さに合わせるべき
- 固定高さだとスクロールバーが2つ表示される可能性

**実装方針**:
- `h-full` を使用して親要素の高さに合わせる
- react-big-calendar の style prop に `{ height: '100%' }` を設定
- 動的高さ計算を削除（または、最小高さのみ保持）

### 5. URL状態管理の維持

**現在の実装**:
- URL クエリパラメーター（?schools=...&sports=...）でフィルター状態を管理
- フィルター変更時に `router.push(newUrl, { scroll: false })` で URL を更新
- 初回訪問時はバドミントンをデフォルト選択

**実装方針**:
- 変更なし
- レイアウト変更はURL状態管理に影響しない

## 実装方針

### Phase 1: 基本レイアウト構造の実装

#### 1-1. app/layout.tsx の変更（任意）

全画面化のため、body と html の高さを設定：

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
```

#### 1-2. app/page.tsx のレイアウト変更

**変更箇所**:
- `<main>` タグのクラス名を変更：
  - `min-h-screen bg-gray-50 p-4 md:p-8` → `h-screen bg-gray-50 overflow-hidden`
  - padding を削除（サイドバーとメインエリアで個別に設定）
- `max-w-7xl mx-auto` を削除（全画面を使用）
- レイアウト構造を2カラム（PC/Tablet）と1カラム（SP）に変更

**実装例**:

```tsx
return (
  <main className="h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
    {/* PC/Tablet: サイドバー（左側） */}
    <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-200 overflow-y-auto">
      {/* ヘッダー（サイドバー上部） */}
      <header className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">
          練馬区 学校体育館個人開放
        </h1>
        {data?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">
            最終更新: {new Date(data.lastUpdated).toLocaleString('ja-JP')}
          </p>
        )}
      </header>

      {/* フィルター（サイドバー用UI） */}
      <div className="flex-1 overflow-y-auto p-6">
        <Filter
          schools={schoolNames}
          sports={sportNames}
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          variant="sidebar" // サイドバー用UIを指定
        />
      </div>
    </aside>

    {/* メインエリア */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* SP: ヘッダー（上部固定） */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800">
          練馬区 学校体育館個人開放
        </h1>
        {data?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-1">
            最終更新: {new Date(data.lastUpdated).toLocaleString('ja-JP')}
          </p>
        )}
      </header>

      {/* SP: フィルター */}
      <div className="lg:hidden">
        <Filter
          schools={schoolNames}
          sports={sportNames}
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          variant="mobile" // SP用UIを指定
        />
      </div>

      {/* PC/Tablet: ヘッダー（メインエリア上部） */}
      <header className="hidden lg:block bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-800">カレンダー</h1>
        {data?.lastUpdated && (
          <p className="text-sm text-gray-500 mt-2">
            最終更新: {new Date(data.lastUpdated).toLocaleString('ja-JP')}
          </p>
        )}
      </header>

      {/* カレンダー */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Calendar events={filteredEvents} onSelectEvent={handleSelectEvent} />
      </div>
    </div>

    {/* イベント詳細モーダル */}
    <EventDetail event={selectedEvent} onClose={handleCloseDetail} />
  </main>
);
```

**注意点**:
- `variant="sidebar"` と `variant="mobile"` は Filter コンポーネントに props を追加する必要がある
- または、`className` を使って `lg:hidden` / `hidden lg:block` で切り替える

#### 1-3. components/Filter.tsx の変更

**変更方針**:
- `variant` prop を追加（"sidebar" | "mobile"）
- variant に応じて UI を切り替え

**サイドバー用UI（variant="sidebar"）**:
- チップ形式ではなく、縦並びリスト
- スポーツ種目：すべて表示、ボタンまたはチェックボックス
- 学校：モーダルではなく、展開可能なリスト

**SP用UI（variant="mobile"）**:
- 現在のチップ形式を維持
- または、ドロップダウン/モーダルベースに変更

**実装例**（擬似コード）:

```tsx
interface FilterProps {
  schools: string[];
  sports: string[];
  initialFilters?: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  variant?: 'sidebar' | 'mobile'; // 追加
}

export default function Filter({ schools, sports, initialFilters, onFilterChange, variant = 'mobile' }: FilterProps) {
  // ...既存のstate

  if (variant === 'sidebar') {
    return (
      <div className="space-y-6">
        {/* スポーツ種目（縦並びリスト） */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">スポーツ種目</h3>
          <div className="space-y-2">
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => handleSportToggle(sport)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedSports.includes(sport)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedSports.includes(sport) && '✓ '}
                {getSportIcon(sport)} {sport}
              </button>
            ))}
          </div>
        </div>

        {/* 学校（展開可能なリスト） */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">学校</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {schools.map((school) => (
              <label
                key={school}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school)}
                  onChange={() => handleSchoolToggle(school)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{school}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // variant === 'mobile': 現在のUIを維持
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* ...既存のチップ形式UI */}
    </div>
  );
}
```

#### 1-4. components/Calendar.tsx の変更

**変更方針**:
- 動的高さ計算を削除
- `h-full` を使用して親要素の高さに合わせる

**変更箇所**:
- `calendarHeight` の計算を削除（または、最小高さのみ保持）
- `<div>` のスタイルを変更：
  - `style={{ height: ${calendarHeight}px }}` → `className="h-full"`

**実装例**:

```tsx
export default function Calendar({ events, onSelectEvent }: CalendarProps) {
  // ...既存のstate

  // calendarHeight の計算を削除

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <BigCalendar
        // ...既存のprops
        style={{ height: '100%' }} // 重要: 親要素の高さに合わせる
      />
    </div>
  );
}
```

**注意点**:
- react-big-calendar は親要素の高さが必要
- 親要素（app/page.tsx の `<div className="flex-1 overflow-y-auto p-4 lg:p-6">`）が `flex-1` で高さを持つため、`h-full` が機能する

### Phase 2: フィルターUIの最適化

**Phase 1 で基本的なUIは実装済み**

Phase 2 では、以下の改善を検討：

1. **サイドバーUIの洗練**:
   - スポーツ種目のアイコン表示
   - 学校リストの検索機能
   - 選択状態のクリアボタン

2. **SPのUIの改善**:
   - チップ形式の改善（スクロールのしやすさ）
   - または、ドロップダウン/モーダルベースへの変更

### Phase 3: 最適化と調整

1. **スクロール挙動の調整**:
   - サイドバーとメインエリアのスクロールバーの見た目調整
   - スクロール位置の保持（フィルター変更時）

2. **レスポンシブテスト**:
   - 各ブレークポイントでの動作確認
   - モバイルブラウザでの動作確認（h-screen vs h-dvh）

3. **アクセシビリティ**:
   - キーボードナビゲーション
   - スクリーンリーダー対応

## 関連ファイル

### 変更予定ファイル

- **app/page.tsx** (188行)
  - レイアウト構造の全面変更
  - ヘッダーの配置変更
  - Filter コンポーネントの variant prop 追加

- **app/layout.tsx** (19行)
  - html, body の高さ設定（`h-full`）

- **components/Filter.tsx** (196行)
  - variant prop の追加
  - サイドバー用UIの実装
  - SP用UIの改善（任意）

- **components/Calendar.tsx** (138行)
  - 動的高さ計算の削除
  - `h-full` への変更

### 変更不要ファイル

- **components/EventDetail.tsx** (109行)
  - 変更なし（モーダルは全画面レイアウトでも動作）

- **lib/types.ts**, **lib/utils.ts**, **lib/constants.ts**
  - 変更なし（ロジック・型定義は影響を受けない）

- **app/globals.css**, **tailwind.config.ts**
  - 変更なし（必要に応じて微調整）

### 参考ファイル

- **app/globals.css** (82行)
  - react-big-calendar のスタイルカスタマイズ例
  - 必要に応じて、サイドバーのスクロールバースタイルを追加

- **tailwind.config.ts** (14行)
  - Tailwind CSS の設定
  - カスタムブレークポイントの追加（必要に応じて）

## 実装時のチェックリスト

### Phase 1

- [ ] app/layout.tsx に `h-full` を追加
- [ ] app/page.tsx のレイアウトを2カラム/1カラムに変更
- [ ] Filter コンポーネントに variant prop を追加
- [ ] サイドバー用フィルターUIを実装
- [ ] Calendar コンポーネントの高さを `h-full` に変更
- [ ] 動作確認（PC/Tablet、SP）

### Phase 2

- [ ] サイドバーUIの洗練（アイコン、検索、クリアボタン）
- [ ] SPのUIの改善（チップ形式 or ドロップダウン/モーダル）
- [ ] 動作確認（各デバイス）

### Phase 3

- [ ] スクロール挙動の調整
- [ ] レスポンシブテスト（各ブレークポイント）
- [ ] アクセシビリティチェック
- [ ] 最終動作確認

## 技術的な参考情報

### Tailwind CSS レスポンシブデザイン

- `lg:` = 1024px 以上
- `hidden lg:flex` = SPで非表示、PC/Tabletで表示
- `lg:hidden` = PC/Tabletで非表示、SPで表示

### Flexbox レイアウト

- `flex flex-col lg:flex-row` = SP: 縦並び、PC/Tablet: 横並び
- `flex-1` = 残りのスペースを使用
- `overflow-y-auto` = 縦スクロール可能

### react-big-calendar の高さ設定

- 親要素の高さが必要
- `style={{ height: '100%' }}` で親要素の高さに合わせる
- 親要素が `h-full` または `flex-1` で高さを持つ必要がある
