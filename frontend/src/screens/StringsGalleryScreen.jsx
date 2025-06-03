import React, { useState } from 'react';
import { ArrowLeft, Calendar, Download, Play, Pause } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';

const StringsGalleryScreen = ({ experiences, onBack, setCurrentScreen }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  // 期間でフィルタリング
  const filterExperiencesByPeriod = () => {
    const now = new Date();
    let filtered = [...experiences];
    
    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = experiences.filter(exp => new Date(exp.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = experiences.filter(exp => new Date(exp.date) >= monthAgo);
        break;
      case '3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filtered = experiences.filter(exp => new Date(exp.date) >= threeMonthsAgo);
        break;
    }
    
    return filtered;
  };

  // 成長過程を再生
  const playGrowthAnimation = () => {
    setIsPlaying(true);
    setPlaybackPosition(0);
    
    const interval = setInterval(() => {
      setPlaybackPosition(prev => {
        if (prev >= experiences.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return experiences.length - 1;
        }
        return prev + 1;
      });
    }, 500);
  };

  // カテゴリー別統計
  const getCategoryStats = () => {
    const stats = {};
    experiences.forEach(exp => {
      stats[exp.category] = (stats[exp.category] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  // ギャラリー画像として保存
  const saveAsImage = () => {
    // Canvas APIを使用して画像を生成・ダウンロード
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#f3e9ff');
    gradient.addColorStop(1, '#fce7f3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // タイトル
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#7c3aed';
    ctx.textAlign = 'center';
    ctx.fillText('My Experience Strings', 400, 50);
    
    // 統計情報
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${experiences.length} experiences`, 400, 90);
    ctx.fillText(new Date().toLocaleDateString('ja-JP'), 400, 115);
    
    // ダウンロード
    const link = document.createElement('a');
    link.download = `experience-strings-${new Date().toISOString().split('T')[0]}.png`;
    canvas.toBlob(blob => {
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 ml-3">ストリングス・ギャラリー</h1>
        </div>

        {/* 期間選択 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">表示期間</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'week', label: '1週間' },
              { value: 'month', label: '1ヶ月' },
              { value: '3months', label: '3ヶ月' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* 成長アニメーション */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">成長の軌跡</h3>
            <div className="flex gap-2">
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : playGrowthAnimation}
                className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={saveAsImage}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(playbackPosition / Math.max(experiences.length - 1, 1)) * 100}%` }}
            />
          </div>
          
          {/* ミニビジュアライゼーション */}
          <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600">
                {isPlaying ? `${playbackPosition + 1} / ${experiences.length}` : 'プレイボタンで再生'}
              </p>
            </div>
          </div>
        </div>

        {/* カテゴリー統計 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">カテゴリー分布</h3>
          <div className="space-y-3">
            {getCategoryStats().map(([category, count]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-32">{category}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                    style={{ width: `${(count / experiences.length) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 font-medium">
                    {count}件
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 特別な瞬間 */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">特別な瞬間</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium mb-1">最初の体験</p>
              <p className="text-sm text-gray-700">
                {experiences[0]?.title || 'まだありません'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {experiences[0] && new Date(experiences[0].date).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-pink-600 font-medium mb-1">最新の体験</p>
              <p className="text-sm text-gray-700">
                {experiences[experiences.length - 1]?.title || 'まだありません'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {experiences[experiences.length - 1] && 
                  new Date(experiences[experiences.length - 1].date).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <NavigationBar 
        currentScreen="gallery" 
        setCurrentScreen={setCurrentScreen} 
        onNavigateToRecommendation={() => setCurrentScreen('recommendation')} // 必要に応じて追加
      />
    </div>
  );
};

export default StringsGalleryScreen;
