import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // danger, warning, info
}) {
  if (!isOpen) return null;
  
  const variantClasses = {
    danger: 'border-red-500/50 bg-red-900/20',
    warning: 'border-yellow-500/50 bg-yellow-900/20',
    info: 'border-blue-500/50 bg-blue-900/20',
  };
  
  const buttonClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`space-card p-6 max-w-md w-full z-10 border ${variantClasses[variant]}`}
        >
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="space-button !bg-gray-700 hover:!bg-gray-600"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`space-button !${buttonClasses[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ConfirmDialog;