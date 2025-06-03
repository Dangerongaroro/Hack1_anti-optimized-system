import { useRef } from 'react';
import * as THREE from 'three';
import { createHoverParticles, createClickParticles } from '../effects/particleEffects';

export const useThreeJSInteraction = () => {
  // マウスホイールでズーム
  const handleWheel = (e, cameraRef) => {
    if (cameraRef.current) {
      e.preventDefault();
      const delta = e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(2, Math.min(10, cameraRef.current.position.z + delta));
    }
  };

  // マウス移動時の処理
  const handleMouseMove = (
    e,
    canvasRef,
    mouseRef,
    raycasterRef,
    cameraRef,
    meshesRef,
    hoveredMeshRef,
    sceneRef,
    particleSystemsRef,
    setHoveredExperience,
    setMousePos
  ) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // マウス座標を更新（ツールチップ用）
    setMousePos({ x, y });

    // Three.js用の正規化座標
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;

    // レイキャスティングでホバー判定
    if (raycasterRef.current && cameraRef.current && meshesRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshesRef.current);

      // 前回のホバーをリセット
      if (hoveredMeshRef.current && (!intersects.length || intersects[0].object !== hoveredMeshRef.current)) {
        hoveredMeshRef.current.material.emissiveIntensity = hoveredMeshRef.current.userData.originalEmissive || 0.1;
        hoveredMeshRef.current = null;
      }

      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        if (hoveredObject.userData && hoveredObject.userData.experience) {
          // スマホ版ではホバーエフェクトを無効にする
          if (window.innerWidth > 768) {
            // 新しいオブジェクトをホバーした場合のみエフェクトを発生
            if (hoveredMeshRef.current !== hoveredObject) {
              setHoveredExperience(hoveredObject.userData.experience);
              canvasRef.current.style.cursor = 'pointer';

              // ホバー時のパーティクルエフェクト
              createHoverParticles(sceneRef, particleSystemsRef, hoveredObject.position, hoveredObject.material.color);

              // グロー効果を追加
              hoveredMeshRef.current = hoveredObject;
              hoveredObject.userData.originalEmissive = hoveredObject.material.emissiveIntensity;
              hoveredObject.material.emissiveIntensity = 1.2;

              // ホバー時のスケールアニメーション開始
              hoveredObject.userData.hoverStartTime = Date.now();
            }
          }
        }
      } else {
        setHoveredExperience(null);
        canvasRef.current.style.cursor = 'default';
      }
    }
  };

  // クリック処理
  const handleCanvasClick = (
    e,
    canvasRef,
    mouseRef,
    raycasterRef,
    cameraRef,
    meshesRef,
    sceneRef,
    particleSystemsRef,
    onExperienceClick
  ) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Three.js用の正規化座標
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;
    
    // レイキャスティングでクリック判定
    if (raycasterRef.current && cameraRef.current && meshesRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshesRef.current);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
       if (clickedObject.userData && onExperienceClick) {
          if (clickedObject.userData.experience) {
            // 球体をクリックした場合
            createClickParticles(sceneRef, particleSystemsRef, clickedObject.position, clickedObject.material.color);
            onExperienceClick(clickedObject.userData.experience);
          } else if (clickedObject.userData.isConnectionThread) {
            // 糸をクリックした場合
            createClickParticles(sceneRef, particleSystemsRef, clickedObject.position, clickedObject.material.color);
            onExperienceClick(clickedObject.userData.experience);
          }
        }
      }
    }
  };

  return {
    handleWheel,
    handleMouseMove,
    handleCanvasClick
  };
};
