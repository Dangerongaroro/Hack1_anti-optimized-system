import React from 'react';
import { ArrowLeft, CheckCircle, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

const ExperienceDetailScreen = ({ 
  experience, 
  onBack, 
  onComplete, 
  onFeedback,
  error = null,
  onClearError 
}) => {
  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">体験が見つかりません</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    if (onClearError) onClearError();
    onComplete();
  };

  const handleFeedback = (feedbackType) => {
    if (onClearError) onClearError();
    onFeedback(experience.id, feedbackType);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/60 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 ml-3">体験詳細</h1>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 体験詳細 */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {experience.title || '無題の体験'}
          </h2>

          <div className="space-y-4">
            {/* ステータス・カテゴリー */}
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {experience.category || 'その他'}
              </span>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                レベル {experience.level || 1}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                experience.completed || experience.status === 'completed'
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {experience.completed || experience.status === 'completed' ? '完了' : '進行中'}
              </span>
            </div>

            {/* 日付 */}
            <div className="text-gray-600 text-sm">
              {formatDate(experience.date)}
            </div>

            {/* 説明 */}
            {experience.description && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-700 text-sm">{experience.description}</p>
              </div>
            )}

            {/* 感情 */}
            {experience.emotion && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-blue-700 text-sm">
                  気持ち: {experience.emotion}
                </p>
              </div>
            )}

            {/* フィードバック */}
            {experience.feedback && (
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-purple-700 text-sm">
                  フィードバック: {experience.feedback}
                </p>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="mt-6 space-y-3">
            {/* 完了ボタン（未完了の場合のみ） */}
            {!experience.completed && experience.status !== 'completed' && (
              <button
                onClick={handleComplete}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                体験を完了する
              </button>
            )}

            {/* フィードバックボタン（完了済みでフィードバック未入力の場合） */}
            {(experience.completed || experience.status === 'completed') && !experience.feedback && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 text-center">この体験はどうでしたか？</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleFeedback('positive')}
                    className="py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">良かった</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('neutral')}
                    className="py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Meh className="w-4 h-4" />
                    <span className="text-xs">普通</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('negative')}
                    className="py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-xs">微妙</span>
                  </button>
                </div>
              </div>
            )}

            {/* 戻るボタン */}
            <button
              onClick={onBack}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>

        {/* ヒント */}
        {!experience.completed && experience.status !== 'completed' && (
          <div className="mt-6 bg-yellow-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 体験のコツ</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 完璧を目指さず、まずは挑戦してみることが大切です</li>
              <li>• 新しい発見や気づきがあれば記録しておきましょう</li>
              <li>• 楽しむことを忘れずに取り組んでみてください</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceDetailScreen;