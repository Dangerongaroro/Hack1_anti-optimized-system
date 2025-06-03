import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThreeJSScene } from './hooks/useThreeJSScene';
import { useThreeJSInteraction } from './hooks/useThreeJSInteraction';
import { Info } from 'lucide-react'; // Infoアイコンをインポート

const MobileExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseRef = useRef(new THREE.Vector2());
  const lastTapTimeRef = useRef(0); // 新しく追加

  // Three.jsシーン管理
  const {
    sceneRef,
    cameraRef,
    // rendererRef, // 現在未使用
    raycasterRef,
    meshesRef,
    particleSystemsRef,
    hoveredMeshRef,
    initializeScene,
    startAnimation,
    handleResize,
    cleanup
  } = useThreeJSScene(experiences);
  // インタラクション管理 (handleCanvasClickはカスタム実装するため使用しない)
  const { handleWheel, handleMouseMove } = useThreeJSInteraction();

  const [showInfoModal, setShowInfoModal] = useState(false); // 新しいState

  // Canvas描画
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const { stars } = initializeScene(canvas);
    const animationId = startAnimation(stars);
    
    // イベントリスナー
    const resizeHandler = () => handleResize(canvas);
    const wheelHandler = (e) => handleWheel(e, cameraRef);
    const mouseMoveHandler = (e) => handleMouseMove(
      e, canvasRef, mouseRef, raycasterRef, cameraRef, meshesRef,
      hoveredMeshRef, sceneRef, particleSystemsRef,
      setHoveredExperience, setMousePos
    );
    // カスタムクリックハンドラ
    const customClickHandler = (e) => {
      e.preventDefault(); // デフォルトのクリック動作を抑制

      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTimeRef.current;
      const TAP_THRESHOLD = 300; // ダブルタップと認識する時間（ミリ秒）
      const Z_MOVE_STEP = 5; // カメラのZ軸移動量

      if (tapLength < TAP_THRESHOLD && tapLength > 0) {
        // ダブルタップ
        cameraRef.current.position.z -= Z_MOVE_STEP; // 奥へ移動
        lastTapTimeRef.current = 0; // リセット
      } else {
        // シングルタップ
        cameraRef.current.position.z += Z_MOVE_STEP; // 手前へ移動
        lastTapTimeRef.current = currentTime;
      }

      // オブジェクト選択ロジックを簡易的に実装
      mouseRef.current.x = (e.clientX / canvas.clientWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshesRef.current);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        const experienceId = intersectedMesh.userData.experienceId;
        if (experienceId && onExperienceClick) {
          onExperienceClick(experienceId);
        }
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('click', customClickHandler); // カスタムハンドラを使用
    
    // クリーンアップ
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('resize', resizeHandler);
      canvas.removeEventListener('wheel', wheelHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('click', customClickHandler); // カスタムハンドラを使用
      
      cleanup();
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiences, initializeScene, startAnimation, handleResize, handleWheel, handleMouseMove, cleanup, onExperienceClick]);

  return (
    <div className="px-4" ref={containerRef} style={{ overflow: 'hidden' }}> {/* ここに style={{ overflow: 'hidden' }} を追加 */}
      <div className="relative mb-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-crosshair relative z-10"
          style={{ background: 'transparent', touchAction: 'none' }} // ここに touchAction: 'none' を追加
        />
        
        {hoveredExperience && (
          <div 
            className="absolute z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 pointer-events-none border border-purple-200/50"
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
        
      </div>

      
      <div className="mt-6 bg-white backdrop-blur-sm rounded-2xl py-2 px-4 border border-blue-200/30 flex items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-700">体験の糸について</h3>
          <button
            onClick={() => setShowInfoModal(true)}
            className="ml-2 p-1 rounded-full bg-transparent hover:bg-blue-100 transition-colors"
            aria-label="体験の糸についての情報"
          >
            <Info className="w-5 h-5 text-blue-700" />
          </button>
        </div>
      </div>

      {/* 情報モーダル */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative">
            <h3 className="text-xl font-bold text-blue-900 mb-4">体験の糸について</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              完了した体験は美しい球体として表示され、それらを繋ぐ糸が成長の軌跡を表現します。
              各体験には固有の色があり、カテゴリーやテーマによって美しいグラデーションを作り出します。
              糸や球をタップしてみてください。
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

export default MobileExperienceStrings;
