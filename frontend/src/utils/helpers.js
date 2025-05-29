// src/utils/helpers.js
import { Music, MapPin, Coffee, Palette, Mountain, Code, /* 他にも必要なアイコンをインポート */ } from 'lucide-react';

// アイコン名をlucide-reactコンポーネントにマッピング
export const iconMap = {
  Music,
  MapPin,
  Coffee,
  Palette,
  Mountain,
  Code,
  // APIやローカルチャレンジで使われる全てのアイコン名をキーとして登録
};

// ローカルでのチャレンジ生成（アイコン名を文字列で返す）
const localChallenges = {
  1: [
    { title: '普段聴かないジャンルの音楽を1曲聴く', icon: 'Music', category: 'アート', type: 'music' },
    { title: 'いつもと違う道で帰る', icon: 'MapPin', category: 'アウトドア', type: 'place' },
    // ...
  ],
  2: [
    { title: '隣町のカフェを開拓する', icon: 'Coffee', category: 'アウトドア', type: 'place' },
    // ...
  ],
  3: [
    { title: '日帰りで近郊の山にハイキング', icon: 'Mountain', category: 'アウトドア', type: 'outdoor' },
    // ...
  ]
};

export const generateChallengeLocal = (level) => {
  const levelChallenges = localChallenges[level] || localChallenges[2]; // 安全策
  const challenge = { ...levelChallenges[Math.floor(Math.random() * levelChallenges.length)], level };
  return challenge; // iconプロパティは文字列
};