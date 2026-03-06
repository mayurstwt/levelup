import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'bg-red-600' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div 
        className="bg-white border-4 border-gray-900 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200"
      >
        <div className="p-6 border-b-4 border-gray-900 bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 font-medium text-lg leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-6 pt-0 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border-4 border-gray-900 text-gray-900 font-bold uppercase tracking-wider hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${confirmColor} text-white border-4 border-gray-900 font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
