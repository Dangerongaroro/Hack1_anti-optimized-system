import * as THREE from 'three';

// ホバー時のパーティクル生成
export const createHoverParticles = (sceneRef, particleSystemsRef, position, color) => {
  if (!sceneRef.current) return;
  
  const particleCount = 15;
  const particles = new THREE.Group();
  
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.04, 6, 6);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particle = new THREE.Mesh(geometry, material);
    
    particle.position.copy(position);
    // 円形に広がる初速度
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 0.1;
    particle.velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      (Math.random() - 0.5) * speed * 0.5
    );
    particle.life = 1.0;
    
    particles.add(particle);
  }
  
  particles.userData = { isHoverParticle: true };
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
