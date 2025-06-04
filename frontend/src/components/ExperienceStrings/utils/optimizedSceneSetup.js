import * as THREE from 'three';
import { getThemeColor } from '../../../utils/helpers';
import { optimizedThreeUtils } from './optimizedThreeUtils';

/**
 * 最適化されたシーンセットアップ
 * リソースプーリングと事前計算を使用
 */

// 最適化された星空作成（美しい星空）
export const createOptimizedStarField = (scene) => {
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 1500; // 少し密度を上げる
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount); // サイズ属性を追加
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    // 固定ランダム（シード値使用）
    const seed1 = optimizedThreeUtils.seededRandom(i * 12.9898);
    const seed2 = optimizedThreeUtils.seededRandom(i * 78.233);
    const seed3 = optimizedThreeUtils.seededRandom(i * 39.346);
    
    // 球状に星を配置して視点変更時の隙間を防ぐ
    const radius = 40 + seed3 * 40; // 40-80の距離に配置
    const theta = seed1 * Math.PI * 2; // 水平角度
    const phi = seed2 * Math.PI; // 垂直角度
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);     // X
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta); // Y
    positions[i3 + 2] = radius * Math.cos(phi);                   // Z    
    // 美しい星の色設定
    const color = new THREE.Color();
    if (seed1 < 0.5) {
      // 白い星（明るめ）
      color.setHSL(0.15, 0.2, 0.7 + seed2 * 0.3);
    } else if (seed1 < 0.75) {
      // 青い星（美しい）
      color.setHSL(0.6, 0.5, 0.6 + seed2 * 0.4);
    } else if (seed1 < 0.9) {
      // 黄色い星
      color.setHSL(0.1, 0.6, 0.5 + seed2 * 0.4);
    } else {
      // 赤い星（少し）
      color.setHSL(0.0, 0.7, 0.4 + seed2 * 0.3);
    }
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    // 星のサイズに変化を
    sizes[i] = 0.3 + seed3 * 1.2; // 0.3から1.5の範囲
  }
  
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const starsMaterial = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    map: createStarTexture() // 星のテクスチャを追加
  });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
    return stars;
};

// 星のテクスチャを作成
const createStarTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  
  // 放射状グラデーション
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
  // 3Dテクスチャ関連の警告を防止
  texture.flipY = false;
  texture.premultiplyAlpha = false;
  return texture;
};

// 最適化された照明設定
export const setupOptimizedLighting = (scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight2.position.set(-5, 3, 5);
  scene.add(directionalLight2);
  
  return { ambientLight, directionalLight, directionalLight2 };
};

// 最適化された完了済み球体作成
export const createOptimizedCompletedSpheres = (scene, experiences, meshesRef) => {
  const completedExperiences = experiences.filter(exp => exp.completed);
  const spheres = [];
  
  // 事前計算された位置を取得
  const positions = optimizedThreeUtils.precomputeSpiralPositions(completedExperiences.length);
  
  completedExperiences.forEach((exp, index) => {
    // 本当の正八面体（detail=0）
    const t = index / Math.max(completedExperiences.length - 1, 1);
    const geometry = new THREE.OctahedronGeometry(0.2 + t * 0.1, 0);
    const colorHex = getThemeColor(exp.id, exp.category);
    const material = optimizedThreeUtils.getMaterial('completed_sphere', colorHex);
    const sphere = new THREE.Mesh(geometry, material);
    // 事前計算された位置を適用
    const pos = positions[index];
    sphere.position.set(pos.x, pos.y, pos.z);
    sphere.scale.setScalar(pos.scale);
    sphere.userData = {
      experience: exp,
      type: 'completed',
      originalScale: pos.scale,
      glowColor: new THREE.Color(colorHex),
      seed: exp.id || index,
      spiralIndex: index,
      depth: pos.z
    };    // 最適化されたポイントライト（より強力）
    const light = new THREE.PointLight(new THREE.Color(colorHex), 0.8, 3);
    light.position.copy(sphere.position);
    sphere.userData.light = light;
    scene.add(light);
    scene.add(sphere);
    spheres.push(sphere);
    meshesRef.current.push(sphere);
  });
  
  return spheres;
};

// 最適化された浮遊ミッション作成
export const createOptimizedFloatingMissions = (scene, experiences, meshesRef, completedSpheres = []) => {
  const incompleteMissions = experiences.filter(exp => !exp.completed);
  
  // 完了済み球体の位置情報を取得
  const completedPositions = completedSpheres.map(sphere => sphere.position);
  
  // 事前計算された位置を取得（完了済み位置を考慮）
  const positions = optimizedThreeUtils.precomputeFloatingPositions(incompleteMissions.length, completedPositions);
  
  incompleteMissions.forEach((mission, index) => {
    // 本当の正八面体（detail=0）
    const geometry = new THREE.OctahedronGeometry(0.2, 0);
    const colorHex = getThemeColor(mission.id, mission.category);
    const material = optimizedThreeUtils.getMaterial('floating_mission', colorHex);
    const missionMesh = new THREE.Mesh(geometry, material);
    // 事前計算された位置を適用
    const pos = positions[index];
    missionMesh.position.set(pos.x, pos.y, pos.z);
    missionMesh.userData = {
      experience: mission,
      type: 'floating',
      index: index,
      seed: pos.seed,
      basePosition: missionMesh.position.clone(),
      positionFixed: true
    };    scene.add(missionMesh);
    meshesRef.current.push(missionMesh);
    
    // 浮遊ミッションにもライトを追加
    const missionLight = new THREE.PointLight(new THREE.Color(colorHex), 0.6, 2.5);
    missionLight.position.copy(missionMesh.position);
    missionMesh.userData.light = missionLight;
    scene.add(missionLight);
    
    // 最適化されたパーティクル効果（固定位置）
    createOptimizedMissionParticles(scene, missionMesh, colorHex, pos.seed);
  });
};

// 最適化されたミッションパーティクル作成
const createOptimizedMissionParticles = (scene, parentMission, colorHex, seed) => {
  // プールからジオメトリとマテリアルを取得
  const particleGeometry = optimizedThreeUtils.geometryPool.particle_tiny;
  const particleMaterial = optimizedThreeUtils.getMaterial('particle', colorHex, { opacity: 0.4 });
  
  for (let p = 0; p < 5; p++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(parentMission.position);
    
    // 固定されたオフセット（事前計算）
    const offsetX = optimizedThreeUtils.seededRandom(seed * 5.678 + p) * 0.8 - 0.4;
    const offsetY = optimizedThreeUtils.seededRandom(seed * 6.789 + p) * 0.8 - 0.4;
    const offsetZ = optimizedThreeUtils.seededRandom(seed * 7.890 + p) * 0.8 - 0.4;
    
    particle.position.add(new THREE.Vector3(offsetX, offsetY, offsetZ));
    
    particle.userData = {
      parentMission: parentMission,
      offset: new THREE.Vector3(offsetX, offsetY, offsetZ),
      speed: 0.001 + optimizedThreeUtils.seededRandom(seed * 8.901 + p) * 0.002,
      isParticle: true,
      isStatic: true // 完全固定
    };
    
    scene.add(particle);
  }
};

// 最適化された接続糸作成
export const createOptimizedConnectionThreads = (scene, spheres) => {
  if (spheres.length < 2) return;
  
  for (let i = 0; i < spheres.length - 1; i++) {
    const start = spheres[i].position;
    const end = spheres[i + 1].position;
    
    // 接続IDを生成
    const connectionId = spheres[i].userData.experience.id + spheres[i + 1].userData.experience.id;
    
    // 事前計算されたカーブを取得
    const curveData = optimizedThreeUtils.getConnectionCurve(start, end, connectionId);
    
    // 最適化された糸セグメント作成
    createOptimizedThreadSegments(scene, curveData, spheres[i], spheres[i + 1]);
    
    // 最適化された糸パーティクル作成
    createOptimizedThreadParticles(scene, curveData, spheres[i], spheres[i + 1]);
  }
};

// 最適化された糸セグメント作成
const createOptimizedThreadSegments = (scene, curveData, startSphere, endSphere) => {
  const { points } = curveData;
  
  // プールからジオメトリを取得
  const cylinderGeometry = optimizedThreeUtils.geometryPool.cylinder_thread;
  
  for (let j = 0; j < points.length - 1; j++) {
    const currentPoint = points[j];
    const nextPoint = points[j + 1];
    
    const direction = new THREE.Vector3().subVectors(nextPoint, currentPoint);
    const length = direction.length();
    direction.normalize();
      // 色のグラデーション
    const t = j / (points.length - 1);
    const startColor = startSphere.material.color;
    const endColor = endSphere.material.color;
    const segmentColor = new THREE.Color().lerpColors(startColor, endColor, t);
      // 発光効果を強化したマテリアル
    const enhancedThreadMaterial = new THREE.MeshPhongMaterial({
      color: segmentColor,
      transparent: true,
      opacity: 0.95,
      emissive: segmentColor,
      emissiveIntensity: 0.6, // 発光強度をさらに増加
      shininess: 150,
      specular: new THREE.Color(0xffffff).multiplyScalar(0.5)
    });
    
    const cylinder = new THREE.Mesh(cylinderGeometry, enhancedThreadMaterial);
    
    // スケールで長さを調整
    cylinder.scale.set(1, length, 1);
    
    // 位置と回転を設定
    const midpoint = new THREE.Vector3().addVectors(currentPoint, nextPoint).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);
    
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    cylinder.quaternion.copy(quaternion);
    
    cylinder.userData = { isConnectionThread: true, isStatic: true };
    scene.add(cylinder);
  }
};

