import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

function Toast({ 
  message, 
  type = 'success', // success, error, warning, info
  duration = 3000,
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Allow exit animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const icons = {
    success: <Check size={18} className="text-green-500" />,
    error: <AlertTriangle size={18} className="text-red-500" />,
    warning: <AlertTriangle size={18} className="text-yellow-500" />,
    info: <Info size={18} className="text-blue-500" />
  };
  
  const bgColors = {
    success: 'bg-green-900/20 border-green-500/30',
    error: 'bg-red-900/20 border-red-500/30',
    warning: 'bg-yellow-900/20 border-yellow-500/30',
    info: 'bg-blue-900/20 border-blue-500/30'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed bottom-4 right-4 max-w-xs w-full p-4 rounded-lg shadow-lg border ${bgColors[type]} z-50`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {icons[type]}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">
                {message}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-3 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;