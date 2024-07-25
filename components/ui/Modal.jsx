import { Dialog } from '@headlessui/react';
import React from 'react';
import Icon from '@/components/ui/Icon';

const Modal = ({
  activeModal,
  onClose,
  noFade,
  disableBackdrop,
  className = 'max-w-xl',
  children,
  footerContent,
  centered,
  scrollContent,
  themeClass = 'bg-slate-900 dark:bg-slate-800 dark:border-b dark:border-slate-700',
  title = 'Basic Modal',
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-filter backdrop-blur-sm">
      {!disableBackdrop && (
        <div className="fixed inset-0 bg-slate-900 opacity-50" onClick={onClose}></div>
      )}
      <div className={`relative bg-white rounded-md shadow-xl transform transition-all ${className} ${centered ? 'my-auto' : 'my-12'}`}>
        <div className={`relative py-4 px-5 flex justify-between ${themeClass}`}>
          <h2 className="capitalize leading-6 tracking-wider font-medium text-base text-white">
            {title}
          </h2>
          <button onClick={onClose} className="text-[22px]">
            <Icon icon="heroicons-outline:x" />
          </button>
        </div>
        <div className={`px-6 py-8 ${scrollContent ? 'overflow-y-auto max-h-[400px]' : ''}`}>
          {children}
        </div>
        {footerContent && (
          <div className="px-4 py-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
