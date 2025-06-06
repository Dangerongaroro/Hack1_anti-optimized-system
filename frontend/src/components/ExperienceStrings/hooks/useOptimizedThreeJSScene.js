import { useRef } from 'react';
import * as THREE from 'three';
import { 
  createOptimizedStarField, 
  setupOptimizedLighting, 
  createOptimizedCompletedSpheres, 
  createOptimizedFloatingMissions,
  createOptimizedConnectionThreads,
  updateOptimizedConnectionThreads,
  disposeOptimizedScene,
  logTotalObjectCount
} from '../utils/optimizedSceneSetup.js';
import { useOptimizedThreeJSAnimation } from './useOptimizedThreeJSAnimation.js';

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
  const prevExperiencesRef = useRef([]);
  
  const { startOptimizedAnimation, disposeOptimizedAnimation } = useOptimizedThreeJSAnimation();/**
   * 最適化されたシーン初期化
   */
  const initializeOptimizedScene = (canvas, serverVisualizationData = null, forceCleanup = false) => {
    const rect = canvas.getBoundingClientRect();
    
    // シーンとカメラの作成
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
      // 最適化されたレンダラー設定
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,    alpha: true,
      antialias: window.devicePixelRatio <= 1, // 高DPIデバイスでは無効化
      powerPreference: "high-performance" // GPU最適化
    });
    
    // 3Dテクスチャ警告対策（新しいThree.jsバージョン対応）
    renderer.outputColorSpace = 'srgb';
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
      // 🎯 差分更新対応: 強制クリーンアップでない限り、既存オブジェクトを保持
    console.log('🔍 クリーンアップ判定:', {
      'forceCleanup': forceCleanup,
      'シーン存在': !!scene,
      'シーン子要素数': scene.children.length
    });
    
    if (forceCleanup) {
      // メッシュ配列をクリア
      meshesRef.current = [];
      // 既存シーンの最適化クリーンアップ
      cleanupOptimizedScene(scene);
      console.log('🧹 強制クリーンアップ実行 - 全オブジェクト削除');
    } else {
      console.log('🔄 差分更新モード - 既存オブジェクト保持');
    }
    
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
      
      // オブジェクト数をログ出力してパフォーマンス問題を調査
      logTotalObjectCount(experiences);
      
      // 初期化時に現在のexperiencesを記録
      prevExperiencesRef.current = [...experiences];
      
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
      
      // オブジェクト数をログ出力してパフォーマンス問題を調査
      logTotalObjectCount(experiences);
      
      // 初期化時に現在のexperiencesを記録
      prevExperiencesRef.current = [...experiences];
      
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
   */  const cleanupOptimizedScene = (scene = sceneRef.current) => {
    if (!scene) return;
    
    const objectsToRemove = [];
    const objectCountByType = {};
    
    scene.traverse((object) => {
      // オブジェクトの詳細情報を収集
      const objectType = object.userData?.type || object.type || 'unknown';
      const objectClass = object.constructor.name;
        // ライト、背景、完了済み球体、星空、環境照明は保持
      if (object instanceof THREE.Light || 
          object.isBackground || 
          (object.userData && object.userData.type === 'completed') ||
          (object.userData && object.userData.type === 'starField') ||
          (object.userData && object.userData.type === 'ambientLight') ||
          (object.userData && object.userData.type === 'directionalLight')) {
        return; // 保持
      }
      
      // その他のオブジェクトは削除対象
      if (object !== scene) {
        // カウント集計
        const key = `${objectClass}(${objectType})`;
        objectCountByType[key] = (objectCountByType[key] || 0) + 1;
        objectsToRemove.push(object);
      }
    });
    
    // 削除対象オブジェクトの詳細ログ
    console.log('🗑️ 削除対象オブジェクト詳細:');
    Object.entries(objectCountByType).forEach(([key, count]) => {
      console.log(`  - ${key}: ${count}個`);
    });
    console.log(`🧹 クリーンアップ: ${objectsToRemove.length}個のオブジェクトを削除`);
    
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
    }  };

  /**
   * 差分更新システム: 新しく追加されたエクスペリエンスのみを処理
   */
  const updateSceneDifferentially = (experiences) => {
    console.log('🔄 差分更新システム開始');
    
    const prevExperiences = prevExperiencesRef.current;
    const newExperiences = experiences.filter(exp => 
      !prevExperiences.find(prev => prev.id === exp.id)
    );
    const completedExperiences = experiences.filter(exp => 
      exp.completed && !prevExperiences.find(prev => prev.id === exp.id && prev.completed)
    );
    
    console.log('📊 差分分析:', {
      '新規体験': newExperiences.length,
      '新規完了': completedExperiences.length,
      '既存保持': prevExperiences.length
    });

    if (newExperiences.length === 0 && completedExperiences.length === 0) {
      console.log('🎯 変更なし - スキップ');
      return false;
    }

    const scene = sceneRef.current;
    if (!scene) return false;

    // 新しい完了済み球体を追加
    if (completedExperiences.length > 0) {
      const newSpheres = createOptimizedCompletedSpheres(scene, completedExperiences, meshesRef);
      console.log('✅ 新しい完了済み球体を追加:', newSpheres.length);
    }

    // 新しい浮遊ミッションを追加
    const newFloatingMissions = newExperiences.filter(exp => !exp.completed);
    if (newFloatingMissions.length > 0) {
      const existingSpheres = meshesRef.current.filter(mesh => 
        mesh.userData.type === 'completed'
      );
      createOptimizedFloatingMissions(scene, newFloatingMissions, meshesRef, existingSpheres);
      console.log('🚀 新しい浮遊ミッションを追加:', newFloatingMissions.length);
    }

    // 🎯 接続糸の部分更新: 新しい完了済み球体のみに接続糸を追加
    if (completedExperiences.length > 0) {
      const newSpheres = meshesRef.current.filter(mesh => 
        mesh.userData.type === 'completed' && 
        completedExperiences.find(exp => exp.id === mesh.userData.experience.id)
      );
      const existingSpheres = meshesRef.current.filter(mesh => 
        mesh.userData.type === 'completed' && 
        !completedExperiences.find(exp => exp.id === mesh.userData.experience.id)
      );
      
      updateOptimizedConnectionThreads(scene, newSpheres, existingSpheres);
      console.log('🧵 接続糸の部分更新完了 - 新規接続のみ追加');
    }

    prevExperiencesRef.current = [...experiences];
    return true;
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
    cleanupOptimizedScene,
    updateSceneDifferentially
  };
};

export default useOptimizedThreeJSScene;
