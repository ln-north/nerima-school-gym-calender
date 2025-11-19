/**
 * 責務：スポーツ種目と学校のフィルター機能を提供する
 * 動作：
 * - スポーツ種目：チップ形式で横並び表示、選択状態は✔マークで表示
 * - 学校：「学校を絞り込む」ボタンからモーダルで選択
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
  const [showAllSports, setShowAllSports] = useState(false);

  // 初期表示するスポーツ種目数
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

  // 表示するスポーツ種目のリスト
  const displayedSports = showAllSports ? sports : sports.slice(0, initialDisplayCount);
  const hasMoreSports = sports.length > initialDisplayCount;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* スポーツ種目チップ */}
        {displayedSports.map((sport) => {
          const isSelected = selectedSports.includes(sport);
          const icon = getSportIcon(sport);
          const hasEmoji = icon !== sport;
          return (
            <button
              key={sport}
              onClick={() => handleSportToggle(sport)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected && '✓ '}
              {hasEmoji ? `${icon} ${sport}` : sport}
            </button>
          );
        })}

        {/* もっと見る/閉じるボタン */}
        {hasMoreSports && (
          <button
            onClick={() => setShowAllSports(!showAllSports)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            {showAllSports ? '閉じる' : `もっと見る (+${sports.length - initialDisplayCount})`}
          </button>
        )}

        {/* 学校を絞り込むボタン */}
        <button
          onClick={() => setShowSchoolModal(true)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border-2 border-gray-300 whitespace-nowrap"
        >
          学校を絞り込む
          {selectedSchools.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
              {selectedSchools.length}
            </span>
          )}
        </button>
      </div>

      {/* 学校選択モーダル */}
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
    </div>
  );
}
