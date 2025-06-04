import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useOptimizedThreeJSScene } from './hooks/useOptimizedThreeJSScene';
import { useThreeJSInteraction } from './hooks/useThreeJSInteraction';
import { Info } from 'lucide-react';

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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const isHoverEnabled = useRef(true);
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
    if (!isInitialized || !isHoverEnabled.current) return;
    
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
    isHoverEnabled.current = false;
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
    
    // ホバー解除関数
    const clearHover = () => {
      if (hoveredMeshRef.current) hoveredMeshRef.current = null;
      setHoveredExperience(null);
      if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    };

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
      canvas.addEventListener('mouseleave', clearHover);
      
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
        canvas.removeEventListener('mouseleave', clearHover);
        
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

  // ツールチップ表示条件を厳格化
  const shouldShowTooltip = isHoverEnabled.current && hoveredExperience && hoveredMeshRef.current &&
    (hoveredMeshRef.current.userData?.type === 'completed' || hoveredMeshRef.current.userData?.type === 'floating');

  return (
    <div className="px-4 bg-black" ref={containerRef}>
      {/* 3Dキャンバス部分 */}
      <div className="relative mb-8 bg-black rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-crosshair relative z-10 bg-black"
          style={{ background: '#000' }}
        />
        {/* ツールチップや統計表示はここに残す */}
        {shouldShowTooltip && isInitialized && (
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
        {/* 統計や操作説明はここに残す */}
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
      {/* 詳細説明モーダル */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative">
            <h3 className="text-xl font-bold text-blue-900 mb-4">体験の糸について</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              完了した体験は美しい球体として表示され、それらを繋ぐ糸が成長の軌跡を表現します。<br />
              各体験には固有の色があり、カテゴリーやテーマによって美しいグラデーションを作り出します。<br />
              ホバーやクリックで詳細な情報を確認できます。
            </p>
            <button onClick={() => setShowInfoModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedExperienceStrings;
