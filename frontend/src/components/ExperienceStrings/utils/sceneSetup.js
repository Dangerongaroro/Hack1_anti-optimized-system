import * as THREE from 'three';
import { getThemeColor } from '../../../utils/helpers';

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
  const spheres = [];
  
  completedExperiences.forEach((exp, index) => {
    // ジオメトリの最適化 - セグメント数を減らす
    // 球のサイズを小さくするため、半径を0.15に変更
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const colorHex = getThemeColor(exp.id, exp.category);
    const color = new THREE.Color(colorHex);
    
    // プロンプトの意図: マットな質感の球体、鏡面反射なし
    // "soft matte spheres, no specular highlights"
    // 球体の発光効果をなくすため、emissive関連のプロパティを削除
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.85,
      metalness: 0.0, // テカリを無くすため、金属感を0に設定
      roughness: 0.8 // テカリを無くすため、粗さを高く設定
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    // らせんベースの配置（奥から手前へ） - 固定版
    const spiralTurns = 2; // らせんの巻数
    const depthRange = 6; // 奥行きの範囲（奥から手前）
    const baseRadius = 2; // 基本半径
    
    // らせんの角度計算
    const t = index / Math.max(completedExperiences.length - 1, 1);
    const angle = t * spiralTurns * Math.PI * 2;
    
    // Z座標（奥から手前へ）- 奥が負の値、手前が正の値
    const depth = -depthRange/2 + t * depthRange; // -3 から +3 へ
    
    // 半径の変化（手前に来るほど少し広がる）
    const radiusVariation = baseRadius + t * 0.8;
    
    // 固定ランダムな角度のずれ（±30度）
    const seed = exp.id || index; // 体験IDをシードとして使用
    const angleOffset = (seededRandom(seed * 1.234) - 0.5) * Math.PI / 3;
    const finalAngle = angle + angleOffset;
    
    // 位置の計算（X-Y平面で回転、Zで奥行き）
    sphere.position.x = Math.cos(finalAngle) * radiusVariation;
    sphere.position.y = Math.sin(finalAngle) * radiusVariation;
    sphere.position.z = depth;
    
    // 固定ランダムな距離のずれ（±20%）
    const distanceVariation = 0.8 + seededRandom(seed * 2.345) * 0.4;
    // X-Y方向のみスケール（Z軸は保持）
    sphere.position.x *= distanceVariation;
    sphere.position.y *= distanceVariation;
    
    // 高さのバリエーション（上下の揺らぎ）
    const heightOffset = (seededRandom(seed * 3.456) - 0.5) * 1.5;
    sphere.position.y += heightOffset;
    
    // 難易度に応じてサイズを調整
    // 球のスケールを小さくするため、係数をかける
    const scaleMultiplier = (0.8 + (exp.level || 1) * 0.2) * 0.7;
    sphere.scale.setScalar(scaleMultiplier);
    
    sphere.userData = { 
      experience: exp, 
      type: 'completed',
      originalScale: scaleMultiplier,
      // glowColor: color, // グロー効果をなくすため削除
      seed: seed,
      spiralIndex: index, // らせん上のインデックス
      depth: depth // 奥行き情報
    };
    
    // グロー効果のためのポイントライトを削除
    // const light = new THREE.PointLight(color, 0.5, 2);
    // light.position.copy(sphere.position);
    // sphere.userData.light = light;
    // scene.add(light);
    
    scene.add(sphere);
    spheres.push(sphere);
    meshesRef.current.push(sphere);
  });
  
  return spheres;
};

// 進行中ミッションの球体を作成（完全固定位置版）
export const createFloatingMissions = (scene, experiences, meshesRef) => {
  const incompleteMissions = experiences.filter(exp => !exp.completed);
  
  incompleteMissions.forEach((mission, index) => {
    // ジオメトリの最適化 - セグメント数を減らす
    // 球のサイズを小さくするため、半径を0.15に変更
    const geometry = new THREE.SphereGeometry(0.15, 24, 24);
    const colorHex = getThemeColor(mission.id, mission.category);
    
    // プロンプトの意図: マットな質感の球体、鏡面反射なし
    // "soft matte spheres, no specular highlights"
    // 球体の発光効果をなくすため、emissive関連のプロパティを削除
    const material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0x000000),
      transparent: true,
      opacity: 0.85,
      metalness: 0.0, // テカリを無くすため、金属感を0に設定
      roughness: 0.8 // テカリを無くすため、粗さを高く設定
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
    
    // トレイル効果と周囲のパーティクル効果を削除
    // const trailGroup = new THREE.Group();
    // missionMesh.userData.trail = [];
    // missionMesh.userData.trailGroup = trailGroup;
    // scene.add(trailGroup);
    
    // 周囲のパーティクル効果（固定位置）を削除
    // const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    // const particleMaterial = new THREE.MeshBasicMaterial({
    //   color: new THREE.Color(colorHex),
    //   transparent: true,
    //   opacity: 0.4
    // });
    
    // for (let p = 0; p < 5; p++) {
    //   const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    //   particle.position.copy(missionMesh.position);
      
    //   // 固定されたオフセット
    //   const offsetX = seededRandom(seed * 5.678 + p) * 0.8 - 0.4;
    //   const offsetY = seededRandom(seed * 6.789 + p) * 0.8 - 0.4;
    //   const offsetZ = seededRandom(seed * 7.890 + p) * 0.8 - 0.4;
      
    //   particle.position.add(new THREE.Vector3(offsetX, offsetY, offsetZ));
      
    //   particle.userData = { 
    //     parentMission: missionMesh, 
    //     offset: new THREE.Vector3(offsetX, offsetY, offsetZ),
    //     speed: 0.001 + seededRandom(seed * 8.901 + p) * 0.002,
    //     isParticle: true // パーティクル識別用
    //   };
    //   scene.add(particle);
    // }
  });
};