// 最適化された糸パーティクル作成
const createOptimizedThreadParticles = (scene, curveData, startSphere, endSphere) => {
  const { curve, distance } = curveData;
  const particleCount = Math.max(5, Math.floor(distance * 3)); // パーティクル数を増加
  
  // プールからジオメトリを取得
  const particleGeometry = optimizedThreeUtils.geometryPool.particle_small;
  
  for (let j = 0; j < particleCount; j++) {
    const t = j / particleCount;
    const point = curve.getPoint(t);
    
    // 色のグラデーション
    const particleColor = new THREE.Color().lerpColors(
      new THREE.Color(getThemeColor(startSphere.userData.experience.id)),
      new THREE.Color(getThemeColor(endSphere.userData.experience.id)),
      t
    );
      // 強化された発光パーティクル
    const enhancedParticleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    
    const particle = new THREE.Mesh(particleGeometry, enhancedParticleMaterial);
    particle.position.copy(point);
    
    // パーティクルに小さなポイントライトを追加
    const particleLight = new THREE.PointLight(particleColor, 0.3, 1.5);
    particleLight.position.copy(point);
    scene.add(particleLight);
    
    particle.userData = {
      isThreadParticle: true,
      baseOpacity: 0.9,
      phase: (j / particleCount) * Math.PI * 2,
      isStatic: true,
      light: particleLight
    };
    
    scene.add(particle);
  }
};

// リソース解放関数
export const disposeOptimizedScene = () => {
  optimizedThreeUtils.dispose();
};

// convertMissionToCompletedSphere関数をexportとして追加
export function convertMissionToCompletedSphere(scene, missionMesh, targetMesh) {
  try {
    // ミッションのマテリアルを完了済み球体のマテリアルに変更
    const experience = missionMesh.userData.experience;
    if (!experience) {
      console.warn('⚠️ ミッション体験データが見つかりません');
      return;
    }

    const colorHex = getThemeColor(experience.id, experience.category);
    const completedMaterial = optimizedThreeUtils.getMaterial('completed_sphere', colorHex);
    
    // マテリアルを変更（メモリリーク対策）
    if (missionMesh.material && !missionMesh.userData?.isPooled) {
      missionMesh.material.dispose(); // 古いマテリアルを解放
    }
    missionMesh.material = completedMaterial;
    
    // userDataを更新（完了状態を即座に反映）
    missionMesh.userData.type = 'completed';
    missionMesh.userData.experience = { ...experience, completed: true };
    
    // ライトの色も更新
    if (missionMesh.userData.light) {
      missionMesh.userData.light.color.setHex(colorHex);
      missionMesh.userData.light.intensity = 0.8; // 完了済みのライト強度
    }
    
    // 完了済み球体のスケールに調整
    missionMesh.scale.setScalar(1.0);
    
    console.log('✅ ミッションを完了済み球体に変換しました:', experience.title);
  } catch (error) {
    console.error('❌ ミッション変換中にエラーが発生しました:', error);
  }
}

export function animateAttachFloatingMission(scene, missionMesh, targetMesh, onComplete) {
  const duration = 400; // ms
  const start = { ...missionMesh.position };
  const end = { ...targetMesh.position };
  const startTime = performance.now();
  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    
    // より滑らかな補間（ease-in-out）
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    // 線形補間
    missionMesh.position.x = start.x + (end.x - start.x) * easeT;
    missionMesh.position.y = start.y + (end.y - start.y) * easeT;
    missionMesh.position.z = start.z + (end.z - start.z) * easeT;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // クリーンアップ（パーティクルやライトのみ）
      if (missionMesh.userData.trailGroup) {
        scene.remove(missionMesh.userData.trailGroup);
        missionMesh.userData.trailGroup.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        missionMesh.userData.trailGroup = null;
      }
        // ミッションメッシュを削除せず、完了済み球体として変換
      convertMissionToCompletedSphere(scene, missionMesh, targetMesh);
      
      // 状態更新を即座に実行（遅延を削除）
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }
  requestAnimationFrame(animate);
}
