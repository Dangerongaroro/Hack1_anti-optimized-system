import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const OnboardingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    interests: [],
    challengeLevel: 2,
    avoidCategories: [],
    timePreference: 'weekend',
    goals: []
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const steps = [
    {
      title: "✨ Seren Pathsへようこそ！",
      subtitle: "最適化されない日常を始めましょう",
      type: "welcome"
    },
    {
      title: "どんなことに興味がありますか？",
      subtitle: "",
      type: "interests",
      options: [
        { id: 'art', label: 'アート・創作', emoji: '🎨' },
        { id: 'music', label: '音楽・エンタメ', emoji: '🎵' },
        { id: 'food', label: '料理・グルメ', emoji: '🍽️' },
        { id: 'outdoor', label: '自然・アウトドア', emoji: '🌿' },
        { id: 'sports', label: '学習・読書', emoji: '📚' },
        { id: 'social', label: 'ソーシャル', emoji: '👥' },
        { id: 'lifestyle', label: 'ライフスタイル', emoji: '🏠' }
      ]
    },
    {
      title: "どれくらい挑戦したいですか？",
      subtitle: "",
      type: "challengeLevel",
      options: [
        { 
          value: 1, 
          label: 'プチ・ディスカバリー', 
          description: '日常の小さな変化を楽しみたい',
          emoji: '🌱'
        },
        { 
          value: 2, 
          label: 'ウィークエンド・チャレンジ', 
          description: '休日に新しいことに挑戦したい',
          emoji: '🚀'
        },
        { 
          value: 3, 
          label: 'アドベンチャー・クエスト', 
          description: '大きな体験にも挑戦してみたい',
          emoji: '⭐'
        }
      ]
    },
    {
      title: "避けたい体験はありますか？",
      subtitle: "",
      type: "avoidCategories",
      options: [
        { id: 'crowded', label: '人混みが多い場所', emoji: '👥' },
        { id: 'expensive', label: 'お金がかかること', emoji: '💰' },
        { id: 'physical', label: '体力が必要なこと', emoji: '💪' },
        { id: 'time', label: '時間がかかること', emoji: '⏰' },
        { id: 'social', label: '人と話すこと', emoji: '🗣️' },
        { id: 'tech', label: 'デジタル・技術系', emoji: '💻' }
      ]
    },
    {
      title: "いつ挑戦することが多いですか？",
      subtitle: "",
      type: "timePreference",
      options: [
        { value: 'weekday', label: '平日の空き時間', emoji: '📅' },
        { value: 'weekend', label: '土日・休日', emoji: '🌈' },
        { value: 'evening', label: '夜寝る前', emoji:'🌙' },
        { value: 'flexible', label: 'いつでも大丈夫', emoji: '👍' }
      ]
    },
    {
      title: "この体験で何を得たいですか？",
      subtitle: "",
      type: "goals",
      options: [
        { id: 'discover', label: '新しい自分の発見', emoji: '🔍' },
        { id: 'skills', label: 'スキル・知識の習得', emoji: '🎓' },
        { id: 'refresh', label: 'リフレッシュ・気分転換', emoji: '🌟' },
        { id: 'social', label: '人とのつながり', emoji: '👨‍👨‍👧‍👦' },
        { id: 'creative', label: '創造性の向上', emoji: '💡' },
        { id: 'confidence', label: '自信をつけたい', emoji: '💪' }
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const handleOptionSelect = (value) => {
    const stepType = currentStepData.type;
    
    if (stepType === 'interests' || stepType === 'avoidCategories' || stepType === 'goals') {
      // 複数選択
      setAnswers(prev => ({
        ...prev,
        [stepType]: prev[stepType].includes(value)
          ? prev[stepType].filter(item => item !== value)
          : [...prev[stepType], value]
      }));
    } else {
      // 単一選択
      setAnswers(prev => ({
        ...prev,
        [stepType]: value
      }));
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return true; // Welcome screen
    
    const stepType = currentStepData.type;
    if (stepType === 'avoidCategories') return true; // 任意回答
    
    if (stepType === 'interests' || stepType === 'goals') {
      return answers[stepType].length > 0;
    }
    
    return answers[stepType] !== undefined && answers[stepType] !== '';
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // アンケート完了
      const userPreferences = {
        interests: answers.interests,
        challengeLevel: answers.challengeLevel,
        avoidCategories: answers.avoidCategories,
        timePreference: answers.timePreference,
        goals: answers.goals,
        setupCompleted: true,
        setupDate: new Date().toISOString()
      };
      
      // ローカルストレージに保存
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
      
      onComplete(userPreferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Welcome Screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <Sparkles className="w-20 h-20 mx-auto text-purple-600 mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Seren Paths
            </h1>
            <p className="text-base font-bold text-gray-700 mb-8">新しい自分を発見する旅</p>
            <p className="text-gray-600 text-sm">
              普段とは違う体験を通じて<br />
              あなたの可能性を広げましょう
            </p>
          </div>
          
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl py-4 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            はじめる
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            簡単な質問に答えるだけ（約1分）
          </p>
        </div>
      </div>
    );
  }

  // Question Screens
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">質問 {currentStep} / {steps.length - 1}</span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / (steps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentStepData.options?.map((option) => {
            const isSelected = currentStepData.type === 'challengeLevel' || currentStepData.type === 'timePreference'
              ? answers[currentStepData.type] === option.value
              : answers[currentStepData.type]?.includes(option.id || option.value);

            return (
              <button
                key={option.id || option.value}
                onClick={() => handleOptionSelect(option.id || option.value)}
                className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white/60 hover:bg-white/80 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                        {option.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              canProceed()
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === steps.length - 1 ? '完了' : '次へ'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
