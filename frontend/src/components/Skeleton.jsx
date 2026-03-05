import React from 'react';

const Skeleton = ({ type }) => {
  if (type === 'job-card') {
    return (
      <div className="bg-white border-2 border-gray-100 rounded overflow-hidden animate-pulse">
        <div className="w-full h-36 bg-gray-200" />
        <div className="p-4 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-100 rounded w-full mt-2" />
          <div className="flex justify-between items-center pt-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Default text skeleton
  return <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />;
};

export default Skeleton;
