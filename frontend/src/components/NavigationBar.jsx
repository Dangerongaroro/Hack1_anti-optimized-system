import React from 'react';
import { Home, Search, User, BookOpen } from 'lucide-react';

const NavigationBar = ({ currentScreen, setCurrentScreen, onNavigateToRecommendation }) => {
  const navItems = [
    {
      id: 'home',
      icon: Home,
      action: () => setCurrentScreen('home')
    },
    {
      id: 'recommendation',
      icon: Search,
      action: onNavigateToRecommendation
    },
    {
      id: 'gallery',
      icon: BookOpen,
      action: () => setCurrentScreen('gallery')
    },
    {
      id: 'profile',
      icon: User,
      action: () => setCurrentScreen('profile')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center py-3 px-4 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : ''}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;
