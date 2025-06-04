import { useState, useEffect, useCallback } from 'react';

/**
 * サーバーサイドビジュアライゼーションフック
 * サーバーが利用できない場合はフロントエンドにフォールバック
 */
export const useServerVisualization = (experiences) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useServerData, setUseServerData] = useState(false);
  const [serverError, setServerError] = useState(null);

  /**
   * フロントエンド用のフォールバックビジュアライゼーションデータ生成
   */  const generateFallbackVisualizationData = useCallback((experiencesData) => {
    if (!experiencesData || experiencesData.length === 0) {
      console.log('⚠️ 体験データがありません');
      return null;
    }

    console.log('🔍 受信した体験データ:', experiencesData);

    // 完了済み体験と未完了体験を分離
    const completedExperiences = experiencesData.filter(exp => exp.isCompleted || exp.completed);
    const incompleteExperiences = experiencesData.filter(exp => !exp.isCompleted && !exp.completed);    console.log('📊 体験データ分析:', {
      totalExperiences: experiencesData.length,
      completedExperiences: completedExperiences.length,
      incompleteExperiences: incompleteExperiences.length,
      sampleExperience: experiencesData[0] ? {
        id: experiencesData[0].id,
        isCompleted: experiencesData[0].isCompleted,
        completed: experiencesData[0].completed,
        title: experiencesData[0].title
      } : null
    });

    // フロントエンド用のビジュアライゼーションデータ構造
    const fallbackData = {
      spheres: completedExperiences.map((exp, index) => ({
        id: exp.id || index,
        position: {
          x: 0, // 実際の配置は optimizedThreeUtils で計算
          y: 0,
          z: 0
        },
        color: exp.color || '#4FC3F7',
        scale: 1.0,
        experience: exp,
        type: 'completed'
      })),
      floatingMissions: incompleteExperiences.slice(0, 5).map((exp, index) => ({ // 最大5つの浮遊ミッション
        id: exp.id || `floating_${index}`,
        position: {
          x: 0, // 実際の配置は optimizedThreeUtils で計算
          y: 0,
          z: 0
        },
        color: exp.color || '#81C784',
        scale: 0.8,
        experience: exp,
        type: 'floating'
      })),
      connections: completedExperiences.length > 1 ? 
        completedExperiences.slice(0, -1).map((exp, index) => ({
          from: index,
          to: index + 1,
          strength: 0.8,
          color: '#FFFFFF'
        })) : [],
      stars: {
        count: 200,
        distribution: 'optimized'
      },
      lighting: {
        ambient: 0.4,
        directional: 0.6
      },
      isServerData: false,
      generatedAt: new Date().toISOString()
    };

    return fallbackData;
  }, []);

  /**
   * サーバーからビジュアライゼーションデータを取得
   */
  const fetchServerVisualizationData = useCallback(async (experiencesData) => {
    try {
      setIsLoading(true);
      setServerError(null);      const response = await fetch('/api/visualization/experience-strings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experiencesData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }      const serverData = await response.json();
        if (serverData && serverData.status === 'success') {
        // サーバーデータにisServerDataフラグを確実に設定する
        const enhancedData = {
          ...serverData.data,
          isServerData: true  // サーバーデータフラグを明示的に設定
        };
        setVisualizationData(enhancedData);
        setUseServerData(true);
        console.log('✅ サーバーサイドビジュアライゼーションデータを取得しました');
        return enhancedData;
      } else {
        throw new Error('Server returned invalid data structure');
      }
    } catch (error) {
      console.warn('⚠️ サーバーサイドビジュアライゼーション取得に失敗:', error.message);
      setServerError(error.message);
      
      // フォールバックデータを生成
      const fallbackData = generateFallbackVisualizationData(experiencesData);
      setVisualizationData(fallbackData);
      setUseServerData(false);
      console.log('🔄 フロントエンドフォールバックデータを使用します');
      return fallbackData;
    } finally {
      setIsLoading(false);
    }
  }, [generateFallbackVisualizationData]);

  /**
   * データの初期化とロード
   */
  useEffect(() => {
    if (!experiences || experiences.length === 0) {
      setVisualizationData(null);
      return;
    }

    let isMounted = true;

    const loadVisualizationData = async () => {
      try {
        // まずサーバーサイドを試行
        const data = await fetchServerVisualizationData(experiences);
        
        if (isMounted) {
          setVisualizationData(data);
        }
      } catch (error) {
        console.error('ビジュアライゼーションデータの読み込みに失敗:', error);
        
        if (isMounted) {
          // 完全にフォールバック
          const fallbackData = generateFallbackVisualizationData(experiences);
          setVisualizationData(fallbackData);
          setUseServerData(false);
        }
      }
    };

    loadVisualizationData();

    return () => {
      isMounted = false;
    };
  }, [experiences, fetchServerVisualizationData, generateFallbackVisualizationData]);

  /**
   * 手動でサーバーデータを再取得
   */
  const retryServerData = useCallback(async () => {
    if (experiences && experiences.length > 0) {
      await fetchServerVisualizationData(experiences);
    }
  }, [experiences, fetchServerVisualizationData]);

  /**
   * フロントエンドフォールバックに強制切り替え
   */
  const forceUseFrontendData = useCallback(() => {
    const fallbackData = generateFallbackVisualizationData(experiences);
    setVisualizationData(fallbackData);
    setUseServerData(false);
    setServerError(null);
    console.log('🔄 フロントエンドデータに強制切り替えしました');
  }, [experiences, generateFallbackVisualizationData]);

  return {
    visualizationData,
    isLoading,
    useServerData,
    serverError,
    retryServerData,
    forceUseFrontendData
  };
};

export default useServerVisualization;
