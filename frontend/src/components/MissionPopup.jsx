import React from 'react';
import { X } from 'lucide-react';

const MissionPopup = ({ isOpen, onClose, floatingMissionsCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 max-w-md w-full shadow-xl relative border border-purple-200/50">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full !bg-white hover:bg-white transition-colors"
          aria-label="ポップアップを閉じる"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center pt-8"> {/* 上部にパディングを追加 */}
          <p className="text-lg font-semibold text-purple-800 mb-4">
            {floatingMissionsCount}個の進行中ミッションが浮遊しています。
            完了すると美しい軌跡を描きながら糸としてつながります！
          </p>
          <p className="text-sm text-gray-600">
            ミッションを完了して、あなたの成長の軌跡を可視化しましょう。
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionPopup;
