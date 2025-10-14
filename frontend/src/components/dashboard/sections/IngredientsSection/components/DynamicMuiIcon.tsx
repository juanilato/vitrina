import React from 'react';
import { iconRegistry, IconName } from './IconoModal';

type Props = {
  name?: string | null;
  className?: string;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large';
};

const Fallback = iconRegistry['Inventory2Outlined'];

export const DynamicMuiIcon: React.FC<Props> = ({ name, className, fontSize = 'medium' }) => {
  const key = (name || 'Inventory2Outlined') as IconName;
  const Comp = (iconRegistry[key] || Fallback) as any;
  return <Comp className={className} fontSize={fontSize} />;
};