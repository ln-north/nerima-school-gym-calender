/**
 * 責務：シンプルな月カレンダーを表示する
 * 動作：
 * - 月の日付グリッドを手帳風に表示
 * - 各日付のイベントをリスト表示
 * - 前月/次月へのナビゲーション
 * - イベントクリックで詳細表示
 */
'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ScheduleEvent, FilterOptions } from '@/lib/types';
import { getSportIcon } from '@/lib/utils';

interface CalendarProps {
  events: ScheduleEvent[];
  onSelectEvent?: (event: ScheduleEvent) => void;
  selectedSportsCount?: number;
  showTime?: boolean;
  startOnSunday?: boolean;
  selectedSports?: string[];
  selectedSchools?: string[];
  schools?: string[];
  sports?: string[];
  onFilterChange?: (filters: FilterOptions) => void;
}

export default function Calendar({ events, onSelectEvent, selectedSportsCount = 0, showTime = false, startOnSunday = false, selectedSports = [], selectedSchools = [], schools = [], sports = [], onFilterChange }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempSelectedSports, setTempSelectedSports] = useState<string[]>(selectedSports);
  const [tempSelectedSchools, setTempSelectedSchools] = useState<string[]>(selectedSchools);
  const [showUnselectedSports, setShowUnselectedSports] = useState(false);
  const [showUnselectedSchools, setShowUnselectedSchools] = useState(false);

  // 未選択項目の初期表示数
  const unselectedPreviewCount = 3;

  // 選択済み/未選択の分離
  const selectedSportsList = sports.filter(sport => tempSelectedSports.includes(sport));
  const unselectedSportsList = sports.filter(sport => !tempSelectedSports.includes(sport));
  const selectedSchoolsList = schools.filter(school => tempSelectedSchools.includes(school));
  const unselectedSchoolsList = schools.filter(school => !tempSelectedSchools.includes(school));

  // 選択されたフィルターが変更されたら一時選択も更新
  useEffect(() => {
    setTempSelectedSports(selectedSports);
    setTempSelectedSchools(selectedSchools);
  }, [selectedSports, selectedSchools]);

  // フィルターモーダルを開く
  const handleOpenFilterModal = () => {
    setTempSelectedSports(selectedSports);
    setTempSelectedSchools(selectedSchools);
    setShowUnselectedSports(false);
    setShowUnselectedSchools(false);
    setShowFilterModal(true);
  };

  // フィルターモーダルを閉じる
  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  // フィルターを適用
  const handleApplyFilter = () => {
    if (onFilterChange) {
      onFilterChange({
        sports: tempSelectedSports,
        schools: tempSelectedSchools,
      });
    }
    setShowFilterModal(false);
  };

  // スポーツトグル
  const handleSportToggle = (sport: string) => {
    setTempSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  // 学校トグル
  const handleSchoolToggle = (school: string) => {
    setTempSelectedSchools(prev =>
      prev.includes(school)
        ? prev.filter(s => s !== school)
        : [...prev, school]
    );
  };

  // 月の全日付を生成（前月の端数、当月、翌月の端数を含む）
  const generateCalendarDays = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const weekStartsOn = startOnSunday ? 0 : 1; // 日曜始まり:0, 月曜始まり:1
    const calendarStart = startOfWeek(monthStart, { locale: ja, weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { locale: ja, weekStartsOn });

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  // 週の日付を生成
  const generateWeekDays = (date: Date) => {
    const weekStartsOn = startOnSunday ? 0 : 1; // 日曜始まり:0, 月曜始まり:1
    const weekStart = startOfWeek(date, { locale: ja, weekStartsOn });
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  // 指定日のイベントを取得
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const calendarDays = view === 'month' ? generateCalendarDays(currentDate) : [];
  const weekDays = view === 'week' ? generateWeekDays(currentDate) : [];
  const today = new Date();

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ナビゲーションヘッダー */}
      <div className="flex items-center justify-between pl-1 md:pl-2 pr-2 md:pr-4 py-2 md:py-3">
        {/* 左側 */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* PC: < > ボタンを左に表示 */}
          <button
            onClick={handlePrev}
            className="hidden md:flex w-9 h-9 hover:bg-gray-100 rounded-lg transition-colors items-center justify-center"
            aria-label={view === 'month' ? '前月' : '前週'}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="hidden md:flex w-9 h-9 hover:bg-gray-100 rounded-lg transition-colors items-center justify-center"
            aria-label={view === 'month' ? '次月' : '次週'}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <h2 className="text-base md:text-lg font-bold text-gray-800 pl-2 md:pl-0">
            {format(currentDate, 'yyyy年M月', { locale: ja })}
          </h2>
        </div>

        {/* 右側 */}
        <div className="flex items-center gap-0.5 md:gap-2">
          {/* SP: < 今日 > をここに表示 */}
          <button
            onClick={handlePrev}
            className="md:hidden w-6 h-6 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            aria-label={view === 'month' ? '前月' : '前週'}
          >
            <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleToday}
            className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            今日
          </button>

          <button
            onClick={handleNext}
            className="md:hidden w-6 h-6 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            aria-label={view === 'month' ? '次月' : '次週'}
          >
            <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* ビュー切り替え：SP用ドロップダウン */}
          <div className="md:hidden relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="px-2 h-7 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              {view === 'month' ? '月' : '週'}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showViewMenu && (
              <div className="absolute right-0 mt-1 w-20 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setView('month');
                    setShowViewMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-xs text-left hover:bg-gray-100 ${
                    view === 'month' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  月
                </button>
                <button
                  onClick={() => {
                    setView('week');
                    setShowViewMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-xs text-left hover:bg-gray-100 ${
                    view === 'week' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  週
                </button>
              </div>
            )}
          </div>

          {/* ビュー切り替え：PC用ボタン */}
          <div className="hidden md:inline-flex rounded-lg border border-gray-300 overflow-hidden h-9">
            <button
              onClick={() => setView('month')}
              className={`px-4 h-full text-sm font-medium transition-colors ${
                view === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 h-full text-sm font-medium transition-colors border-l border-gray-300 ${
                view === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              週
            </button>
          </div>
        </div>
      </div>

      {/* SP: フィルター表示 */}
      <div className="lg:hidden flex-shrink-0 bg-white px-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto flex-1">
            {selectedSports.length > 0 ? (
              selectedSports.map((sport) => (
                <span
                  key={sport}
                  className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap"
                >
                  {sport}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap">
                すべてのスポーツ
              </span>
            )}
            {selectedSchools.length > 0 ? (
              selectedSchools.map((school) => (
                <span
                  key={school}
                  className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap"
                >
                  {school}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap">
                すべての学校
              </span>
            )}
          </div>
          <button
            onClick={handleOpenFilterModal}
            className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            絞り込み条件を編集
          </button>
        </div>
      </div>

      {/* 月表示 */}
      {view === 'month' && (
        <>
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {(startOnSunday ? ['日', '月', '火', '水', '木', '金', '土'] : ['月', '火', '水', '木', '金', '土', '日']).map((day, index) => {
              const isSunday = startOnSunday ? index === 0 : index === 6;
              const isSaturday = startOnSunday ? index === 6 : index === 5;
              return (
                <div
                  key={day}
                  className={`pb-1 pt-3 px-2 text-center md:text-left text-xs md:text-sm md:pl-3 md:pr-2 font-semibold ${
                    isSunday ? 'text-red-400' : isSaturday ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* カレンダーグリッド */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 auto-rows-fr min-h-full">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, today);
                const dayOfWeek = day.getDay();

                return (
                  <div
                    key={index}
                    className={`border-b border-gray-200 px-0 py-1 md:p-2 min-h-[100px] ${
                      isToday ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    {/* 日付 */}
                    <div
                      className={`text-xs md:text-base font-medium mb-1 text-center ${
                        !isCurrentMonth ? 'opacity-20' : ''
                      } ${
                        isToday
                          ? 'bg-blue-600 text-white w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center mx-auto md:mx-0'
                          : 'md:text-left md:pl-1'
                      } ${
                        !isToday && dayOfWeek === 0
                          ? 'text-red-600'
                          : !isToday && dayOfWeek === 6
                          ? 'text-blue-600'
                          : !isToday
                          ? 'text-gray-700'
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* イベントリスト */}
                    <div>
                      {dayEvents.map((event, eventIndex) => {
                        const icon = getSportIcon(event.sports[0]);
                        const showIcon = selectedSportsCount !== 1 && icon !== event.sports[0];
                        return (
                          <div
                            key={eventIndex}
                            onClick={() => onSelectEvent?.(event)}
                            className={`text-xs py-0.5 px-1 cursor-pointer hover:bg-blue-50 rounded transition-colors ${
                              !isCurrentMonth ? 'opacity-20' : ''
                            }`}
                          >
                            {/* SP用: 省略形 */}
                            <div className="md:hidden font-medium text-xs text-gray-800 overflow-hidden whitespace-nowrap [text-overflow:clip]">
                              {showIcon && `${icon} `}
                              {event.schoolName.replace('小学校', '小').replace('中学校', '中')}
                            </div>
                            {/* PC用: 完全名 */}
                            <div className="hidden md:block font-medium text-sm text-gray-800 overflow-hidden whitespace-nowrap [text-overflow:ellipsis]">
                              {showIcon && `${icon} `}
                              {event.schoolName}
                            </div>
                            {showTime && (
                              <div className="text-gray-600 text-[0.65rem]">
                                {event.startTime}-{event.endTime}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 週表示（手帳風ホリゾンタル型） */}
      {view === 'week' && (
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col min-h-full">
            {weekDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={index}
                  className={`flex flex-1 border-b border-gray-200 ${
                    isToday ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  {/* 左側：日付 */}
                  <div
                    className={`flex-shrink-0 w-24 p-3 flex flex-col items-center justify-center ${
                      isToday ? 'bg-blue-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-600 mb-1">
                      {format(day, 'E', { locale: ja })}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isToday ? 'text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {format(day, 'd', { locale: ja })}
                    </div>
                  </div>

                  {/* 右側：イベント一覧（横スクロール） */}
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-2 p-3 min-h-full">
                      {dayEvents.length === 0 ? (
                        <div className="flex items-center text-sm text-gray-400">
                          予定なし
                        </div>
                      ) : (
                        dayEvents.map((event, eventIndex) => {
                          const icon = getSportIcon(event.sports[0]);
                          const showIcon = selectedSportsCount !== 1 && icon !== event.sports[0];
                          return (
                            <div
                              key={eventIndex}
                              onClick={() => onSelectEvent?.(event)}
                              className="flex-shrink-0 w-48 p-2 cursor-pointer hover:bg-blue-50 rounded transition-colors"
                            >
                              {showTime && (
                                <div className="text-xs font-semibold text-gray-600 mb-1">
                                  {event.startTime}-{event.endTime}
                                </div>
                              )}
                              <div className="text-base text-gray-800 font-medium mb-0.5 truncate">
                                {showIcon && `${icon} `}
                                {event.schoolName}
                              </div>
                              <div className="text-xs text-gray-600">
                                {event.sports.join(', ')}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* フィルターモーダル（SP用） */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseFilterModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">絞り込み条件</h3>
              <button
                onClick={handleCloseFilterModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-4 space-y-6">
              {/* スポーツ種目セクション */}
              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    スポーツ種目
                  </h4>
                </div>
                <div className="space-y-2">
                  {/* 選択済み項目 */}
                  {selectedSportsList.map((sport) => (
                    <label
                      key={sport}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleSportToggle(sport)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{sport}</span>
                    </label>
                  ))}

                  {/* 未選択項目 */}
                  {unselectedSportsList.length > 0 && (
                    <>
                      {!showUnselectedSports ? (
                        // 折りたたみ時：プレビューのみ（グラデーション付き）
                        <div className="relative">
                          {unselectedSportsList.slice(0, unselectedPreviewCount).map((sport) => (
                            <label
                              key={sport}
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                            >
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleSportToggle(sport)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{sport}</span>
                            </label>
                          ))}
                          {/* グラデーションオーバーレイ */}
                          {unselectedSportsList.length > unselectedPreviewCount && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white pointer-events-none" />
                          )}
                        </div>
                      ) : (
                        // 展開時：全未選択項目
                        unselectedSportsList.map((sport) => (
                          <label
                            key={sport}
                            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleSportToggle(sport)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{sport}</span>
                          </label>
                        ))
                      )}

                      {/* 項目を表示/非表示ボタン */}
                      {unselectedSportsList.length > unselectedPreviewCount && (
                        <button
                          onClick={() => setShowUnselectedSports(!showUnselectedSports)}
                          className="flex items-center space-x-2 w-full text-left p-3 hover:bg-gray-50 rounded-lg text-sm text-gray-600"
                        >
                          <span>{showUnselectedSports ? '項目を非表示' : 'さらに表示'}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${showUnselectedSports ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 学校セクション */}
              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    学校
                  </h4>
                </div>
                <div className="space-y-2">
                  {/* 選択済み項目 */}
                  {selectedSchoolsList.map((school) => (
                    <label
                      key={school}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleSchoolToggle(school)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{school}</span>
                    </label>
                  ))}

                  {/* 未選択項目 */}
                  {unselectedSchoolsList.length > 0 && (
                    <>
                      {!showUnselectedSchools ? (
                        // 折りたたみ時：プレビューのみ（グラデーション付き）
                        <div className="relative">
                          {unselectedSchoolsList.slice(0, unselectedPreviewCount).map((school) => (
                            <label
                              key={school}
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                            >
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleSchoolToggle(school)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{school}</span>
                            </label>
                          ))}
                          {/* グラデーションオーバーレイ */}
                          {unselectedSchoolsList.length > unselectedPreviewCount && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white pointer-events-none" />
                          )}
                        </div>
                      ) : (
                        // 展開時：全未選択項目
                        unselectedSchoolsList.map((school) => (
                          <label
                            key={school}
                            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleSchoolToggle(school)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{school}</span>
                          </label>
                        ))
                      )}

                      {/* 項目を表示/非表示ボタン */}
                      {unselectedSchoolsList.length > unselectedPreviewCount && (
                        <button
                          onClick={() => setShowUnselectedSchools(!showUnselectedSchools)}
                          className="flex items-center space-x-2 w-full text-left p-3 hover:bg-gray-50 rounded-lg text-sm text-gray-600"
                        >
                          <span>{showUnselectedSchools ? '項目を非表示' : 'さらに表示'}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${showUnselectedSchools ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={handleApplyFilter}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                適用する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
