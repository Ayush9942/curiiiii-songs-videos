import React, { useState, useEffect } from 'react';
import { Gift, Heart, Sparkles, Music, Star, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, Wish } from './types';
import BirthdayHero from './components/BirthdayHero';
import CustomPlayer from './components/CustomPlayer';
import MediaGallery from './components/MediaGallery';
import WishesSection from './components/WishesSection';

interface Particle {
  id: number;
  x: number;
  emoji: string;
  size: number;
  delay: number;
  duration: number;
}

export default function App() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [mediaRes, wishesRes] = await Promise.all([
          fetch('/api/media'),
          fetch('/api/wishes')
        ]);
        
        if (!mediaRes.ok || !wishesRes.ok) {
          throw new Error('Failed to load database. Express server might be sleeping.');
        }

        const mediaData = await mediaRes.json();
        const wishesData = await wishesRes.json();

        setMediaItems(mediaData);
        setWishes(wishesData);

        // Auto-select first item if available
        if (mediaData.length > 0) {
          setSelectedMedia(mediaData[0]);
        }
      } catch (err: any) {
        console.error('Fetch data error:', err);
        setError('Error loading celebration records: ' + (err.message || 'Server unreachable'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Trigger floating celebratory emojis
  const handleTriggerConfetti = () => {
    const emojis = ['🎈', '🎉', '💖', '🍰', '🌟', '🎸', '🎤', '🍭', '🌸', '✨'];
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: Math.random() * 100, // percentage from left
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.floor(Math.random() * 24) + 20, // size in px
      delay: Math.random() * 1.5,
      duration: Math.random() * 4 + 5 // 5 to 9s flight
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after flight completes to avoid DOM bloating
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 11000);
  };

  // Add a birthday wish
  const handleAddWish = async (sender: string, message: string) => {
    const res = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to post wish');
    }
    const newWish = await res.json();
    setWishes(prev => [...prev, newWish]);
    handleTriggerConfetti(); // Sparkles feedback!
  };

  // Delete a wish
  const handleDeleteWish = async (id: string) => {
    const res = await fetch(`/api/wishes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete wish');
    }
    setWishes(prev => prev.filter(w => w.id !== id));
  };

  // Upload local media file
  const handleUploadFile = async (formData: FormData) => {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData // Content-Type header must NOT be set manually for boundary calculation
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload media file');
    }
    const newMedia = await res.json();
    setMediaItems(prev => [...prev, newMedia]);
    setSelectedMedia(newMedia); // Auto-play newly uploaded track
    handleTriggerConfetti();
  };

  // Add external media URL link
  const handleAddLink = async (title: string, description: string, type: 'audio' | 'video', url: string) => {
    const res = await fetch('/api/media/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, type, url })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to link external media');
    }
    const newMedia = await res.json();
    setMediaItems(prev => [...prev, newMedia]);
    setSelectedMedia(newMedia); // Auto-play newly linked track
    handleTriggerConfetti();
  };

  // Delete a media item
  const handleDeleteItem = async (id: string) => {
    const res = await fetch(`/api/media/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete media');
    }
    setMediaItems(prev => prev.filter(m => m.id !== id));
    // Clear selected media if we deleted it
    if (selectedMedia?.id === id) {
      setSelectedMedia(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 font-sans relative pb-16">
      
      {/* Floating Emojis Confetti Canvas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute bottom-0 text-center animate-float select-none"
            style={{
              left: `${p.x}%`,
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Decorative Subtle Dark Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-stone-500/[0.03] blur-3xl pointer-events-none" />

      {/* Primary Header Navbar */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">Special Edition • 2026</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tighter text-white font-display">
              For My Favorite Sister, Curious
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-right">
            <div className="hidden sm:block">
              <span className="block text-[11px] uppercase tracking-widest text-stone-400">A Celebration of Art & Life</span>
              <span className="block text-xs italic font-serif text-stone-500">Happy Birthday, Curiiii • from ayuuu</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 bg-[#111] flex items-center justify-center text-red-500">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 relative z-10">
        
        {/* Loading / Error handling states */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin mb-4" />
            <p className="text-sm text-slate-400 font-sans">Preparing the magical birthday stage...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-500/30 text-red-300 p-6 rounded-2xl text-center my-12 max-w-lg mx-auto">
            <p className="font-semibold mb-2">Oops!</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-900 border border-red-500/30 rounded-xl text-xs font-semibold transition"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* 1. Birthday Hero section */}
            <BirthdayHero 
              wishes={wishes} 
              onTriggerConfetti={handleTriggerConfetti} 
            />

            {/* 2. Media Area (Interactive Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              
              {/* Left Column (Player - Sticky/Focused) */}
              <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
                <CustomPlayer
                  item={selectedMedia}
                  onClose={() => setSelectedMedia(null)}
                />
              </div>

              {/* Right Column (Media Gallery list) */}
              <div className="lg:col-span-2">
                <MediaGallery
                  items={mediaItems}
                  selectedItem={selectedMedia}
                  onSelectItem={setSelectedMedia}
                  onUploadFile={handleUploadFile}
                  onAddLink={handleAddLink}
                  onDeleteItem={handleDeleteItem}
                />
              </div>
            </div>

            {/* 3. Wishes Section */}
            <WishesSection
              wishes={wishes}
              onAddWish={handleAddWish}
              onDeleteWish={handleDeleteWish}
            />
          </>
        )}
      </main>

      {/* Elegant Sibling Footer */}
      <footer className="border-t border-slate-900 mt-16 pt-8 text-center px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-300">
            <Heart className="w-4 h-4 fill-current text-red-500" />
            <span className="font-display font-medium text-sm">Happiest Birthday to My Dear Sister, Curious (Curiiii)!</span>
          </div>
          <p className="text-xs text-stone-500 font-sans max-w-md leading-relaxed">
            Every upload, melody, and wish here is curated with pure sibling love for Curiiii. 
            May your songs always inspire, and your videos continue to make us smile.
          </p>
          <div className="text-[10px] text-stone-600 mt-2 font-mono">
            Crafted with lots of sibling love by <span className="text-stone-400">Ayuuu</span> • {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
