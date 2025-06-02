import { useRef } from 'react';
import * as THREE from 'three';

// アニメーション関連のロジック
export const useThreeJSAnimation = () => {
  // 星空のアニメーション
  const animateStars = (stars) => {
    if (stars) {
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
    }
  };

  // 球体のアニメーション
  const animateSpheres = (meshesRef, hoveredMeshRef) => {
    meshesRef.current.forEach((mesh, index) => {
      if (mesh.userData.type === 'completed') {
        // ホバー時の特別なスケールアニメーション
        if (mesh === hoveredMeshRef.current && mesh.userData.hoverStartTime) {
          const hoverTime = (Date.now() - mesh.userData.hoverStartTime) * 0.005;
          const hoverScale = 1.3 + Math.sin(hoverTime * 3) * 0.2;
          mesh.scale.setScalar(hoverScale);
          
          // ホバー時の回転効果
          mesh.rotation.y += 0.02;
          mesh.rotation.x += 0.01;
        } else {
          // 通常のパルス
          const pulseScale = 1 + Math.sin(Date.now() * 0.002 + index * 0.5) * 0.1;
          mesh.scale.setScalar(pulseScale);
        }
        
        // ホバーしていない球体の発光を動的に変更
        if (mesh !== hoveredMeshRef.current && mesh.material.emissiveIntensity !== undefined) {
          mesh.material.emissiveIntensity = 0.1 + Math.sin(Date.now() * 0.003 + index) * 0.05;
        }
      } else if (mesh.userData.type === 'floating') {
        animateFloatingMission(mesh, hoveredMeshRef);
      }
    });
  };

  // 浮遊ミッションのアニメーション
  const animateFloatingMission = (mesh, hoveredMeshRef) => {
    const time = Date.now() * 0.0008;
    const baseAngle = (mesh.userData.index / Math.max(1, 1)) * Math.PI * 2;
    const floatRadius = 4.0 + Math.sin(time * 0.5 + mesh.userData.index) * 0.5;
    const verticalFloat = Math.sin(time * 0.7 + mesh.userData.index * 1.5) * 1.5;
    
    const newPos = new THREE.Vector3(
      Math.cos(baseAngle + time * 0.15) * floatRadius,
      Math.sin(baseAngle + time * 0.15) * floatRadius,
      verticalFloat
    );
    
    // ホバー時の特別なアニメーション
    if (mesh === hoveredMeshRef.current && mesh.userData.hoverStartTime) {
      const hoverTime = (Date.now() - mesh.userData.hoverStartTime) * 0.008;
      const hoverScale = 1.5 + Math.sin(hoverTime * 4) * 0.3;
      mesh.scale.setScalar(hoverScale);
      
      // ホバー時の振動効果
      newPos.add(new THREE.Vector3(
        Math.sin(hoverTime * 8) * 0.1,
        Math.cos(hoverTime * 8) * 0.1,
        Math.sin(hoverTime * 6) * 0.05
      ));
      
      // ホバー時の回転効果
      mesh.rotation.z += 0.03;
    } else {
      // 通常のパルス
      const pulseSize = 1 + Math.sin(time * 2 + mesh.userData.index * 2) * 0.2;
      mesh.scale.setScalar(pulseSize);
    }
    
    // トレイル効果の処理
    updateTrailEffect(mesh);
    
    mesh.position.copy(newPos);
    
    // 材質の発光を動的に変更
    if (mesh !== hoveredMeshRef.current && mesh.material.emissiveIntensity !== undefined) {
      mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 4 + mesh.userData.index) * 0.2;
    }
  };

  // トレイル効果の更新
  const updateTrailEffect = (mesh) => {
    // トレイル効果
    mesh.userData.trail.push({
      position: mesh.position.clone(),
      opacity: 0.6
    });
    
    // トレイルの長さを制限
    if (mesh.userData.trail.length > 30) {
      mesh.userData.trail.shift();
    }
    
    // 古いトレイルをクリア
    if (mesh.userData.trailGroup) {
      while (mesh.userData.trailGroup.children.length > 0) {
        const child = mesh.userData.trailGroup.children[0];
        mesh.userData.trailGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    }
    
    // 新しいトレイルを作成
    mesh.userData.trail.forEach((point, idx) => {
      if (idx > 0) {
        const trailGeometry = new THREE.SphereGeometry(
          0.05 * (idx / mesh.userData.trail.length),
          8, 
          8
        );
        const trailMaterial = new THREE.MeshBasicMaterial({
          color: mesh.material.color,
          transparent: true,
          opacity: point.opacity * (idx / mesh.userData.trail.length),
          blending: THREE.AdditiveBlending
        });
        const trailSphere = new THREE.Mesh(trailGeometry, trailMaterial);
        trailSphere.position.copy(point.position);
        mesh.userData.trailGroup.add(trailSphere);
      }
      
      point.opacity *= 0.98;
    });
  };

  // パーティクルのアニメーション
  const animateSceneParticles = (scene) => {
    scene.traverse((object) => {
      if (object.userData.parentMission) {
        const time = Date.now() * object.userData.speed * 0.8;
        const parent = object.userData.parentMission;
        const offset = object.userData.offset;
        
        object.position.copy(parent.position);
        object.position.add(new THREE.Vector3(
          offset.x * Math.sin(time),
          offset.y * Math.cos(time),
          offset.z * Math.sin(time * 1.5)
        ));
        
        // パーティクルの透明度をアニメーション
        if (object.material) {
          object.material.opacity = 0.2 + Math.sin(time * 3) * 0.2;
        }
      }
      
      // 糸のパーティクルアニメーション
      if (object.userData.isThreadParticle) {
        const time = Date.now() * 0.001;
        // パルス効果
        object.material.opacity = object.userData.baseOpacity + 
          Math.sin(time * 2 + object.userData.phase) * 0.2;
        // 微妙な上下動
        object.position.y += Math.sin(time * 3 + object.userData.phase) * 0.001;
      }
    });
  };

  return {
    animateStars,
    animateSpheres,
    animateSceneParticles
  };
};
