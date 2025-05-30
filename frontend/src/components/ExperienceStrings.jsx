// frontend/src/components/ExperienceStrings.jsx
import React, { useState, useEffect, useRef } from 'react';

const idToColor = (id) => {
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash * 137.508) % 360;
  const saturation = 70 + (Math.abs(hash) % 20);
  const lightness = 50 + (Math.abs(hash) % 10);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const ExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);

  console.log('ExperienceStrings rendering with:', experiences);
  
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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 芸術的な螺旋パスを生成
  const generateArtisticPaths = (width, height) => {
    const paths = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.25;
    
    // 完了した体験のみをフィルタリング
    const completedExperiences = experiences.filter(exp => exp.completed);
    
    completedExperiences.forEach((exp, index) => {
      const angle = (index / completedExperiences.length) * Math.PI * 2;
      const spiralFactor = index * 0.15;
      const radius = baseRadius * (1 + spiralFactor * 0.1);
      
      // 螺旋状の座標計算（アニメーション付き）
      const animOffset = animationFrame * 0.005;
      const x = centerX + Math.cos(angle + animOffset) * radius;
      const y = centerY + Math.sin(angle + animOffset) * radius - index * 15;
      
      paths.push({
        x, y,
        exp,
        color: idToColor(exp.id),
        angle,
        radius,
        index
      });
    });
    
    return paths;
  };

  // 美しい糸の描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || experiences.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = 500;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    
    // 背景のグラデーション
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, 'rgba(237, 233, 254, 0.3)');
    bgGradient.addColorStop(0.5, 'rgba(251, 207, 232, 0.2)');
    bgGradient.addColorStop(1, 'rgba(219, 234, 254, 0.3)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // パスを生成
    const paths = generateArtisticPaths(width, height);

    // 糸を描画（後ろから前へ）
    for (let i = 0; i < paths.length - 1; i++) {
      const current = paths[i];
      const next = paths[i + 1];
      
      // グラデーションの作成
      const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
      // 117行目付近の色生成コードを確認
      const baseHue = Math.abs(current.exp.id * 137.508) % 360;
      const hueStep = 10;
      const hue = (baseHue + i * hueStep) % 360;
      const color = `hsl(${hue}, 79%, 59%)`; // 'dd'が付加されないように修正
      
      // gradientの設定
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, `hsl(${hue}, 79%, 39%)`);
      
      // 複雑なベジェ曲線で糸を描画
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      
      // アニメーションによる曲線の変化
      const waveOffset = Math.sin(animationFrame * 0.01 + i * 0.5) * 30;
      const controlOffset = Math.cos(animationFrame * 0.008 + i * 0.3) * 40;
      
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      // 3次ベジェ曲線で滑らかな糸を表現
      ctx.bezierCurveTo(
        current.x + controlOffset, current.y + waveOffset,
        next.x - controlOffset, next.y - waveOffset,
        next.x, next.y
      );
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 + Math.sin(animationFrame * 0.02 + i) * 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 影効果
      ctx.shadowColor = current.color;
      ctx.shadowBlur = 10 + Math.sin(animationFrame * 0.03 + i) * 5;
      ctx.stroke();
      
      // 追加の光の筋
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // ノード（体験ポイント）を描画
    paths.forEach((path, index) => {
      const pulseSize = 1 + Math.sin(animationFrame * 0.05 + index * 0.5) * 0.3;
      const nodeSize = 8 + pulseSize * 2;
      
      // グロー効果の色を正しく設定
      const glowGradient = ctx.createRadialGradient(path.x, path.y, 0, path.x, path.y, nodeSize * 3);
      // HSL色をRGBA形式に変換するか、正しい形式で透明度を設定
      const pathColorRgba = convertHslToRgba(path.color, 0.27); // 44をアルファ値0.27に変換
      const pathColorRgba2 = convertHslToRgba(path.color, 0.13); // 22をアルファ値0.13に変換
      
      glowGradient.addColorStop(0, pathColorRgba);
      glowGradient.addColorStop(0.5, pathColorRgba2);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(path.x - nodeSize * 3, path.y - nodeSize * 3, nodeSize * 6, nodeSize * 6);
      
      // メインノード
      const nodeGradient = ctx.createRadialGradient(
        path.x - nodeSize / 3, path.y - nodeSize / 3, 0,
        path.x, path.y, nodeSize
      );
      nodeGradient.addColorStop(0, 'white');
      nodeGradient.addColorStop(0.5, path.color);
      // HSL色値の場合は透明度を正しく設定
      const colorWithAlpha = path.color.replace('hsl(', 'hsla(').replace(')', ', 0.87)');
      nodeGradient.addColorStop(1, colorWithAlpha);
      
      ctx.beginPath();
      ctx.arc(path.x, path.y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = nodeGradient;
      ctx.fill();
      
      // 輪郭
      ctx.strokeStyle = path.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 内側の光
      ctx.beginPath();
      ctx.arc(path.x - nodeSize / 3, path.y - nodeSize / 3, nodeSize / 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    });

  }, [experiences, animationFrame]);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const paths = generateArtisticPaths(rect.width, rect.height);
    
    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      const distance = Math.sqrt(Math.pow(clickX - path.x, 2) + Math.pow(clickY - path.y, 2));

      if (distance < 15 && onExperienceClick) {
        onExperienceClick(path.exp);
        return;
      }
    }
  };

  try {
    return (
      <div className="px-4" ref={containerRef}>
        
        {/* 美しいキャンバス部分 */}
        <div className="relative mb-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-2xl"
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            style={{ 
              display: 'block', 
              cursor: 'pointer',
              height: '500px'
            }}
          />
          
          {/* 統計オーバーレイ */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {experiences.length}
                </p>
                <p className="text-xs text-gray-600">体験数</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {new Set(experiences.map(e => e.category)).size}
                </p>
                <p className="text-xs text-gray-600">カテゴリ</p>
              </div>
            </div>
          </div>
          
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
                className="group relative bg-white/70 backdrop-blur-md rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/90 hover:shadow-md border border-white/30 w-full"
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

// HSL色をRGBA形式に変換するヘルパー関数を追加
const convertHslToRgba = (hslColor, alpha) => {
  // HSL文字列から数値を抽出
  const match = hslColor.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return `rgba(128, 128, 128, ${alpha})`; // フォールバック
  
  const [, h, s, l] = match;
  const hue = parseFloat(h) / 360;
  const saturation = parseFloat(s) / 100;
  const lightness = parseFloat(l) / 100;
  
  // HSLからRGBに変換
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
  const m = lightness - c / 2;
  
  let r, g, b;
  if (hue < 1/6) { r = c; g = x; b = 0; }
  else if (hue < 2/6) { r = x; g = c; b = 0; }
  else if (hue < 3/6) { r = 0; g = c; b = x; }
  else if (hue < 4/6) { r = 0; g = x; b = c; }
  else if (hue < 5/6) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);
  
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};