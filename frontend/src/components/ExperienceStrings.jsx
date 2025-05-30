// frontend/src/components/ExperienceStrings.jsx
import React, { useState, useEffect, useRef } from 'react';
// このコンポーネント内で直接 lucide-react アイコンは使っていないので、インポートは不要

const ExperienceStrings = ({ experiences, onExperienceClick }) => {
  const canvasRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // キャンバスクリア
      ctx.clearRect(0, 0, width, height);

      // 背景の美しいグラデーション
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, 'rgba(59, 130, 246, 0.03)');
      bgGradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.03)');
      bgGradient.addColorStop(1, 'rgba(236, 72, 153, 0.03)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 時系列順にソート
      const sortedExperiences = [...experiences].sort((a, b) => a.date - b.date);
      
      // 糸の色設定
      const colors = {
        music: '#EC4899',
        place: '#10B981',
        skill: '#3B82F6',
        art: '#F59E0B',
        outdoor: '#8B5CF6',
        journal: '#6366F1'
      };

      // パスポイントを計算（ランダムな角度で繋がる一本の糸）
      const points = [];
      const margin = 40;
      
      sortedExperiences.forEach((exp, index) => {
        const progress = index / Math.max(sortedExperiences.length - 1, 1);
        
        // ランダムな角度と振幅
        const angle = Math.random() * Math.PI * 2;
        const amplitude = 50 + Math.random() * 100;
        
        // 基本的な進行方向に加えてランダムな動き
        const baseX = margin + (width - margin * 2) * progress;
        const baseY = height / 2;
        
        const x = baseX + Math.cos(angle) * amplitude * 0.3;
        const y = baseY + Math.sin(angle) * amplitude;
        
        points.push({
          x,
          y,
          exp,
          color: colors[exp.type],
          angle
        });
      });

      // 美しいベジェ曲線で繋ぐ
      if (points.length > 1) {
        // メインの糸を描画
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          
          // コントロールポイントを計算
          const cp1x = prev.x + (curr.x - prev.x) * 0.5;
          const cp1y = prev.y;
          const cp2x = prev.x + (curr.x - prev.x) * 0.5;
          const cp2y = curr.y;
          
          // セグメントごとに色分け
          ctx.strokeStyle = prev.color;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          ctx.stroke();
        }
        
        // 装飾的な背景の糸
        ctx.globalAlpha = 0.1;
        for (let offset = -20; offset <= 20; offset += 10) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y + offset);
          
          for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y + offset;
            const cp2x = prev.x + (curr.x - prev.x) * 0.5;
            const cp2y = curr.y + offset;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y + offset);
          }
          
          ctx.strokeStyle = '#9333EA';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // 各体験ポイントを描画
      points.forEach((point, index) => {
        const isFirst = index === 0;
        const isLast = index === points.length - 1;
        const isHovered = hoveredExperience === point.exp.id;
        const size = isHovered ? 9 : 6;
        let color = point.color;
        if (isFirst) {
          color = '#000000';
        } 

        // 外側の光彩
        const glowGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 3);
        glowGradient.addColorStop(0, color + (isHovered ? '40' : '20'));
        glowGradient.addColorStop(1, color + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // メインの点
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        let pointGradient;
        if (isLast) {
          pointGradient = ctx.createLinearGradient(point.x - size, point.y - size, point.x + size, point.y + size);
          pointGradient.addColorStop(0, "red");
          pointGradient.addColorStop(0.2, "orange");
          pointGradient.addColorStop(0.4, "yellow");
          pointGradient.addColorStop(0.6, "green");
          pointGradient.addColorStop(0.8, "blue");
          pointGradient.addColorStop(1, "violet");
        } else {
          pointGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size);
          pointGradient.addColorStop(0, '#FFFFFF');
          pointGradient.addColorStop(0.7, color);
          pointGradient.addColorStop(1, color + 'DD');
        }
        ctx.fillStyle = pointGradient || color;
        ctx.fill();

        // 内側の光
        ctx.beginPath();
        ctx.arc(point.x - size * 0.3, point.y - size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF90';
        ctx.fill();
      });

      // クリッカブルエリアをメモリに保存
      canvas.experiencePoints = points;
    }
  }, [experiences]);

  // マウスイベントハンドリング
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    // ホバー判定
    if (canvas.experiencePoints) {
      let hovered = null;
      for (let i = 1; i < canvas.experiencePoints.length; i++) {
        const p1 = canvas.experiencePoints[i - 1];
        const p2 = canvas.experiencePoints[i];
        const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (distance < 7) {
          hovered = p1;
          break;
        }
      }
      
      setHoveredExperience(hovered ? hovered.exp.id : null);
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    }
  };

  // 点と線分の距離を計算する関数
  const pointToLineDistance = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) // 線分の長さが0の場合を除く
      param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return Math.sqrt((x - xx) ** 2 + (y - yy) ** 2);
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (canvas.experiencePoints) {
      let clicked = null;
      for (let i = 1; i < canvas.experiencePoints.length; i++) {
        const p1 = canvas.experiencePoints[i - 1];
        const p2 = canvas.experiencePoints[i];
        const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (distance < 7) {
          clicked = p1;
          break;
        }
      }
      
      if (clicked && onExperienceClick) {
        onExperienceClick(clicked.exp);
      }
    }
  };

  return (
    <div className="relative bg-white/40 backdrop-blur-lg rounded-3xl p-6 shadow-xl">
      <canvas
        ref={canvasRef}
        width={350}
        height={400}
        className="w-full max-w-md mx-auto"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setHoveredExperience(null)}
      />
      
      {/* ホバー時のツールチップ */}
      {hoveredExperience && (
        <div 
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10"
          style={{ 
            left: `${mousePos.x}px`, 
            top: `${mousePos.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {experiences.find(e => e.id === hoveredExperience)?.title}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          あなたの旅が美しい一本の物語を紡いでいます
        </p>
        <p className="text-xs text-gray-500 mt-1">
          紐を選択して体験の詳細を見る
        </p>
      </div>
    </div>
  );
};
export default ExperienceStrings;
