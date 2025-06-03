import * as THREE from 'three';
import { createHoverParticles, createClickParticles } from '../effects/particleEffects';

export const useOptimizedThreeJSInteraction = (getInteractableMeshes) => {
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

    setMousePos({ x, y });
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;

    const meshes = getInteractableMeshes();
    if (raycasterRef.current && cameraRef.current && meshes.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      const newHoveredObject = intersects.length > 0 ? intersects[0].object : null;

      if (hoveredMeshRef.current !== newHoveredObject) {
        // 前回のホバーをリセット
        if (hoveredMeshRef.current) {
          if (hoveredMeshRef.current.material && hoveredMeshRef.current.material.emissiveIntensity !== undefined) {
            hoveredMeshRef.current.material.emissiveIntensity = hoveredMeshRef.current.userData.originalEmissive || 0.1;
          }
        }
        hoveredMeshRef.current = newHoveredObject;
        if (newHoveredObject) {
          // 体験データの取得
          let experienceData = null;
          if (newHoveredObject.userData.experience) {
            experienceData = newHoveredObject.userData.experience;
          } else if (newHoveredObject.userData.threadInfo) {
            experienceData = {
              title: `${newHoveredObject.userData.threadInfo.from} → ${newHoveredObject.userData.threadInfo.to}`,
              description: '体験の繋がり',
              category: '接続',
              type: 'connection',
              completed: true,
              date: new Date(),
              level: 1
            };
          }
          if (experienceData) {
            setHoveredExperience(experienceData);
            canvasRef.current.style.cursor = 'pointer';
            // パーティクル生成
            if (newHoveredObject.userData.type === 'completed' || newHoveredObject.userData.type === 'floating') {
              createHoverParticles(sceneRef, particleSystemsRef, newHoveredObject.position, newHoveredObject.material.color);
            }
            // グロー効果
            if (newHoveredObject.material && newHoveredObject.material.emissiveIntensity !== undefined) {
              newHoveredObject.userData.originalEmissive = newHoveredObject.material.emissiveIntensity;
              newHoveredObject.material.emissiveIntensity = 1.2;
            }
            newHoveredObject.userData.hoverStartTime = Date.now();
          } else {
            setHoveredExperience(null);
            canvasRef.current.style.cursor = 'default';
          }
        } else {
          // ホバー解除時は必ずhoveredMeshRef.current = nullとsetHoveredExperience(null)
          hoveredMeshRef.current = null;
          setHoveredExperience(null);
          canvasRef.current.style.cursor = 'default';
        }
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
    sceneRef,
    particleSystemsRef,
    onExperienceClick
  ) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;
    const meshes = getInteractableMeshes();
    if (raycasterRef.current && cameraRef.current && meshes.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData && onExperienceClick) {
          if (clickedObject.userData.experience) {
            createClickParticles(sceneRef, particleSystemsRef, clickedObject.position, clickedObject.material.color);
            onExperienceClick(clickedObject.userData.experience);
          } else if (clickedObject.userData.isConnectionThread) {
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