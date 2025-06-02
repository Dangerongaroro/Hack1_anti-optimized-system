import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useOptimizedThreeJSScene } from './hooks/useOptimizedThreeJSScene';
import { useThreeJSInteraction } from './hooks/useThreeJSInteraction';

/**
 * 最適化されたExperienceStringsコンポーネント
 * パフォーマンス改善とリソース効率化
 */
const OptimizedExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseRef = useRef(new THREE.Vector2());
  const [isInitialized, setIsInitialized] = useState(false);
    // 最適化されたThree.jsシーン管理
  const {
    sceneRef,
    cameraRef,
    raycasterRef,
    hoveredMeshRef,
    initializeScene,
    startAnimation,
    handleResize,
    cleanup,
    getInteractableMeshes
  } = useOptimizedThreeJSScene(experiences);
  
  // インタラクション管理（既存のものを再利用）
  const { handleWheel, handleMouseMove, handleCanvasClick } = useThreeJSInteraction();
  // 最適化されたマウス移動ハンドラー
  const optimizedMouseMoveHandler = useCallback((e) => {
    if (!isInitialized) return;
    
    // 基本的なマウス移動処理は既存のものを使用
    handleMouseMove(
      e, 
      canvasRef, 
      mouseRef, 
      raycasterRef, 
      cameraRef, 
      { current: getInteractableMeshes() }, // 最適化: インタラクト可能なメッシュのみ
      hoveredMeshRef, 
      sceneRef, 
      { current: [] }, // パーティクルシステムは最適化で簡略化
      setHoveredExperience, 
      setMousePos
    );
  }, [isInitialized, handleMouseMove, getInteractableMeshes, cameraRef, hoveredMeshRef, raycasterRef, sceneRef]);

  // 最適化されたクリックハンドラー
  const optimizedClickHandler = useCallback((e) => {
    if (!isInitialized) return;
    
    handleCanvasClick(
      e, 
      canvasRef, 
      mouseRef, 
      raycasterRef, 
      cameraRef, 
      { current: getInteractableMeshes() }, // 最適化: インタラクト可能なメッシュのみ
      sceneRef, 
      { current: [] }, // パーティクルシステムは最適化で簡略化
      onExperienceClick
    );
  }, [isInitialized, handleCanvasClick, getInteractableMeshes, onExperienceClick, cameraRef, raycasterRef, sceneRef]);

  // 最適化されたホイールハンドラー
  const optimizedWheelHandler = useCallback((e) => {
    if (!isInitialized) return;
    handleWheel(e, cameraRef);
  }, [isInitialized, handleWheel, cameraRef]);

  // Canvas初期化とアニメーション開始
  useEffect(() => {
    if (!canvasRef.current || experiences.length === 0) return;
    
    const canvas = canvasRef.current;
    let animationCleanup = null;
    
    try {
      // シーン初期化
      const { stars } = initializeScene(canvas);
      
      // アニメーション開始
      animationCleanup = startAnimation(stars);
      
      setIsInitialized(true);
      
      // イベントリスナーの設定
      const resizeHandler = () => handleResize(canvas);
      
      window.addEventListener('resize', resizeHandler);
      canvas.addEventListener('wheel', optimizedWheelHandler, { passive: false });
      canvas.addEventListener('mousemove', optimizedMouseMoveHandler);
      canvas.addEventListener('click', optimizedClickHandler);
      
      // クリーンアップ関数
      return () => {
        setIsInitialized(false);
        
        // アニメーションの停止
        if (animationCleanup) {
          animationCleanup();
        }
        
        // イベントリスナーの削除
        window.removeEventListener('resize', resizeHandler);
        canvas.removeEventListener('wheel', optimizedWheelHandler);
        canvas.removeEventListener('mousemove', optimizedMouseMoveHandler);
        canvas.removeEventListener('click', optimizedClickHandler);
        
        // リソースのクリーンアップ
        cleanup();
      };
    } catch (error) {
      console.error('最適化されたシーンの初期化に失敗しました:', error);
      setIsInitialized(false);
    }
  }, [experiences, initializeScene, startAnimation, handleResize, cleanup, onExperienceClick, optimizedClickHandler, optimizedMouseMoveHandler, optimizedWheelHandler]);

  // レンダリング最適化のためのメモ化された統計情報
  const stats = React.useMemo(() => {
    const completed = experiences.filter(exp => exp.completed).length;
    const floating = experiences.filter(exp => !exp.completed).length;
    return { completed, floating };
  }, [experiences]);

  return (
    <div className="px-4" ref={containerRef}>
      <div className="relative mb-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-crosshair relative z-10"
          style={{ background: 'transparent' }}
        />
        
        {/* 最適化されたツールチップ表示 */}
        {hoveredExperience && isInitialized && (
          <div 
            className="absolute z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 pointer-events-none border border-purple-200/50 transform transition-opacity duration-200"
            style={{
              left: `${mousePos.x + 10}px`,
              top: `${mousePos.y - 10}px`,
              transform: 'translate(0, -100%)'
            }}
          >
            <h4 className="font-semibold text-purple-900 text-sm mb-1">
              {hoveredExperience.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {hoveredExperience.description || `${hoveredExperience.category}の体験`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {hoveredExperience.category}
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
        
        {/* 最適化された統計表示 */}
        <div className="absolute bottom-4 left-4 text-white/80 text-sm z-10">
          <p className="mb-1">🎯 体験の糸: {stats.completed}本</p>
          <p>💫 浮遊ミッション: {stats.floating}個</p>
          {!isInitialized && <p className="text-yellow-300">🔄 最適化中...</p>}
        </div>
        
        <div className="absolute bottom-4 right-4 text-white/60 text-xs z-10">
          <p>マウスホイール: ズーム</p>
          <p>ホバー: 詳細表示</p>
          <p>クリック: 体験を選択</p>
        </div>
      </div>

      {/* 進行中ミッションの説明 */}
      {stats.floating > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/30">
          <p className="text-sm text-purple-800">
            💫 {stats.floating}個の進行中ミッションが浮遊しています。
            完了すると美しい軌跡を描きながら糸として繋がります！
          </p>
        </div>
      )}
      
      <div className="mt-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/30">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">最適化された体験の糸について</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          最適化版では、パフォーマンスを大幅に改善しながら美しい視覚効果を維持します。
          リソースプーリング、事前計算、フレームレート制御により、スムーズな体験を提供します。
          完了した体験は美しい球体として表示され、それらを繋ぐ糸が成長の軌跡を表現します。
        </p>
        {isInitialized && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1 inline-block">
            ✅ 最適化システム稼働中 - 高速レンダリング有効
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedExperienceStrings;
