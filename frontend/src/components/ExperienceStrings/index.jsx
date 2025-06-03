import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useThreeJSScene } from './hooks/useThreeJSScene';
import { useThreeJSInteraction } from './hooks/useThreeJSInteraction';

const ExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseRef = useRef(new THREE.Vector2());

  // Three.jsシーン管理
  const {
    sceneRef,
    cameraRef,
    raycasterRef,
    meshesRef,
    particleSystemsRef,
    hoveredMeshRef,
    initializeScene,
    startAnimation,
    handleResize,
    cleanup
  } = useThreeJSScene(experiences);

  // インタラクション管理
  const { handleWheel, handleMouseMove, handleCanvasClick } = useThreeJSInteraction();

  // モーダルが開いている間はホバー処理を無効化
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExperienceClickWrapper = useCallback((experienceData) => {
    console.log('Experience clicked, clearing hover state');
    setHoveredExperience(null); // ホバー状態をクリア
    setIsModalOpen(true); // モーダル状態を設定
    onExperienceClick(experienceData);
  }, [onExperienceClick]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // モーダルが開いている間はマウスイベントを制限
  const mouseMoveHandler = (e) => {
    if (!isModalOpen) { // モーダルが開いていない場合のみホバー処理
      handleMouseMove(
        e, canvasRef, mouseRef, raycasterRef, cameraRef, meshesRef,
        hoveredMeshRef, sceneRef, particleSystemsRef,
        setHoveredExperience, setMousePos
      );
    }
  };

  // Canvas描画とイベントリスナー設定（統一版）
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    console.log('Initializing scene with experiences:', experiences);
    
    const { stars } = initializeScene(canvas);
    const animationId = startAnimation(stars);
    
    // イベントリスナー
    const resizeHandler = () => handleResize(canvas);
    const wheelHandler = (e) => handleWheel(e, cameraRef);
    const clickHandler = (e) => handleCanvasClick(
      e, canvasRef, mouseRef, raycasterRef, cameraRef, meshesRef,
      sceneRef, particleSystemsRef, handleExperienceClickWrapper // ラッパー関数を使用
    );
    
    window.addEventListener('resize', resizeHandler);
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('click', clickHandler);
    
    console.log('Event listeners set up, meshes count:', meshesRef.current?.length || 0);
    
    // クリーンアップ
    return () => {
      console.log('Cleaning up scene');
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('resize', resizeHandler);
      canvas.removeEventListener('wheel', wheelHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('click', clickHandler);
      
      cleanup();
    };
  }, [experiences, handleExperienceClickWrapper, isModalOpen]);

  return (
    <div className="px-4" ref={containerRef}>
      <div className="relative mb-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-crosshair relative z-10"
          style={{ background: 'transparent' }}
        />
        
        {/* ホバーツールチップ（モーダルが開いていない場合のみ表示） */}
        {hoveredExperience && !isModalOpen && (
          <div 
            className="absolute z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 pointer-events-none border border-purple-200/50"
            style={{
              left: `${mousePos.x + 10}px`,
              top: `${mousePos.y - 10}px`,
              transform: 'translate(0, -100%)'
            }}
          >
            <h4 className="font-semibold text-purple-900 text-sm mb-1">
              {hoveredExperience.title || '無題の体験'}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {hoveredExperience.description || `${hoveredExperience.category || 'その他'}の体験`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {hoveredExperience.category || 'その他'}
              </span>
              <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                レベル {hoveredExperience.level || 1}
              </span>
              {hoveredExperience.completed && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  完了済み
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 text-white/80 text-sm z-10">
          <p className="mb-1">🎯 体験の糸: {experiences.filter(exp => exp.completed).length}本</p>
          <p>💫 浮遊ミッション: {experiences.filter(exp => !exp.completed).length}個</p>
        </div>
        
        <div className="absolute bottom-4 right-4 text-white/60 text-xs z-10">
          <p>マウスホイール: ズーム</p>
          <p>ホバー: 詳細表示</p>
          <p>クリック: 体験を選択</p>
        </div>
      </div>

      {/* 進行中ミッションの説明 */}
      {experiences.filter(exp => !exp.completed).length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/30">
          <p className="text-sm text-purple-800">
            💫 {experiences.filter(exp => !exp.completed).length}個の進行中ミッションが浮遊しています。
            完了すると美しい軌跡を描きながら糸として繋がります！
          </p>
        </div>
      )}
      
      <div className="mt-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/30">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">体験の糸について</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          完了した体験は美しい球体として表示され、それらを繋ぐ糸が成長の軌跡を表現します。
          各体験には固有の色があり、カテゴリーやテーマによって美しいグラデーションを作り出します。
          ホバーやクリックで詳細な情報を確認できます。
        </p>
      </div>
    </div>
  );
};

export default ExperienceStrings;
