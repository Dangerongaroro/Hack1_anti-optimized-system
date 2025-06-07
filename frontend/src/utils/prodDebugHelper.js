/**
 * 本番環境デバッグヘルパー
 * ユーザーが本番環境でブラウザコンソールから実行できるデバッグ関数
 */

// グローバルデバッグオブジェクト
window.ExperienceStringsDebug = {
  // 基本診断情報
  diagnose: () => {
    console.log('🔧 === 本番環境デバッグ診断 ===');
    
    // 診断情報関数が存在するかチェック
    if (window.debugExperienceStrings) {
      console.log('✅ debugExperienceStrings関数が利用可能');
      window.debugExperienceStrings();
    } else {
      console.log('❌ debugExperienceStrings関数が見つかりません');
    }

    // ブラウザ情報
    console.log('ブラウザ情報:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    });

    // 画面情報
    console.log('画面情報:', {
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    });

    // WebGL対応状況
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      console.log('WebGL対応状況:', {
        supported: !!gl,
        version: gl ? gl.getParameter(gl.VERSION) : 'N/A',
        vendor: gl ? gl.getParameter(gl.VENDOR) : 'N/A',
        renderer: gl ? gl.getParameter(gl.RENDERER) : 'N/A'
      });
    } catch (error) {
      console.log('❌ WebGL診断エラー:', error);
    }

    // Canvas要素の確認
    const canvasElements = document.querySelectorAll('canvas');
    console.log('Canvas要素:', {
      count: canvasElements.length,
      elements: Array.from(canvasElements).map(canvas => ({
        id: canvas.id,
        className: canvas.className,
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        style: canvas.style.cssText
      }))
    });

    console.log('=== 診断完了 ===');
  },

  // イベントリスナーのテスト
  testEventListeners: () => {
    console.log('🎛️ === イベントリスナーテスト ===');
    
    const canvasElements = document.querySelectorAll('canvas');
    if (canvasElements.length === 0) {
      console.log('❌ Canvas要素が見つかりません');
      return;
    }

    const canvas = canvasElements[0];
    console.log('📍 テスト対象Canvas:', canvas);

    // テスト用のイベントハンドラー
    const testClickHandler = (e) => {
      console.log('🖱️ テストクリックイベント発火:', {
        type: e.type,
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
        currentTarget: e.currentTarget
      });
    };

    const testTouchHandler = (e) => {
      console.log('📱 テストタッチイベント発火:', {
        type: e.type,
        touches: e.touches.length,
        target: e.target,
        currentTarget: e.currentTarget
      });
    };

    // テストイベントリスナーを一時的に追加
    canvas.addEventListener('click', testClickHandler);
    canvas.addEventListener('touchend', testTouchHandler);

    console.log('✅ テストイベントリスナーを追加しました');
    console.log('💡 Canvasをクリックまたはタップしてイベントが正常に発火するか確認してください');
    
    // 10秒後に削除
    setTimeout(() => {
      canvas.removeEventListener('click', testClickHandler);
      canvas.removeEventListener('touchend', testTouchHandler);
      console.log('🗑️ テストイベントリスナーを削除しました');
    }, 10000);
  },

  // シミュレートクリック
  simulateClick: (x = 200, y = 200) => {
    console.log('🖱️ === クリックシミュレーション ===');
    
    const canvasElements = document.querySelectorAll('canvas');
    if (canvasElements.length === 0) {
      console.log('❌ Canvas要素が見つかりません');
      return;
    }

    const canvas = canvasElements[0];
    const rect = canvas.getBoundingClientRect();
    
    console.log('📍 シミュレーション座標:', { x, y });
    console.log('📐 Canvas位置:', rect);

    // クリックイベントを作成
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + x,
      clientY: rect.top + y
    });

    console.log('🎯 クリックイベント送信中...');
    canvas.dispatchEvent(clickEvent);
    console.log('✅ クリックイベント送信完了');
  },

  // コンソールログレベルの確認
  checkConsoleLogging: () => {
    console.log('📝 === コンソールログレベル確認 ===');
    console.log('通常ログ - このメッセージが表示されますか？');
    console.info('情報ログ - このメッセージが表示されますか？');
    console.warn('警告ログ - このメッセージが表示されますか？');
    console.error('エラーログ - このメッセージが表示されますか？');
    console.debug('デバッグログ - このメッセージが表示されますか？');
    console.log('=== ログレベル確認完了 ===');
  },
  // 本番環境と開発環境の違いを確認
  checkEnvironment: () => {
    console.log('🌍 === 環境情報確認 ===');
    
    // Viteの環境変数
    console.log('Vite環境:', import.meta.env);
    
    // その他の環境情報
    console.log('Location:', {
      href: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname
    });

    // ビルド情報（もしあれば）
    console.log('Build情報:', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    console.log('=== 環境情報確認完了 ===');
  },

  // API接続テスト
  testApiConnection: async () => {
    console.log('🌐 === API接続テスト ===');
    
    // API設定の確認
    const getApiBaseUrl = () => {
      if (import.meta.env.PROD) {
        return 'https://seren-path-backend.onrender.com/api';
      }
      return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    };

    const apiBaseUrl = getApiBaseUrl();
    console.log('API Base URL:', apiBaseUrl);
    
    // ヘルスチェックエンドポイントをテスト
    const testEndpoints = [
      '/health',
      '/challenges',
      '/experiences',
      '/'
    ];

    for (const endpoint of testEndpoints) {
      const fullUrl = apiBaseUrl + endpoint;
      console.log(`🔍 テスト中: ${fullUrl}`);
      
      try {
        const startTime = performance.now();
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // タイムアウトを設定
          signal: AbortSignal.timeout(10000) // 10秒
        });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        console.log(`✅ ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          headers: Object.fromEntries(response.headers.entries())
        });

        // レスポンスの内容も確認（小さなレスポンスのみ）
        if (response.ok && response.headers.get('content-length') < 1000) {
          try {
            const data = await response.clone().json();
            console.log(`📄 ${endpoint} レスポンス内容:`, data);
          } catch (e) {
            console.log(`📄 ${endpoint} レスポンス: JSON以外の形式`);
          }
        }

      } catch (error) {
        console.error(`❌ ${endpoint} エラー:`, {
          name: error.name,
          message: error.message,
          cause: error.cause
        });
      }
    }
    
    console.log('=== API接続テスト完了 ===');
  },

  // CORS問題の診断
  diagnoseCORS: async () => {
    console.log('🔒 === CORS診断 ===');
    
    const apiBaseUrl = import.meta.env.PROD 
      ? 'https://seren-path-backend.onrender.com/api'
      : 'http://localhost:8000/api';
    
    console.log('フロントエンドOrigin:', window.location.origin);
    console.log('バックエンドURL:', apiBaseUrl);
    
    try {
      // OPTIONSリクエストでCORSヘッダーを確認
      const response = await fetch(apiBaseUrl + '/health', {
        method: 'OPTIONS'
      });
      
      console.log('CORS OPTIONS レスポンス:', {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
          'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        }
      });
      
    } catch (error) {
      console.error('❌ CORS診断エラー:', error);
    }
    
    console.log('=== CORS診断完了 ===');
  },

  // ネットワーク接続性のテスト
  testNetworkConnectivity: async () => {
    console.log('🌐 === ネットワーク接続性テスト ===');
    
    // 基本的な接続性テスト
    const testUrls = [
      'https://httpbin.org/get', // 外部API
      'https://seren-path-backend.onrender.com', // バックエンドルート
      'https://seren-path-backend.onrender.com/api', // APIエンドポイント
    ];
    
    for (const url of testUrls) {
      console.log(`🔍 接続テスト: ${url}`);
      
      try {
        const startTime = performance.now();
        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5秒タイムアウト
        });
        const endTime = performance.now();
        
        console.log(`✅ ${url}:`, {
          status: response.status,
          responseTime: `${Math.round(endTime - startTime)}ms`,
          accessible: response.ok
        });
        
      } catch (error) {
        console.error(`❌ ${url}:`, error.message);
      }
    }
    
    console.log('=== ネットワーク接続性テスト完了 ===');
  }
};

console.log('🔧 本番環境デバッグヘルパーが読み込まれました');
console.log('💡 使用方法:');
console.log('  - ExperienceStringsDebug.diagnose() : 基本診断');
console.log('  - ExperienceStringsDebug.testEventListeners() : イベントリスナーテスト');
console.log('  - ExperienceStringsDebug.simulateClick(x, y) : クリックシミュレーション');
console.log('  - ExperienceStringsDebug.checkConsoleLogging() : ログレベル確認');
console.log('  - ExperienceStringsDebug.checkEnvironment() : 環境情報確認');
console.log('  - ExperienceStringsDebug.testApiConnection() : API接続テスト');
console.log('  - ExperienceStringsDebug.diagnoseCORS() : CORS診断');
console.log('  - ExperienceStringsDebug.testNetworkConnectivity() : ネットワーク接続性テスト');
