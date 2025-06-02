import React, { useState } from 'react';
import { ArrowLeft, Save, Heart, Smile, Meh, Frown, Zap, Star } from 'lucide-react';

const JournalEntryScreen = ({ onBack, onSave }) => {
  const [entry, setEntry] = useState({
    title: '',
    category: '',
    emotion: '',
    description: '',
    tags: [],
    template: null
  });

  const categories = [
    'アート・創作', '音楽・エンタメ', '料理・グルメ',
    '自然・アウトドア', 'スポーツ・運動', '学習・読書',
    'ソーシャル', 'ライフスタイル', 'その他'
  ];

  const emotions = [
    { value: 'happy', label: '楽しかった', icon: Smile, color: 'text-green-600' },
    { value: 'neutral', label: '普通', icon: Meh, color: 'text-yellow-600' },
    { value: 'sad', label: 'つらかった', icon: Frown, color: 'text-red-600' },
    { value: 'excited', label: 'わくわく', icon: Heart, color: 'text-pink-600' },
    { value: 'surprised', label: '驚いた', icon: Zap, color: 'text-purple-600' },
    { value: 'proud', label: '誇らしい', icon: Star, color: 'text-blue-600' }
  ];

  const emotionTags = [
    '新鮮だった', '挑戦的だった', '心地よかった', '刺激的だった',
    '平和だった', '感動した', '学びがあった', '成長を感じた'
  ];

  const templates = [
    {
      id: 'discovery',
      title: '今日の小さな発見',
      prompts: ['何を発見しましたか？', 'どんな気持ちになりましたか？']
    },
    {
      id: 'challenge',
      title: '挑戦したこと',
      prompts: ['どんな挑戦でしたか？', '結果はどうでしたか？']
    },
    {
      id: 'emotion',
      title: '心が動いた瞬間',
      prompts: ['何に心を動かされましたか？', 'なぜそう感じたと思いますか？']
    }
  ];

  const handleTemplateSelect = (template) => {
    setEntry({
      ...entry,
      template: template.id,
      title: template.title,
      description: template.prompts.join('\n\n')
    });
  };

  const handleTagToggle = (tag) => {
    setEntry({
      ...entry,
      tags: entry.tags.includes(tag)
        ? entry.tags.filter(t => t !== tag)
        : [...entry.tags, tag]
    });
  };

  const handleSave = () => {
    if (entry.title && entry.category) {
      onSave({
        ...entry,
        date: new Date(),
        type: 'journal',
        completed: true,
        level: 2
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
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

        {/* テンプレート選択 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            テンプレート（任意）
          </label>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  entry.template === template.id
                    ? 'bg-purple-100 border-2 border-purple-300'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-800">{template.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {template.prompts[0]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* タイトル入力 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            体験のタイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={entry.title}
            onChange={(e) => setEntry({ ...entry, title: e.target.value })}
            placeholder="どんな体験をしましたか？"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={50}
          />
        </div>

        {/* カテゴリー選択 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            カテゴリー <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setEntry({ ...entry, category })}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  entry.category === category
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
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            今の気持ちは？
          </label>
          <div className="grid grid-cols-3 gap-2">
            {emotions.map((emotion) => {
              const IconComponent = emotion.icon;
              return (
                <button
                  key={emotion.value}
                  onClick={() => setEntry({ ...entry, emotion: emotion.value })}
                  className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                    entry.emotion === emotion.value
                      ? 'bg-purple-100 border-2 border-purple-300'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${emotion.color}`} />
                  <span className="text-xs font-medium text-gray-700">
                    {emotion.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 感情タグ */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            感情タグ（複数選択可）
          </label>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  entry.tags.includes(tag)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 詳細記入 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            詳細（任意）
          </label>
          <textarea
            value={entry.description}
            onChange={(e) => setEntry({ ...entry, description: e.target.value })}
            placeholder="体験の詳細や感想を記録してみましょう..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={5}
            maxLength={300}
          />
          <div className="text-xs text-gray-500 mt-1">
            {entry.description.length}/300文字
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={!entry.title || !entry.category}
            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              entry.title && entry.category
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
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
      </div>
    </div>
  );
};

export default JournalEntryScreen;