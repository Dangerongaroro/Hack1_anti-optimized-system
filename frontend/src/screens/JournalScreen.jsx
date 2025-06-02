import React, { useState } from 'react';
import { Edit3, Calendar, Heart } from 'lucide-react';

const JournalScreen = ({ journalEntries, onAddEntry }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      {/* ジャーナルコンテンツ */}
      <div className="px-4 py-6 pb-32">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">マイジャーナル</h1>
        
        {/* ジャーナルエントリー一覧 */}
        <div className="space-y-4">
          {journalEntries?.map(entry => (
            <div key={entry.id} className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  {entry.date}
                </div>
              </div>
              <p className="text-gray-600 mb-3">{entry.content}</p>
              {entry.mood && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600">{entry.mood}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 追記フォーム（モーダル） */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">新しい体験を記録</h2>
            {/* フォーム内容 */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="体験のタイトル"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                placeholder="今日はどんな体験をしましたか？感じたことや学んだことを記録してみましょう..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    // onAddEntry(newEntry);
                    setShowAddForm(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalScreen;