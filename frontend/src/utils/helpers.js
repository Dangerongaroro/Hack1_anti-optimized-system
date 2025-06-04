// frontend/src/utils/helpers.js
import { 
  Music, MapPin, Coffee, Palette, Mountain, Code,
  Home, Compass, BookOpen, User, ChevronRight, X, 
  Plus, Calendar, Award, Sparkles, TrendingUp, 
  Star, ThumbsUp, ThumbsDown, SkipForward,
  HelpCircle, Book, Camera, Clock
} from 'lucide-react';

export const iconMap = {
  Music,
  MapPin,
  Coffee,
  Palette,
  Mountain,
  Code,
  Home,
  Compass,
  BookOpen,
  User,
  ChevronRight,
  X,
  Plus,
  Calendar,
  Award,
  Sparkles,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  HelpCircle,
  Book,
  Camera,
  Clock
};

const localChallengesData = {
  1: [
    { title: '普段聴かないジャンルの音楽を1曲聴く', icon: 'Music', category: 'アート', type: 'music' },
    { title: 'いつもと違う道で帰る', icon: 'MapPin', category: 'アウトドア', type: 'place' },
    { title: '知らない飲み物を試してみる', icon: 'Coffee', category: '食', type: 'place' }
  ],
  2: [
    { title: '隣町のカフェを開拓する', icon: 'Coffee', category: 'アウトドア', type: 'place' },
    { title: 'オンラインで単発の絵画教室に参加', icon: 'Palette', category: 'アート', type: 'art' },
    { title: '新しいレシピで料理に挑戦', icon: 'Book', category: '食', type: 'skill' }
  ],
  3: [
    { title: '日帰りで近郊の山にハイキング', icon: 'Mountain', category: 'アウトドア', type: 'outdoor' },
    { title: 'プログラミングの入門書を1章読む', icon: 'Code', category: '学び', type: 'skill' },
    { title: '地元の美術館で特別展を鑑賞', icon: 'Palette', category: 'アート', type: 'art' }
  ]
};

// ローカルでお題を生成する関数
export const generateChallengeLocal = (level) => {
  const levelChallenges = localChallengesData[level] || localChallengesData[2];
  if (!levelChallenges || levelChallenges.length === 0) {
    return { 
      title: 'エラー: 適切なチャレンジが見つかりません', 
      icon: 'HelpCircle', 
      category: 'エラー', 
      type: 'error', 
      level: level 
    };
  }
  
  // 重要: 生成するお題オブジェクトに必ずlevelプロパティを含める
  const challenge = {
    id: `local_${Date.now()}`,
    title: levelChallenges[Math.floor(Math.random() * levelChallenges.length)].title,
    description: 'このチャレンジはあなたのスキルを向上させるためのものです。',
    category: levelChallenges[Math.floor(Math.random() * levelChallenges.length)].category,
    type: 'challenge',
    level: level,  // この行が重要
    // その他のプロパティ
  };
  
  return challenge;
};

// テーマカラー取得関数
export function getThemeColor(id, category) {
  // feature_masahiro2の色設計に合わせる
  const categoryMap = {
    'ライフスタイル': 30,
    'アート・創作': 280,
    '料理・グルメ': 50,
    'ソーシャル': 330,
    '学習・読書': 210,
    '自然・アウトドア': 120,
    'スポーツ・運動': 170,
    'エンタメ': 0,
    'その他': 200
  };
  const normalized = normalizeCategory(category);
  let hue;
  if (normalized && categoryMap[normalized]) {
    hue = categoryMap[normalized];
  } else {
    hue = (typeof id === 'number' ? id * 47 : (id ? id.toString().length * 47 : 0)) % 360;
  }
  // feature_masahiro2の色味に近いパステル
  return `hsl(${hue}, 70%, 75%)`;
}

// 有効なカテゴリーのリスト
export const VALID_CATEGORIES = [
  'ライフスタイル',
  'アート・創作',
  '料理・グルメ',
  'ソーシャル',
  '学習・読書',
  '自然・アウトドア',
  'スポーツ・運動',
  'エンタメ',
  'その他'
];

// カテゴリーの検証と正規化
export const normalizeCategory = (category) => {
  if (!category) return 'その他';
  
  // 完全一致
  if (VALID_CATEGORIES.includes(category)) {
    return category;
  }
  
  // 部分一致の試行
  const normalized = VALID_CATEGORIES.find(valid => 
    valid.includes(category) || category.includes(valid)
  );
  
  return normalized || 'その他';
};
