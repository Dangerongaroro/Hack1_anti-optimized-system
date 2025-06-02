// 完全に書き直したExperienceStrings.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const idToColor = (id) => {
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // より美しいパステル調の色相範囲に制限
  const colorRanges = [
    { min: 250, max: 280 }, // 淡い紫〜青紫系
    { min: 200, max: 230 }, // 淡い青系
    { min: 300, max: 330 }, // 淡いピンク〜マゼンタ系
    { min: 180, max: 210 }  // 淡いシアン系
  ];
  
  // ハッシュ値から色相範囲を選択
  const rangeIndex = Math.abs(hash) % colorRanges.length;
  const selectedRange = colorRanges[rangeIndex];
  
  // 選択された範囲内で色相を決定
  const hue = Math.abs(hash * 137.508) % (selectedRange.max - selectedRange.min) + selectedRange.min;
  
  // より柔らかい彩度と明度に調整
  const saturation = Math.round(40 + (Math.abs(hash) % 20)); // 40-60%（より淡く）
  const lightness = Math.round(70 + (Math.abs(hash) % 15));  // 70-85%（より明るく）
  
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
};

// テーマカラー取得関数を更新
const getThemeColor = (id, category = null) => {
  // より美しいパステル調のカテゴリーカラー
  const categoryColors = {
    "ライフスタイル": "#6EE7B7",    // 淡い緑
    "アート・創作": "#C4B5FD",     // 淡い紫
    "料理・グルメ": "#FDE68A",     // 淡い黄色
    "ソーシャル": "#F9A8D4",       // 淡いピンク
    "学習・読書": "#93C5FD",       // 淡い青
    "自然・アウトドア": "#86EFAC",  // 淡いグリーン
    "エンタメ": "#FDBA74"          // 淡いオレンジ
  };
  
  // カテゴリーが指定されていて、マッピングが存在する場合はそれを使用
  if (category && categoryColors[category]) {
    return categoryColors[category];
  }
  
  // それ以外はIDベースの色を生成
  return idToColor(id);
};

