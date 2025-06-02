import * as THREE from 'three';

// ホバー時のパーティクル生成
export const createHoverParticles = (sceneRef, particleSystemsRef, position, color) => {
  if (!sceneRef.current) return;
  
  const particleCount = 20;
  const particles = new THREE.Group();
  
  // パーティクルの位置と属性を配列で管理
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    // 円形に広がる初速度
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.1;
    const velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      (Math.random() - 0.5) * speed * 0.5
    );
    velocities.push(velocity);
    
    // 初期位置
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    
    // 色
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    // サイズ
    sizes[i] = 0.05 + Math.random() * 0.03;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const material = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  
  const particleSystem = new THREE.Points(geometry, material);
  particleSystem.userData = { 
    isHoverParticle: true,
    velocities: velocities,
    life: 1.0,
    startTime: Date.now()
  };
  
  particles.add(particleSystem);
  sceneRef.current.add(particles);
  particleSystemsRef.current.push(particles);
};


// クリック時のパーティクル生成
export const createClickParticles = (sceneRef, particleSystemsRef, position, color) => {
  if (!sceneRef.current) return;
  
  const particleCount = 30;
  const particles = new THREE.Group();
  
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.08, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    const particle = new THREE.Mesh(geometry, material);
    
    particle.position.copy(position);
    // より強い初速度を設定
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    );
    particle.life = 1.0;
    
    particles.add(particle);
  }
  
  particles.userData = { isClickParticle: true };
  sceneRef.current.add(particles);
  particleSystemsRef.current.push(particles);
};

// パーティクルアニメーション処理
export const animateParticles = (scene, particleSystemsRef) => {
  // ホバーパーティクルのアニメーション
  particleSystemsRef.current = particleSystemsRef.current.filter(system => {
    if (system.userData.isHoverParticle) {
      let alive = false;
      system.children.forEach(particle => {
        particle.life -= 0.03;
        if (particle.life > 0) {
          alive = true;
          // 位置を更新
          particle.position.add(particle.velocity);
          // 速度を減衰
          particle.velocity.multiplyScalar(0.96);
          // 透明度とスケールを更新
          particle.material.opacity = particle.life * 0.8;
          const scale = 0.5 + particle.life * 0.5;
          particle.scale.set(scale, scale, scale);
        }
      });
      
      if (!alive) {
        scene.remove(system);
        system.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        return false;
      }
      
      return true;
    }
    
    // クリックパーティクルのアニメーション
    if (system.userData.isClickParticle) {
      let alive = false;
      system.children.forEach(particle => {
        particle.life -= 0.02;
        if (particle.life > 0) {
          alive = true;
          // 位置を更新
          particle.position.add(particle.velocity);
          // 速度を減衰
          particle.velocity.multiplyScalar(0.95);
          // 重力効果
          particle.velocity.y -= 0.005;
          // 透明度とスケールを更新
          particle.material.opacity = particle.life;
          const scale = particle.life * 1.5;
          particle.scale.set(scale, scale, scale);
        }
      });
      
      if (!alive) {
        scene.remove(system);
        system.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        return false;
      }
      
      return true;
    }
    
    return true;
  });
};
