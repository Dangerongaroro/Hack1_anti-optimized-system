import React, { useState } from 'react';
import OptimizedExperienceStrings from './OptimizedExperienceStrings';

/**
 * 最適化されたExperienceStringsのデモ/テストコンポーネント
 */
const OptimizedExperienceStringsDemo = () => {
  const [selectedExperience, setSelectedExperience] = useState(null);

  // テスト用のサンプルデータ
  const sampleExperiences = [
    {
      id: 1,
      title: "React基礎学習",
      description: "Reactの基本概念を理解し、コンポーネント作成を習得",
      category: "プログラミング",
      level: 2,
      completed: true
    },
    {
      id: 2,
      title: "Three.js 3D可視化",
      description: "WebGLを使った3D可視化とインタラクション",
      category: "プログラミング",
      level: 3,
      completed: true
    },
    {
      id: 3,
      title: "UI/UXデザイン原則",
      description: "ユーザビリティ向上のための設計原則",
      category: "デザイン",
      level: 2,
      completed: true
    },
    {
      id: 4,
      title: "パフォーマンス最適化",
      description: "フロントエンドアプリケーションの高速化技術",
      category: "プログラミング",
      level: 4,
      completed: false
    },
    {
      id: 5,
      title: "アクセシビリティ対応",
      description: "すべてのユーザーに使いやすいWebサイト作成",
      category: "デザイン",
      level: 3,
      completed: false
    },
    {
      id: 6,
      title: "TypeScript導入",
      description: "型安全性を向上させるTypeScript活用",
      category: "プログラミング",
      level: 3,
      completed: true
    },
    {
      id: 7,
      title: "モバイル対応デザイン",
      description: "レスポンシブデザインとモバイルファースト",
      category: "デザイン",
      level: 2,
      completed: false
    },
    {
      id: 8,
      title: "セキュリティ基礎",
      description: "Webアプリケーションの脆弱性対策",
      category: "セキュリティ",
      level: 4,
      completed: true
    }
  ];

  const handleExperienceClick = (experience) => {
    setSelectedExperience(experience);
    console.log('体験が選択されました:', experience);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-4">
            🚀 最適化された体験の糸 デモ
          </h1>
          <p className="text-lg text-purple-700 mb-2">
            パフォーマンス向上とリソース効率化を実現した新バージョン
          </p>
          <div className="text-sm text-gray-600 bg-white/70 rounded-lg p-3 inline-block">
            <strong>改善点:</strong> シード値による一貫した配置、リソースプーリング、フレームレート制御、位置固定化によるホバー安定性向上
          </div>
        </div>

        {/* 最適化されたコンポーネント */}
        <OptimizedExperienceStrings
          experiences={sampleExperiences}
          onExperienceClick={handleExperienceClick}
        />

        {/* 選択された体験の詳細表示 */}
        {selectedExperience && (
          <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">
              選択された体験: {selectedExperience.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>説明:</strong> {selectedExperience.description}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>カテゴリ:</strong> {selectedExperience.category}
                </p>
                <p className="text-gray-700">
                  <strong>レベル:</strong> {selectedExperience.level}
                </p>
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>状態:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    selectedExperience.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedExperience.completed ? '完了済み' : '進行中'}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* パフォーマンス情報 */}
        <div className="mt-8 bg-gradient-to-r from-green-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/30">
          <h3 className="text-lg font-semibold text-green-900 mb-4">🔧 最適化の詳細</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 rounded-lg p-3">
              <h4 className="font-semibold text-green-800 mb-2">🎯 位置固定化</h4>
              <p className="text-green-700">シード値による一貫した配置でホバー検出を安定化</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800 mb-2">♻️ リソースプール</h4>
              <p className="text-blue-700">ジオメトリとマテリアルの再利用で大幅な最適化</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <h4 className="font-semibold text-purple-800 mb-2">⚡ フレーム制御</h4>
              <p className="text-purple-700">60FPS制限とアニメーション最適化</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedExperienceStringsDemo;
