import React from 'react';

function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClass = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className={`${sizeClass[size]} border-red-500 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-4 text-gray-400">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;