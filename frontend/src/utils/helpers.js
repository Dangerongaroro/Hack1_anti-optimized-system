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
  return { ...levelChallenges[Math.floor(Math.random() * levelChallenges.length)], level };
};