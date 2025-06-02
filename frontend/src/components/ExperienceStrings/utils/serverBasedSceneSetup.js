import * as THREE from 'three';

/**
 * サーバー側で計算されたデータを使用してシーンを構築
 */

export const createServerBasedSpheres = (scene, serverData, meshesRef) => {
  if (!serverData || !serverData.spiral_positions) {
    return [];
  }

  const spheres = [];
  
  serverData.spiral_positions.forEach((sphereData, index) => {
    const geometry = new THREE.SphereGeometry(0.25, 16, 16);
    const color = new THREE.Color(sphereData.color);
    
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
    
    // サーバー側で計算された位置を適用
    sphere.position.set(
      sphereData.position.x,
      sphereData.position.y,
      sphereData.position.z
    );
    
    // サーバー側で計算されたスケールを適用
    if (sphereData.scale) {
      sphere.scale.setScalar(sphereData.scale);
    }
    
    sphere.userData = {
      experience: { id: sphereData.experience_id },
      type: 'completed',
      originalScale: sphereData.scale || 1,
      glowColor: color,
      seed: sphereData.seed,
      spiralIndex: sphereData.index,
      depth: sphereData.position.z
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

export const createServerBasedFloatingMissions = (scene, serverData, meshesRef) => {
  if (!serverData || !serverData.floating_positions) {
    return;
  }
  
  serverData.floating_positions.forEach((missionData, index) => {
    const geometry = new THREE.SphereGeometry(0.2, 24, 24);
    const color = new THREE.Color(missionData.color);
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.85,
      metalness: 0.05,
      roughness: 0.2,
      emissive: color.clone().multiplyScalar(0.15),
      emissiveIntensity: 0.3
    });
    
    const missionMesh = new THREE.Mesh(geometry, material);
    
    // サーバー側で計算された位置を適用
    missionMesh.position.set(
      missionData.position.x,
      missionData.position.y,
      missionData.position.z
    );
    
    missionMesh.userData = {
      experience: { id: missionData.experience_id },
      type: 'floating',
      index: missionData.index,
      seed: missionData.seed,
      basePosition: missionMesh.position.clone(),
      positionFixed: true
    };
    
    scene.add(missionMesh);
    meshesRef.current.push(missionMesh);
    
    // 周囲のパーティクル効果（固定位置）
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4
    });
    
    for (let p = 0; p < 5; p++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      );
      
      particle.position.copy(missionMesh.position).add(offset);
      particle.userData = {
        parentMission: missionMesh,
        offset: offset,
        speed: 0.5 + Math.random() * 0.5,
        isParticle: true
      };
      
      scene.add(particle);
    }
  });
};

export const createServerBasedConnectionThreads = (scene, serverData) => {
  if (!serverData || !serverData.connection_curves || serverData.connection_curves.length === 0) {
    return;
  }
  
  serverData.connection_curves.forEach((curveData) => {
    // 制御点から曲線を作成
    const points = curveData.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(points);
    
    // 曲線に沿って複数の円柱で糸を表現
    const segments = 30;
    const segmentPoints = curve.getPoints(segments);
    
    for (let j = 0; j < segmentPoints.length - 1; j++) {
      const currentPoint = segmentPoints[j];
      const nextPoint = segmentPoints[j + 1];
      
      const direction = new THREE.Vector3().subVectors(nextPoint, currentPoint);
      const length = direction.length();
      direction.normalize();
      
      const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8, 1);
      
      // 色のグラデーション
      const t = j / (segmentPoints.length - 1);
      const segmentColor = new THREE.Color().lerpColors(
        new THREE.Color(curveData.start_color),
        new THREE.Color(curveData.end_color),
        t
      );
      
      const cylinderMaterial = new THREE.MeshPhongMaterial({
        color: segmentColor,
        transparent: true,
        opacity: 0.8,
        emissive: segmentColor,
        emissiveIntensity: 0.2
      });
      
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      
      // 円柱の位置と回転を設定
      const midpoint = new THREE.Vector3().addVectors(currentPoint, nextPoint).multiplyScalar(0.5);
      cylinder.position.copy(midpoint);
      
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      cylinder.quaternion.copy(quaternion);
      
      cylinder.userData = { isConnectionThread: true, isStatic: true };
      scene.add(cylinder);
    }
    
    // パーティクル効果をカーブに沿って配置
    createServerBasedThreadParticles(scene, curve, curveData);
  });
};

const createServerBasedThreadParticles = (scene, curve, curveData) => {
  const particleCount = Math.floor(curveData.distance * 3);
  
  for (let j = 0; j < particleCount; j++) {
    const t = j / particleCount;
    const point = curve.getPoint(t);
    
    const particleGeometry = new THREE.SphereGeometry(0.03, 6, 6);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().lerpColors(
        new THREE.Color(curveData.start_color),
        new THREE.Color(curveData.end_color),
        t
      ),
      transparent: true,
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
