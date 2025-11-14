'use client';

import { useState, useMemo, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import Filter from '@/components/Filter';
import EventDetail from '@/components/EventDetail';
import type { ScheduleData, CalendarEvent, FilterOptions, ScheduleEvent } from '@/lib/types';
import { filterEvents, getSchoolNames, getSportNames } from '@/lib/utils';

export default function Home() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('Data loaded successfully:', jsonData.events?.length, 'events');
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Failed to load schedule data:', errorMessage);
        console.error('URL attempted:', dataUrl);
        setError(`データの読み込みに失敗しました: ${errorMessage} (URL: ${dataUrl})`);
        setLoading(false);
      });
  }, []);
  const [filters, setFilters] = useState<FilterOptions>({ schools: [], sports: [] });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const schoolNames = useMemo(() => data ? getSchoolNames(data) : [], [data]);
  const sportNames = useMemo(() => data ? getSportNames(data) : [], [data]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    return filterEvents(data.events, filters.schools, filters.sports);
  }, [data, filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            練馬区 学校体育館個人開放カレンダー
          </h1>
          <p className="text-gray-600">
            練馬区の学校体育館個人開放日程をカレンダー形式で表示します。
          </p>
          {data?.lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              最終更新: {new Date(data.lastUpdated).toLocaleString('ja-JP')}
            </p>
          )}
          {process.env.NODE_ENV === 'production' && (
            <p className="text-xs text-gray-400 mt-1">
              Data URL: {process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/schedule.json
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">データを読み込み中...</p>
            </div>
          </div>
        ) : !data || data.events.length === 0 ? (
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
                {data && (
                  <>
                    <p>events count: {data.events?.length || 0}</p>
                    <p>schools count: {data.schools?.length || 0}</p>
                    <p>sports count: {data.sports?.length || 0}</p>
                  </>
                )}
                <p>Error: {error || 'なし'}</p>
                <p>BasePath: {process.env.NEXT_PUBLIC_BASE_PATH || '(empty)'}</p>
              </div>
            </details>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* フィルターサイドバー */}
            <aside className="lg:col-span-1">
              <Filter
                schools={schoolNames}
                sports={sportNames}
                onFilterChange={handleFilterChange}
              />

              {/* 統計情報 */}
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">統計</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">全イベント:</span>
                    <span className="font-semibold text-gray-800">
                      {data.events.length}件
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">表示中:</span>
                    <span className="font-semibold text-blue-600">
                      {filteredEvents.length}件
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">学校数:</span>
                    <span className="font-semibold text-gray-800">
                      {schoolNames.length}校
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">種目数:</span>
                    <span className="font-semibold text-gray-800">
                      {sportNames.length}種目
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* カレンダー */}
            <div className="lg:col-span-3">
              <Calendar events={filteredEvents} onSelectEvent={handleSelectEvent} />
            </div>
          </div>
        )}

        {/* イベント詳細モーダル */}
        <EventDetail event={selectedEvent} onClose={handleCloseDetail} />
      </div>
    </main>
  );
}
