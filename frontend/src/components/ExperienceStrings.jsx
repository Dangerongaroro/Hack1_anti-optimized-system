// frontend/src/components/ExperienceStrings.jsx
import React, { useState, useEffect, useRef } from 'react';

const idToColor = (id) => {
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // 色相を0-359の範囲で均等に分布させる
  const hue = Math.abs(hash * 137.508) % 360; // ゴールデンアングルを利用して色相を分散
  const saturation = 70 + (Math.abs(hash) % 20); // 彩度を70-89の範囲で決定
  const lightness = 50 + (Math.abs(hash) % 10); // 明度を50-59の範囲で決定
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

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

  // アニメーション用のタイマー
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 美しい糸の描画
  useEffect(() => {
    console.log('🎨 All experiences with categories:', experiences.map(exp => ({ 
      title: exp.title, 
      category: exp.category,
      type: exp.type,
      id: exp.id
    })));
    
    const canvas = canvasRef.current;
    if (!canvas || experiences.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = Math.max(400, experiences.length * 100 + 100); // 縦方向のスペースを確保
    
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
      const y = 80 + index * 100 + Math.cos(animationFrame * 0.03 + index) * 3; // y座標を統一
      
      return { x, y, experience: exp, index };
    });

    // 美しい単一色の糸を描画（体験別の色とアニメーション）
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      // 完了したミッションの間にのみ糸を描画
      if (current.experience.completed && next.experience.completed) {
        // 各体験のIDに基づいた単一色を使用
        const currentColor = idToColor(current.experience.id);
        
        // 滑らかなベジェ曲線
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        
        const distance = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
        const controlOffset = Math.min(distance * 0.5, 100);
        
        // アニメーションパターン
        const animationOffset = current.experience.id * 0.3 + animationFrame * 0.01;
        
        const controlX1 = current.x + controlOffset * Math.cos(animationOffset);
        const controlY1 = current.y + controlOffset * 0.3;
        const controlX2 = next.x - controlOffset * Math.cos(animationOffset);
        const controlY2 = next.y - controlOffset * 0.3;
        
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, next.x, next.y);
        
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 3.5; // 完了した体験の糸は太く
        ctx.lineCap = 'round';
        
        // 体験に応じた影の色
        const shadowColor = `${currentColor}40`; // 40は透明度
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        
        // 影をリセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    }

    // 美しい体験ポイントを描画（色の調整）
    positions.forEach((pos, index) => {
      const { experience } = pos;
      const experienceColor = idToColor(experience.id);
      const pulseSize = 1 + Math.sin(animationFrame * 0.05 + index * 0.5) * 0.5;
      
      // 外側のソフトグロー
      const glowColor = `${experienceColor}26`; // 15% 透明度
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, 2 * Math.PI);
      ctx.fillStyle = glowColor;
      ctx.fill();
      
      // メインの円（単一色）
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 7 + pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = experienceColor;
      ctx.fill();
      
      // 外枠を追加（より鮮明に）
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 7 + pulseSize, 0, 2 * Math.PI);
      ctx.strokeStyle = experienceColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      
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
    // 逆順にループすることで、手前にある要素が優先的にクリックされるようにする
    for (let i = experiences.length - 1; i >= 0; i--) {
      const exp = experiences[i];
      const centerX = rect.width / 2;
      const angle = (i / experiences.length) * Math.PI * 2;
      const radius = Math.min(rect.width, rect.height) * 0.15;
      const spiralFactor = i * 20;

      const x = centerX + Math.cos(angle) * (radius + spiralFactor * 0.5);
      const y = 80 + i * 100; // y座標を統一

      const distance = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));

      // クリックが円の範囲内にあるか、または糸の近くにあるかを判定
      // 糸のクリック判定は、その糸が接続している円のクリックとして処理する
      if (distance < 15 && onExperienceClick) { // 15は円の半径の許容範囲
        onExperienceClick(exp);
        return; // クリック処理を終了
      }
    }
  };

  try {
    return (
      <div className="px-4" ref={containerRef}>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Experiences</h2>
        
        {/* 美しいキャンバス部分 */}
        <div className="relative mb-8 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-blue-50/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm border border-white/20">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-2xl"
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            style={{ 
              display: 'block', 
              cursor: 'pointer',
              width: '400px', 
              height: '400px', 
              backgroundColor: 'white' 
            }}
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
                    style={{ backgroundColor: idToColor(hoveredExperience.id) }}
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
            const experienceColor = idToColor(id);

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
                    style={{ backgroundColor: experienceColor }}
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
                          style={{ backgroundColor: experienceColor }}
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
