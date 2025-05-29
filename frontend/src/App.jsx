// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Home, Compass, BookOpen, User, X, Plus, /* 他、NavigationBarやModalで直接使うアイコン */ } from 'lucide-react'; // IconRendererで使わないものは直接インポートも可

// 定数とサービス
import { initialExperiences as initialExperiencesData, initialUserStats } from './constants/initialData';
import api from './services/api'; // api.js からインポート

// コンポーネント
import HomeScreen from './screens/HomeScreen';
import RecommendationScreen from './screens/RecommendationScreen';
import JournalScreen from './screens/JournalScreen';
import JournalEntryScreen from './screens/JournalEntryScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavigationBar from './components/NavigationBar';
import ExperienceDetailModal from './components/ExperienceDetailModal';

// 元のSerenPathsコンポーネントのロジックをAppコンポーネントに統合
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [experiences, setExperiences] = useState(() =>
    initialExperiencesData.map(exp => ({...exp, date: new Date(exp.date)}))
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

  // APIを使用してレコメンドを生成
  const handleGenerateChallenge = useCallback(async () => {
    const challenge = await api.getRecommendation(selectedLevel, userPreferences);
    setCurrentChallenge(challenge); // challenge.icon は文字列名
  }, [selectedLevel, userPreferences]);

  // チャレンジを受け入れる
  const acceptChallenge = useCallback(() => {
    if (currentChallenge) {
      const newExperience = {
        id: experiences.length + 1, // ID生成は見直し推奨
        date: new Date(),
        type: currentChallenge.type,
        level: currentChallenge.level,
        title: currentChallenge.title,
        category: currentChallenge.category,
        completed: false,
        deviation: 30 + Math.random() * 60,
        // iconName: currentChallenge.icon // 必要ならアイコン名を保存
      };
      const updatedExperiences = [...experiences, newExperience];
      setExperiences(updatedExperiences);
      setCurrentScreen('home');
      setCurrentChallenge(null);
      api.updatePreferences(updatedExperiences);
    }
  }, [currentChallenge, experiences]);

  // 他の関数 (skipChallenge, saveJournalEntry, handleExperienceFeedback, navigateToRecommendation) も
  // api.js の関数を使うように修正・確認

  const skipChallenge = useCallback(async (reason) => {
    if (currentChallenge) {
        // currentChallenge.id が存在するか確認。ローカル生成の場合IDがない可能性がある
        // API仕様として、レコメンドされたチャレンジにはIDが付与されることを推奨
        const challengeId = currentChallenge.id || `local_${currentChallenge.title.replace(/\s+/g, '_')}`;
        await api.sendFeedback(challengeId, reason);
    }
  }, [currentChallenge]);

  const saveJournalEntry = useCallback(() => {
    if (journalEntry.title && journalEntry.category) {
      const newExperience = {
        id: experiences.length + 1,
        date: new Date(),
        type: 'journal', // 'journal' の type に対する色設定を ExperienceStrings に追加
        level: 2,
        title: journalEntry.title,
        category: journalEntry.category,
        completed: true,
        deviation: 30 + Math.random() * 60
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


  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20"> {/* NavBar分のスペース */}
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
          onGenerateChallenge={handleGenerateChallenge} // 再生成ボタン用
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

      {!['journal-entry', 'recommendation'].includes(currentScreen) && (
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