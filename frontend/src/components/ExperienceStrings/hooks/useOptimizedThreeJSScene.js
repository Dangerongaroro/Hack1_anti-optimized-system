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
  
  const { startOptimizedAnimation, disposeOptimizedAnimation } = useOptimizedThreeJSAnimation();

  /**
   * 最適化されたシーン初期化
   */
  const initializeOptimizedScene = (canvas) => {
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
    
    // 最適化されたシーン要素を作成
    const stars = createOptimizedStarField(scene);
    setupOptimizedLighting(scene);
    const spheres = createOptimizedCompletedSpheres(scene, experiences, meshesRef);
    createOptimizedConnectionThreads(scene, spheres);
    createOptimizedFloatingMissions(scene, experiences, meshesRef);
    
    return { scene, camera, renderer, stars };
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
    
    // アニメーションのクリーンアップ
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
      animationCleanupRef.current = null;
    }
    
    // シーンオブジェクトの最適化クリーンアップ
    const objectsToRemove = [];
    scene.traverse((object) => {
      objectsToRemove.push(object);
    });
    
    objectsToRemove.forEach(object => {
      // ジオメトリの解放（プールされたものは除く）
      if (object.geometry && !object.userData.isPooled) {
        object.geometry.dispose();
      }
      
      // マテリアルの解放（プールされたものは除く）
      if (object.material && !object.userData.isPooled) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => {
            if (!m.userData?.isPooled) m.dispose();
          });
        } else {
          if (!object.material.userData?.isPooled) {
            object.material.dispose();
          }
        }
      }
      
      // ライトの解放
      if (object.userData?.light && scene.children.includes(object.userData.light)) {
        scene.remove(object.userData.light);
      }
    });
    
    // シーンから全ての子要素を削除
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
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
