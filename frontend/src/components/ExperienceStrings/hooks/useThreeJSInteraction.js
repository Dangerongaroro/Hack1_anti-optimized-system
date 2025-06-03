import { useRef } from 'react';
import * as THREE from 'three';
import { createHoverParticles, createClickParticles } from '../effects/particleEffects';

export const useThreeJSInteraction = () => {
  // マウスホイールでズーム
  const handleWheel = (e, cameraRef) => {
    if (cameraRef.current) {
      e.preventDefault();
      const delta = e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(2, Math.min(10, cameraRef.current.position.z + delta));
    }
  };

  // マウス移動時の処理
  const handleMouseMove = (
    e,
    canvasRef,
    mouseRef,
    raycasterRef,
    cameraRef,
    meshesRef,
    hoveredMeshRef,
    sceneRef,
    particleSystemsRef,
    setHoveredExperience,
    setMousePos
  ) => {
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
      
      // 新しいホバー対象があるかチェック
      const newHoveredObject = intersects.length > 0 ? intersects[0].object : null;
      
      // 前回のホバーと異なる場合のみ処理
      if (hoveredMeshRef.current !== newHoveredObject) {
        
        // 前回のホバーをリセット
        if (hoveredMeshRef.current) {
          if (hoveredMeshRef.current.material && hoveredMeshRef.current.material.emissiveIntensity !== undefined) {
            hoveredMeshRef.current.material.emissiveIntensity = hoveredMeshRef.current.userData.originalEmissive || 0.1;
          }
        }
        
        // 新しいホバー対象を設定
        hoveredMeshRef.current = newHoveredObject;
        
        if (newHoveredObject) {
          console.log('=== Hover デバッグ ===');
          console.log('Hover object userData:', newHoveredObject.userData);
          
          // 体験データの取得と検証
          let experienceData = null;
          
          if (newHoveredObject.userData.experience) {
            const rawExperience = newHoveredObject.userData.experience;
            console.log('Raw hover experience data:', rawExperience);
            
            // データの完全性をチェック
            if (rawExperience && typeof rawExperience === 'object') {
              // 必要なプロパティが揃っているかチェック
              const hasTitle = rawExperience.title && rawExperience.title !== '';
              const hasCategory = rawExperience.category && rawExperience.category !== '';
              const hasLevel = rawExperience.level !== undefined && rawExperience.level !== null;
              
              console.log('Data validation:', { hasTitle, hasCategory, hasLevel });
              console.log('Title:', rawExperience.title);
              console.log('Category:', rawExperience.category);
              console.log('Level:', rawExperience.level);
              
              if (hasTitle && hasCategory && hasLevel) {
                experienceData = rawExperience;
                console.log('✅ Valid hover experience data:', experienceData);
              } else {
                console.log('❌ Incomplete hover data, creating fallback');
                
                // 不完全なデータの場合は安全なフォールバックを作成
                experienceData = {
                  id: rawExperience.id || 'unknown',
                  title: rawExperience.title || `体験 ${rawExperience.id || 'ID不明'}`,
                  category: rawExperience.category || 'その他',
                  level: rawExperience.level || 1,
                  completed: rawExperience.completed !== undefined ? rawExperience.completed : false,
                  date: rawExperience.date || new Date(),
                  description: rawExperience.description || `レベル${rawExperience.level || 1}の${rawExperience.category || 'その他'}体験`,
                  type: rawExperience.type || 'general'
                };
                console.log('📝 Fallback hover experience data created:', experienceData);
              }
            } else {
              console.log('❌ Invalid experience data type or null');
            }
          } else if (newHoveredObject.userData.threadInfo) {
            // 糸のパーティクル用のフォールバック
            experienceData = {
              title: `${newHoveredObject.userData.threadInfo.from} → ${newHoveredObject.userData.threadInfo.to}`,
              description: '体験の繋がり',
              category: '接続',
              type: 'connection',
              completed: true,
              date: new Date(),
              level: 1
            };
            console.log('🔗 Thread experience data created:', experienceData);
          } else {
            console.log('❌ No experience data found in userData');
            console.log('Available userData keys:', Object.keys(newHoveredObject.userData));
          }
          
          if (experienceData) {
            console.log('🎯 Setting hovered experience:', experienceData.title);
            setHoveredExperience(experienceData);
            canvasRef.current.style.cursor = 'pointer';
            
            // ホバー時のパーティクルエフェクト
            if (newHoveredObject.userData.type === 'completed' || newHoveredObject.userData.type === 'floating') {
              createHoverParticles(sceneRef, particleSystemsRef, newHoveredObject.position, newHoveredObject.material.color);
            }
            
            // グロー効果を追加
            if (newHoveredObject.material && newHoveredObject.material.emissiveIntensity !== undefined) {
              newHoveredObject.userData.originalEmissive = newHoveredObject.material.emissiveIntensity;
              newHoveredObject.material.emissiveIntensity = 1.2;
            }
            
            // ホバー時のスケールアニメーション開始
            newHoveredObject.userData.hoverStartTime = Date.now();
          } else {
            console.log('❌ No valid experience data, clearing hover state');
            setHoveredExperience(null);
            canvasRef.current.style.cursor = 'default';
          }
        } else {
          // ホバー対象がない場合
          console.log('⭕ No hover target, clearing state');
          setHoveredExperience(null);
          canvasRef.current.style.cursor = 'default';
        }
      }
    }
  };

  // クリック処理
  const handleCanvasClick = (
    e,
    canvasRef,
    mouseRef,
    raycasterRef,
    cameraRef,
    meshesRef,
    sceneRef,
    particleSystemsRef,
    onExperienceClick
  ) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseRef.current.x = (x / rect.width) * 2 - 1;
    mouseRef.current.y = -(y / rect.height) * 2 + 1;
    
    console.log('=== Canvas Click デバッグ ===');
    console.log('クリック座標:', { x, y });
    
    if (raycasterRef.current && cameraRef.current && meshesRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(meshesRef.current);
      
      console.log('交差オブジェクト数:', intersects.length);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log('クリックされたオブジェクトのuserData:', clickedObject.userData);
        
        if (clickedObject.userData.experience) {
          const experienceData = clickedObject.userData.experience;
          console.log('Click experience data:', experienceData);
          
          // クリック時はホバー状態をクリア（モーダルとの競合を防ぐ）
          // setHoveredExperience(null); // この行をコメントアウトまたは削除
          
          // 完全な体験データを渡す
          onExperienceClick(experienceData);
        } else {
          console.log('体験データがuserDataに存在しない');
          console.log('利用可能なuserDataプロパティ:', Object.keys(clickedObject.userData));
        }
      } else {
        console.log('クリック対象なし');
      }
    } else {
      console.log('レイキャスト条件未満');
    }
  };

  return {
    handleWheel,
    handleMouseMove,
    handleCanvasClick
  };
};
