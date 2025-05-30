// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// 定数とサービス
import { initialExperiences, initialUserStats } from './constants/initialData';
import api from './services/api';

// コンポーネント
import HomeScreen from './screens/HomeScreen.jsx';
import RecommendationScreen from './screens/RecommendationScreen';
import JournalScreen from './screens/JournalScreen';
import JournalEntryScreen from './screens/JournalEntryScreen';
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
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [journalEntry, setJournalEntry] = useState({ title: '', category: '', emotion: '' });
  const [userStats, setUserStats] = useState(initialUserStats);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // 初回起動チェック
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      if (preferences.setupCompleted) {
        setUserPreferences(preferences);
        setSelectedLevel(preferences.challengeLevel || 2);
        setIsFirstLaunch(false);
      }
    }
  }, []);

  // オンボーディング完了ハンドラー
  const handleOnboardingComplete = (preferences) => {
    setUserPreferences(preferences);
    setSelectedLevel(preferences.challengeLevel || 2);
    setIsFirstLaunch(false);
    console.log('✅ Onboarding completed:', preferences);
  };

  // 既存の関数たち...
  const handleGenerateChallenge = useCallback(async () => {
    try {
      const challenge = await api.getRecommendation(selectedLevel, userPreferences);
      setCurrentChallenge(challenge);
    } catch (error) {
      console.error('Challenge generation failed:', error);
    }
  }, [selectedLevel, userPreferences]);

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
  }, [experiences]);

  const navigateToRecommendation = useCallback(() => {
    handleGenerateChallenge();
    setCurrentScreen('recommendation');
  }, [handleGenerateChallenge]);

  // 初回起動時はオンボーディング画面を表示
  if (isFirstLaunch) {
    return (
      <ErrorBoundary>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
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
            currentChallenge={currentChallenge}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            onGenerateChallenge={handleGenerateChallenge}
            onAcceptChallenge={acceptChallenge}
            onSkipChallenge={skipChallenge}
            onClose={() => setCurrentScreen('home')}
          />
        )}
        
        {currentScreen === 'journal' && (
          <JournalScreen
            experiences={experiences}
            userStats={userStats}
            onNavigateToEntry={() => setCurrentScreen('journal-entry')}
          />
        )}
        
        {currentScreen === 'journal-entry' && (
          <JournalEntryScreen
            journalEntry={journalEntry}
            setJournalEntry={setJournalEntry}
            onSave={saveJournalEntry}
            onClose={() => setCurrentScreen('journal')}
          />
        )}
        
        {currentScreen === 'profile' && (
          <ProfileScreen 
            userStats={userStats}
            userPreferences={userPreferences}
            onResetOnboarding={() => {
              localStorage.removeItem('userPreferences');
              setIsFirstLaunch(true);
            }}
          />
        )}

        {selectedExperience && (
          <ExperienceDetailModal
            experience={selectedExperience}
            onClose={() => setSelectedExperience(null)}
            onFeedback={handleExperienceFeedback}
          />
        )}

        {!['journal-entry', 'recommendation'].includes(currentScreen) && (
          <NavigationBar
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            onNavigateToRecommendation={navigateToRecommendation}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;