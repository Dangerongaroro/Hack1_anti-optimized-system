import React from 'react';
import { Home, Compass, Image, PenTool, User } from 'lucide-react';

const NavigationBar = ({ currentScreen, setCurrentScreen, onNavigateToRecommendation }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`p-3 rounded-xl transition-colors ${
            currentScreen === 'home' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={onNavigateToRecommendation}
          className={`p-3 rounded-xl transition-colors ${
            currentScreen === 'recommendation' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Compass className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentScreen('gallery')}
          className={`p-3 rounded-xl transition-colors ${
            currentScreen === 'gallery' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Image className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentScreen('journal')}
          className={`p-3 rounded-xl transition-colors ${
            currentScreen === 'journal' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PenTool className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentScreen('profile')}
          className={`p-3 rounded-xl transition-colors ${
            currentScreen === 'profile' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;