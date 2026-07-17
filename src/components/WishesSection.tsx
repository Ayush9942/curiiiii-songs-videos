import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Send, Trash2, Calendar, MessageCircleCode } from 'lucide-react';
import { Wish } from '../types';

interface WishesSectionProps {
  wishes: Wish[];
  onAddWish: (sender: string, message: string) => Promise<void>;
  onDeleteWish?: (id: string) => Promise<void>;
}

export default function WishesSection({ wishes, onAddWish, onDeleteWish }: WishesSectionProps) {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !message.trim()) {
      setError('Please fill in both fields!');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onAddWish(sender.trim(), message.trim());
      setSender('');
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send your wish.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12" id="wishes-section">
      {/* Messages list (Col-span 2) */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-none bg-white/5 text-stone-300 border border-white/10">
            <MessageCircleCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-light text-white tracking-tight">
              Heartfelt Notes & Wishes
            </h2>
            <p className="text-xs text-stone-500 font-serif italic">
              Sweet words of celebration and love dedicated to her
            </p>
          </div>
        </div>

        {wishes.length === 0 ? (
          <div className="bg-[#0e0e0e]/40 border border-white/5 rounded-none p-8 text-center text-stone-500 font-serif italic">
            No wishes uploaded yet. Be the first to wish her!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {wishes.map((wish, index) => {
                const isFromAyuuu = wish.sender.toLowerCase() === 'ayuuu';
                return (
                  <motion.div
                    key={wish.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                    className={`p-6 rounded-none border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                      isFromAyuuu
                        ? 'bg-[#121212] border-stone-400 border-t-2 shadow-none'
                        : 'bg-[#0e0e0e] border-white/5 shadow-none'
                    }`}
                  >
                    {/* Background decorations for Ayuuu wishes */}
                    {isFromAyuuu && (
                      <div className="absolute -right-4 -bottom-4 opacity-5 text-stone-400 pointer-events-none">
                        <Heart className="w-20 h-20 fill-current" />
                      </div>
                    )}

                    <div>
                      {/* Badge sender */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                              isFromAyuuu
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'bg-[#181818] text-stone-400 border border-white/5'
                            }`}
                          >
                            {wish.sender}
                          </span>
                          {isFromAyuuu && <Sparkles className="w-3 h-3 text-stone-300 animate-pulse" />}
                        </div>
                        {onDeleteWish && (
                          <button
                            onClick={() => onDeleteWish(wish.id)}
                            className="text-stone-600 hover:text-red-400 p-1 rounded-none hover:bg-white/5 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Msg */}
                      <p className="text-stone-300 text-sm font-serif leading-relaxed italic whitespace-pre-line">
                        "{wish.message}"
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 mt-4 text-[9px] uppercase tracking-wider text-stone-500 font-sans">
                      <Calendar className="w-3 h-3 text-stone-600" />
                      <span>{wish.date}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Write a wish form (Col-span 1) */}
      <div className="bg-[#0e0e0e] border border-white/10 rounded-none p-6 relative">
        <h3 className="text-base font-display font-light text-white uppercase tracking-widest mb-1">Leave a Wish 💖</h3>
        <p className="text-xs text-stone-500 mb-6 font-serif italic">
          Write a beautiful birthday quote or supportive message to post on her dashboard!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
              Your Name / Sender
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ayuuu"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2.5 text-xs outline-none transition"
              id="wish-sender-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
              Wishes Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write something sweet, musical, or loving..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2.5 text-xs outline-none transition resize-none"
              id="wish-message-input"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
          {success && (
            <p className="text-xs text-emerald-500 flex items-center gap-1 font-semibold animate-pulse">
              ✓ Wish posted successfully!
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-stone-200 hover:bg-white text-black font-bold uppercase tracking-widest text-xs rounded-none transition duration-300 disabled:opacity-50 cursor-pointer shadow-lg"
            id="wish-submit-btn"
          >
            {isSubmitting ? (
              <span className="animate-spin text-xs">✦</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Birthday Sparkles!</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
