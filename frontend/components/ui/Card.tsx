
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
