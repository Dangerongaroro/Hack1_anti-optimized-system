import React from 'react';
import OptimizedExperienceStrings from './OptimizedExperienceStrings';

const ExperienceStrings = (props) => {
  return (
    <div className="px-4">
      <OptimizedExperienceStrings {...props} />
      {/* mainの説明部分を下部に表示 */}
      <div className="mt-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/30">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">体験の糸について</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          完了した体験は美しい球体として表示され、それらを繋ぐ糸が成長の軌跡を表現します。
          各体験には固有の色があり、カテゴリーやテーマによって美しいグラデーションを作り出します。
          ホバーやクリックで詳細な情報を確認できます。
        </p>
      </div>
    </div>
  );
};

export default ExperienceStrings;
