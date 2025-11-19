/**
 * 責務：スポーツ種目と学校のフィルター機能を提供する
 * 動作：
 * - PC/Tablet（サイドバー）: 縦並びリスト形式でスポーツ・学校を表示
 * - SP（上部）: チップ形式で横スクロール、学校はモーダルで選択
 */
'use client';

import { useState, useEffect } from 'react';
import type { FilterOptions } from '@/lib/types';
import { getSportIcon } from '@/lib/utils';

interface FilterProps {
  schools: string[];
  sports: string[];
  initialFilters?: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function Filter({ schools, sports, initialFilters, onFilterChange }: FilterProps) {
  const [selectedSchools, setSelectedSchools] = useState<string[]>(initialFilters?.schools || []);
  const [selectedSports, setSelectedSports] = useState<string[]>(initialFilters?.sports || []);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [showAllSports, setShowAllSports] = useState(false);

  // 初期表示するスポーツ種目数（SP用）
  const initialDisplayCount = 4;

  // 初期フィルターが変更されたら状態を更新
  useEffect(() => {
    if (initialFilters) {
      setSelectedSchools(initialFilters.schools);
      setSelectedSports(initialFilters.sports);
    }
  }, [initialFilters]);

  const handleSchoolToggle = (school: string) => {
    const newSelection = selectedSchools.includes(school)
      ? selectedSchools.filter((s) => s !== school)
      : [...selectedSchools, school];

    setSelectedSchools(newSelection);
    onFilterChange({
      schools: newSelection,
      sports: selectedSports,
    });
  };

  const handleSportToggle = (sport: string) => {
    const newSelection = selectedSports.includes(sport)
      ? selectedSports.filter((s) => s !== sport)
      : [...selectedSports, sport];

    setSelectedSports(newSelection);
    onFilterChange({
      schools: selectedSchools,
      sports: newSelection,
    });
  };

  const handleClearSchools = () => {
    setSelectedSchools([]);
    onFilterChange({
      schools: [],
      sports: selectedSports,
    });
  };

  // スポーツの並び順を定義
  const sportOrder = [
    // ラケットスポーツ
    'バドミントン',
    '卓球',
    // テニス系
    'テニス',
    '硬式テニス',
    'ラケットテニス',
    'ミニテニス',
    'パドルテニス',
    // バレー系
    'バレーボール',
    'ソフトバレーボール',
    'キャッチバレー',
    // バスケ系
    'バスケットボール',
    'ミニバスケット',
    // その他球技
    'フットサル',
    'ボッチャ',
    // その他
    '軽スポーツ',
    'インディアカ',
    '初心者卓球教室',
  ];

  // スポーツを定義された順番で並び替え
  const sortedSports = [...sports].sort((a, b) => {
    const indexA = sportOrder.indexOf(a);
    const indexB = sportOrder.indexOf(b);
    // 定義されていないスポーツは末尾に
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // SP用：表示するスポーツ種目のリスト
  const displayedSports = showAllSports ? sortedSports : sortedSports.slice(0, initialDisplayCount);
  const hasMoreSports = sortedSports.length > initialDisplayCount;

  return (
    <>
      {/* PC/Tablet: サイドバー用縦並びリスト */}
      <div className="hidden lg:block p-4">
        {/* スポーツ種目セクション */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            スポーツ種目
            {selectedSports.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                {selectedSports.length}
              </span>
            )}
          </h3>
          <div className="space-y-1">
            {sortedSports.map((sport) => {
              const isSelected = selectedSports.includes(sport);
              const icon = getSportIcon(sport);
              const hasEmoji = icon !== sport;
              return (
                <label
                  key={sport}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSportToggle(sport)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">
                    {hasEmoji ? `${icon} ${sport}` : sport}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 学校セクション */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              学校
              {selectedSchools.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                  {selectedSchools.length}
                </span>
              )}
            </h3>
            {selectedSchools.length > 0 && (
              <button
                onClick={handleClearSchools}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                クリア
              </button>
            )}
          </div>
          <div className="space-y-1">
            {schools.map((school) => (
              <label
                key={school}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school)}
                  onChange={() => handleSchoolToggle(school)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">{school}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SP: 上部用ドロップダウン形式 */}
      <div className="lg:hidden bg-white p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* スポーツドロップダウンボタン */}
          <button
            onClick={() => setShowSportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>スポーツ</span>
            {selectedSports.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs">
                {selectedSports.length}
              </span>
            )}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 学校ドロップダウンボタン */}
          <button
            onClick={() => setShowSchoolModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>学校</span>
            {selectedSchools.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs">
                {selectedSchools.length}
              </span>
            )}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* スポーツ選択モーダル（SP用） */}
      {showSportModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSportModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">スポーツを選択</h3>
              <button
                onClick={() => setShowSportModal(false)}
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

            {/* スポーツリスト */}
            <div className="p-4 space-y-2">
              {sortedSports.map((sport) => {
                const icon = getSportIcon(sport);
                const hasEmoji = icon !== sport;
                return (
                  <label
                    key={sport}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport)}
                      onChange={() => handleSportToggle(sport)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {hasEmoji ? `${icon} ${sport}` : sport}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* モーダルフッター */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setShowSportModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 学校選択モーダル（SP用） */}
      {showSchoolModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSchoolModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">学校を選択</h3>
              <div className="flex items-center gap-3">
                {selectedSchools.length > 0 && (
                  <button
                    onClick={handleClearSchools}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    すべてクリア
                  </button>
                )}
                <button
                  onClick={() => setShowSchoolModal(false)}
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
            </div>

            {/* 学校リスト */}
            <div className="p-4 space-y-2">
              {schools.map((school) => (
                <label
                  key={school}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(school)}
                    onChange={() => handleSchoolToggle(school)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{school}</span>
                </label>
              ))}
            </div>

            {/* モーダルフッター */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setShowSchoolModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
