import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passcode: string) => Promise<void>;
  title: string;
  itemType: 'song' | 'video' | 'wish';
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemType
}: DeleteConfirmModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the passcode.');
      return;
    }
    setError('');
    setIsDeleting(true);

    try {
      await onConfirm(passcode);
      setPasscode('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Incorrect passcode or server error.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0e0e0e] border border-white/10 p-6 md:p-8 w-full max-w-sm relative text-center shadow-2xl rounded-none"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-white p-1.5 hover:bg-white/5 rounded-none transition"
          disabled={isDeleting}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto w-12 h-12 bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 rounded-none">
          <Lock className="w-5 h-5" />
        </div>

        {/* Title */}
        <h3 className="text-base font-display font-light text-white uppercase tracking-widest mb-1">
          Confirm Deletion
        </h3>
        <p className="text-xs text-stone-500 font-serif italic mb-4">
          This feature requires administrative credentials.
        </p>

        {/* Target Details */}
        <div className="bg-black/40 border border-white/5 p-3.5 mb-6 text-left">
          <span className="block text-[9px] uppercase tracking-wider text-stone-500 font-sans mb-1">
            Deleting {itemType}:
          </span>
          <p className="text-xs text-stone-300 font-medium font-serif italic truncate">
            "{title}"
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] font-semibold uppercase text-stone-400 tracking-wider text-left mb-2 font-sans">
              Admin Passcode
            </label>
            <input
              type="password"
              required
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isDeleting}
              className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2.5 text-xs text-center tracking-widest outline-none transition"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-400 font-mono text-center flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3 h-3" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-[#151515] hover:bg-[#1d1d1d] text-stone-400 hover:text-white rounded-none text-xs uppercase tracking-widest border border-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 shadow-md transition disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="animate-spin text-xs">✦</span>
              ) : (
                <span>Delete</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
