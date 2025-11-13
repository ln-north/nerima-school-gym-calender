'use client';

import type { CalendarEvent } from '@/lib/types';
import { formatDateJa } from '@/lib/utils';

interface EventDetailProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetail({ event, onClose }: EventDetailProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">イベント詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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

        <div className="space-y-4">
          {/* 学校名 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">学校</h3>
            <p className="text-lg text-gray-800">{event.resource.schoolName}</p>
          </div>

          {/* 日付 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">日付</h3>
            <p className="text-lg text-gray-800">
              {formatDateJa(event.resource.date)}
            </p>
          </div>

          {/* 時間 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">時間</h3>
            <p className="text-lg text-gray-800">
              {event.resource.startTime} 〜 {event.resource.endTime}
            </p>
          </div>

          {/* スポーツ種目 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">
              スポーツ種目
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.resource.sports.map((sport) => (
                <span
                  key={sport}
                  className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>

          {/* 詳細URL */}
          {event.resource.url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">
                詳細情報
              </h3>
              <a
                href={event.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
              >
                練馬区のページで確認
              </a>
            </div>
          )}
        </div>

        {/* 閉じるボタン */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
