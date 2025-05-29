// frontend/src/constants/initialData.js
export const initialExperiences = [
  { id: 1, date: new Date('2025-05-15'), type: 'music', level: 1, title: 'ジャズを初めて聴いた', category: 'アート', completed: true, deviation: 30, feedback: 'positive' },
  { id: 2, date: new Date('2025-05-18'), type: 'place', level: 2, title: '隣町のカフェ巡り', category: 'アウトドア', completed: true, deviation: 45, feedback: 'positive' },
  { id: 3, date: new Date('2025-05-22'), type: 'skill', level: 3, title: 'プログラミング入門', category: '学び', completed: true, deviation: 70, feedback: 'neutral' },
  { id: 4, date: new Date('2025-05-25'), type: 'art', level: 1, title: '水彩画に挑戦', category: 'アート', completed: true, deviation: 50, feedback: 'positive' },
  { id: 5, date: new Date('2025-05-27'), type: 'outdoor', level: 2, title: '早朝ランニング', category: 'アウトドア', completed: true, deviation: 35, feedback: 'positive' },
];

export const initialUserStats = {
  totalExperiences: 23,
  currentStreak: 5,
  diversityScore: 78,
  badges: ['初心者探求者', 'アート愛好家', '週末冒険家']
};