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
import StringsGalleryScreen from './screens/StringsGalleryScreen';
import JournalEntryScreen from './screens/JournalEntryScreen';
import ThemeChallengeScreen from './screens/ThemeChallengeScreen';

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
  const [challengesByLevel, setChallengesByLevel] = useState({
    1: null,
    2: null,
    3: null
  });
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [journalEntry, setJournalEntry] = useState({ title: '', category: '', emotion: '' });
  const [userStats, setUserStats] = useState(initialUserStats);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [challengesInitialized, setChallengesInitialized] = useState(false);
  const [activeThemeChallenge, setActiveThemeChallenge] = useState(null);

  // generateChallenge関数
  const generateChallenge = async (level) => {
    try {
      const challenge = await api.getRecommendation(level, userPreferences, experiences);
      return {
        ...challenge,
        level: level
      };
    } catch (error) {
      console.error('API接続エラー:', error);
      const localChallenge = generateChallengeLocal(level);
      return {
        ...localChallenge,
        level: level
      };
    }
  };

  // 初回起動チェック
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
    const savedExperiences = localStorage.getItem('experiences');
    if (savedExperiences) {
      setExperiences(JSON.parse(savedExperiences).map(exp => ({...exp, date: new Date(exp.date)})));
    }
  }, []);

  // 全レベルのお題を生成する関数（依存配列を修正）
  const generateAllLevelChallenges = useCallback(async () => {
    console.log('🎯 全レベルのお題生成を開始');
    setChallengesInitialized(false);
    
    const newChallenges = {};
    
    for (let level = 1; level <= 3; level++) {
      try {
        const challenge = await generateChallenge(level);
        newChallenges[level] = challenge;
      } catch (error) {
        console.error(`❌ レベル${level}のお題生成に失敗:`, error);
        const localChallenge = generateChallengeLocal(level);
        newChallenges[level] = localChallenge;
      }
    }
    
    setChallengesByLevel(newChallenges);
    setCurrentChallenge(newChallenges[selectedLevel]);
    setChallengesInitialized(true);
  }, [userPreferences, experiences, selectedLevel]); // challengesByLevelを削除

  // 初期化フラグを追加
  const [initializedOnce, setInitializedOnce] = useState(false);

  useEffect(() => {
    if (userPreferences?.setupCompleted && experiences && !initializedOnce) {
      generateAllLevelChallenges();
      setInitializedOnce(true);
    }
  }, [userPreferences, experiences, initializedOnce, generateAllLevelChallenges]);

  useEffect(() => {
    if (userPreferences && experiences && userPreferences.setupCompleted) {
      generateAllLevelChallenges();
    }
  }, [userPreferences, experiences]);

  useEffect(() => {
    if (challengesByLevel[selectedLevel] && challengesInitialized) {
      setCurrentChallenge(challengesByLevel[selectedLevel]);
    }
  }, [selectedLevel, challengesByLevel, challengesInitialized]);

  const regenerateCurrentLevelChallenge = async () => {
    try {
      const challenge = await generateChallenge(selectedLevel);
      setChallengesByLevel(prev => ({
        ...prev,
        [selectedLevel]: challenge
      }));
      setCurrentChallenge(challenge);
    } catch (error) {
      console.error('お題生成に失敗:', error);
      const localChallenge = generateChallengeLocal(selectedLevel);
      setChallengesByLevel(prev => ({
        ...prev,
        [selectedLevel]: localChallenge
      }));
      setCurrentChallenge(localChallenge);
    }
  };

  const handleGenerateChallenge = useCallback(() => {
    regenerateCurrentLevelChallenge();
  }, [selectedLevel]);

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
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
    }
  }, [currentChallenge, experiences]);

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
    api.updatePreferences(updatedExperiences);
    localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
  }, [experiences]);

  const handleExperienceFeedback = useCallback(async (experienceId, feedback) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === experienceId ? { ...exp, feedback } : exp
    );
    setExperiences(updatedExperiences);
    setSelectedExperience(null);
    await api.sendFeedback(experienceId, feedback);
    await api.updatePreferences(updatedExperiences);
    localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
  }, [experiences]);

  const handleClearMission = useCallback((experienceId) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === experienceId ? { ...exp, completed: true } : exp
    );
    setExperiences(updatedExperiences);
    setSelectedExperience(null);
    api.updatePreferences(updatedExperiences);
    localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
  }, [experiences]);

  const navigateToRecommendation = useCallback(() => {
    setCurrentScreen('recommendation');
  }, []);

  const handleExperienceClick = useCallback((experience) => {
    // 体験の詳細表示やアクション処理
    setSelectedExperience(experience);
    // 必要に応じて画面遷移
  }, []);

  const navigateToJournalEntry = useCallback(() => {
    setCurrentScreen('journal-entry');
  }, []);

  const handleJoinThemeChallenge = useCallback((theme) => {
    setActiveThemeChallenge(theme);
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
              setCurrentScreen={setCurrentScreen}
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
          )}

          {selectedExperience && (
            <ExperienceDetailModal
              experience={selectedExperience}
              onClose={() => setSelectedExperience(null)}
              onFeedback={handleExperienceFeedback}
              onClearMission={handleClearMission}
            />
          )}

          {!['journal', 'gallery', 'theme-challenge', 'journal-entry'].includes(currentScreen) && (
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
