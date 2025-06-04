import * as THREE from 'three';

/**
 * 最適化されたThree.jsユーティリティクラス
 * リソースプーリングと事前計算によるパフォーマンス向上
 */
class OptimizedThreeUtils {
  constructor() {
    // ジオメトリプール
    this.geometryPool = {
      sphere_small: new THREE.SphereGeometry(0.2, 16, 16),
      sphere_medium: new THREE.SphereGeometry(0.25, 16, 16),
      sphere_large: new THREE.SphereGeometry(0.3, 16, 16),
      cylinder_thread: new THREE.CylinderGeometry(0.05, 0.05, 1, 8, 1),
      particle_small: new THREE.SphereGeometry(0.03, 6, 6),
      particle_tiny: new THREE.SphereGeometry(0.02, 8, 8)
    };
    
    // マテリアルプール
    this.materialPool = new Map();
    
    // 事前計算されたらせん配置データ
    this.spiralPositions = null;
    this.floatingPositions = null;
    
    // カーブキャッシュ
    this.connectionCurves = new Map();
  }
  
  /**
   * シード値を使った固定ランダム関数
   */
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  /**
   * らせん配置の事前計算
   */
  precomputeSpiralPositions(count) {
    if (this.spiralPositions && this.spiralPositions.length === count) {
      return this.spiralPositions;
    }
    
    const positions = [];
    const spiralTurns = 2;
    const depthRange = 6;
    const baseRadius = 2;
    
    for (let i = 0; i < count; i++) {
      const t = i / Math.max(count - 1, 1);
      const angle = t * spiralTurns * Math.PI * 2;
      const depth = -depthRange/2 + t * depthRange;
      const radiusVariation = baseRadius + t * 0.8;
      
      // 固定ランダムオフセット
      const seed = i + 1000; // 体験IDの代わりにインデックス使用
      const angleOffset = (this.seededRandom(seed * 1.234) - 0.5) * Math.PI / 3;
      const finalAngle = angle + angleOffset;
      
      const x = Math.cos(finalAngle) * radiusVariation;
      const y = Math.sin(finalAngle) * radiusVariation;
      const z = depth;
      
      const distanceVariation = 0.8 + this.seededRandom(seed * 2.345) * 0.4;
      const heightOffset = (this.seededRandom(seed * 3.456) - 0.5) * 1.5;
      
      positions.push({
        x: x * distanceVariation,
        y: y * distanceVariation + heightOffset,
        z: z,
        scale: 0.8 + this.seededRandom(seed * 4.567) * 0.4
      });
    }
    
    this.spiralPositions = positions;
    return positions;
  }
    /**
   * 浮遊ミッション位置の事前計算（完了済み体験の最後の位置から続くように配置）
   */
  precomputeFloatingPositions(count, completedSpherePositions = []) {
    if (this.floatingPositions && this.floatingPositions.length === count) {
      return this.floatingPositions;
    }
    
    const positions = [];
    
    if (completedSpherePositions.length === 0) {
      // 完了済み体験がない場合は中心付近に配置
      for (let i = 0; i < count; i++) {
        const baseAngle = (i / Math.max(count, 1)) * Math.PI * 2;
        const seed = i + 2000;
        
        const x = Math.cos(baseAngle) * 2.0;
        const y = Math.sin(baseAngle) * 2.0;
        const z = this.seededRandom(seed * 3.456) * 2 - 1;
        
        positions.push({ x, y, z, seed });
      }
    } else {
      // 完了済み体験の最後の位置から続くように配置
      const lastPosition = completedSpherePositions[completedSpherePositions.length - 1];
      const spiralContinuation = completedSpherePositions.length;
      
      for (let i = 0; i < count; i++) {
        const totalIndex = spiralContinuation + i;
        const t = totalIndex / Math.max(totalIndex, 1);
        const angle = t * 2 * Math.PI * 2; // らせんの続き
        const depth = lastPosition.z + (i + 1) * 0.8; // 奥に向かって続く
        const radiusVariation = 2.5 + t * 0.5; // 少し外側に
        
        const seed = i + 2000;
        const angleOffset = (this.seededRandom(seed * 1.234) - 0.5) * Math.PI / 4;
        const finalAngle = angle + angleOffset;
        
        const x = Math.cos(finalAngle) * radiusVariation;
        const y = Math.sin(finalAngle) * radiusVariation;
        const z = depth;
        
        const heightOffset = (this.seededRandom(seed * 3.456) - 0.5) * 1.0;
        
        positions.push({ 
          x: x, 
          y: y + heightOffset, 
          z: z, 
          seed 
        });
      }
    }
    
    this.floatingPositions = positions;
    return positions;
  }
  
