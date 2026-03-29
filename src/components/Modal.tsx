import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="card w-full max-w-lg p-8 space-y-6 animate-in zoom-in duration-300 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X size={20} />
        </button>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
