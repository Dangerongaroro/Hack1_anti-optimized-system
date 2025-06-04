import { useRef } from 'react';
import * as THREE from 'three';
import { 
  createOptimizedStarField, 
  setupOptimizedLighting, 
  createOptimizedCompletedSpheres, 
  createOptimizedFloatingMissions,
  createOptimizedConnectionThreads,
  disposeOptimizedScene
} from '../utils/optimizedSceneSetup';
import { useOptimizedThreeJSAnimation } from './useOptimizedThreeJSAnimation';

/**
 * 最適化されたThree.jsシーン管理フック
 * パフォーマンス向上とリソース効率化
 */
export const useOptimizedThreeJSScene = (experiences) => {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef = useRef(null);
  const meshesRef = useRef([]);
  const hoveredMeshRef = useRef(null);
  const animationCleanupRef = useRef(null);
  
  const { startOptimizedAnimation, disposeOptimizedAnimation } = useOptimizedThreeJSAnimation();  /**
   * 最適化されたシーン初期化
   */
  const initializeOptimizedScene = (canvas, serverVisualizationData = null) => {
    const rect = canvas.getBoundingClientRect();
    
    // シーンとカメラの作成
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
      // 最適化されたレンダラー設定
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      alpha: true,
      antialias: window.devicePixelRatio <= 1, // 高DPIデバイスでは無効化
      powerPreference: "high-performance" // GPU最適化
    });
    
    // 3Dテクスチャ警告対策
    renderer.outputEncoding = THREE.sRGBEncoding;
    THREE.ColorManagement.enabled = true;
    
    // 参照を保存
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    raycasterRef.current = new THREE.Raycaster();
    raycasterRef.current.params.Points.threshold = 0.5;
    
    // レンダラー最適化設定
    renderer.setSize(rect.width, rect.height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // DPR制限
    renderer.shadowMap.enabled = false; // シャドウ無効化でパフォーマンス向上
    
    camera.position.set(0, 0, 5); // 正面から
    camera.lookAt(0, 0, 0);
    
    // メッシュ配列をクリア
    meshesRef.current = [];
      // 既存シーンの最適化クリーンアップ
    cleanupOptimizedScene(scene);
    
    // サーバーデータが利用可能で、isServerDataフラグがtrueの場合は、サーバー側計算を使用
    if (serverVisualizationData && serverVisualizationData.isServerData === true) {
      console.log('🔧 サーバーサイド計算結果を使用します', serverVisualizationData);
      
      // 星空と照明を設定
      const stars = createOptimizedStarField(scene);
      setupOptimizedLighting(scene);
      
      // サーバーデータを使ってオブジェクトを作成
      const spheres = createOptimizedCompletedSpheres(scene, experiences, meshesRef);
      createOptimizedConnectionThreads(scene, spheres);
      createOptimizedFloatingMissions(scene, experiences, meshesRef, spheres);
      
      // サーバーデータとフロントエンドデータの構造の違いを吸収
      return {
        scene,
        renderer,
        camera,
        stars,
        meshesRef,
        hoveredMeshRef: { current: null },
        initComplete: true
      };
    } else {
      // サーバーデータがない場合やフラグがfalseの場合はフロントエンド計算
      console.log('💻 フロントエンドビジュアライゼーションを使用します');
      
      // 最適化されたシーン要素を作成
      const stars = createOptimizedStarField(scene);
      setupOptimizedLighting(scene);
      const spheres = createOptimizedCompletedSpheres(scene, experiences, meshesRef);
      createOptimizedConnectionThreads(scene, spheres);
      createOptimizedFloatingMissions(scene, experiences, meshesRef, spheres);
      
      // else ブロック内でもreturnするように変更
      return { scene, camera, renderer, stars };
    }
  };

  /**
   * 最適化されたアニメーション開始
   */
  const startOptimizedAnimationLoop = (stars) => {
    // 既存のアニメーションをクリーンアップ
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
    }
    
    // 最適化されたアニメーションループを開始
    const cleanup = startOptimizedAnimation(
      sceneRef.current,
      stars,
      meshesRef,
      hoveredMeshRef,
      rendererRef.current,
      cameraRef.current
    );
    
    animationCleanupRef.current = cleanup;
    return cleanup;
  };

  /**
   * 最適化されたリサイズハンドラー
   */
  const handleOptimizedResize = (canvas) => {
    const newRect = canvas.getBoundingClientRect();
    if (cameraRef.current && rendererRef.current) {
      // アスペクト比とプロジェクション行列の更新
      cameraRef.current.aspect = newRect.width / newRect.height;
      cameraRef.current.updateProjectionMatrix();
      
      // レンダラーサイズの更新
      rendererRef.current.setSize(newRect.width, newRect.height);
    }
  };

  /**
   * 最適化されたシーンクリーンアップ
   */
  const cleanupOptimizedScene = (scene = sceneRef.current) => {
    if (!scene) return;
    
    const objectsToRemove = [];
    
    scene.traverse((object) => {
      // ライト、背景、完了済み球体は保持
      if (object instanceof THREE.Light || 
          object.isBackground || 
          (object.userData && object.userData.type === 'completed')) {
        console.log('🔒 保護されたオブジェクト:', object.userData?.type || object.type); // デバッグ追加
        return; // 保持
      }
      
      // その他のオブジェクトは削除対象
      if (object !== scene) {
        console.log('🗑️ 削除対象:', object.userData?.type || 'unknown'); // デバッグ追加
        objectsToRemove.push(object);
      }
    });
    
    console.log(`🧹 クリーンアップ: ${objectsToRemove.length}個のオブジェクトを削除, 保護されたオブジェクトは残存`);
    
    // 削除対象のオブジェクトを削除
    objectsToRemove.forEach(object => {
      scene.remove(object);
      if (object.geometry && !object.userData?.isPooled) object.geometry.dispose();
      if (object.material && !object.userData?.isPooled) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };

  /**
   * 完全なリソース解放
   */
  const disposeOptimizedResources = () => {
    // アニメーションの停止
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
      animationCleanupRef.current = null;
    }
    
    // シーンのクリーンアップ
    cleanupOptimizedScene();
    
    // レンダラーの解放
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    // アニメーションシステムの解放
    disposeOptimizedAnimation();
    
    // 最適化ユーティリティの解放
    disposeOptimizedScene();
    
    // 参照のクリア
    sceneRef.current = null;
    cameraRef.current = null;
    raycasterRef.current = null;
    meshesRef.current = [];
    hoveredMeshRef.current = null;
  };

  /**
   * レイキャスト用メッシュ取得の最適化
   */
  const getInteractableMeshes = () => {
    return meshesRef.current.filter(mesh => 
      mesh.userData.type === 'completed' || mesh.userData.type === 'floating'
    );
  };

  /**
   * ホバーメッシュの最適化設定
   */
  const setOptimizedHoveredMesh = (mesh) => {
    // 前のホバーメッシュの状態をリセット
    if (hoveredMeshRef.current && hoveredMeshRef.current !== mesh) {
      hoveredMeshRef.current.userData.hoverStartTime = null;
      hoveredMeshRef.current.userData.isHovering = false;
    }
    
    hoveredMeshRef.current = mesh;
    
    // 新しいホバーメッシュの初期化
    if (mesh) {
      mesh.userData.hoverStartTime = Date.now();
      mesh.userData.isHovering = true;
    }
  };

  return {
    // 基本参照（後方互換性）
    sceneRef,
    cameraRef,
    rendererRef,
    raycasterRef,
    meshesRef,
    hoveredMeshRef,
    
    // 最適化されたメソッド
    initializeScene: initializeOptimizedScene,
    startAnimation: startOptimizedAnimationLoop,
    handleResize: handleOptimizedResize,
    cleanup: disposeOptimizedResources,
    
    // 追加の最適化機能
    getInteractableMeshes,
    setOptimizedHoveredMesh,
    cleanupOptimizedScene
  };
};

export default useOptimizedThreeJSScene;
