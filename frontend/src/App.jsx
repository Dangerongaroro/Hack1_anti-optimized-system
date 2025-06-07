import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// 定数とサービス
import { initialExperiences, initialUserStats } from './constants/initialData.js';
import api from './services/api.js';
import { generateChallengeLocal } from './utils/helpers.js';
import { supabase } from './lib/supabase.js';

// コンポーネント
import HomeScreen from './screens/HomeScreen.jsx';
import RecommendationScreen from './screens/RecommendationScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import OnboardingScreen from './screens/OnboardingScreen.jsx';
import NavigationBar from './components/NavigationBar.jsx';
import ExperienceDetailModal from './components/ExperienceDetailModal.jsx';
import StringsGalleryScreen from './screens/StringsGalleryScreen.jsx';
import JournalEntryScreen from './screens/JournalEntryScreen.jsx';
import ThemeChallengeScreen from './screens/ThemeChallengeScreen.jsx';
import MissionPopup from './components/MissionPopup.jsx';

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    avoidCategories: [],
    preferredCategories: [],
    challengeFrequency: 'daily'
  });
  const [currentScreen, setCurrentScreen] = useState('home');
  const [experiences, setExperiences] = useState(() => {
    // ローカルストレージから読み込む際のデータ検証
    const savedExperiences = localStorage.getItem('experiences');
    if (savedExperiences) {
      try {
        const parsed = JSON.parse(savedExperiences);
        // データの検証と正規化
        return parsed.map((exp, index) => ({
          id: exp.id || index + 1,
          title: exp.title || '無題の体験',
          category: exp.category || 'その他',
          level: exp.level || 1,
          completed: exp.completed || false,
          date: exp.date ? new Date(exp.date) : new Date(),
          type: exp.type || 'general',
          ...exp
        }));
      } catch (error) {
        console.error('Failed to parse saved experiences:', error);
      }
    }
    
    // デフォルトの初期データも正規化
    return initialExperiences.map(exp => ({
      ...exp,
      date: new Date(exp.date),
      title: exp.title || '無題の体験',
      category: exp.category || 'その他'
    }));
  });
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [challengesByLevel, setChallengesByLevel] = useState({
    1: null,
    2: null,
    3: null
  });  const [currentChallenge, setCurrentChallenge] = useState(null);
  // ユーザー統計（使用時に更新）
  const [userStats] = useState(initialUserStats);
  const [selectedExperience, setSelectedExperience] = useState(null);
  
  // selectedExperience の変更を監視
  useEffect(() => {
    console.log('🔍 selectedExperience 状態変更:', selectedExperience);
  }, [selectedExperience]);  const [challengesInitialized, setChallengesInitialized] = useState(false);
  const [showMissionPopup, setShowMissionPopup] = useState(false);
  
  // 認証状態管理
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null
  });
  
  // 認証が必要かどうかを判定
  const shouldRequireAuth = import.meta.env.VITE_SKIP_AUTH !== 'true';
  
  // 認証状態の監視
  useEffect(() => {
    if (!shouldRequireAuth) {
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      return;
    }
    
    // 現在の認証状態をチェック
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState({
          isLoading: false,
          isAuthenticated: !!session?.user,
          user: session?.user || null
        });
      } catch (error) {
        console.error('認証状態チェックエラー:', error);
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
      }
    };
    
    checkAuth();
    
    // 認証状態変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('認証状態変更:', event, session?.user?.email);
      setAuthState({
        isLoading: false,
        isAuthenticated: !!session?.user,
        user: session?.user || null
      });
    });
    
    return () => subscription.unsubscribe();
  }, [shouldRequireAuth]);
  // generateChallenge関数をmemoize
  const generateChallenge = useCallback(async (level) => {
    try {
      console.log(`🌐 APIでレベル${level}のお題生成を試行中...`);
      const challenge = await api.getRecommendation(level, userPreferences, experiences);
      console.log(`✅ APIでレベル${level}のお題生成成功:`, challenge);
      return {
        ...challenge,
        level: level
      };
    } catch (error) {
      console.error(`❌ APIでレベル${level}のお題生成に失敗:`, error);
      console.warn(`🔄 レベル${level}の生成をローカル処理に切り替えます`);
      
      const localChallenge = generateChallengeLocal(level);
      console.log(`🏠 ローカルでレベル${level}のお題生成完了:`, localChallenge);
      
      return {
        ...localChallenge,
        level: level
      };
    }
  }, [userPreferences, experiences]);
  // デバウンス用のタイマーRef
  const debounceTimerRef = useRef(null);

  // デバウンス付きのAPI更新関数
  const debouncedUpdatePreferences = useCallback((updatedExperiences, delay = 2000) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      console.log('🔄 デバウンス後にプリファレンス更新実行');
      api.updatePreferences(updatedExperiences);
    }, delay);
  }, []);


  // 初回起動チェック - ローカルストレージの重複読み込みを削除
  useEffect(() => {
    api.initialize();
    
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      if (preferences.setupCompleted) {
        setUserPreferences(preferences);
        setSelectedLevel(preferences.challengeLevel || 2);
        setIsFirstLaunch(false);
      }
    }
    // experiences の重複読み込みを削除（初期化時に既に読み込み済み）
  }, []);

  // 全レベルのお題を生成する関数（依存配列を最適化）
  const generateAllLevelChallenges = useCallback(async () => {
    console.log('🎯 全レベルのお題生成を開始');
    setChallengesInitialized(false);
    
    const newChallenges = {};
    
    for (let level = 1; level <= 3; level++) {
      try {
        const challenge = await generateChallenge(level);
        newChallenges[level] = challenge;
        console.log(`✅ レベル${level}のお題生成完了`);
      } catch (error) {
        console.error(`❌ レベル${level}のお題生成に失敗:`, error);
        console.warn(`🔄 レベル${level}の生成を緊急ローカル処理に切り替え`);
        
        const localChallenge = generateChallengeLocal(level);
        newChallenges[level] = localChallenge;
        console.log(`🏠 緊急ローカル処理でレベル${level}生成完了:`, localChallenge);
      }
    }
    
    setChallengesByLevel(newChallenges);
    setCurrentChallenge(newChallenges[selectedLevel]);
    setChallengesInitialized(true);
    console.log('🎯 全レベルのお題生成完了:', newChallenges);
  }, [generateChallenge, selectedLevel]); // 必要な依存関係のみ

  // 初期化フラグを追加
  const [initializedOnce, setInitializedOnce] = useState(false);  // 🎯 最適化: 統合されたuseEffect - 初期化と選択レベルの更新を1つにまとめる
  useEffect(() => {
    // 初回チャレンジ生成（1回のみ）
    if (userPreferences?.setupCompleted && experiences.length > 0 && !initializedOnce) {
      console.log('🚀 初回チャレンジ生成開始 - 1回のみ実行');
      generateAllLevelChallenges();
      setInitializedOnce(true);
      return; // 初回生成時は現在のチャレンジ設定をスキップ
    }
    
    // レベル選択変更時の現在チャレンジ更新
    if (challengesByLevel[selectedLevel] && challengesInitialized) {
      setCurrentChallenge(challengesByLevel[selectedLevel]);
    }
  }, [userPreferences?.setupCompleted, experiences.length, initializedOnce, generateAllLevelChallenges, selectedLevel, challengesByLevel, challengesInitialized]);const regenerateCurrentLevelChallenge = useCallback(async () => {
    console.log(`🔄 レベル${selectedLevel}のお題を再生成中...`);
    try {
      const challenge = await generateChallenge(selectedLevel);
      setChallengesByLevel(prev => ({
        ...prev,
        [selectedLevel]: challenge
      }));
      setCurrentChallenge(challenge);
      console.log(`✅ レベル${selectedLevel}のお題再生成完了:`, challenge);
    } catch (error) {
      console.error(`❌ レベル${selectedLevel}のお題再生成に失敗:`, error);
      console.warn(`🔄 レベル${selectedLevel}の再生成を緊急ローカル処理に切り替え`);
      
      const localChallenge = generateChallengeLocal(selectedLevel);
      setChallengesByLevel(prev => ({
        ...prev,
        [selectedLevel]: localChallenge
      }));
      setCurrentChallenge(localChallenge);
      console.log(`🏠 緊急ローカル処理でレベル${selectedLevel}再生成完了:`, localChallenge);
    }
  }, [generateChallenge, selectedLevel]);

  const handleOnboardingComplete = useCallback((preferences) => {
    setUserPreferences(preferences);
    setIsFirstLaunch(false);
    localStorage.setItem('userPreferences', JSON.stringify({
      ...preferences,
      setupCompleted: true
    }));
  }, []);

  const handleResetOnboarding = useCallback(() => {
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('experiences');
    setIsFirstLaunch(true);
    setUserPreferences({
      avoidCategories: [],
      preferredCategories: [],
      challengeFrequency: 'daily'
    });
    setExperiences(initialExperiences.map(exp => ({...exp, date: new Date(exp.date)})));
    setChallengesByLevel({
      1: null,
      2: null,
      3: null
    });
    setCurrentChallenge(null);
  }, []);
  const acceptChallenge = useCallback(() => {
    if (currentChallenge) {
      const newExperience = {
        id: experiences.length + 1,
        date: new Date(),
        type: currentChallenge.type || 'general',
        level: currentChallenge.level || selectedLevel,
        title: currentChallenge.title || '新しい体験', // 確実にタイトルを設定
        category: currentChallenge.category || 'その他',
        description: currentChallenge.description || '', // 説明も追加
        completed: false,
        deviation: 30 + Math.random() * 60
      };
      
      // デバッグログを追加
      console.log('Creating experience from challenge:', {
        challenge: currentChallenge,
        newExperience: newExperience
      });
      
      const updatedExperiences = [...experiences, newExperience];
      setExperiences(updatedExperiences);
      setCurrentScreen('home');
      setCurrentChallenge(null);
      
      // バックグラウンドでデータ保存（デバウンス付き）
      requestIdleCallback(() => {
        localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
        debouncedUpdatePreferences(updatedExperiences);
      });
      
      setShowMissionPopup(true); // ミッション開始時にポップアップを表示
    }
  }, [currentChallenge, experiences, selectedLevel, debouncedUpdatePreferences]);

  const handleCloseMissionPopup = useCallback(() => {
    setShowMissionPopup(false);
  }, []);

  const skipChallenge = useCallback(async (reason) => {
    if (currentChallenge) {
      const challengeId = currentChallenge.id || `challenge_skipped_${Date.now()}`;
      await api.sendFeedback(challengeId, reason);
    }
  }, [currentChallenge]);
  const saveJournalEntry = useCallback((entry) => {
    const newExperience = {
      id: experiences.length + 1,
      ...entry,
      date: new Date(),
      type: 'journal',
      completed: true,
      deviation: 30 + Math.random() * 60
    };
    const updatedExperiences = [...experiences, newExperience];
    setExperiences(updatedExperiences);
    setCurrentScreen('home');
    
    // バックグラウンドでデータ保存（デバウンス付き）
    requestIdleCallback(() => {
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
      debouncedUpdatePreferences(updatedExperiences);
    });
  }, [experiences, debouncedUpdatePreferences]);
  const handleExperienceFeedback = useCallback(async (experienceId, feedback) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === experienceId ? { ...exp, feedback } : exp
    );
    setExperiences(updatedExperiences);
    setSelectedExperience(null);
    
    // フィードバックのAPI呼び出しは即座に実行（ユーザーの意図を反映するため）
    await api.sendFeedback(experienceId, feedback);
    
    // プリファレンス更新はデバウンス付き
    requestIdleCallback(() => {
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
      debouncedUpdatePreferences(updatedExperiences);
    });
  }, [experiences, debouncedUpdatePreferences]);const handleClearMission = useCallback((experienceId) => {
    console.log('🎯 ミッション完了処理開始:', experienceId);
    
    const updatedExperiences = experiences.map(exp =>
      exp.id === experienceId ? { ...exp, completed: true } : exp
    );
    
    // 状態更新とデータ保存を効率的に実行
    setExperiences(updatedExperiences);
    
    // モーダルを閉じる（不要な再描画を防ぐ）
    if (selectedExperience && selectedExperience.id === experienceId) {
      setSelectedExperience(null);
    }
    
    // バックグラウンドでデータ保存（デバウンス付き）
    requestIdleCallback(() => {
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
      // デバウンスされたAPI呼び出し
      debouncedUpdatePreferences(updatedExperiences);
    });
    
    console.log('✅ ミッション完了処理完了:', experienceId);
  }, [experiences, selectedExperience, debouncedUpdatePreferences]);

  const navigateToRecommendation = useCallback(() => {
    setCurrentScreen('recommendation');
  }, []);  // 体験検索用のMapをメモ化（高速検索のため）
  const experienceMap = useMemo(() => {
    const map = new Map();
    experiences.forEach(exp => map.set(exp.id, exp));
    return map;
  }, [experiences]);

  // 体験クリック処理（最適化版 - Map使用で高速検索）
  const handleExperienceClick = useCallback((experienceData) => {
    console.log('=== handleExperienceClick デバッグ ===');
    console.log('クリックされた体験データ:', experienceData);
    console.log('現在のselectedExperience:', selectedExperience);
    
    if (!experienceData) {
      console.log('無効な体験データのため処理をスキップ');
      return;
    }
    
    // 効率的なデータ取得（Map使用で高速検索）
    let fullExperience;
    if (typeof experienceData === 'object' && experienceData.id) {
      // IDのみまたは部分オブジェクトの場合
      fullExperience = experienceMap.get(experienceData.id) || experienceData;
    } else if (typeof experienceData === 'number') {
      // IDが数値で直接渡された場合
      fullExperience = experienceMap.get(experienceData);
    } else {
      fullExperience = experienceData;
    }
    
    if (fullExperience) {
      console.log('selectedExperience に設定する値:', fullExperience);
      setSelectedExperience(fullExperience);
      console.log('selectedExperience 設定完了');
    } else {
      console.log('体験データが見つからない');
    }
  }, [experienceMap, selectedExperience]);

  const navigateToJournalEntry = useCallback(() => {
    setCurrentScreen('journal-entry');
  }, []);
  const handleJoinThemeChallenge = useCallback((theme) => {
    // テーマに関連するお題を生成
    theme.challenges.forEach((challengeTitle, index) => {
      const newExperience = {
        id: experiences.length + 1 + index,
        date: new Date(),
        type: 'theme-challenge',
        level: theme.difficulty,
        title: challengeTitle,
        category: 'テーマチャレンジ',
        completed: false,
        themeId: theme.id,
        themeName: theme.title,
        deviation: 30 + Math.random() * 60
      };
      setExperiences(prev => [...prev, newExperience]);
    });
    setCurrentScreen('home');
  }, [experiences]);
  // 認証ローディング中の表示
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }
  
  // 認証が必要で未認証の場合は認証画面を表示
  if (shouldRequireAuth && !authState.isAuthenticated) {
    return (
      <ErrorBoundary className="min-h-screen">
        <ProfileScreen onNavigate={setCurrentScreen} />
      </ErrorBoundary>
    );
  }

  // 初回起動時はオンボーディング画面を表示
  if (isFirstLaunch) {
    return (
      <ErrorBoundary className="min-h-screen">
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <div className="mx-auto bg-white w-full max-w-screen-xl relative pb-20">
          {currentScreen === 'home' && (
            <HomeScreen 
              experiences={experiences}
              userStats={userStats}
              onNavigateToRecommendation={navigateToRecommendation}
              onExperienceClick={handleExperienceClick}
              onClearMission={handleClearMission}
              onNavigateToJournalEntry={navigateToJournalEntry}
            />
          )}
          {currentScreen === 'recommendation' && (
            <RecommendationScreen
              currentChallenge={challengesInitialized ? currentChallenge : null}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              onGenerateChallenge={regenerateCurrentLevelChallenge}
              onAcceptChallenge={acceptChallenge}
              onSkipChallenge={skipChallenge}
              onClose={() => setCurrentScreen('home')}
            />
          )}
          {currentScreen === 'profile' && (
            <ProfileScreen 
              userStats={userStats}
              onResetOnboarding={handleResetOnboarding}
            />
          )}
          {currentScreen === 'gallery' && (
            <StringsGalleryScreen
              experiences={experiences}
              onBack={() => setCurrentScreen('home')}
            />
          )}
          {currentScreen === 'journal-entry' && (
            <JournalEntryScreen
              onBack={() => setCurrentScreen('home')}
              onSave={saveJournalEntry}
            />
          )}
          {currentScreen === 'theme-challenge' && (
            <ThemeChallengeScreen
              onBack={() => setCurrentScreen('home')}
              onJoinChallenge={handleJoinThemeChallenge}
            />
          )}          {selectedExperience && (
            <ExperienceDetailModal
              experience={selectedExperience}
              onClose={() => {
                console.log('モーダルを閉じる処理');
                setSelectedExperience(null);
              }}
              onFeedback={handleExperienceFeedback}
              onClearMission={handleClearMission}
            />
          )}

          {!['journal', 'theme-challenge', 'journal-entry'].includes(currentScreen) && (
            <NavigationBar
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              onNavigateToRecommendation={navigateToRecommendation}
            />
          )}

          <MissionPopup
            isOpen={showMissionPopup}
            onClose={handleCloseMissionPopup}
            floatingMissionsCount={experiences.filter(exp => !exp.completed).length}
          />
        </div>
      </ErrorBoundary>

    </div>
  );
};

export default App;