const ExperienceStrings = ({ experiences = [], onExperienceClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);
  const [floatingMissions, setFloatingMissions] = useState([]);
  
  // Three.jsの参照を保持
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const meshesRef = useRef([]);

  // アニメーションループ
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 未完了ミッションの抽出と浮遊設定
  useEffect(() => {
    const incompleteMissions = experiences.filter(exp => !exp.completed).map((exp, index) => ({
      ...exp,
      floatX: Math.random() * 100 - 50,
      floatY: Math.random() * 100 - 50,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03
    }));
    setFloatingMissions(incompleteMissions);
  }, [experiences]);

  // マウス移動時の処理を改善
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // マウス座標を更新（ツールチップ用）
    setMousePos({ x, y });
    
    // Three.js用の正規化座標
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;
    
    // レイキャスティングでホバー判定
    if (raycasterRef.current && cameraRef.current && meshesRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshesRef.current);
      
      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        if (hoveredObject.userData && hoveredObject.userData.experience) {
          setHoveredExperience(hoveredObject.userData.experience);
          canvasRef.current.style.cursor = 'pointer';
        }
      } else {
        setHoveredExperience(null);
        canvasRef.current.style.cursor = 'default';
      }
    }
  };

  // クリック処理を改善
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Three.js用の正規化座標
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;
    
    // レイキャスティングでクリック判定
    if (raycasterRef.current && cameraRef.current && meshesRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshesRef.current);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData && clickedObject.userData.experience && onExperienceClick) {
          onExperienceClick(clickedObject.userData.experience);
        }
      }
    }
  };

  // Canvas描画部分を改善
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      alpha: true,
      antialias: true
    });
    
    // 参照を保存
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    raycasterRef.current = new THREE.Raycaster();
    raycasterRef.current.params.Points.threshold = 0.5; // クリック判定の閾値を調整
    
    renderer.setSize(rect.width, rect.height);
    renderer.setClearColor(0x000000, 0);
    camera.position.z = 5;
    
    // メッシュ配列をクリア
    meshesRef.current = [];
    
    // シーンをクリア
    while(scene.children.length > 0) {
      const child = scene.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      scene.remove(child);
    }

    // 照明を追加（より柔らかく）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 3, 5);
    scene.add(directionalLight2);
    
    // 完了済み体験を3D球体で表現
    const completedExperiences = experiences.filter(exp => exp.completed);
    const spheres = [];
    
    completedExperiences.forEach((exp, index) => {
      // より大きな球体にして判定しやすくする
      const geometry = new THREE.SphereGeometry(0.35, 32, 32);
      
      const colorHex = getThemeColor(exp.id, exp.category);
      
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.9,
        metalness: 0.1,
        roughness: 0.3,
        emissive: new THREE.Color(colorHex).multiplyScalar(0.05),
        emissiveIntensity: 0.1
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      // 螺旋配置
      const angle = (index / Math.max(completedExperiences.length, 1)) * Math.PI * 2;
      const radius = 2.5;
      const height = (index - completedExperiences.length / 2) * 0.4;
      
      sphere.position.x = Math.cos(angle) * radius;
      sphere.position.y = Math.sin(angle) * radius;
      sphere.position.z = height;
      
      sphere.userData = { experience: exp, type: 'completed' };
      
      scene.add(sphere);
      spheres.push(sphere);
      meshesRef.current.push(sphere); // レイキャスト用の配列に追加
    });
    
    // 美しいグラデーション糸を3D線で表現
    if (spheres.length > 1) {
      for (let i = 0; i < spheres.length - 1; i++) {
        const points = [
          spheres[i].position.clone(),
          spheres[i + 1].position.clone()
        ];
        
        // 糸の中間点を追加してより滑らかな曲線に
        const midPoint = new THREE.Vector3();
        midPoint.addVectors(spheres[i].position, spheres[i + 1].position);
        midPoint.multiplyScalar(0.5);
        // 中間点を少し外側に押し出して美しい曲線を作る
        midPoint.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ));
        
        const curve = new THREE.QuadraticBezierCurve3(
          spheres[i].position,
          midPoint,
          spheres[i + 1].position
        );
        
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(20)
        );
        
        // グラデーション効果のある糸
        const material = new THREE.LineBasicMaterial({ 
          color: new THREE.Color().lerpColors(
            new THREE.Color(getThemeColor(spheres[i].userData.experience.id)),
            new THREE.Color(getThemeColor(spheres[i + 1].userData.experience.id)),
            0.5
          ),
          transparent: true,
          opacity: 0.6,
          linewidth: 2
        });
        
        const line = new THREE.Line(curveGeometry, material);
        scene.add(line);
      }
    }
    
    // 浮遊ミッションを3D球体で追加
    floatingMissions.forEach((mission, index) => {
      // より大きな球体にして判定しやすくする
      const geometry = new THREE.SphereGeometry(0.25, 24, 24);
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
      
      const baseAngle = (index / Math.max(floatingMissions.length, 1)) * Math.PI * 2;
      const floatRadius = 4.0;
      
      missionMesh.position.x = Math.cos(baseAngle) * floatRadius;
      missionMesh.position.y = Math.sin(baseAngle) * floatRadius;
      missionMesh.position.z = Math.sin(baseAngle * 2) * 1.5;
      
      missionMesh.userData = { experience: mission, type: 'floating', index: index };
      
      scene.add(missionMesh);
      meshesRef.current.push(missionMesh); // レイキャスト用の配列に追加
      
      // 浮遊ミッションの周りにパーティクル効果を追加
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
    
    // アニメーションループ
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // 球体を個別にパルス
      meshesRef.current.forEach((mesh, index) => {
        if (mesh.userData.type === 'completed') {
          const pulseScale = 1 + Math.sin(Date.now() * 0.002 + index * 0.5) * 0.1;
          mesh.scale.setScalar(pulseScale);
          
          // 材質の発光を動的に変更
          if (mesh.material.emissiveIntensity !== undefined) {
            mesh.material.emissiveIntensity = 0.1 + Math.sin(Date.now() * 0.003 + index) * 0.05;
          }
        } else if (mesh.userData.type === 'floating') {
          const time = Date.now() * 0.0008;
          const baseAngle = (mesh.userData.index / Math.max(floatingMissions.length, 1)) * Math.PI * 2;
          const floatRadius = 4.0 + Math.sin(time * 0.5 + mesh.userData.index) * 0.5;
          const verticalFloat = Math.sin(time * 0.7 + mesh.userData.index * 1.5) * 1.5;
          
          mesh.position.x = Math.cos(baseAngle) * floatRadius;
          mesh.position.y = Math.sin(baseAngle) * floatRadius;
          mesh.position.z = verticalFloat;
          
          const pulseSize = 1 + Math.sin(time * 2 + mesh.userData.index * 2) * 0.2;
          mesh.scale.setScalar(pulseSize);
          
          // 材質の発光を動的に変更
          if (mesh.material.emissiveIntensity !== undefined) {
            mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 4 + mesh.userData.index) * 0.2;
          }
        }
      });
      
      // パーティクルのアニメーション
      scene.traverse((object) => {
        if (object.userData.parentMission) {
          const time = Date.now() * object.userData.speed * 0.8;
          const parent = object.userData.parentMission;
          const offset = object.userData.offset;
          
          object.position.copy(parent.position);
          object.position.add(new THREE.Vector3(
            offset.x * Math.sin(time),
            offset.y * Math.cos(time),
            offset.z * Math.sin(time * 1.5)
          ));
          
          // パーティクルの透明度をアニメーション
          if (object.material) {
            object.material.opacity = 0.2 + Math.sin(time * 3) * 0.2;
          }
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // ウィンドウリサイズ対応
    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      camera.aspect = newRect.width / newRect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(newRect.width, newRect.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // クリーンアップ
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // ジオメトリとマテリアルのクリーンアップ
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
    
  }, [experiences, floatingMissions]);

  return (
    <div className="px-4" ref={containerRef}>
      <div className="relative mb-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative w-full h-[500px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-2xl"
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            onMouseLeave={() => {
              setHoveredExperience(null);
              if (canvasRef.current) {
                canvasRef.current.style.cursor = 'default';
              }
            }}
          />
        </div>
        
        {/* 統計オーバーレイ */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {experiences.filter(e => e.completed).length}
              </p>
              <p className="text-xs text-gray-600">完了</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {experiences.filter(e => !e.completed).length}
              </p>
              <p className="text-xs text-gray-600">進行中</p>
            </div>
          </div>
        </div>
        
        {/* ホバー時の詳細表示 - より目立つように改善 */}
        {hoveredExperience && (
          <div 
            className="absolute bg-gray-900/95 text-white backdrop-blur-lg rounded-2xl p-4 shadow-2xl pointer-events-none z-20 border border-white/20"
            style={{
              left: Math.min(mousePos.x + 15, (containerRef.current?.offsetWidth || 400) - 250),
              top: Math.max(mousePos.y - 100, 10),
              maxWidth: '250px',
              transform: 'scale(1)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <h4 className="font-bold text-lg mb-2">{hoveredExperience.title}</h4>
            <div className="space-y-1">
              <p className="text-sm opacity-90">{hoveredExperience.category}</p>
              <p className="text-xs opacity-80">
                {hoveredExperience.date ? new Date(hoveredExperience.date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '日付なし'}
              </p>
              {!hoveredExperience.completed && (
                <p className="text-xs text-yellow-400 mt-2">🎯 進行中のミッション</p>
              )}
              {hoveredExperience.completed && (
                <p className="text-xs text-green-400 mt-2">✨ 完了済み</p>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs opacity-70">クリックして詳細を見る</p>
            </div>
          </div>
        )}
      </div>

      {/* 進行中ミッションの説明 */}
      {floatingMissions.length > 0 && (
        <div className="mt-6 bg-yellow-50 rounded-2xl p-4">
          <p className="text-sm text-yellow-800">
            💫 {floatingMissions.length}個の進行中ミッションが浮遊しています。
            完了すると糸として繋がります！
          </p>
        </div>
      )}
      
      {/* CSS追加 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ExperienceStrings;