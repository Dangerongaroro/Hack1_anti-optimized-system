import React from 'react';

const NavigationDebug = ({ currentScreen, setCurrentScreen, onNavigateToRecommendation }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-0 left-0 bg-black text-white p-2 text-xs z-50">
      <div>Current Screen: {currentScreen}</div>
      <div>setCurrentScreen: {typeof setCurrentScreen}</div>
      <div>onNavigateToRecommendation: {typeof onNavigateToRecommendation}</div>
      <div className="mt-1">
        <button 
          onClick={() => console.log('Navigation state:', { currentScreen, setCurrentScreen, onNavigateToRecommendation })}
          className="bg-blue-600 px-1 py-0.5 rounded text-xs"
        >
          Log State
        </button>
      </div>
    </div>
  );
};

export default NavigationDebug;