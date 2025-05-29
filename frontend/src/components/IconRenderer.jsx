import React from 'react';
import { iconMap } from '../utils/helpers';
import { HelpCircle } from 'lucide-react'; // デフォルト/フォールバック用アイコン

const IconRenderer = ({ iconName, ...props }) => {
  const IconComponent = iconMap[iconName] || HelpCircle; // マップにない場合はHelpCircleを表示
  return <IconComponent {...props} />;
};

export default IconRenderer;