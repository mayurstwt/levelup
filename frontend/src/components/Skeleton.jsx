import React from 'react';

const pulse = 'animate-pulse bg-gray-200 rounded';

const SkeletonLine = ({ w = 'w-full', h = 'h-4' }) => (
  <div className={`${pulse} ${w} ${h}`} />
);

const Skeleton = ({ type = 'line', count = 1 }) => {
  if (type === 'job-card') {
    return (
      <div className="bg-white border-2 border-gray-100 rounded overflow-hidden animate-pulse">
        <div className="w-full h-36 bg-gray-200" />
        <div className="p-4 space-y-3">
          <SkeletonLine w="w-3/4" />
          <SkeletonLine w="w-1/4" />
          <SkeletonLine h="h-8" />
          <div className="flex justify-between items-center pt-2">
            <div className={`${pulse} w-6 h-6 rounded-full`} />
            <SkeletonLine w="w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'bid-card') {
    return (
      <div className="bg-white border-2 border-gray-100 rounded-lg p-5 flex gap-4 animate-pulse">
        <div className={`${pulse} w-12 h-12 rounded-full flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-1/2" />
          <SkeletonLine w="w-3/4" h="h-3" />
          <SkeletonLine w="w-1/4" h="h-3" />
        </div>
        <SkeletonLine w="w-20" h="h-8" />
      </div>
    );
  }

  if (type === 'dashboard-row') {
    return (
      <div className="bg-white border-2 border-gray-100 rounded-lg p-4 flex justify-between items-center gap-4 animate-pulse">
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-1/3" />
          <SkeletonLine w="w-2/3" h="h-3" />
        </div>
        <SkeletonLine w="w-20" h="h-6" />
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="bg-white border-2 border-gray-100 rounded-lg p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className={`${pulse} w-20 h-20 rounded-full`} />
          <div className="flex-1 space-y-2">
            <SkeletonLine w="w-1/2" h="h-6" />
            <SkeletonLine w="w-1/3" h="h-3" />
          </div>
        </div>
        <SkeletonLine />
        <SkeletonLine w="w-5/6" />
        <SkeletonLine w="w-3/4" />
      </div>
    );
  }

  // Default: plain text skeleton lines
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLine key={i} w={i % 3 === 0 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
};

export default Skeleton;
