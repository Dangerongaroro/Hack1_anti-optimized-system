import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, Sparkles, CheckCircle2, Star, Plus, Edit3, Info } from 'lucide-react';
import OptimizedExperienceStrings from '../components/ExperienceStrings/OptimizedExperienceStrings';

const HomeScreen = ({ experiences, userStats, onNavigateToRecommendation, onExperienceClick, onClearMission, onNavigateToJournalEntry }) => {
  const safeExperiences = Array.isArray(experiences) ? experiences : [];
  
  // デバッグ用にコンソールログを追加
  console.log('HomeScreen userStats:', userStats);
  console.log('HomeScreen experiences:', experiences);
  
  // より強固なuserStatsのフォールバック
  const safeUserStats = {
    totalExperiences: safeExperiences.length,
    currentStreak: userStats?.currentStreak || 0,
    diversityScore: userStats?.diversityScore || 0,
    badges: Array.isArray(userStats?.badges) ? userStats.badges : [],
    ...userStats
  };

  // 実際の体験数を計算
  const actualTotalExperiences = safeExperiences.length;
  const actualCompletedExperiences = safeExperiences.filter(e => e && e.completed).length;
  const actualCurrentStreak = safeUserStats.currentStreak;
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 w-full mx-auto overflow-hidden"> {/* overflow-x-hidden を overflow-hidden に変更 */}
      <div className="relative">
        {/* ヘッダー部分 - 強制表示版 */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Seren Paths
              </h1>
              <p className="text-gray-600 text-sm font-bold">新しい自分を発見する旅</p>
            </div>
            {/* 右上の達成度表示 - 確実に表示 */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
                <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{actualTotalExperiences}体験</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow border border-pink-100">
                <Calendar className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{actualCurrentStreak}日</span>
              </div>
            </div>
          </div>
        </div>

        {/* 体験表示部分 */}
        <div className="pt-24 lg:pt-28 pb-8">
          <OptimizedExperienceStrings 
            experiences={safeExperiences} 
            onExperienceClick={onExperienceClick} 
          />
          {/* canvas直下に説明パネルを配置 */}
          <div className="mt-8 mb-4 max-w-3xl mx-auto">
            <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg md:text-xl font-semibold text-blue-900 mr-2">
                  体験の糸について
                </h3>
                <button
                  onClick={() => setShowInfoPanel((prev) => !prev)}
                  className="p-1 rounded-full bg-transparent hover:bg-blue-100 transition-colors"
                  aria-label="体験の糸についての情報"
                >
                  <Info className="w-5 h-5 text-blue-700" />
                </button>
              </div>
            </div>
            {/* 展開式説明文 */}
            {showInfoPanel && (
              <div className="mt-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/30 text-blue-800 text-sm md:text-base text-center md:text-left">
                完了した体験は美しい球体として表示され、それらを繋ぐ糸が成長の軌跡を表現します。
                各体験には固有の色があり、カテゴリーやテーマによって美しいグラデーションを作り出します。
                ホバーやクリックで詳細な情報を確認できます。
              </div>
            )}
          </div>
        </div>

        {/* 統計表示 - 改良版 */}
        <div className="pb-6 px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 text-center hover:bg-white/90 transition-colors border border-purple-100">
              <p className="text-2xl font-bold text-purple-600">{actualTotalExperiences}</p>
              <p className="text-sm text-gray-600 font-medium">総体験数</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 text-center hover:bg-white/90 transition-colors border border-pink-100">
              <p className="text-2xl font-bold text-pink-600">{safeUserStats.badges.length}</p>
              <p className="text-sm text-gray-600 font-medium">獲得バッジ</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 text-center hover:bg-white/90 transition-colors border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{actualCompletedExperiences}</p>
              <p className="text-sm text-gray-600 font-medium">完了済み</p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="pb-24 w-full mx-auto px-4">
          <button
            onClick={onNavigateToRecommendation}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl py-4 lg:py-5 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-base lg:text-lg"
          >
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
            新しいお題を見つける
          </button>
        </div>

        {/* 進行中ミッション一覧 */}
        <div className="mt-6 px-4 pb-32">
          <h2 className="text-lg font-bold mb-4 text-gray-800">進行中ミッション</h2>
          <div className="space-y-3">
            {safeExperiences.filter(exp => !exp.completed).map(exp => (
              <div key={exp.id} className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    onClick={() => onExperienceClick(exp)} 
                    className="cursor-pointer text-center w-full"
                  >
                    <div className="font-semibold text-gray-800 mb-1">{exp.title}</div>
                    <div className="text-sm text-gray-600">{exp.category} / レベル{exp.level}</div>
                  </div>
                  
                  {/* おしゃれな達成ボタン - 中央配置 */}
                  <button
                    onClick={() => onClearMission(exp.id)}
                    className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {/* 背景の光る効果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                    
                    {/* アイコンとテキスト */}
                    <div className="relative z-10 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-sm font-semibold">達成！</span>
                      <Star className="w-3 h-3 group-hover:scale-125 transition-transform duration-300" />
                    </div>
                    
                    {/* ボタン押下時の波紋効果 */}
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-150 pointer-events-none"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* ミッションが無い場合 */}
          {safeExperiences.filter(exp => !exp.completed).length === 0 && (
            <div className="bg-white/60 backdrop-blur rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">すべてのミッション完了！</h3>
              <p className="text-gray-600 mb-4">素晴らしい成果です。新しいお題を探してみましょう。</p>
            </div>
          )}
        </div>

        {/* フローティングアクションボタンエリア */}
        <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3">
          {/* 体験記録ボタン */}
          <button
            onClick={onNavigateToJournalEntry}
            className="group bg-white/20 backdrop-blur-lg border border-white/30 text-blue-700 px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            {/* 背景の光る効果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* アイコンとテキスト */}
            <Edit3 className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10 font-medium text-sm whitespace-nowrap">体験記録</span>
            
            {/* 波紋効果 */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-full transition-transform duration-150"></div>
          </button>

          {/* 新しいお題ボタン */}
          <button
            onClick={onNavigateToRecommendation}
            className="group bg-white/20 backdrop-blur-lg border border-white/30 text-purple-700 px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            {/* 背景の光る効果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* アイコンとテキスト */}
            <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10 font-medium text-sm whitespace-nowrap">新しいお題</span>
            
            {/* 波紋効果 */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-full transition-transform duration-150"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
