// frontend/src/components/ExperienceStrings/effects/postProcessing.js
import * as THREE from 'three';

// ブルームエフェクト用のシェーダー（簡易版）
export const createBloomEffect = (renderer, scene, camera) => {
  // レンダーターゲットを作成
  const renderTargetParams = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  };
  
  const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    renderTargetParams
  );
  
  // ブルーム用のマテリアル
  const bloomMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      intensity: { value: 1.5 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec3 luma = vec3(0.299, 0.587, 0.114);
        float bright = dot(texel.rgb, luma);
        vec3 bloom = texel.rgb * smoothstep(0.5, 0.9, bright) * intensity;
        gl_FragColor = vec4(texel.rgb + bloom, texel.a);
      }
    `
  });
  
  // フルスクリーンクワッド
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    bloomMaterial
  );
  
  const bloomScene = new THREE.Scene();
  const bloomCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  bloomScene.add(quad);
  
  return {
    render: () => {
      // シーンを一度レンダリング
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      
      // ブルームエフェクトを適用
      bloomMaterial.uniforms.tDiffuse.value = renderTarget.texture;
      renderer.setRenderTarget(null);
      renderer.render(bloomScene, bloomCamera);
    },
    dispose: () => {
      renderTarget.dispose();
      bloomMaterial.dispose();
      quad.geometry.dispose();
    }
  };
};

// パーティクルトレイル効果
export class ParticleTrail {
  constructor(scene, maxParticles = 100) {
    this.scene = scene;
    this.maxParticles = maxParticles;
    this.particles = [];
    
    // パーティクルシステムの初期化
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const opacities = new Float32Array(maxParticles);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        varying vec3 vColor;
        
        void main() {
          vOpacity = opacity;
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = vOpacity * smoothstep(0.5, 0.0, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }
  
  emit(position, color, velocity = new THREE.Vector3()) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    
    this.particles.push({
      position: position.clone(),
      velocity: velocity.clone(),
      color: color.clone(),
      life: 1.0,
      size: Math.random() * 0.1 + 0.05
    });
  }
  
  update(deltaTime) {
    const positions = this.particleSystem.geometry.attributes.position.array;
    const colors = this.particleSystem.geometry.attributes.color.array;
    const sizes = this.particleSystem.geometry.attributes.size.array;
    const opacities = this.particleSystem.geometry.attributes.opacity.array;
    
    this.particles.forEach((particle, i) => {
      particle.life -= deltaTime * 0.5;
      
      if (particle.life > 0) {
        // 位置の更新
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
        particle.velocity.multiplyScalar(0.98); // 減衰
        
        // 配列に設定
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
        
        colors[i * 3] = particle.color.r;
        colors[i * 3 + 1] = particle.color.g;
        colors[i * 3 + 2] = particle.color.b;
        
        sizes[i] = particle.size * particle.life;
        opacities[i] = particle.life;
      }
    });
    
    // 死んだパーティクルを削除
    this.particles = this.particles.filter(p => p.life > 0);
    
    // 属性を更新
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    this.particleSystem.geometry.attributes.color.needsUpdate = true;
    this.particleSystem.geometry.attributes.size.needsUpdate = true;
    this.particleSystem.geometry.attributes.opacity.needsUpdate = true;
    
    // 時間を更新
    this.particleSystem.material.uniforms.time.value += deltaTime;
  }
  
  dispose() {
    this.scene.remove(this.particleSystem);
    this.particleSystem.geometry.dispose();
    this.particleSystem.material.dispose();
  }
}

// 環境光の動的調整
export const createDynamicLighting = (scene) => {
  // リムライト用のディレクショナルライト
  const rimLight1 = new THREE.DirectionalLight(0x9966ff, 0.3);
  rimLight1.position.set(-5, 5, -5);
  scene.add(rimLight1);
  
  const rimLight2 = new THREE.DirectionalLight(0xff66cc, 0.3);
  rimLight2.position.set(5, 5, 5);
  scene.add(rimLight2);
  
  // アンビエントライトの色を動的に変更
  let ambientLight = null;
  scene.traverse((child) => {
    if (child instanceof THREE.AmbientLight) {
      ambientLight = child;
    }
  });
  
  return {
    update: (time) => {
      // リムライトの回転
      const angle = time * 0.5;
      rimLight1.position.x = Math.cos(angle) * 5;
      rimLight1.position.z = Math.sin(angle) * 5;
      
      rimLight2.position.x = Math.cos(angle + Math.PI) * 5;
      rimLight2.position.z = Math.sin(angle + Math.PI) * 5;
      
      // アンビエントライトの色相変化
      if (ambientLight) {
        const hue = (Math.sin(time * 0.2) + 1) * 0.5;
        ambientLight.color.setHSL(hue * 0.1 + 0.7, 0.2, 0.8);
      }
    },
    dispose: () => {
      scene.remove(rimLight1);
      scene.remove(rimLight2);
    }
  };
};