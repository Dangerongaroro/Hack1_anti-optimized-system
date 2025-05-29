import React from 'react';
import { X } from 'lucide-react';

const JournalEntryScreen = ({ journalEntry, setJournalEntry, onSave, onClose }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">新しい体験を記録</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              どんな体験をしましたか？
            </label>
            <input
              type="text"
              value={journalEntry.title}
              onChange={(e) => setJournalEntry({ ...journalEntry, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="例：初めて一人で映画を見た"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['アート', 'アウトドア', '学び', '食', 'その他'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setJournalEntry({ ...journalEntry, category: cat })}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    journalEntry.category === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              どんな気持ちでしたか？（任意）
            </label>
            <div className="flex flex-wrap gap-2">
              {['楽しかった', '驚いた', '挑戦的だった', '新鮮だった', '達成感があった'].map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setJournalEntry({ ...journalEntry, emotion })}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    journalEntry.emotion === emotion
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onSave}
            disabled={!journalEntry.title || !journalEntry.category}
            className={`w-full py-4 rounded-2xl font-medium shadow-lg transition-all duration-300 ${
              journalEntry.title && journalEntry.category
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            記録する
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryScreen;