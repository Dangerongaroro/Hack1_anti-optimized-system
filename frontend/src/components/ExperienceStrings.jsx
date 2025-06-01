// 完全に書き直したExperienceStrings.jsx
import React, { useState, useEffect, useRef } from 'react';

const idToColor = (id) => {
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // 数値を正規化して小数点以下を制限
  const hue = Math.round(Math.abs(hash * 137.508) % 360);
  const saturation = Math.round(70 + (Math.abs(hash) % 20));
  const lightness = Math.round(50 + (Math.abs(hash) % 10));
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const ExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);
  const [floatingMissions, setFloatingMissions] = useState([]);

  // アニメーションループ
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 未完了ミッションの抽出と浮遊設定
  useEffect(() => {
    const incompleteMissions = experiences.filter(exp => !exp.completed).map((exp, index) => ({
      ...exp,
      floatX: Math.random() * 100 - 50,
      floatY: Math.random() * 100 - 50,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03
    }));
    setFloatingMissions(incompleteMissions);
  }, [experiences]);

  // 芸術的な螺旋パスを生成
  const generateArtisticPaths = (width, height) => {
    const paths = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.25;
    
    const completedExperiences = experiences.filter(exp => exp.completed);
    
    completedExperiences.forEach((exp, index) => {
      const angle = (index / completedExperiences.length) * Math.PI * 2;
      const spiralFactor = index * 0.15;
      const radius = baseRadius * (1 + spiralFactor * 0.1);
      
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

    // 糸を描画
    for (let i = 0; i < paths.length - 1; i++) {
      const current = paths[i];
      const next = paths[i + 1];
      
      const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
      gradient.addColorStop(0, current.color);
      gradient.addColorStop(1, next.color);
      
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      
      const waveOffset = Math.sin(animationFrame * 0.01 + i * 0.5) * 30;
      const controlOffset = Math.cos(animationFrame * 0.008 + i * 0.3) * 40;
      
      ctx.bezierCurveTo(
        current.x + controlOffset, current.y + waveOffset,
        next.x - controlOffset, next.y - waveOffset,
        next.x, next.y
      );
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 + Math.sin(animationFrame * 0.02 + i) * 1;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // 光の筋
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 完了済みノードを描画
    paths.forEach((path, index) => {
      const pulseSize = 1 + Math.sin(animationFrame * 0.05 + index * 0.5) * 0.3;
      const nodeSize = 8 + pulseSize * 2;
      
      // グロー効果 - 色値を正しい形式に修正
      const baseColor = path.color;
      const glowGradient = ctx.createRadialGradient(path.x, path.y, 0, path.x, path.y, nodeSize * 3);
      
      // HSL色からHSLAに変換して透明度を追加
      const colorWithAlpha = baseColor.replace('hsl(', 'hsla(').replace(')', ', 0.27)');
      const colorWithLightAlpha = baseColor.replace('hsl(', 'hsla(').replace(')', ', 0.13)');
      
      glowGradient.addColorStop(0, colorWithAlpha);
      glowGradient.addColorStop(0.5, colorWithLightAlpha);
      glowGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(path.x - nodeSize * 3, path.y - nodeSize * 3, nodeSize * 6, nodeSize * 6);
      
      // メインノード
      ctx.beginPath();
      ctx.arc(path.x, path.y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = path.color;
      ctx.fill();
      
      // 白い境界線
      ctx.beginPath();
      ctx.arc(path.x, path.y, nodeSize, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 浮遊する未完了ミッションを描画
    const centerX = width / 2;
    const centerY = height / 2;
    
    floatingMissions.forEach((mission, index) => {
      const time = animationFrame * mission.speed;
      const floatRadius = 150 + Math.sin(time + mission.phase) * 30;
      const angle = time + mission.phase;
      
      const x = centerX + Math.cos(angle) * floatRadius + mission.floatX;
      const y = centerY + Math.sin(angle) * floatRadius + mission.floatY;
      
      // 接続線（薄い）
      if (paths.length > 0) {
        const nearestPath = paths[paths.length - 1];
        ctx.beginPath();
        ctx.moveTo(nearestPath.x, nearestPath.y);
        ctx.lineTo(x, y);
        
        const baseColor = mission.color || idToColor(mission.id);
        const lineColorWithAlpha = baseColor.replace('hsl(', 'hsla(').replace(')', ', 0.2)');
        ctx.strokeStyle = lineColorWithAlpha;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // 浮遊する丸
      const missionSize = 12 + Math.sin(time * 2) * 2;
      
      // 外側のリング（パルス効果）
      ctx.beginPath();
      ctx.arc(x, y, missionSize + 5 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
      
      const baseColor = idToColor(mission.id);
      const ringColorWithAlpha = baseColor.replace('hsl(', 'hsla(').replace(')', ', 0.4)');
      ctx.strokeStyle = ringColorWithAlpha;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // メインの丸
      const missionGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, missionSize);
      missionGradient.addColorStop(0, 'white');
      missionGradient.addColorStop(0.5, baseColor);
      
      const centerColorWithAlpha = baseColor.replace('hsl(', 'hsla(').replace(')', ', 0.87)');
      missionGradient.addColorStop(1, centerColorWithAlpha);
      
      ctx.beginPath();
      ctx.arc(x, y, missionSize, 0, Math.PI * 2);
      ctx.fillStyle = missionGradient;
      ctx.fill();
      
      // レベル表示
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mission.level || '?', x, y);
    });

  }, [experiences, animationFrame, floatingMissions]);

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

    // 完了済み体験のクリック判定
    const paths = generateArtisticPaths(rect.width, rect.height);
    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      const distance = Math.sqrt(Math.pow(clickX - path.x, 2) + Math.pow(clickY - path.y, 2));
      if (distance < 15 && onExperienceClick) {
        onExperienceClick(path.exp);
        return;
      }
    }

    // 浮遊ミッションのクリック判定
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    floatingMissions.forEach((mission) => {
      const time = animationFrame * mission.speed;
      const floatRadius = 150 + Math.sin(time + mission.phase) * 30;
      const angle = time + mission.phase;
      
      const x = centerX + Math.cos(angle) * floatRadius + mission.floatX;
      const y = centerY + Math.sin(angle) * floatRadius + mission.floatY;
      
      const distance = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
      if (distance < 20 && onExperienceClick) {
        onExperienceClick(mission);
      }
    });
  };

  return (
    <div className="px-4" ref={containerRef}>
      <div className="relative mb-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px] rounded-2xl cursor-pointer"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          style={{ display: 'block' }}
        />
        
        {/* 統計オーバーレイ */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {experiences.filter(e => e.completed).length}
              </p>
              <p className="text-xs text-gray-600">完了</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {experiences.filter(e => !e.completed).length}
              </p>
              <p className="text-xs text-gray-600">進行中</p>
            </div>
          </div>
        </div>
        
        {hoveredExperience && (
          <div 
            className="absolute bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl pointer-events-none z-10"
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
            {!hoveredExperience.completed && (
              <p className="text-xs text-yellow-600 mt-1">🎯 進行中のミッション</p>
            )}
          </div>
        )}
      </div>

      {/* 進行中ミッションの説明 */}
      {floatingMissions.length > 0 && (
        <div className="mt-6 bg-yellow-50 rounded-2xl p-4">
          <p className="text-sm text-yellow-800">
            💫 {floatingMissions.length}個の進行中ミッションが浮遊しています。
            完了すると糸として繋がります！
          </p>
        </div>
      )}
    </div>
  );
};

export default ExperienceStrings;