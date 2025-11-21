'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Calendar from '@/components/Calendar';
import Filter from '@/components/Filter';
import EventDetail from '@/components/EventDetail';
import type { ScheduleData, FilterOptions, ScheduleEvent } from '@/lib/types';
import { filterEvents, getSchoolNames, getSportNames } from '@/lib/utils';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialFiltersSet, setInitialFiltersSet] = useState(false);

  // URLからフィルターを読み込む
  const getFiltersFromURL = (): FilterOptions => {
    const schoolsParam = searchParams.get('schools');
    const sportsParam = searchParams.get('sports');

    return {
      schools: schoolsParam ? schoolsParam.split(',').filter(Boolean) : [],
      sports: sportsParam ? sportsParam.split(',').filter(Boolean) : [],
    };
  };

  // 初期フィルターの設定（URLパラメーターがない場合はバドミントンをデフォルト）
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const urlFilters = getFiltersFromURL();
    // URLパラメーターがない場合はバドミントンをデフォルトで選択
    if (urlFilters.schools.length === 0 && urlFilters.sports.length === 0) {
      return { schools: [], sports: ['バドミントン'] };
    }
    return urlFilters;
  });

  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showTime, setShowTime] = useState(false);
  const [startOnSunday, setStartOnSunday] = useState(false);

  useEffect(() => {
    // JSONデータを読み込む
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const dataUrl = `${basePath}/data/schedule.json`;

    console.log('Fetching data from:', dataUrl);
    console.log('Base path:', basePath);

    fetch(dataUrl)
      .then((res) => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
        setInitialFiltersSet(true);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Failed to load schedule data:', errorMessage);
        console.error('URL attempted:', dataUrl);
        setError(`データの読み込みに失敗しました: ${errorMessage} (URL: ${dataUrl})`);
        setLoading(false);
      });
  }, []);

  const schoolNames = useMemo(() => data ? getSchoolNames(data) : [], [data]);
  const sportNames = useMemo(() => data ? getSportNames(data) : [], [data]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    return filterEvents(data.events, filters.schools, filters.sports);
  }, [data, filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    // URLクエリパラメーターを更新
    const params = new URLSearchParams();
    if (newFilters.schools.length > 0) {
      params.set('schools', newFilters.schools.join(','));
    }
    if (newFilters.sports.length > 0) {
      params.set('sports', newFilters.sports.join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    router.push(newUrl, { scroll: false });
  };

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  return (
    <main className="h-dvh flex flex-col bg-gray-50">
      {/* ヘッダー（全画面共通） */}
      {!loading && data && data.events.length > 0 && (
        <header className="py-3 px-3 md:py-3 md:px-4 bg-gray-100 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-sm md:text-[1.0625rem] font-bold text-gray-800 flex items-center gap-1.5 md:gap-2">
            <span className="text-[0.65rem] md:text-xs font-medium bg-gray-500 text-white px-1 py-0 md:px-1.5 md:py-0.5 rounded">
              練馬区
            </span>
            開放カレンダー
          </h1>
        </header>
      )}

      {/* サイドバーとメインエリア */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* PC/Tablet: サイドバー（左側固定） */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 overflow-y-auto">
        {/* フィルター（サイドバー内） */}
        {!loading && data && data.events.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <Filter
              schools={schoolNames}
              sports={sportNames}
              initialFilters={filters}
              onFilterChange={handleFilterChange}
              showTime={showTime}
              onShowTimeChange={setShowTime}
              startOnSunday={startOnSunday}
              onStartOnSundayChange={setStartOnSunday}
            />
          </div>
        )}
      </aside>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">データを読み込み中...</p>
              </div>
            </div>
          ) : !data || data.events.length === 0 ? (
            <div className="p-4 md:p-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  データがありません
                </h2>
                <p className="text-yellow-700 mb-2">
                  データの読み込みに失敗しました。しばらくしてから再度アクセスしてください。
                </p>
                <details className="mt-4 open">
                  <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800 font-semibold">
                    デバッグ情報
                  </summary>
                  <div className="mt-2 text-xs text-yellow-800 bg-yellow-100 p-3 rounded space-y-1">
                    <p>data is null: {data === null ? 'YES' : 'NO'}</p>
                    <p>data exists: {data ? 'YES' : 'NO'}</p>
                    <p>Error: {error || 'なし'}</p>
                    <p>BasePath: {process.env.NEXT_PUBLIC_BASE_PATH || '(empty)'}</p>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {/* カレンダー */}
              <Calendar
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                selectedSportsCount={filters.sports.length}
                showTime={showTime}
                startOnSunday={startOnSunday}
                selectedSports={filters.sports}
                selectedSchools={filters.schools}
                schools={schoolNames}
                sports={sportNames}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>
      </div>
      </div>

      {/* イベント詳細モーダル */}
      <EventDetail event={selectedEvent} onClose={handleCloseDetail} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
