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
  const animateSpheres = (meshesRef, hoveredMeshRef, scene) => {
    meshesRef.current.forEach((mesh, index) => {
      if (mesh.userData.type === 'completed') {
        const baseScale = mesh.userData.originalScale || 1;
        
        // ホバー時の特別なスケールアニメーション
        if (mesh === hoveredMeshRef.current && mesh.userData.hoverStartTime) {
          const hoverTime = (Date.now() - mesh.userData.hoverStartTime) * 0.005;
          const hoverScale = baseScale * (1.3 + Math.sin(hoverTime * 3) * 0.2);
          mesh.scale.setScalar(hoverScale);
          
          // ホバー時の回転効果
          mesh.rotation.y += 0.02;
          mesh.rotation.x += 0.01;
          
          // 発光強度を上げる
          mesh.material.emissiveIntensity = 0.6 + Math.sin(hoverTime * 4) * 0.2;
          if (mesh.userData.light) {
            mesh.userData.light.intensity = 0.8 + Math.sin(hoverTime * 4) * 0.2;
          }
        } else {
          // 通常のパルス
          const pulseScale = baseScale * (1 + Math.sin(Date.now() * 0.002 + index * 0.5) * 0.05);
          mesh.scale.setScalar(pulseScale);
          
          // 通常の発光
          mesh.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003 + index) * 0.1;
          if (mesh.userData.light) {
            mesh.userData.light.intensity = 0.5 + Math.sin(Date.now() * 0.003 + index) * 0.1;
          }
        }
      } else if (mesh.userData.type === 'floating') {
        animateFloatingMission(mesh, hoveredMeshRef);
      }
    });
    // キラキラパーティクルのアニメーション
    animateSparkles(scene);
  };

  // キラキラパーティクルのアニメーション
  const animateSparkles = (scene) => {
    scene.traverse((object) => {
      if (object.userData.isSparkle) {
        const time = Date.now() * 0.001;
        // スパークルの回転
        object.rotation.x += 0.02;
        object.rotation.y += 0.01;
        object.rotation.z += 0.015;
        
        // スパークルの透明度をアニメーション
        if (object.material) {
          object.material.opacity = 0.3 + Math.sin(time * 5 + object.userData.phase) * 0.3;
        }
        
        // スパークルのスケールをアニメーション
        const scaleValue = 1 + Math.sin(time * 3 + object.userData.phase) * 0.2;
        object.scale.setScalar(scaleValue);
      }
    });
  };

  // 浮遊ミッションのアニメーション
  const animateFloatingMission = (mesh, hoveredMeshRef) => {
    const time = Date.now() * 0.0008;
    
    // 位置は一切変更しない（初期位置のまま固定）
    // アニメーションは回転とスケールのみ
    
    const isCurrentlyHovered = mesh === hoveredMeshRef.current;
    
    // 常時回転（浮遊ミッション用）
    const floatRotationSpeed = 0.008 + (mesh.userData.index % 4) * 0.003;
    mesh.rotation.x += floatRotationSpeed;
    mesh.rotation.y += floatRotationSpeed * 0.7;
    mesh.rotation.z += floatRotationSpeed * 0.4;
    
    // ホバー状態の安定化
    if (isCurrentlyHovered) {
      if (!mesh.userData.hoverStartTime) {
        mesh.userData.hoverStartTime = Date.now();
        mesh.userData.isHovering = true;
      }
      mesh.userData.hoverEndTime = null;
    } else {
      if (mesh.userData.isHovering) {
        if (!mesh.userData.hoverEndTime) {
          mesh.userData.hoverEndTime = Date.now();
        } else if (Date.now() - mesh.userData.hoverEndTime > 150) { // 150ms遅延
          mesh.userData.hoverStartTime = null;
          mesh.userData.hoverEndTime = null;
          mesh.userData.isHovering = false;
        }
      }
    }
    
    // アニメーション実行（位置変更なし）
    if (mesh.userData.isHovering && mesh.userData.hoverStartTime) {
      // ホバー中の特別なアニメーション
      const hoverTime = (Date.now() - mesh.userData.hoverStartTime) * 0.008;
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
      const pulseSize = 1 + Math.sin(time * 2 + mesh.userData.index * 2) * 0.2;
      mesh.scale.setScalar(pulseSize);
      
      // 通常の発光
      if (mesh.material.emissiveIntensity !== undefined) {
        mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 4 + mesh.userData.index) * 0.2;
      }
    }
    
    // トレイル効果は停止（位置固定なので不要）
    // updateTrailEffect(mesh); // コメントアウト
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

  // パーティクルのアニメーション（浮遊ミッション位置変更を停止）
  const animateSceneParticles = (scene) => {
    scene.traverse((object) => {
      // 浮遊ミッション本体の位置は変更しない
      if (object.userData.parentMission && object.userData.isParticle) {
        const time = Date.now() * object.userData.speed * 0.8;
        const parent = object.userData.parentMission;
        const offset = object.userData.offset;
        
        // パーティクルのみ親の周りで動く
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
      
      // 糸のパーティクルアニメーション（位置は固定、透明度のみ変化）
      if (object.userData.isThreadParticle && object.userData.baseOpacity !== undefined) {
        const time = Date.now() * 0.001;
        // パルス効果のみ（位置は変更しない）
        if (object.material) {
          const phase = object.userData.phase || 0;
          object.material.opacity = Math.max(0.1, 
            object.userData.baseOpacity + Math.sin(time * 2 + phase) * 0.2
          );
        }
      }
    });
  };

  return {
    animateStars,
    animateSpheres,
    animateSceneParticles,
    animateSparkles
  };
};
