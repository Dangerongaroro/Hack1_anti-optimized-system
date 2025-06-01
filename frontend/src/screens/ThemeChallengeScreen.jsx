import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Trophy, Users, Timer } from 'lucide-react';

const ThemeChallengeScreen = ({ onBack, onJoinChallenge }) => {
  const [activeThemes, setActiveThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // サンプルテーマ
  const sampleThemes = [
    {
      id: 'local-first',
      title: '地元再発見ウィーク',
      description: '普段通り過ぎる地元の魅力を再発見しよう',
      duration: '7日間',
      participants: 234,
      difficulty: 2,
      rewards: ['地元探検家バッジ', '多様性スコア+10'],
      challenges: [
        '地元の歴史スポットを訪れる',
        '地元の老舗で食事',
        '地元の図書館で郷土資料を読む'
      ]
    },
    {
      id: 'creative-week',
      title: 'クリエイティブチャレンジ',
      description: '創造性を解放する1週間',
      duration: '7日間',
      participants: 189,
      difficulty: 3,
      rewards: ['アーティストバッジ', '創造性スコア+15'],
      challenges: [
        '絵を描いてみる',
        '楽器に触れる',
        '詩や短編を書く'
      ]
    },
    {
      id: 'mindful-days',
      title: 'マインドフル3Days',
      description: '心と向き合う3日間',
      duration: '3日間',
      participants: 456,
      difficulty: 1,
      rewards: ['内省バッジ', 'ウェルビーイングスコア+5'],
      challenges: [
        '瞑想を試す',
        'デジタルデトックス1時間',
        '感謝日記を書く'
      ]
    }
  ];

  useEffect(() => {
    // 実際にはAPIから取得
    setActiveThemes(sampleThemes);
  }, []);

  const joinTheme = (theme) => {
    onJoinChallenge(theme);
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
          <h1 className="text-xl font-bold text-gray-800 ml-3">テーマチャレンジ</h1>
        </div>

        {/* 説明 */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-800">期間限定チャレンジ</h3>
          </div>
          <p className="text-sm text-purple-700">
            みんなで同じテーマに挑戦！特別なバッジや報酬がもらえます
          </p>
        </div>

        {/* アクティブなテーマ一覧 */}
        <div className="space-y-4">
          {activeThemes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedTheme(theme)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800">{theme.title}</h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: theme.difficulty }, (_, i) => (
                    <div key={i} className="w-2 h-2 bg-purple-600 rounded-full" />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {theme.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {theme.participants}人参加中
                </div>
              </div>
              
              {/* 報酬プレビュー */}
              <div className="mt-3 flex gap-2">
                {theme.rewards.slice(0, 2).map((reward, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-xs"
                  >
                    {reward}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 詳細モーダル */}
        {selectedTheme && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedTheme.title}
              </h3>
              <p className="text-gray-600 mb-4">{selectedTheme.description}</p>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">チャレンジ内容</h4>
                <ul className="space-y-1">
                  {selectedTheme.challenges.map((challenge, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">獲得できる報酬</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTheme.rewards.map((reward, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm flex items-center gap-1"
                    >
                      <Trophy className="w-3 h-3" />
                      {reward}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => joinTheme(selectedTheme)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl"
                >
                  参加する
                </button>
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeChallengeScreen;