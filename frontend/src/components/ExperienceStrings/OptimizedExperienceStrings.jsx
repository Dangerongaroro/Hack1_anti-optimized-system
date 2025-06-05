import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useOptimizedThreeJSScene } from './hooks/useOptimizedThreeJSScene';
import { useServerVisualization } from './hooks/useServerVisualization';

/**
 * 最適化されたExperienceStringsコンポーネント（ホバー機能なし）
 * パフォーマンス改善とリソース効率化、タッチ操作対応
 */
const OptimizedExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const [isInitialized, setIsInitialized] = useState(false);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // サーバーサイドビジュアライゼーションフック
  const { visualizationData, isLoading: serverLoading, useServerData } = useServerVisualization(experiences);

  // タッチ操作用の状態
  const touchState = useRef({
    isTouch: false,
    isDragging: false,
    isPinching: false,
    lastTouch: { x: 0, y: 0 },
    lastDistance: 0,
    touches: [],
    tapStartTime: 0,
    tapStartPos: { x: 0, y: 0 },
    isTap: false
  });  // 最適化されたThree.jsシーン管理
  const {
    cameraRef,
    raycasterRef,
    initializeScene,
    startAnimation,
    handleResize,
    cleanup,
    getInteractableMeshes,
    sceneRef,  // 追加: シーン参照
    updateSceneDifferentially  // 差分更新システム
  } = useOptimizedThreeJSScene(experiences);
  // 最適化されたクリックハンドラー（デバウンス機能付き）
  const optimizedClickHandler = useCallback((e) => {
    if (!isInitialized || !canvasRef.current) return;
    
    console.log('🖱️ クリック処理開始');
    
    // レイキャスト計算をrequestIdleCallbackで非同期化
    requestIdleCallback(() => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseRef.current.x = (x / rect.width) * 2 - 1;
      mouseRef.current.y = -(y / rect.height) * 2 + 1;

      const meshes = getInteractableMeshes();
      console.log('📋 クリック可能なメッシュ数:', meshes.length);
      
      if (raycasterRef.current && cameraRef.current && meshes.length > 0) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(meshes);
        
        console.log('🎯 レイキャスト結果:', intersects.length, 'つのオブジェクトがヒット');
        
        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          const userData = clickedObject.userData;
          
          console.log('📦 クリックされたオブジェクト:', {
            type: userData.type,
            experienceId: userData.experience?.id,
            experienceTitle: userData.experience?.title,
            isCompleted: userData.experience?.completed
          });
            // 浮遊ミッションの場合は詳細表示のみ（自動処理は無効化）
          if (userData.type === 'floating') {
            console.log('🎈 浮遊ミッションクリック - 詳細表示のみ実行');
            if (userData.experience && onExperienceClick) {
              onExperienceClick(userData.experience);
            }
          } else if (userData.experience && onExperienceClick) {
            console.log('⚪ 完了済み球体クリック - 詳細表示実行');
            onExperienceClick(userData.experience);
          }
        } else {
          console.log('❌ クリック対象が見つかりませんでした');
        }
      }
    });
  }, [isInitialized, getInteractableMeshes, onExperienceClick, cameraRef, raycasterRef]);

  // 最適化されたホイールハンドラー
  const optimizedWheelHandler = useCallback((e) => {
    if (!isInitialized || !cameraRef.current) return;
    e.preventDefault();

    // カメラの向き（視線ベクトル）を取得
    const cameraDirection = new THREE.Vector3();
    cameraRef.current.getWorldDirection(cameraDirection);

    // 原点を常にlookAtしている場合
    const lookAt = new THREE.Vector3(0, 0, 0);

    // スクロール量
    const delta = e.deltaY * 0.05; // 拡大/縮小の速度

    // 現在の距離
    const dist = cameraRef.current.position.distanceTo(lookAt);

    // 距離制限
    const minDist = 2;
    const maxDist = 30;
    let newDist = dist + delta;
    newDist = Math.max(minDist, Math.min(maxDist, newDist));

    // 新しい位置 = lookAt + (direction * newDist)
    cameraRef.current.position.copy(
      lookAt.clone().add(
        cameraDirection.multiplyScalar(-newDist) // -方向に進む（カメラの向きは逆）
      )
    );
    cameraRef.current.lookAt(lookAt);
  }, [isInitialized, cameraRef]);
  // ドラッグ開始
  const handleMouseDown = useCallback((e) => {
    if (touchState.current.isTouch) return; // タッチ操作中はマウス操作を無視
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    if (touchState.current.isTouch) return; // タッチ操作中はマウス操作を無視
    isDragging.current = false;
  }, []);

  // ドラッグ中のカメラ移動
  const handleCameraDrag = useCallback((e) => {
    if (!isDragging.current || !cameraRef.current || touchState.current.isTouch) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    const panSpeed = 0.01; // 調整可

    cameraRef.current.position.x -= dx * panSpeed;
    cameraRef.current.position.y += dy * panSpeed;
    cameraRef.current.lookAt(0, 0, 0);

    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, [cameraRef]);  // タッチ開始ハンドラー
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    touchState.current.isTouch = true;
    
    if (e.touches.length === 1) {
      // シングルタッチ - タップまたはドラッグ操作
      const touch = e.touches[0];
      touchState.current.tapStartTime = Date.now();
      touchState.current.tapStartPos = {
        x: touch.clientX,
        y: touch.clientY
      };
      touchState.current.lastTouch = {
        x: touch.clientX,
        y: touch.clientY
      };
      touchState.current.isTap = true;
      touchState.current.isDragging = false;
    } else if (e.touches.length === 2) {
      // ダブルタッチ - ピンチズーム操作
      touchState.current.isPinching = true;
      touchState.current.isDragging = false;
      touchState.current.isTap = false;
      
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current.lastDistance = Math.sqrt(dx * dx + dy * dy);
    }
    
    touchState.current.touches = Array.from(e.touches);
  }, []);
  // タッチ移動ハンドラー
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    if (!cameraRef.current) return;
    
    if (e.touches.length === 1 && touchState.current.isTap) {
      // タップ判定の確認
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchState.current.tapStartPos.x);
      const dy = Math.abs(touch.clientY - touchState.current.tapStartPos.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 移動距離が一定以上の場合はタップではなくドラッグとして判定
      if (distance > 10) {
        touchState.current.isTap = false;
        touchState.current.isDragging = true;
      }
    }
    
    if (e.touches.length === 1 && touchState.current.isDragging && !touchState.current.isTap) {
      // シングルタッチドラッグ - カメラの回転/パン
      const touch = e.touches[0];
      const dx = touch.clientX - touchState.current.lastTouch.x;
      const dy = touch.clientY - touchState.current.lastTouch.y;
      
      const panSpeed = 0.015; // タッチ用に少し強めに設定
      
      cameraRef.current.position.x -= dx * panSpeed;
      cameraRef.current.position.y += dy * panSpeed;
      cameraRef.current.lookAt(0, 0, 0);
      
      touchState.current.lastTouch = {
        x: touch.clientX,
        y: touch.clientY
      };
    } else if (e.touches.length === 2 && touchState.current.isPinching) {
      // ピンチズーム
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (touchState.current.lastDistance > 0) {
        const delta = distance - touchState.current.lastDistance;
        const zoomSpeed = 0.01;
        
        // ズーム処理（既存のズーム関数と同様の制限）
        const camera = cameraRef.current;
        const currentDistance = camera.position.length();
        const newDistance = Math.max(5, Math.min(50, currentDistance - delta * zoomSpeed));
        
        const direction = camera.position.clone().normalize();
        camera.position.copy(direction.multiplyScalar(newDistance));
        camera.lookAt(0, 0, 0);
      }
      
      touchState.current.lastDistance = distance;
    }
  }, [cameraRef]);
  // タッチ終了ハンドラー
  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    
    // タップ処理の実行
    if (touchState.current.isTap && isInitialized && canvasRef.current) {
      const touchEndTime = Date.now();
      const tapDuration = touchEndTime - touchState.current.tapStartTime;
        // タップの時間が短い場合（300ms以下）にクリック処理を実行
      if (tapDuration < 300) {
        console.log('📱 タッチタップ処理開始');
        
        // レイキャスト処理でタップされたオブジェクトを検出
        const rect = canvasRef.current.getBoundingClientRect();
        const x = touchState.current.tapStartPos.x - rect.left;
        const y = touchState.current.tapStartPos.y - rect.top;

        mouseRef.current.x = (x / rect.width) * 2 - 1;
        mouseRef.current.y = -(y / rect.height) * 2 + 1;

        const meshes = getInteractableMeshes();
        console.log('📋 タップ可能なメッシュ数:', meshes.length);
        
        if (raycasterRef.current && cameraRef.current && meshes.length > 0) {
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
          const intersects = raycasterRef.current.intersectObjects(meshes);
          
          console.log('🎯 タップレイキャスト結果:', intersects.length, 'つのオブジェクトがヒット');
            if (intersects.length > 0) {
            const tappedObject = intersects[0].object;
            const userData = tappedObject.userData;
            
            console.log('📦 タップされたオブジェクト:', {
              type: userData.type,
              experienceId: userData.experience?.id,
              experienceTitle: userData.experience?.title,
              isCompleted: userData.experience?.completed
            });
            
            if (userData.experience && onExperienceClick) {
              if (userData.type === 'floating') {
                console.log('🎈 浮遊ミッションタップ - 詳細表示のみ実行');
              } else {
                console.log('⚪ 完了済み球体タップ - 詳細表示実行');
              }
              onExperienceClick(userData.experience);            }
          } else {
            console.log('❌ タップ対象が見つかりませんでした');
          }
        }
      }
    }
    
    if (e.touches.length === 0) {
      // すべてのタッチが終了
      touchState.current.isTouch = false;
      touchState.current.isDragging = false;
      touchState.current.isPinching = false;
      touchState.current.isTap = false;
      touchState.current.lastDistance = 0;
      touchState.current.tapStartTime = 0;
    } else if (e.touches.length === 1 && touchState.current.isPinching) {
      // ピンチからシングルタッチへ移行
      touchState.current.isPinching = false;
      touchState.current.isDragging = true;
      touchState.current.isTap = false;
      touchState.current.lastTouch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
    
    touchState.current.touches = Array.from(e.touches);
  }, [isInitialized, getInteractableMeshes, onExperienceClick, cameraRef, raycasterRef]);  // Canvas初期化とアニメーション開始
  useEffect(() => {
    // 🎯 本当に初期化が必要な場合のみ実行
    if (!canvasRef.current || experiences.length === 0) return;

    // 🎯 シーンが既に初期化されており、要素数に変化がない場合はスキップ
    if (isInitialized && sceneRef.current) {
      console.log('🚀 シーンは既に初期化済み - 初期化スキップ（差分更新は別のuseEffectで処理）');
      return;
    }

    // サーバーデータの読み込み待機
    if (serverLoading) {
      console.log('🔄 サーバーサイドビジュアライゼーションデータ読み込み中...');
      return;
    }
    
    const canvas = canvasRef.current;
    let animationCleanup = null;

    try {
      // サーバーデータの使用状況をログ出力
      if (useServerData && visualizationData) {
        console.log('🖥️ サーバーサイドビジュアライゼーションデータを使用:', visualizationData);
      } else {
        console.log('💻 フロントエンド計算でビジュアライゼーションを実行');
      }      // シーン初期化（サーバーデータまたはフロントエンド計算）
      // 🎯 初回初期化時のみ強制クリーンアップを実行
      const forceCleanup = !isInitialized;
      console.log('🎯 初期化モード分析:', {
        'isInitialized': isInitialized,
        'forceCleanup': forceCleanup,
        'experiencesLength': experiences.length,
        'シーン参照存在': !!sceneRef.current
      });
      
      const { stars } = initializeScene(canvas, visualizationData, forceCleanup);
      
      // アニメーション開始
      animationCleanup = startAnimation(stars);
      
      setIsInitialized(true);
      console.log('✅ 3Dビジュアライゼーションが正常に初期化されました');

      // イベントリスナーの設定
      const resizeHandler = () => handleResize(canvas);
      
      window.addEventListener('resize', resizeHandler);
      canvas.addEventListener('wheel', optimizedWheelHandler, { passive: false });
      canvas.addEventListener('click', optimizedClickHandler);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
      canvas.addEventListener('mousemove', handleCameraDrag);
      
      // タッチイベントの設定
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

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
        canvas.removeEventListener('click', optimizedClickHandler);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
        canvas.removeEventListener('mousemove', handleCameraDrag);
        
        // タッチイベントの削除
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
        
        // リソースのクリーンアップ
        cleanup();
      };    } catch (error) {
      console.error('最適化されたシーンの初期化に失敗しました:', error);
      setIsInitialized(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visualizationData, 
    serverLoading, 
    useServerData,
    experiences.length // 🎯 修正: 本当に必要な依存関係のみ - 長さ変更時のみ初期化
    // ハンドラー関数は除外（無限ループを防ぐため）
  ]);

  // 🎯 差分更新専用useEffect: experiencesの内容変更を監視
  useEffect(() => {
    if (!isInitialized || !canvasRef.current || experiences.length === 0) return;

    console.log('🔄 差分更新チェック - experiencesの内容変更を検出');
    const wasUpdated = updateSceneDifferentially(experiences);
    if (wasUpdated) {
      console.log('✅ 差分更新完了 - 新しいオブジェクトのみ追加');
    }
  }, [experiences, isInitialized, updateSceneDifferentially]);
  // レンダリング最適化のためのメモ化された統計情報
  const stats = React.useMemo(() => {
    const completed = experiences.filter(exp => exp.completed).length;
    const floating = experiences.filter(exp => !exp.completed).length;
    return { completed, floating };
  }, [experiences]);

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

        {/* 統計や操作説明 */}        <div className="absolute bottom-4 left-4 text-white/80 text-sm z-10">
          <p className="mb-1">🎯 体験の糸: {stats.completed}本</p>
          <p>💫 浮遊ミッション: {stats.floating}個</p>
          {!isInitialized && <p className="text-yellow-300">🔄 最適化中...</p>}
          {visualizationData && (
            <p className={`mt-1 ${visualizationData.isServerData ? 'text-green-300' : 'text-orange-300'}`}>
              {visualizationData.isServerData ? '🔧 サーバー計算使用中' : '💻 フロントエンド計算使用中'}
            </p>
          )}
        </div>

        <div className="absolute bottom-4 right-4 text-white/60 text-xs z-10">
          <div className="hidden md:block">
            <p>マウスホイール: ズーム</p>
            <p>ドラッグ: 視点移動</p>
            <p>クリック: 体験を選択</p>
          </div>
          <div className="md:hidden">
            <p>ピンチ: ズーム</p>
            <p>ドラッグ: 視点移動</p>
            <p>タップ: 体験を選択</p>
          </div>        </div>
      </div>
    </div>
  );
};

export default OptimizedExperienceStrings;
