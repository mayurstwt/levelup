import React from 'react';

const EmptyState = ({ title, description, icon = '🏜️', action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-300 rounded">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 font-semibold mb-6 text-center max-w-sm">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
