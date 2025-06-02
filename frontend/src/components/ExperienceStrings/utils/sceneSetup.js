import * as THREE from 'three';
import { getThemeColor } from '../../../utils/helpers';

// 背景の星空を作成
export const createStarField = (scene) => {
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 50;
    positions[i3 + 1] = (Math.random() - 0.5) * 50;
    positions[i3 + 2] = -20 + Math.random() * 20;
    
    const color = new THREE.Color();
    color.setHSL(Math.random() * 360, 0.5, 0.5 + Math.random() * 0.5);
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

// 照明を設定
export const setupLighting = (scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight2.position.set(-5, 3, 5);
  scene.add(directionalLight2);
};

// 完了済み体験の球体を作成
export const createCompletedSpheres = (scene, experiences, meshesRef) => {
  const completedExperiences = experiences.filter(exp => exp.completed);
  const spheres = [];
  
  completedExperiences.forEach((exp, index) => {
    // ジオメトリの最適化 - セグメント数を減らす
    const geometry = new THREE.SphereGeometry(0.25, 16, 16);
    const colorHex = getThemeColor(exp.id, exp.category);
    const color = new THREE.Color(colorHex);
    
    // より発光感のあるマテリアル
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.85,
      metalness: 0.3,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    // らせんベースの配置（やや角度をつける）
    const spiralTurns = 2; // らせんの巻数
    const totalHeight = 4; // 全体の高さ範囲
    const baseRadius = 2; // 基本半径
    
    // らせんの角度計算
    const t = index / Math.max(completedExperiences.length - 1, 1);
    const angle = t * spiralTurns * Math.PI * 2;
    
    // 高さの計算（下から上へ）
    const height = (t - 0.5) * totalHeight;
    
    // 半径の変化（上に行くほど少し広がる）
    const radiusVariation = baseRadius + t * 0.5;
    
    // ランダムな角度のずれ（±30度）
    const angleOffset = (Math.random() - 0.5) * Math.PI / 3;
    const finalAngle = angle + angleOffset;
    
    // 位置の計算
    sphere.position.x = Math.cos(finalAngle) * radiusVariation;
    sphere.position.y = height;
    sphere.position.z = Math.sin(finalAngle) * radiusVariation;
    
    // ランダムな距離のずれ（±20%）
    const distanceVariation = 0.8 + Math.random() * 0.4;
    sphere.position.multiplyScalar(distanceVariation);
    
    // 難易度に応じてサイズを調整
    const scaleMultiplier = 0.8 + (exp.level || 1) * 0.2;
    sphere.scale.setScalar(scaleMultiplier);
    
    sphere.userData = { 
      experience: exp, 
      type: 'completed',
      originalScale: scaleMultiplier,
      glowColor: color
    };
    
    // グロー効果のためのポイントライト
    const light = new THREE.PointLight(color, 0.5, 2);
    light.position.copy(sphere.position);
    sphere.userData.light = light;
    scene.add(light);
    
    scene.add(sphere);
    spheres.push(sphere);
    meshesRef.current.push(sphere);
  });
  
  return spheres;
};

// 進行中ミッションの球体を作成
export const createFloatingMissions = (scene, experiences, meshesRef) => {
  const incompleteMissions = experiences.filter(exp => !exp.completed);
  
  incompleteMissions.forEach((mission, index) => {
    const geometry = new THREE.SphereGeometry(0.2, 24, 24);
    const colorHex = getThemeColor(mission.id, mission.category);
    
    const material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.85,
      metalness: 0.05,
      roughness: 0.2,
      emissive: new THREE.Color(colorHex).multiplyScalar(0.15),
      emissiveIntensity: 0.3
    });
    const missionMesh = new THREE.Mesh(geometry, material);
    
    const baseAngle = (index / Math.max(incompleteMissions.length, 1)) * Math.PI * 2;
    const floatRadius = 4.0;
    
    missionMesh.position.x = Math.cos(baseAngle) * floatRadius;
    missionMesh.position.y = Math.sin(baseAngle) * floatRadius;
    missionMesh.position.z = Math.sin(baseAngle * 2) * 1.5;
    
    missionMesh.userData = { experience: mission, type: 'floating', index: index };
    
    scene.add(missionMesh);
    meshesRef.current.push(missionMesh);
    
    // トレイル効果用の初期化
    const trailGroup = new THREE.Group();
    missionMesh.userData.trail = [];
    missionMesh.userData.trailGroup = trailGroup;
    scene.add(trailGroup);
    
    // 周囲のパーティクル効果
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.4
    });
    
    for (let p = 0; p < 5; p++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(missionMesh.position);
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      ));
      particle.userData = { 
        parentMission: missionMesh, 
        offset: new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8
        ),
        speed: 0.001 + Math.random() * 0.002
      };
      scene.add(particle);
    }
  });
};
