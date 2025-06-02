import { useState, useEffect } from 'react';
import api from '../services/api.js'; // default importに変更

export const useServerVisualization = (experiences) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [useServerData, setUseServerData] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisualizationData = async () => {
      if (!experiences || experiences.length === 0) return;
      
      // AI機能とAPIの可用性をチェック
      if (!api.getAIEnabled()) {
        setUseServerData(false);
        return;
      }

      setLoading(true);
      try {
        const serverData = await api.getVisualizationData(experiences);
        if (serverData) {
          setVisualizationData(serverData);
          setUseServerData(true);
          console.log('🖥️ Using server-side visualization data');
        } else {
          setUseServerData(false);
          console.log('💻 Falling back to client-side calculations');
        }
      } catch (error) {
        console.warn('Visualization API error:', error);
        setUseServerData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchVisualizationData();
  }, [experiences]);

  return {
    visualizationData,
    useServerData,
    loading
  };
};