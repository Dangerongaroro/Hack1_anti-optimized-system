import React from 'react';
import { ArrowLeft, Save, Heart, Smile, Meh, Frown } from 'lucide-react';

const JournalScreen = ({ 
  journalEntry, 
  onJournalChange, 
  onSave, 
  onBack,
  error = null,
  onClearError 
}) => {
  const categories = [
    'アート・創作',
    '音楽・エンタメ', 
    '料理・グルメ',
    '自然・アウトドア',
    'スポーツ・運動',
    '学習・読書',
    'ソーシャル',
    'ライフスタイル',
    'その他'
  ];

  const emotions = [
    { value: 'happy', label: '楽しかった', icon: Smile, color: 'text-green-600' },
    { value: 'neutral', label: '普通', icon: Meh, color: 'text-yellow-600' },
    { value: 'sad', label: 'つらかった', icon: Frown, color: 'text-red-600' },
    { value: 'excited', label: 'わくわく', icon: Heart, color: 'text-pink-600' }
  ];

  const handleInputChange = (field, value) => {
    if (onClearError) onClearError();
    onJournalChange({
      ...journalEntry,
      [field]: value
    });
  };

  const handleSave = () => {
    if (!journalEntry.title?.trim()) {
      if (onClearError) onClearError();
      return;
    }
    
    if (!journalEntry.category) {
      if (onClearError) onClearError();
      return;
    }

    onSave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/60 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 ml-3">体験を記録</h1>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* タイトル入力 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              体験のタイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={journalEntry.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="どんな体験をしましたか？"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(journalEntry.title || '').length}/50文字
            </div>
          </div>

          {/* カテゴリー選択 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleInputChange('category', category)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    journalEntry.category === category
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 感情選択 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              今の気持ちは？
            </label>
            <div className="grid grid-cols-2 gap-3">
              {emotions.map((emotion) => {
                const IconComponent = emotion.icon;
                return (
                  <button
                    key={emotion.value}
                    onClick={() => handleInputChange('emotion', emotion.value)}
                    className={`p-3 rounded-lg transition-all flex items-center gap-2 ${
                      journalEntry.emotion === emotion.value
                        ? 'bg-purple-100 border-2 border-purple-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${emotion.color}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {emotion.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* メモ・詳細 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ・詳細（任意）
            </label>
            <textarea
              value={journalEntry.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="体験の詳細や感想を記録してみましょう..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(journalEntry.description || '').length}/200文字
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={!journalEntry.title?.trim() || !journalEntry.category}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                journalEntry.title?.trim() && journalEntry.category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              体験を保存
            </button>

            <button
              onClick={onBack}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              戻る
            </button>
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 記録のコツ</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 新しく発見したことや学んだことを書いてみましょう</li>
              <li>• 予想と違った部分があれば記録しておきましょう</li>
              <li>• 次回への改善点があれば忘れずにメモしましょう</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalScreen;