import React from 'react';

// Inline SVG illustrations for key states — no external dependencies needed
const ILLUSTRATIONS = {
  jobs: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-28 mb-2">
      <rect x="10" y="20" width="100" height="65" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2"/>
      <rect x="20" y="32" width="50" height="6" rx="2" fill="#BFDBFE"/>
      <rect x="20" y="44" width="80" height="4" rx="2" fill="#DBEAFE"/>
      <rect x="20" y="54" width="65" height="4" rx="2" fill="#DBEAFE"/>
      <rect x="20" y="64" width="40" height="4" rx="2" fill="#DBEAFE"/>
      <circle cx="92" cy="35" r="14" fill="#3B82F6"/>
      <path d="M86 35l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bids: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-28 mb-2">
      <circle cx="60" cy="45" r="32" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="2"/>
      <path d="M60 30v18l10 10" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="25" y="78" width="70" height="6" rx="3" fill="#FDE68A"/>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-28 mb-2">
      <path d="M60 15 C40 15 28 30 28 48 L28 62 L20 72 L100 72 L92 62 L92 48 C92 30 80 15 60 15Z" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="2"/>
      <rect x="50" y="72" width="20" height="8" rx="4" fill="#7C3AED"/>
      <circle cx="88" cy="22" r="12" fill="#10B981"/>
      <path d="M83 22l3.5 3.5 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-28 mb-2">
      <rect x="15" y="15" width="90" height="70" rx="6" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2"/>
      <circle cx="60" cy="42" r="16" fill="#E5E7EB"/>
      <rect x="36" y="66" width="48" height="5" rx="2.5" fill="#E5E7EB"/>
      <rect x="44" y="76" width="32" height="4" rx="2" fill="#F3F4F6"/>
    </svg>
  ),
};

const EmptyState = ({ title, description, icon, illustration = 'default', action }) => {
  const IllustrationComponent = ILLUSTRATIONS[illustration] || ILLUSTRATIONS.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg text-center px-6">
      {icon ? (
        <div className="text-6xl mb-4">{icon}</div>
      ) : (
        <div className="mb-2">{IllustrationComponent}</div>
      )}
      <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 font-medium text-sm max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
