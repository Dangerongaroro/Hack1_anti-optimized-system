// frontend/src/screens/ProfileScreen.jsx
import React, { useState } from 'react';
import { ChevronRight, Bell, Shield, Settings, Download } from 'lucide-react';
import api from '../services/api';

const ProfileScreen = ({ userStats, onResetOnboarding }) => {
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
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

  const handleExportData = () => {
    const data = {
      experiences: JSON.parse(localStorage.getItem('experiences') || '[]'),
      preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
      stats: userStats,
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
      localStorage.removeItem('userPreferences');
      if (onResetOnboarding) {
        onResetOnboarding();
      }
    }
  };

  const handlePrivacyToggle = (key) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
    // ここで実際の設定保存処理を行う
    localStorage.setItem('privacySettings', JSON.stringify({ ...privacySettings, [key]: !privacySettings[key] }));
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
    // ここで実際の設定保存処理を行う
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
            <p className="text-gray-600">探求を始めて30日</p>
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

        <div>
          <h4 className="font-medium text-gray-800 mb-3">獲得バッジ</h4>
          <div className="flex flex-wrap gap-2">
            {userStats.badges.map((badge, index) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* 通知設定 */}
        <div className="bg-white/60 backdrop-blur rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/80 transition-colors"
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
            className="w-full p-4 flex items-center justify-between hover:bg-white/80 transition-colors"
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

        {/* 設定セクションを追加 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">設定</h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">自動データ保存</span>
            <button
              onClick={() => handleAutoSaveToggle(!autoSaveEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {!autoSaveEnabled && (
            <button
              onClick={handleManualSync}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
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
          className="w-full bg-white/60 backdrop-blur rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-colors"
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