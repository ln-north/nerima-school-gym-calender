'use client';

import { useState } from 'react';
import type { FilterOptions } from '@/lib/types';

interface FilterProps {
  schools: string[];
  sports: string[];
  onFilterChange: (filters: FilterOptions) => void;
}

export default function Filter({ schools, sports, onFilterChange }: FilterProps) {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [showSchoolFilter, setShowSchoolFilter] = useState(false);
  const [showSportFilter, setShowSportFilter] = useState(false);

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

  const handleClearSports = () => {
    setSelectedSports([]);
    onFilterChange({
      schools: selectedSchools,
      sports: [],
    });
  };

  const handleClearAll = () => {
    setSelectedSchools([]);
    setSelectedSports([]);
    onFilterChange({
      schools: [],
      sports: [],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">フィルター</h2>
        {(selectedSchools.length > 0 || selectedSports.length > 0) && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            すべてクリア
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 学校フィルター */}
        <div>
          <button
            onClick={() => setShowSchoolFilter(!showSchoolFilter)}
            className="flex items-center justify-between w-full text-left font-semibold text-gray-700 hover:text-gray-900"
          >
            <span>
              学校
              {selectedSchools.length > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({selectedSchools.length}件選択中)
                </span>
              )}
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                showSchoolFilter ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSchoolFilter && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {selectedSchools.length > 0 && (
                <button
                  onClick={handleClearSchools}
                  className="text-xs text-gray-600 hover:text-gray-800 mb-2"
                >
                  選択解除
                </button>
              )}
              {schools.map((school) => (
                <label
                  key={school}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(school)}
                    onChange={() => handleSchoolToggle(school)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{school}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* スポーツ種目フィルター */}
        <div>
          <button
            onClick={() => setShowSportFilter(!showSportFilter)}
            className="flex items-center justify-between w-full text-left font-semibold text-gray-700 hover:text-gray-900"
          >
            <span>
              スポーツ種目
              {selectedSports.length > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({selectedSports.length}件選択中)
                </span>
              )}
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                showSportFilter ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSportFilter && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {selectedSports.length > 0 && (
                <button
                  onClick={handleClearSports}
                  className="text-xs text-gray-600 hover:text-gray-800 mb-2"
                >
                  選択解除
                </button>
              )}
              {sports.map((sport) => (
                <label
                  key={sport}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport)}
                    onChange={() => handleSportToggle(sport)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{sport}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
