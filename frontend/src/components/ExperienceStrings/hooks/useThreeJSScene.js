import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { setupLighting, createCompletedSpheres, createFloatingMissions } from '../utils/sceneSetup'; // createStarFieldを削除
import { createConnectionThreads } from '../utils/connectionThreads';
import { createServerBasedSpheres, createServerBasedFloatingMissions, createServerBasedConnectionThreads } from '../utils/serverBasedSceneSetup';
import { useThreeJSAnimation } from './useThreeJSAnimation';
import { useServerVisualization } from './useServerVisualization';
import { animateParticles } from '../effects/particleEffects';

export const useThreeJSScene = (experiences) => {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef = useRef(null);
  const meshesRef = useRef([]);
  const particleSystemsRef = useRef([]);
  const hoveredMeshRef = useRef(null);
  
  const { animateStars, animateSpheres, animateSceneParticles } = useThreeJSAnimation();
  const { visualizationData, useServerData } = useServerVisualization(experiences);

  const initializeScene = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      alpha: true,
      antialias: true
    });
    
    // 参照を保存
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    raycasterRef.current = new THREE.Raycaster();
    raycasterRef.current.params.Points.threshold = 0.5;
    
    renderer.setSize(rect.width, rect.height);
    renderer.setClearColor(0xFFFFFF, 1); // 背景色を白色に設定
    camera.position.z = 7; // 6から7に変更
    
    // メッシュ配列をクリア
    meshesRef.current = [];
    particleSystemsRef.current = [];
    
    // シーンをクリア
    while(scene.children.length > 0) {
      const child = scene.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      scene.remove(child);
    }    // シーン要素を作成
    // const stars = createStarField(scene); // 星の作成を削除
    setupLighting(scene);
    
    // サーバー側データまたはクライアント側計算を使用
    let spheres;
    if (useServerData && visualizationData) {
      console.log('🖥️ Using server-side visualization data');
      spheres = createServerBasedSpheres(scene, visualizationData, meshesRef);
      createServerBasedConnectionThreads(scene, visualizationData);
      createServerBasedFloatingMissions(scene, visualizationData, meshesRef);
    } else {
      console.log('💻 Using client-side calculations');
      spheres = createCompletedSpheres(scene, experiences, meshesRef);
      createConnectionThreads(scene, spheres);
      createFloatingMissions(scene, experiences, meshesRef);
    }
    
    return { scene, camera, renderer }; // starsを削除
  };


  const startAnimation = () => { // stars引数を削除
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // 各種アニメーション処理
      // animateStars(stars); // 星のアニメーションを削除
      animateSpheres(meshesRef, hoveredMeshRef, sceneRef.current);
      animateSceneParticles(sceneRef.current);
      animateParticles(sceneRef.current, particleSystemsRef);
      
      // レンダリング
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    return animationId;
  };

  const handleResize = (canvas) => {
    const newRect = canvas.getBoundingClientRect();
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = newRect.width / newRect.height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newRect.width, newRect.height);
    }
  };

  const cleanup = () => {
    // トレイルのクリーンアップ
    meshesRef.current.forEach(mesh => {
      if (mesh.userData.trailGroup) {
        sceneRef.current?.remove(mesh.userData.trailGroup);
        mesh.userData.trailGroup.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
    });
    
    // ジオメトリとマテリアルのクリーンアップ
    sceneRef.current?.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    rendererRef.current?.dispose();
  };

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    raycasterRef,
    meshesRef,
    particleSystemsRef,
    hoveredMeshRef,
    initializeScene,
    startAnimation,
    handleResize,
    cleanup
  };
};
