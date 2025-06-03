import * as THREE from 'three';
import { getThemeColor } from '../../../utils/helpers';

// 美しいグラデーション糸を3D線で表現
export const createConnectionThreads = (scene, spheres) => {
  if (spheres.length < 2) return;
  
  for (let i = 0; i < spheres.length - 1; i++) {
    const start = spheres[i].position;
    const end = spheres[i + 1].position;
    
    // 曲線の作成 - 固定された制御点を使用
    const distance = start.distanceTo(end);
    const midPoint = new THREE.Vector3();
    midPoint.addVectors(start, end);
    midPoint.multiplyScalar(0.5);
    
    // シード値を使って一貫した変位を生成
    const seed = spheres[i].userData.experience.id + spheres[i + 1].userData.experience.id;
    const pseudoRandom = (seed % 1000) / 1000; // 0-1の固定値
    
    const bulge = distance * 0.3;
    midPoint.add(new THREE.Vector3(
      (pseudoRandom - 0.5) * bulge,
      (pseudoRandom * 0.7 - 0.35) * bulge,
      (pseudoRandom * 0.3 - 0.15) * bulge
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
        0.025, // 上部の半径（太さ）
        0.025, // 下部の半径（太さ）
        length, // 長さ
        8, // 円周方向のセグメント数
        1
      );
      
      // 色のグラデーション
      const segmentColor = new THREE.Color(getThemeColor(spheres[i].userData.experience.id));
      
      // プロンプトの意図: マットな質感の糸
      // "soft matte threads"
      const cylinderMaterial = new THREE.MeshPhongMaterial({
        color: segmentColor,
        transparent: true,
        opacity: 0.8,
        shininess: 0, // テカリを無くすため、光沢を0に設定
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
      
      // 糸が動かないように固定
      cylinder.userData = { 
        isConnectionThread: true, 
        isStatic: true,
        experience: spheres[i].userData.experience // startSphereのexperienceデータを保存
      };
      scene.add(cylinder);
    }
  }
};
