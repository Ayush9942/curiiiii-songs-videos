import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart, Sparkles, Music, Video, Star, Volume2, Play } from 'lucide-react';
import { Wish } from '../types';

interface BirthdayHeroProps {
  wishes: Wish[];
  onTriggerConfetti: () => void;
}

export default function BirthdayHero({ wishes, onTriggerConfetti }: BirthdayHeroProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingTune, setIsPlayingTune] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play the uploaded song
  const playBirthdayTune = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/uploads/mediaFile-1784258883191-515638657.aac');
        audioRef.current.onended = () => setIsPlayingTune(false);
        audioRef.current.onpause = () => setIsPlayingTune(false);
      }
      
      if (isPlayingTune) {
        audioRef.current.pause();
        setIsPlayingTune(false);
      } else {
        audioRef.current.play();
        setIsPlayingTune(true);
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlayingTune(false);
    }
  };

  // Find the primary wishes from ayuuu
  const primaryWish = wishes.find(w => w.sender.toLowerCase() === 'ayuuu') || wishes[0];

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-6 bg-[#0e0e0e] text-stone-200 rounded-sm border border-white/10 mb-12">
      {/* Decorative subtle stars in background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-1.5 h-1.5 bg-stone-400 rounded-full animate-sparkle" />
        <div className="absolute top-24 right-20 w-2 h-2 bg-white rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-stone-500 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-stone-400 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Floating elements & Header */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center justify-center px-4 py-2 bg-white/5 rounded-none border border-white/10 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2.5 animate-pulse"></span>
          <span className="text-xs uppercase tracking-[0.3em] text-stone-400 font-sans">To My Favourite Online Sister, Curiiii</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-display font-light tracking-tighter text-white mb-4"
        >
          Happy Birthday, Curious. 🎂
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base md:text-lg text-stone-400 font-serif italic max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Distance may exist in the digital world, but our sibling bond with Curiiii is closer than ever. 
          This elegant corner is designed with heartfelt melodies and appreciation.
        </motion.p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTriggerConfetti}
            className="flex items-center gap-2 px-6 py-3.5 bg-stone-200 hover:bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-none transition duration-300 shadow-lg"
            id="btn-celebrate"
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            Celebrate with Sparks! 🎉
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={playBirthdayTune}
            className={`flex items-center gap-2 px-6 py-3.5 border border-white/10 text-stone-300 hover:bg-white/5 font-bold text-xs uppercase tracking-[0.2em] rounded-none transition duration-300`}
            id="btn-play-tune"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingTune ? 'animate-bounce text-red-400' : ''}`} />
            {isPlayingTune ? 'Pause Ruposhh 🎶' : 'Play Ruposhh 🎶'}
          </motion.button>
        </div>

        {/* Interactive Letter from Ayuuu */}
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="envelope"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                whileHover={{ y: -3 }}
                onClick={() => setIsOpen(true)}
                className="cursor-pointer bg-[#111111] hover:bg-[#151515] border border-white/5 hover:border-white/10 p-8 rounded-none flex flex-col items-center justify-center gap-4 transition group"
              >
                <div className="w-12 h-12 rounded-none bg-stone-900 border border-white/10 flex items-center justify-center text-stone-400 group-hover:text-red-500 group-hover:border-red-500/30 transition-colors">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="text-center">
                  <h3 className="font-sans text-xs uppercase tracking-[0.25em] text-stone-300 font-semibold mb-1">A Heartfelt Letter from Ayuuu</h3>
                  <p className="text-xs text-stone-500 font-serif italic">Click to read the birthday letter ✨</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="letter"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#121212] text-stone-300 p-8 rounded-none shadow-2xl relative text-left border border-white/10 border-t-2 border-t-stone-400 font-sans"
              >
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 p-1.5 rounded-none transition"
                  aria-label="Close Letter"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-display font-light text-xl text-white">Dear Sister,</span>
                </div>

                <p className="text-stone-300 leading-relaxed text-base mb-6 italic font-serif whitespace-pre-line">
                  "{primaryWish?.message || 'Wishing you the happiest birthday filled with beautiful melodies and memories!'}"
                </p>

                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500">Sent with Sibling Love</p>
                    <p className="font-serif italic text-3xl text-white mt-1">ayuuu</p>
                  </div>
                  <Gift className="w-8 h-8 text-white/5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
