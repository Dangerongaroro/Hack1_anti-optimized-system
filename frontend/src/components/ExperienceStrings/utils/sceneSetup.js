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
    // シード値を使った固定ランダム
    const seed1 = Math.sin(i * 12.9898) * 43758.5453;
    const seed2 = Math.sin(i * 78.233) * 43758.5453;
    const seed3 = Math.sin(i * 39.346) * 43758.5453;
    
    positions[i3] = (seed1 - Math.floor(seed1) - 0.5) * 50;
    positions[i3 + 1] = (seed2 - Math.floor(seed2) - 0.5) * 50;
    positions[i3 + 2] = -20 + (seed3 - Math.floor(seed3)) * 20;
    
    const color = new THREE.Color();
    const hue = (seed1 - Math.floor(seed1)) * 360;
    color.setHSL(hue, 0.5, 0.5 + (seed2 - Math.floor(seed2)) * 0.5);
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

// シード値を使った固定ランダム関数
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 完了済み体験の球体を作成（奥から手前へのらせん配置）
export const createCompletedSpheres = (scene, experiences, meshesRef) => {
  const completedExperiences = experiences.filter(exp => exp.completed);
  console.log('=== createCompletedSpheres デバッグ ===');
  console.log('完了済み体験数:', completedExperiences.length);
  console.log('完了済み体験一覧:', completedExperiences);
  
  const spheres = [];
  
  completedExperiences.forEach((exp, index) => {
    console.log(`=== 球体 ${index} 作成開始 ===`);
    console.log('体験データ:', exp);
    console.log('データ検証:', {
      hasTitle: !!exp.title,
      hasCategory: !!exp.category,
      hasLevel: exp.level !== undefined,
      hasId: !!exp.id,
      hasCompleted: exp.completed !== undefined
    });
    
    // データ検証を強化
    if (!exp || typeof exp !== 'object') {
      console.warn('❌ Invalid experience data at index', index, ':', exp);
      return;
    }
    
    // 安全なタイトルの取得
    const safeTitle = exp.title || exp.name || `体験 ${index + 1}`;
    const safeCategory = exp.category || 'その他';
    const safeLevel = exp.level || 1;
    
    console.log('安全なデータ:', { safeTitle, safeCategory, safeLevel });
    
    // らせん配置の計算
    const t = index / Math.max(completedExperiences.length - 1, 1);
    const radius = 2.5 + t * 1.5;
    const angle = t * Math.PI * 4; // より多くの回転
    const height = (t - 0.5) * 4; // より高い範囲
    
    // 横向きらせん（x軸方向に伸びる）
    const position = {
      x: (t - 0.5) * 6, // x方向に奥行きを持たせる
      y: Math.sin(angle) * radius,
      z: Math.cos(angle) * radius
    };
    
    // 球体作成
    const geometry = new THREE.OctahedronGeometry(0.2 + t * 0.1, 16, 16);
    const colorHex = getThemeColor(exp.id, exp.category);
    const color = new THREE.Color(colorHex);
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.85,
      metalness: 0.3,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.1
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(position.x, position.y, position.z);
    
    // userDataに完全かつ安全な体験データを設定
    const safeExperienceData = {
      id: exp.id || index + 1,
      title: safeTitle,
      category: safeCategory,
      level: safeLevel,
      completed: exp.completed !== undefined ? exp.completed : true,
      date: exp.date || new Date(),
      type: exp.type || 'general',
      description: exp.description || `${safeCategory}の体験`,
      feedback: exp.feedback || null,
      deviation: exp.deviation || 0
    };
    
    sphere.userData = {
      type: 'completed',
      experience: safeExperienceData  // 安全で完全な体験データ
    };
    
    console.log(`✅ 球体 ${index} のuserData設定完了:`, sphere.userData.experience);
    
    scene.add(sphere);
    spheres.push(sphere);
    meshesRef.current.push(sphere);
  });
  
  console.log(`🎯 合計 ${spheres.length} 個の球体を作成完了`);
  return spheres;
};

// 進行中ミッションの球体を作成（完全固定位置版）
export const createFloatingMissions = (scene, experiences, meshesRef) => {
  const incompleteMissions = experiences.filter(exp => !exp.completed);
  
  incompleteMissions.forEach((mission, index) => {
    const geometry = new THREE.OctahedronGeometry(0.2, 24, 24);
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
    
    // 完全に固定された位置（ランダム要素なし）
    const baseAngle = (index / Math.max(incompleteMissions.length, 1)) * Math.PI * 2;
    const floatRadius = 4.0;
    
    // 固定位置の計算
    const seed = mission.id || index;
    const heightOffset = seededRandom(seed * 3.456) * 2 - 1; // -1 to 1
    const radiusOffset = seededRandom(seed * 4.567) * 0.5; // 0 to 0.5
    
    missionMesh.position.x = Math.cos(baseAngle) * (floatRadius + radiusOffset);
    missionMesh.position.y = Math.sin(baseAngle) * (floatRadius + radiusOffset);
    missionMesh.position.z = Math.sin(baseAngle * 2) * 1.5 + heightOffset;
    
    missionMesh.userData = { 
      experience: mission, 
      type: 'floating', 
      index: index,
      seed: seed,
      basePosition: missionMesh.position.clone(), // 基準位置を保存
      positionFixed: true // 位置固定フラグ
    };
    
    scene.add(missionMesh);
    meshesRef.current.push(missionMesh);
    
    // トレイル効果用の初期化
    const trailGroup = new THREE.Group();
    missionMesh.userData.trail = [];
    missionMesh.userData.trailGroup = trailGroup;
    scene.add(trailGroup);
    
    // 周囲のパーティクル効果（固定位置）
    const particleGeometry = new THREE.OctahedronGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.4
    });
    
    for (let p = 0; p < 5; p++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(missionMesh.position);
      
      // 固定されたオフセット
      const offsetX = seededRandom(seed * 5.678 + p) * 0.8 - 0.4;
      const offsetY = seededRandom(seed * 6.789 + p) * 0.8 - 0.4;
      const offsetZ = seededRandom(seed * 7.890 + p) * 0.8 - 0.4;
      
      particle.position.add(new THREE.Vector3(offsetX, offsetY, offsetZ));
      
      particle.userData = { 
        parentMission: missionMesh, 
        offset: new THREE.Vector3(offsetX, offsetY, offsetZ),
        speed: 0.001 + seededRandom(seed * 8.901 + p) * 0.002,
        isParticle: true // パーティクル識別用
      };
      scene.add(particle);
    }
  });
};