  /**
   * 最適化されたマテリアル取得
   */
  getMaterial(type, color, options = {}) {
    const key = `${type}_${color}_${JSON.stringify(options)}`;
    
    if (!this.materialPool.has(key)) {
      let material;
      
      switch (type) {        case 'completed_sphere':
          material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.95,
            metalness: 0.4,
            roughness: 0.05,
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.8, // さらに発光強度を増加
            ...options
          });
          break;
          
        case 'floating_mission':
          material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.95,
            metalness: 0.1,
            roughness: 0.05,
            emissive: new THREE.Color(color).multiplyScalar(0.6),
            emissiveIntensity: 0.7, // 発光強度を増加
            ...options
          });
          break;
          
        case 'thread':
          material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.8,
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.2,
            ...options
          });
          break;        case 'particle':
          material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.5,
            ...options
          });
          break;
          
        default:
          material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), ...options });
      }
      
      this.materialPool.set(key, material);
    }
    
    return this.materialPool.get(key);
  }
  
  /**
   * 接続カーブの事前計算とキャッシュ
   */
  getConnectionCurve(start, end, connectionId) {
    if (this.connectionCurves.has(connectionId)) {
      return this.connectionCurves.get(connectionId);
    }
    
    const distance = start.distanceTo(end);
    const midPoint = new THREE.Vector3();
    midPoint.addVectors(start, end);
    midPoint.multiplyScalar(0.5);
    
    // 固定されたバルジ計算
    const seed = connectionId;
    const pseudoRandom = (seed % 1000) / 1000;
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
    
    // セグメント点を事前計算
    const segments = 30;
    const points = curve.getPoints(segments);
    
    const curveData = {
      curve,
      points,
      segments,
      distance
    };
    
    this.connectionCurves.set(connectionId, curveData);
    return curveData;
  }
  
  /**
   * リソースの解放
   */
  dispose() {
    // ジオメトリの解放
    Object.values(this.geometryPool).forEach(geometry => {
      geometry.dispose();
    });
    
    // マテリアルの解放
    this.materialPool.forEach(material => {
      material.dispose();
    });
    
    // キャッシュクリア
    this.spiralPositions = null;
    this.floatingPositions = null;
    this.connectionCurves.clear();
  }
}

// シングルトンインスタンス
export const optimizedThreeUtils = new OptimizedThreeUtils();

/**
 * 最適化されたアニメーション管理クラス
 */
export class OptimizedAnimationManager {
  constructor() {
    this.animationFrameId = null;
    this.isRunning = false;
    this.callbacks = new Set();
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
  }
  
  /**
   * アニメーションコールバックを追加
   */
  addCallback(callback) {
    this.callbacks.add(callback);
  }
  
  /**
   * アニメーションコールバックを削除
   */
  removeCallback(callback) {
    this.callbacks.delete(callback);
  }
  
  /**
   * 最適化されたアニメーションループ開始
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    
    const animate = (currentTime) => {
      if (!this.isRunning) return;
      
      const deltaTime = currentTime - this.lastFrameTime;
      
      // フレームレート制限
      if (deltaTime >= this.frameInterval) {
        this.callbacks.forEach(callback => {
          callback(currentTime, deltaTime);
        });
        
        this.lastFrameTime = currentTime;
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * アニメーション停止
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * リソース解放
   */
  dispose() {
    this.stop();
    this.callbacks.clear();
  }
}

export default optimizedThreeUtils;
