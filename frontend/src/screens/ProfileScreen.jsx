import React, { useState, useEffect } from 'react';
import { ChevronRight, Bell, Shield, Settings, Download, Award, TrendingUp, Target } from 'lucide-react';
import api from '../services/api';

const ProfileScreen = ({ userStats, onResetOnboarding, experiences = [] }) => {
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showGrowthAnalysis, setShowGrowthAnalysis] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareData: false,
    analytics: true,
    personalizedAds: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    dailyChallenge: true,
    achievements: true,
    weeklyReport: false
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(api.getAutoSaveEnabled());

  // 成長分析を計算
  const calculateGrowthMetrics = () => {
    if (!experiences || experiences.length === 0) return null;
    
    const categoryCounts = {};
    experiences.forEach(exp => {
      categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
    });
    
    const totalCategories = Object.keys(categoryCounts).length;
    const averagePerCategory = experiences.length / Math.max(totalCategories, 1);
    const growthStage = 
      experiences.length < 10 ? '探索期' :
      experiences.length < 30 ? '拡大期' :
      experiences.length < 50 ? '深化期' : '統合期';
    
    return {
      totalCategories,
      averagePerCategory: averagePerCategory.toFixed(1),
      growthStage,
      favoriteCategory: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'なし'
    };
  };

  const growthMetrics = calculateGrowthMetrics();

  // 探求者バッジの定義
  const achievementBadges = [
    { name: '初心者探求者', icon: '🌱', condition: experiences.length >= 5, description: '5つの体験を完了' },
    { name: '体験コレクター', icon: '📦', condition: experiences.length >= 15, description: '15の体験を記録' },
    { name: '多様性マスター', icon: '🌈', condition: userStats.diversityScore >= 70, description: '多様性スコア70%以上' },
    { name: '週末冒険家', icon: '🚀', condition: experiences.filter(e => e.level === 2).length >= 5, description: 'レベル2を5回達成' },
    { name: 'アドベンチャラー', icon: '⭐', condition: experiences.filter(e => e.level === 3).length >= 3, description: 'レベル3を3回達成' },
    { name: '継続の達人', icon: '🔥', condition: userStats.currentStreak >= 7, description: '7日連続で体験' }
  ];

  const earnedBadges = achievementBadges.filter(badge => badge.condition);

  const handleExportData = () => {
    const data = {
      experiences: JSON.parse(localStorage.getItem('experiences') || '[]'),
      preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
      stats: userStats,
      growthAnalysis: growthMetrics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seren-paths-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetOnboarding = () => {
    if (confirm('初回アンケートをやり直しますか？現在の設定は失われます。')) {
      if (onResetOnboarding) {
        onResetOnboarding();
      }
    }
  };

  const handlePrivacyToggle = (key) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
    localStorage.setItem('privacySettings', JSON.stringify({ ...privacySettings, [key]: !privacySettings[key] }));
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
    localStorage.setItem('notificationSettings', JSON.stringify({ ...notificationSettings, [key]: !notificationSettings[key] }));
  };

  const handleAutoSaveToggle = (enabled) => {
    setAutoSaveEnabled(enabled);
    api.setAutoSaveEnabled(enabled);
  };

  const handleManualSync = async () => {
    try {
      const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
      await api.updatePreferences(experiences);
      alert('データ同期が完了しました');
    } catch (error) {
      alert('同期に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">プロフィール</h2>
      </div>

      <div className="bg-white/60 backdrop-blur rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            A
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">冒険者A</h3>
            <p className="text-gray-600">
              {growthMetrics ? `${growthMetrics.growthStage}の探求者` : '探求を始めて間もない'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{userStats.totalExperiences}</p>
            <p className="text-xs text-gray-600">体験数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">{userStats.diversityScore}%</p>
            <p className="text-xs text-gray-600">多様性スコア</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{userStats.currentStreak}</p>
            <p className="text-xs text-gray-600">連続日数</p>
          </div>
        </div>

        {/* 探求者バッジセクション */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">探求者バッジ</h4>
          <div className="grid grid-cols-2 gap-3">
            {achievementBadges.map((badge, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border-2 transition-all ${
                  badge.condition
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{badge.icon}</span>
                  <span className={`text-sm font-medium ${
                    badge.condition ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 成長分析セクション */}
      <div className="bg-white/60 backdrop-blur rounded-2xl overflow-hidden mb-4">
        <button
            onClick={() => setShowGrowthAnalysis(!showGrowthAnalysis)}
            className="w-full p-4 flex items-center justify-between bg-white/60 transition-colors"
          >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">成長分析</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showGrowthAnalysis ? 'rotate-90' : ''}`} />
        </button>
        
        {showGrowthAnalysis && growthMetrics && (
          <div className="border-t border-gray-200/50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">成長ステージ</span>
              <span className="text-sm font-medium text-purple-600">{growthMetrics.totalCategories}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">カテゴリー平均体験数</span>
              <span className="text-sm font-medium text-purple-600">{growthMetrics.averagePerCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">最も探索したカテゴリー</span>
              <span className="text-sm font-medium text-purple-600">{growthMetrics.favoriteCategory}</span>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700">
                💡 {growthMetrics.growthStage === '探索期' && '様々な体験を試して、自分の興味を見つけましょう！'}
                {growthMetrics.growthStage === '拡大期' && '順調に成長しています！新しいカテゴリーにも挑戦してみましょう。'}
                {growthMetrics.growthStage === '深化期' && '豊富な体験を積んでいます。より深い挑戦に取り組んでみては？'}
                {growthMetrics.growthStage === '統合期' && '素晴らしい成長です！これまでの体験を振り返り、新たな目標を設定しましょう。'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* 通知設定 */}
        <div className="bg-white/60 backdrop-blur rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className="w-full p-4 flex items-center justify-between bg-white/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">通知設定</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showNotificationSettings ? 'rotate-90' : ''}`} />
          </button>
          
          {showNotificationSettings && (
            <div className="border-t border-gray-200/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">毎日のチャレンジ通知</span>
                <button
                  onClick={() => handleNotificationToggle('dailyChallenge')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notificationSettings.dailyChallenge ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.dailyChallenge ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">アチーブメント獲得通知</span>
                <button
                  onClick={() => handleNotificationToggle('achievements')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notificationSettings.achievements ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.achievements ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">週間レポート</span>
                <button
                  onClick={() => handleNotificationToggle('weeklyReport')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notificationSettings.weeklyReport ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.weeklyReport ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* プライバシー設定 */}
        <div className="bg-white/60 backdrop-blur rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
            className="w-full p-4 flex items-center justify-between bg-white/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">プライバシー設定</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showPrivacySettings ? 'rotate-90' : ''}`} />
          </button>
          
          {showPrivacySettings && (
            <div className="border-t border-gray-200/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">データの共有</span>
                <button
                  onClick={() => handlePrivacyToggle('shareData')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    privacySettings.shareData ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    privacySettings.shareData ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">利用状況の分析</span>
                <button
                  onClick={() => handlePrivacyToggle('analytics')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    privacySettings.analytics ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    privacySettings.analytics ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">パーソナライズド広告</span>
                <button
                  onClick={() => handlePrivacyToggle('personalizedAds')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    privacySettings.personalizedAds ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    privacySettings.personalizedAds ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* データ管理セクション */}
        <div className="bg-white/60 backdrop-blur rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 mb-2">データ管理</h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">自動データ保存</span>
            <button
              onClick={() => handleAutoSaveToggle(!autoSaveEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                autoSaveEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          {!autoSaveEnabled && (
            <button
              onClick={handleManualSync}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              データを手動同期
            </button>
          )}
        </div>

        {/* 初回アンケートを再設定 */}
        <button
          onClick={handleResetOnboarding}
          className="w-full bg-white/60 backdrop-blur rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">初回アンケートを再設定</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* データエクスポート */}
        <button
          onClick={handleExportData}
          className="w-full p-4 flex items-center justify-between bg-white/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">データをエクスポート</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
