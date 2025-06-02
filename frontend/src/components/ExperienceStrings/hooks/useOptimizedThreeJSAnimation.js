import * as THREE from 'three';
import { OptimizedAnimationManager } from '../utils/optimizedThreeUtils';

/**
 * 最適化されたThree.jsアニメーションフック
 * フレームレート制御とリソース効率化
 */
export const useOptimizedThreeJSAnimation = () => {
  // アニメーションマネージャー
  const animationManager = new OptimizedAnimationManager();
  
  // 星空の最適化アニメーション
  const animateOptimizedStars = (stars) => {
    if (stars) {
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
    }
  };
  
  // 球体の最適化アニメーション
  const animateOptimizedSpheres = (meshesRef, hoveredMeshRef, currentTime) => {
    const timeSeconds = currentTime * 0.001;
    
    meshesRef.current.forEach((mesh, index) => {
      if (mesh.userData.type === 'completed') {
        const baseScale = mesh.userData.originalScale || 1;
        
        // ホバー状態の最適化処理
        if (mesh === hoveredMeshRef.current && mesh.userData.hoverStartTime) {
          const hoverTime = (currentTime - mesh.userData.hoverStartTime) * 0.005;
          const hoverScale = baseScale * (1.3 + Math.sin(hoverTime * 3) * 0.2);
          mesh.scale.setScalar(hoverScale);
          
          // 回転の最適化
          mesh.rotation.y += 0.02;
          mesh.rotation.x += 0.01;
          
          // 発光強度の最適化
          const emissiveIntensity = 0.6 + Math.sin(hoverTime * 4) * 0.2;
          mesh.material.emissiveIntensity = emissiveIntensity;
          if (mesh.userData.light) {
            mesh.userData.light.intensity = 0.8 + Math.sin(hoverTime * 4) * 0.2;
          }
        } else {
          // 通常のパルス（最適化版）
          const pulseScale = baseScale * (1 + Math.sin(timeSeconds * 2 + index * 0.5) * 0.05);
          mesh.scale.setScalar(pulseScale);
          
          // 発光の最適化
          const emissiveIntensity = 0.3 + Math.sin(timeSeconds * 3 + index) * 0.1;
          mesh.material.emissiveIntensity = emissiveIntensity;
          if (mesh.userData.light) {
            mesh.userData.light.intensity = 0.5 + Math.sin(timeSeconds * 3 + index) * 0.1;
          }
        }
      } else if (mesh.userData.type === 'floating') {
        animateOptimizedFloatingMission(mesh, hoveredMeshRef, currentTime);
      }
    });
  };
  
  // 浮遊ミッションの最適化アニメーション（位置固定版）
  const animateOptimizedFloatingMission = (mesh, hoveredMeshRef, currentTime) => {
    const timeSeconds = currentTime * 0.0008;
    const isCurrentlyHovered = mesh === hoveredMeshRef.current;
    
    // 回転のみ（位置は完全固定）
    const floatRotationSpeed = 0.008 + (mesh.userData.index % 4) * 0.003;
    mesh.rotation.x += floatRotationSpeed;
    mesh.rotation.y += floatRotationSpeed * 0.7;
    mesh.rotation.z += floatRotationSpeed * 0.4;
    
    // ホバー状態の最適化管理
    if (isCurrentlyHovered) {
      if (!mesh.userData.hoverStartTime) {
        mesh.userData.hoverStartTime = currentTime;
        mesh.userData.isHovering = true;
      }
      mesh.userData.hoverEndTime = null;
    } else {
      if (mesh.userData.isHovering) {
        if (!mesh.userData.hoverEndTime) {
          mesh.userData.hoverEndTime = currentTime;
        } else if (currentTime - mesh.userData.hoverEndTime > 150) {
          mesh.userData.hoverStartTime = null;
          mesh.userData.hoverEndTime = null;
          mesh.userData.isHovering = false;
        }
      }
    }
    
    // アニメーション実行（位置変更なし）
    if (mesh.userData.isHovering && mesh.userData.hoverStartTime) {
      // ホバー中の特別なアニメーション
      const hoverTime = (currentTime - mesh.userData.hoverStartTime) * 0.008;
      const hoverScale = 1.5 + Math.sin(hoverTime * 4) * 0.3;
      mesh.scale.setScalar(hoverScale);
      
      // ホバー時の追加回転効果
      mesh.rotation.x += 0.05;
      mesh.rotation.y += 0.04;
      mesh.rotation.z += 0.06;
      
      // ホバー時の発光
      if (mesh.material.emissiveIntensity !== undefined) {
        mesh.material.emissiveIntensity = 0.8 + Math.sin(hoverTime * 4) * 0.2;
      }
    } else {
      // 通常のパルス（スケールのみ）
      const pulseSize = 1 + Math.sin(timeSeconds * 2 + mesh.userData.index * 2) * 0.2;
      mesh.scale.setScalar(pulseSize);
      
      // 通常の発光
      if (mesh.material.emissiveIntensity !== undefined) {
        mesh.material.emissiveIntensity = 0.3 + Math.sin(timeSeconds * 4 + mesh.userData.index) * 0.2;
      }
    }
  };
  
  // パーティクルの最適化アニメーション（完全固定位置版）
  const animateOptimizedSceneParticles = (scene, currentTime) => {
    const timeSeconds = currentTime * 0.001;
    
    scene.traverse((object) => {
      // 浮遊ミッション周辺のパーティクル - 位置は完全固定
      if (object.userData.parentMission && object.userData.isParticle) {
        const time = timeSeconds * object.userData.speed * 0.8;
        
        // 位置は固定、透明度とスケールのみアニメーション
        if (object.material) {
          object.material.opacity = 0.2 + Math.sin(time * 3) * 0.2;
        }
        
        // 軽微なスケールアニメーション
        const scaleValue = 1 + Math.sin(time * 2) * 0.1;
        object.scale.setScalar(scaleValue);
      }
      
      // 糸のパーティクルアニメーション（位置固定、透明度のみ）
      if (object.userData.isThreadParticle && object.userData.baseOpacity !== undefined) {
        // パルス効果のみ（位置は変更しない）
        if (object.material) {
          const phase = object.userData.phase || 0;
          object.material.opacity = Math.max(0.1,
            object.userData.baseOpacity + Math.sin(timeSeconds * 2 + phase) * 0.2
          );
        }
      }
      
      // キラキラパーティクルの最適化アニメーション
      if (object.userData.isSparkle) {
        // スパークルの回転
        object.rotation.x += 0.02;
        object.rotation.y += 0.01;
        object.rotation.z += 0.015;
        
        // スパークルの透明度をアニメーション
        if (object.material) {
          object.material.opacity = 0.3 + Math.sin(timeSeconds * 5 + object.userData.phase) * 0.3;
        }
        
        // スパークルのスケールをアニメーション
        const scaleValue = 1 + Math.sin(timeSeconds * 3 + object.userData.phase) * 0.2;
        object.scale.setScalar(scaleValue);
      }
    });
  };
  
  // メイン最適化アニメーションループ
  const startOptimizedAnimation = (scene, stars, meshesRef, hoveredMeshRef, renderer, camera) => {
    const animationCallback = (currentTime) => {
      // 星空アニメーション
      animateOptimizedStars(stars);
      
      // 球体アニメーション
      animateOptimizedSpheres(meshesRef, hoveredMeshRef, currentTime);
      
      // パーティクルアニメーション
      animateOptimizedSceneParticles(scene, currentTime);
      
      // レンダリング
      if (renderer && camera && scene) {
        renderer.render(scene, camera);
      }
    };
    
    animationManager.addCallback(animationCallback);
    animationManager.start();
    
    // クリーンアップ関数を返す
    return () => {
      animationManager.removeCallback(animationCallback);
      animationManager.stop();
    };
  };
  
  // リソース解放
  const disposeOptimizedAnimation = () => {
    animationManager.dispose();
  };
  
  return {
    // 個別アニメーション関数（後方互換性）
    animateStars: animateOptimizedStars,
    animateSpheres: animateOptimizedSpheres,
    animateSceneParticles: animateOptimizedSceneParticles,
    
    // 最適化されたメイン関数
    startOptimizedAnimation,
    disposeOptimizedAnimation,
    
    // アニメーションマネージャー直接アクセス
    animationManager
  };
};

export default useOptimizedThreeJSAnimation;
