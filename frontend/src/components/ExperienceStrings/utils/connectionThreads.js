import * as THREE from 'three';
import { getThemeColor } from '../../../utils/helpers';

// 美しいグラデーション糸を3D線で表現
export const createConnectionThreads = (scene, spheres) => {
  if (spheres.length < 2) return;
  
  for (let i = 0; i < spheres.length - 1; i++) {
    const start = spheres[i].position;
    const end = spheres[i + 1].position;
    
    // 曲線の作成
    const distance = start.distanceTo(end);
    const midPoint = new THREE.Vector3();
    midPoint.addVectors(start, end);
    midPoint.multiplyScalar(0.5);
    
    const bulge = distance * 0.3;
    midPoint.add(new THREE.Vector3(
      (Math.random() - 0.5) * bulge,
      (Math.random() - 0.5) * bulge,
      (Math.random() - 0.5) * bulge
    ));
    
    const curve = new THREE.CatmullRomCurve3([
      start.clone(),
      midPoint,
      end.clone()
    ]);
    
    // 複数の円柱で太い糸を表現
    const segments = 30;
    const points = curve.getPoints(segments);
    
    for (let j = 0; j < points.length - 1; j++) {
      const currentPoint = points[j];
      const nextPoint = points[j + 1];
      
      // 各セグメントの方向と長さを計算
      const direction = new THREE.Vector3().subVectors(nextPoint, currentPoint);
      const length = direction.length();
      direction.normalize();
      
      // 円柱のジオメトリを作成
      const cylinderGeometry = new THREE.CylinderGeometry(
        0.05, // 上部の半径（太さ）
        0.05, // 下部の半径（太さ）
        length, // 長さ
        8, // 円周方向のセグメント数
        1
      );
      
      // 色のグラデーション
      const t = j / (points.length - 1);
      const segmentColor = new THREE.Color().lerpColors(
        new THREE.Color(getThemeColor(spheres[i].userData.experience.id)),
        new THREE.Color(getThemeColor(spheres[i + 1].userData.experience.id)),
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
      
      // 円柱を正しい方向に向ける
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      cylinder.quaternion.copy(quaternion);
      
      scene.add(cylinder);
    }
    
    // 糸に沿ってパーティクルを配置
    createThreadParticles(scene, curve, spheres[i], spheres[i + 1], distance);
  }
};

// 糸に沿ったパーティクル作成
const createThreadParticles = (scene, curve, startSphere, endSphere, distance) => {
  const particleCount = Math.floor(distance * 3);
  for (let j = 0; j < particleCount; j++) {
    const t = j / particleCount;
    const point = curve.getPoint(t);
    
    const particleGeometry = new THREE.SphereGeometry(0.03, 6, 6);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().lerpColors(
        new THREE.Color(getThemeColor(startSphere.userData.experience.id)),
        new THREE.Color(getThemeColor(endSphere.userData.experience.id)),
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
      phase: Math.random() * Math.PI * 2
    };
    scene.add(particle);
  }
};
