// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// 定数とサービス
import { initialExperiences, initialUserStats } from './constants/initialData';
import api from './services/api';
import { generateChallengeLocal } from './utils/helpers.js';

// コンポーネント
import HomeScreen from './screens/HomeScreen.jsx';
import RecommendationScreen from './screens/RecommendationScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import NavigationBar from './components/NavigationBar';
import ExperienceDetailModal from './components/ExperienceDetailModal';

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    avoidCategories: [],
    preferredCategories: [],
    challengeFrequency: 'daily'
  });
  const [currentScreen, setCurrentScreen] = useState('home');
  const [experiences, setExperiences] = useState(
    initialExperiences.map(exp => ({...exp, date: new Date(exp.date)}))
  );
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  // レベル別お題を保持する状態を追加
  const [challengesByLevel, setChallengesByLevel] = useState({
    1: null,
    2: null,
    3: null
  });
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [journalEntry, setJournalEntry] = useState({ title: '', category: '', emotion: '' });
  const [userStats, setUserStats] = useState(initialUserStats);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // お題生成の完了状態を追加
  const [challengesInitialized, setChallengesInitialized] = useState(false);

  // generateChallenge関数をコンポーネント内に移動
  const generateChallenge = async (level) => {
    try {
      // 既存のapi.jsのgetRecommendationメソッドを使用
      const challenge = await api.getRecommendation(level, userPreferences, experiences);
      
      // レベル情報を確実に追加
      return {
        ...challenge,
        level: level
      };
    } catch (error) {
      console.error('API接続エラー:', error);
      // APIが失敗した場合はローカル生成にフォールバック
      const localChallenge = generateChallengeLocal(level);
      return {
        ...localChallenge,
        level: level
      };
    }
  };

  // 初回起動チェック
  useEffect(() => {
    // API初期化を追加
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
    // ローカルストレージから体験データをロード
    const savedExperiences = localStorage.getItem('experiences');
    if (savedExperiences) {
      setExperiences(JSON.parse(savedExperiences).map(exp => ({...exp, date: new Date(exp.date)})));
    }
  }, []);

  // 全レベルのお題を生成する関数
  const generateAllLevelChallenges = useCallback(async () => {
    console.log('🎯 全レベルのお題生成を開始');
    console.log('現在のuserPreferences:', userPreferences);
    console.log('現在のexperiences数:', experiences.length);
    
    // 生成開始時に初期化状態をfalseに
    setChallengesInitialized(false);
    
    const newChallenges = { ...challengesByLevel };
    
    for (let level = 1; level <= 3; level++) {
      console.log(`📝 レベル${level}のお題を生成中...`);
      try {
        const challenge = await generateChallenge(level);
        console.log(`✅ レベル${level}の生成結果:`, challenge);
        console.log(`✅ レベル${level}のlevelプロパティ:`, challenge.level);
        newChallenges[level] = challenge;
      } catch (error) {
        console.error(`❌ レベル${level}のお題生成に失敗:`, error);
        // エラー時はローカル生成にフォールバック
        const localChallenge = generateChallengeLocal(level);
        console.log(`🔄 レベル${level}のローカル生成結果:`, localChallenge);
        newChallenges[level] = localChallenge;
      }
    }
    
    console.log('🎊 全レベルのお題生成完了:', newChallenges);
    setChallengesByLevel(newChallenges);
    setCurrentChallenge(newChallenges[selectedLevel]);
    
    // 全て完了してから初期化完了をtrueに
    setChallengesInitialized(true);
  }, [userPreferences, experiences, challengesByLevel, selectedLevel, generateChallenge]);

  // userPreferencesとexperiencesの状態が更新された後にお題を生成
  useEffect(() => {
    if (userPreferences && experiences && userPreferences.setupCompleted) {
      generateAllLevelChallenges();
    }
  }, [userPreferences, experiences]); // generateAllLevelChallengesを依存関係に含めるとループになる可能性があるため除外

  // レベル変更時に対応するお題を表示するuseEffect
  useEffect(() => {
    if (challengesByLevel[selectedLevel] && challengesInitialized) {
      setCurrentChallenge(challengesByLevel[selectedLevel]);
    }
  }, [selectedLevel, challengesByLevel, challengesInitialized]);

  // 特定レベルのお題だけを再生成する関数
  const regenerateCurrentLevelChallenge = async () => {
    try {
      const challenge = await generateChallenge(selectedLevel);
      console.log(`🔄 レベル${selectedLevel}の再生成結果:`, challenge);
      
      setChallengesByLevel(prev => ({
        ...prev,
        [selectedLevel]: challenge
      }));
      setCurrentChallenge(challenge);
    } catch (error) {
      console.error('お題生成に失敗:', error);
      const localChallenge = generateChallengeLocal(selectedLevel);
      console.log(`🔄 レベル${selectedLevel}のローカル再生成結果:`, localChallenge);
      
      setChallengesByLevel(prev => ({
        ...prev,
        [selectedLevel]: localChallenge
      }));
      setCurrentChallenge(localChallenge);
    }
  };

  // handleGenerateChallenge関数の修正
  const handleGenerateChallenge = useCallback(() => {
    regenerateCurrentLevelChallenge();
  }, [regenerateCurrentLevelChallenge]); // 正しい依存関係を追加

  const handleOnboardingComplete = useCallback((preferences) => {
    console.log('オンボーディング完了:', preferences);
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
        type: currentChallenge.type,
        level: currentChallenge.level,
        title: currentChallenge.title,
        category: currentChallenge.category,
        completed: false,
        deviation: 30 + Math.random() * 60
      };
      const updatedExperiences = [...experiences, newExperience];
      setExperiences(updatedExperiences);
      setCurrentScreen('home');
      setCurrentChallenge(null);
      api.updatePreferences(updatedExperiences);
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences)); // ローカルストレージに保存
    }
  }, [currentChallenge, experiences]);

  const skipChallenge = useCallback(async (reason) => {
    if (currentChallenge) {
      const challengeId = currentChallenge.id || `challenge_skipped_${Date.now()}`;
      await api.sendFeedback(challengeId, reason);
    }
  }, [currentChallenge]);

  const saveJournalEntry = useCallback(() => {
    if (journalEntry.title && journalEntry.category) {
      const newExperience = {
        id: experiences.length + 1,
        date: new Date(),
        type: 'journal',
        level: 2,
        title: journalEntry.title,
        category: journalEntry.category,
        completed: true,
        deviation: 30 + Math.random() * 60,
        emotion: journalEntry.emotion || ''
      };
      const updatedExperiences = [...experiences, newExperience];
      setExperiences(updatedExperiences);
      setJournalEntry({ title: '', category: '', emotion: '' });
      setCurrentScreen('home');
      api.updatePreferences(updatedExperiences);
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences)); // ローカルストレージに保存
    }
  }, [journalEntry, experiences]);

  const handleExperienceFeedback = useCallback(async (experienceId, feedback) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === experienceId ? { ...exp, feedback } : exp
    );
    setExperiences(updatedExperiences);
    setSelectedExperience(null);
    await api.sendFeedback(experienceId, feedback);
    await api.updatePreferences(updatedExperiences);
    localStorage.setItem('experiences', JSON.stringify(updatedExperiences)); // ローカルストレージに保存
  }, [experiences]);

  const handleClearMission = useCallback((experienceId) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === experienceId ? { ...exp, completed: true } : exp
    );
    setExperiences(updatedExperiences);
    setSelectedExperience(null);
    api.updatePreferences(updatedExperiences);
    localStorage.setItem('experiences', JSON.stringify(updatedExperiences)); // ローカルストレージに保存
  }, [experiences]);

  const navigateToRecommendation = useCallback(() => {
    // handleGenerateChallenge()を削除 - 不要
    setCurrentScreen('recommendation');
  }, []); // handleGenerateChallenge依存関係も削除

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
        <div className="mx-auto bg-white w-full relative pb-20 flex items-center justify-center"> {/* NavBarの高さ分padding-bottom */}
          {currentScreen === 'home' && (
            <HomeScreen
              experiences={experiences}
              userStats={userStats}
              onNavigateToRecommendation={navigateToRecommendation}
              onExperienceClick={setSelectedExperience}
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
              onResetOnboarding={handleResetOnboarding}  // この行を追加
            />
          )}

            {selectedExperience && (
              <ExperienceDetailModal
                experience={selectedExperience}
                onClose={() => setSelectedExperience(null)}
                onFeedback={handleExperienceFeedback}
                onClearMission={handleClearMission} // onClearMissionを渡す
              />
            )}

          {!['journal-entry'].includes(currentScreen) && ( // recommendation画面でもNavBar非表示
            <NavigationBar
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              onNavigateToRecommendation={navigateToRecommendation}
            />
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default App;
