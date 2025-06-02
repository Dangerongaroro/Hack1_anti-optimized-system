import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

/**
 * サーバー側ビジュアライゼーションデータを管理するフック
 */
export const useServerVisualization = (experiences) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useServerData, setUseServerData] = useState(false);

  useEffect(() => {
    const fetchVisualizationData = async () => {
      if (!experiences || experiences.length === 0) {
        setVisualizationData(null);
        setUseServerData(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // サーバー側でビジュアライゼーションデータを取得
        const serverData = await api.getVisualizationData(experiences);
        
        if (serverData) {
          setVisualizationData(serverData);
          setUseServerData(true);
          console.log('✅ Using server-side visualization data');
        } else {
          setVisualizationData(null);
          setUseServerData(false);
          console.log('⚠️ Falling back to client-side calculations');
        }
      } catch (error) {
        console.error('❌ Server visualization failed:', error);
        setVisualizationData(null);
        setUseServerData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisualizationData();
  }, [experiences]);

  return {
    visualizationData,
    isLoading,
    useServerData
  };
};
