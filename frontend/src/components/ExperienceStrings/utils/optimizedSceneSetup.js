import * as THREE from 'three';
import { getThemeColor } from '../../../utils/helpers';
import { optimizedThreeUtils } from './optimizedThreeUtils';

/**
 * 最適化されたシーンセットアップ
 * リソースプーリングと事前計算を使用
 */

// 最適化された星空作成
export const createOptimizedStarField = (scene) => {
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    // 固定ランダム（シード値使用）
    const seed1 = optimizedThreeUtils.seededRandom(i * 12.9898);
    const seed2 = optimizedThreeUtils.seededRandom(i * 78.233);
    const seed3 = optimizedThreeUtils.seededRandom(i * 39.346);
    
    positions[i3] = (seed1 - 0.5) * 50;
    positions[i3 + 1] = (seed2 - 0.5) * 50;
    positions[i3 + 2] = -20 + seed3 * 20;
    
    const color = new THREE.Color();
    const hue = seed1 * 360;
    color.setHSL(hue, 0.5, 0.5 + seed2 * 0.5);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }
  
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const starsMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  
  return stars;
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
    };
    // 最適化されたポイントライト
    const light = new THREE.PointLight(new THREE.Color(colorHex), 0.5, 2);
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
export const createOptimizedFloatingMissions = (scene, experiences, meshesRef) => {
  const incompleteMissions = experiences.filter(exp => !exp.completed);
  
  // 事前計算された位置を取得
  const positions = optimizedThreeUtils.precomputeFloatingPositions(incompleteMissions.length);
  
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
    };
    scene.add(missionMesh);
    meshesRef.current.push(missionMesh);
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
    const segmentColor = new THREE.Color().lerpColors(
      new THREE.Color(getThemeColor(startSphere.userData.experience.id)),
      new THREE.Color(getThemeColor(endSphere.userData.experience.id)),
      t
    );
    
    // プールからマテリアルを取得
    const cylinderMaterial = optimizedThreeUtils.getMaterial('thread', segmentColor);
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    
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
  const particleCount = Math.max(3, Math.floor(distance * 2)); // パーティクル数を削減
  
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
    
    // プールからマテリアルを取得
    const particleMaterial = optimizedThreeUtils.getMaterial('particle', particleColor, {
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(point);
    particle.userData = {
      isThreadParticle: true,
      baseOpacity: 0.6,
      phase: (j / particleCount) * Math.PI * 2,
      isStatic: true
    };
    
    scene.add(particle);
  }
};

// リソース解放関数
export const disposeOptimizedScene = () => {
  optimizedThreeUtils.dispose();
};
