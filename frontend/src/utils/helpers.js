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

const idToColor = (id) => {
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // より美しいパステル調の色相範囲に制限
  const colorRanges = [
    { min: 250, max: 280 }, // 淡い紫〜青紫系
    { min: 200, max: 230 }, // 淡い青系
    { min: 300, max: 330 }, // 淡いピンク〜マゼンタ系
    { min: 180, max: 210 }  // 淡いシアン系
  ];
  
  // ハッシュ値から色相範囲を選択
  const rangeIndex = Math.abs(hash) % colorRanges.length;
  const selectedRange = colorRanges[rangeIndex];
  
  // 選択された範囲内で色相を決定
  const hue = Math.abs(hash * 137.508) % (selectedRange.max - selectedRange.min) + selectedRange.min;
  
  // より柔らかい彩度と明度に調整
  const saturation = Math.round(40 + (Math.abs(hash) % 20)); // 40-60%（より淡く）
  const lightness = Math.round(70 + (Math.abs(hash) % 15));  // 70-85%（より明るく）
  
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
};

// テーマカラー取得関数
export const getThemeColor = (id, category = null) => {
  // より美しいパステル調のカテゴリーカラー
  const categoryColors = {
    "ライフスタイル": "#6EE7B7",    // 淡い緑
    "アート・創作": "#C4B5FD",     // 淡い紫
    "料理・グルメ": "#FDE68A",     // 淡い黄色
    "ソーシャル": "#F9A8D4",       // 淡いピンク
    "学習・読書": "#93C5FD",       // 淡い青
    "自然・アウトドア": "#86EFAC",  // 淡いグリーン
    "エンタメ": "#FDBA74"          // 淡いオレンジ
  };
  
  // カテゴリーが指定されていて、マッピングが存在する場合はそれを使用
  if (category && categoryColors[category]) {
    return categoryColors[category];
  }
  
  // それ以外はIDベースの色を生成
  return idToColor(id);
};