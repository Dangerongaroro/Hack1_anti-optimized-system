// frontend/src/components/ExperienceStrings.jsx
import React, { useState, useEffect, useRef } from 'react';

const ExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);

  console.log('ExperienceStrings rendering with:', experiences);
  
  // データの安全性チェック
  if (!experiences || !Array.isArray(experiences)) {
    return (
      <div className="px-4 py-8">
        <p className="text-gray-600 text-center">体験データを読み込み中...</p>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="px-4 py-8">
        <p className="text-gray-600 text-center">まだ体験がありません</p>
      </div>
    );
  }

  // カテゴリー別のカラーマッピング（RGBA形式で管理）
  const categoryColors = {
    'アート・創作': {
      primary: '#8B5CF6',
      rgba: { r: 139, g: 92, b: 246 },
      light: 'rgba(139, 92, 246, 0.1)',
      medium: 'rgba(139, 92, 246, 0.6)',
      dark: 'rgba(139, 92, 246, 0.8)'
    },
    '料理・グルメ': {
      primary: '#EF4444',
      rgba: { r: 239, g: 68, b: 68 },
      light: 'rgba(239, 68, 68, 0.1)',
      medium: 'rgba(239, 68, 68, 0.6)',
      dark: 'rgba(239, 68, 68, 0.8)'
    },
    '自然・アウトドア': {
      primary: '#10B981',
      rgba: { r: 16, g: 185, b: 129 },
      light: 'rgba(16, 185, 129, 0.1)',
      medium: 'rgba(16, 185, 129, 0.6)',
      dark: 'rgba(16, 185, 129, 0.8)'
    },
    'スポーツ・運動': {
      primary: '#F59E0B',
      rgba: { r: 245, g: 158, b: 11 },
      light: 'rgba(245, 158, 11, 0.1)',
      medium: 'rgba(245, 158, 11, 0.6)',
      dark: 'rgba(245, 158, 11, 0.8)'
    },
    '学習・読書': {
      primary: '#3B82F6',
      rgba: { r: 59, g: 130, b: 246 },
      light: 'rgba(59, 130, 246, 0.1)',
      medium: 'rgba(59, 130, 246, 0.6)',
      dark: 'rgba(59, 130, 246, 0.8)'
    },
    '音楽・エンタメ': {
      primary: '#EC4899',
      rgba: { r: 236, g: 72, b: 153 },
      light: 'rgba(236, 72, 153, 0.1)',
      medium: 'rgba(236, 72, 153, 0.6)',
      dark: 'rgba(236, 72, 153, 0.8)'
    },
    'ソーシャル': {
      primary: '#06B6D4',
      rgba: { r: 6, g: 182, b: 212 },
      light: 'rgba(6, 182, 212, 0.1)',
      medium: 'rgba(6, 182, 212, 0.6)',
      dark: 'rgba(6, 182, 212, 0.8)'
    },
    'ライフスタイル': {
      primary: '#84CC16',
      rgba: { r: 132, g: 204, b: 22 },
      light: 'rgba(132, 204, 22, 0.1)',
      medium: 'rgba(132, 204, 22, 0.6)',
      dark: 'rgba(132, 204, 22, 0.8)'
    },
    'その他': {
      primary: '#6B7280',
      rgba: { r: 107, g: 114, b: 128 },
      light: 'rgba(107, 114, 128, 0.1)',
      medium: 'rgba(107, 114, 128, 0.6)',
      dark: 'rgba(107, 114, 128, 0.8)'
    }
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors['その他'];
  };

  // アニメーション用のタイマー
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 美しい糸の描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || experiences.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = Math.max(400, experiences.length * 80 + 100);
    
    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);

    // 体験の位置を美しく配置
    const centerX = width / 2;
    const positions = experiences.map((exp, index) => {
      const angle = (index / experiences.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.15;
      const spiralFactor = index * 20;
      
      const x = centerX + Math.cos(angle) * (radius + spiralFactor * 0.5) + Math.sin(animationFrame * 0.02 + index) * 5;
      const y = 80 + index * 60 + Math.cos(animationFrame * 0.03 + index) * 3;
      
      return { x, y, experience: exp, index };
    });

    // 美しいグラデーション糸を描画
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      // グラデーションの作成
      const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
      const currentColorData = getCategoryColor(current.experience.category);
      const nextColorData = getCategoryColor(next.experience.category);
      
      gradient.addColorStop(0, currentColorData.medium);
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)'); // 中間は紫
      gradient.addColorStop(1, nextColorData.medium);
      
      // 滑らかなベジェ曲線
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      
      const distance = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
      const controlOffset = Math.min(distance * 0.5, 100);
      
      const controlX1 = current.x + controlOffset * Math.cos((current.index + animationFrame * 0.01) * 0.5);
      const controlY1 = current.y + controlOffset * 0.3;
      const controlX2 = next.x - controlOffset * Math.cos((next.index + animationFrame * 0.01) * 0.5);
      const controlY2 = next.y - controlOffset * 0.3;
      
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, next.x, next.y);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = currentColorData.light;
      ctx.shadowBlur = 10;
      ctx.stroke();
      
      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // 美しい体験ポイントを描画
    positions.forEach((pos, index) => {
      const { experience } = pos;
      const colorData = getCategoryColor(experience.category);
      const pulseSize = 2 + Math.sin(animationFrame * 0.05 + index * 0.5) * 1;
      
      // 外側のグロー
      const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
      glowGradient.addColorStop(0, colorData.medium);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // メインの円
      const mainGradient = ctx.createRadialGradient(pos.x - 2, pos.y - 2, 0, pos.x, pos.y, 10 + pulseSize);
      mainGradient.addColorStop(0, '#ffffff');
      mainGradient.addColorStop(0.3, colorData.primary);
      mainGradient.addColorStop(1, colorData.dark);
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8 + pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = mainGradient;
      ctx.fill();
      
      // 完了マーク
      if (experience.completed) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // チェックマーク
        ctx.beginPath();
        ctx.moveTo(pos.x - 2, pos.y);
        ctx.lineTo(pos.x - 1, pos.y + 1);
        ctx.lineTo(pos.x + 2, pos.y - 2);
        ctx.strokeStyle = colorData.primary;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      // レベル表示
      for (let i = 0; i < (experience.level || 1); i++) {
        ctx.beginPath();
        ctx.arc(pos.x - 15 + i * 4, pos.y + 15, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = colorData.primary;
        ctx.fill();
      }
    });

  }, [experiences, animationFrame]);

  // マウス移動ハンドラー
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // キャンバスクリックハンドラー
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // クリックされた体験を探す
    experiences.forEach((exp, index) => {
      const centerX = rect.width / 2;
      const angle = (index / experiences.length) * Math.PI * 2;
      const radius = Math.min(rect.width, rect.height) * 0.15;
      const spiralFactor = index * 20;
      
      const x = centerX + Math.cos(angle) * (radius + spiralFactor * 0.5);
      const y = 80 + index * 60;
      
      const distance = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
      
      if (distance < 15 && onExperienceClick) {
        onExperienceClick(exp);
      }
    });
  };

  try {
    return (
      <div className="px-4" ref={containerRef}>
        <h2 className="text-xl font-bold text-gray-800 mb-6">✨ あなたの体験の軌跡</h2>
        
        {/* 美しいキャンバス部分 */}
        <div className="relative mb-8 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-blue-50/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm border border-white/20">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-2xl"
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            style={{ display: 'block', cursor: 'pointer' }}
          />
          
          {/* ホバー時の詳細表示 */}
          {hoveredExperience && (
            <div 
              className="absolute bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl pointer-events-none z-10 border border-white/30"
              style={{
                left: Math.min(mousePos.x + 15, (containerRef.current?.offsetWidth || 400) - 200),
                top: mousePos.y - 10,
                transform: 'translateY(-100%)',
                maxWidth: '200px'
              }}
            >
              <h4 className="font-semibold text-gray-800 mb-1">{hoveredExperience.title}</h4>
              <p className="text-sm text-gray-600 mb-1">{hoveredExperience.category}</p>
              <p className="text-xs text-gray-500">
                {new Date(hoveredExperience.date).toLocaleDateString('ja-JP')}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: hoveredExperience.level || 1 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(hoveredExperience.category).primary }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 簡素化されたリスト表示 */}
        <div className="space-y-2">
          {experiences.map((experience, index) => {
            if (!experience) return null;

            const title = experience.title || '無題の体験';
            const category = experience.category || 'その他';
            const completed = Boolean(experience.completed);
            const id = experience.id || `exp_${index}`;
            const colorData = getCategoryColor(category);

            return (
              <div
                key={id}
                onClick={() => onExperienceClick?.(experience)}
                onMouseEnter={() => setHoveredExperience(experience)}
                onMouseLeave={() => setHoveredExperience(null)}
                className="group relative bg-white/70 backdrop-blur-md rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/90 hover:shadow-md border border-white/30"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorData.primary }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">{title}</h3>
                    <p className="text-sm text-gray-600">{category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {completed && (
                      <span className="text-green-500 text-sm">✓</span>
                    )}
                    <div className="flex gap-1">
                      {Array.from({ length: experience.level || 1 }, (_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: colorData.primary }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 統計サマリー */}
        <div className="mt-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 体験サマリー</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {experiences.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">総体験数</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {experiences.filter(e => e && e.completed).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">完了済み</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ExperienceStrings render error:', error);
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">表示エラー</p>
          <p className="text-red-600 text-sm mt-1">
            体験データの表示中にエラーが発生しました
          </p>
        </div>
      </div>
    );
  }
};

export default ExperienceStrings;