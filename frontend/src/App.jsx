// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';

// 定数とサービス
import { initialExperiences, initialUserStats } from './constants/initialData'; // 修正: インポートパス
import api from './services/api'; // 修正: インポートパス

// コンポーネント
import HomeScreen from './screens/HomeScreen.jsx';
import RecommendationScreen from './screens/RecommendationScreen';
import JournalScreen from './screens/JournalScreen';
import JournalEntryScreen from './screens/JournalEntryScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavigationBar from './components/NavigationBar';
import ExperienceDetailModal from './components/ExperienceDetailModal';
// App.jsx自体でlucideアイコンを直接使う場合はここでインポート

const App = () => {
  // 元の SerenPaths コンポーネントの useState, useEffect, 各関数定義をここにコピー
  const [currentScreen, setCurrentScreen] = useState('home');
  const [experiences, setExperiences] = useState(
    // initialExperiences の date は既に new Date() でラップされているのでそのまま使用可
    // もし initialData.js で文字列として保持している場合はここで new Date() する
    initialExperiences.map(exp => ({...exp, date: new Date(exp.date)}))
  );
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [journalEntry, setJournalEntry] = useState({ title: '', category: '', emotion: '' });
  const [userStats, setUserStats] = useState(initialUserStats);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    avoidCategories: [],
    preferredCategories: [],
    challengeFrequency: 'daily'
  });

  const handleGenerateChallenge = useCallback(async () => {
    const challenge = await api.getRecommendation(selectedLevel, userPreferences);
    setCurrentChallenge(challenge);
  }, [selectedLevel, userPreferences]);

  const acceptChallenge = useCallback(() => {
    if (currentChallenge) {
      const newExperience = {
        id: experiences.length + 1, // 簡単なID生成
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
      // APIからのチャレンジにIDが含まれることを期待。なければ代替ID。
      const challengeId = currentChallenge.id || `challenge_skipped_${Date.now()}`;
      await api.sendFeedback(challengeId, reason);
      // スキップ後、新しいチャレンジを生成するかどうかは仕様による
      // handleGenerateChallenge(); // 必要なら呼ぶ
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
        emotion: journalEntry.emotion || '' // emotionも保存
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
    setSelectedExperience(null); // モーダルを閉じる
    await api.sendFeedback(experienceId, feedback);
    await api.updatePreferences(updatedExperiences);
  }, [experiences]);

  const navigateToRecommendation = useCallback(() => {
    handleGenerateChallenge();
    setCurrentScreen('recommendation');
  }, [handleGenerateChallenge]);

  // 元の SerenPaths コンポーネントの return 部分をここにコピーし、コンポーネントのパスを修正
  return (
    <div className="mx-auto bg-white min-h-screen relative pb-20 flex items-center justify-center"> {/* NavBarの高さ分padding-bottom */}
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
        <ProfileScreen userStats={userStats} />
      )}

      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        onFeedback={handleExperienceFeedback}
      />

      {!['journal-entry'].includes(currentScreen) && ( // recommendation画面でもNavBar非表示
        <NavigationBar
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          onNavigateToRecommendation={navigateToRecommendation}
        />
      )}
    </div>
  );
};
export default App;
