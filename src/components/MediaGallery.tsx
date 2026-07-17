import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Video as VideoIcon, UploadCloud, Plus, Link as LinkIcon, Trash2, Filter, Play, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaGalleryProps {
  items: MediaItem[];
  selectedItem: MediaItem | null;
  onSelectItem: (item: MediaItem) => void;
  onUploadFile: (formData: FormData) => Promise<void>;
  onAddLink: (title: string, description: string, type: 'audio' | 'video', url: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export default function MediaGallery({
  items,
  selectedItem,
  onSelectItem,
  onUploadFile,
  onAddLink,
  onDeleteItem
}: MediaGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');

  // File Upload states
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileType, setFileType] = useState<'audio' | 'video'>('audio');
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Link Add states
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkType, setLinkType] = useState<'audio' | 'video'>('audio');
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);

  // Filter items
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  // Validate and set file
  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('audio/')) {
      setFileType('audio');
      setFile(selectedFile);
      setFileError('');
      // Pre-fill title if empty
      if (!fileTitle) {
        setFileTitle(selectedFile.name.split('.')[0]);
      }
    } else if (selectedFile.type.startsWith('video/')) {
      setFileType('video');
      setFile(selectedFile);
      setFileError('');
      // Pre-fill title if empty
      if (!fileTitle) {
        setFileTitle(selectedFile.name.split('.')[0]);
      }
    } else {
      setFileError('Please select only audio or video files.');
    }
  };

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Submit File Upload
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a file to upload!');
      return;
    }
    if (!fileTitle.trim()) {
      setFileError('Please provide a title!');
      return;
    }

    setFileError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('mediaFile', file);
      formData.append('title', fileTitle.trim());
      formData.append('description', fileDesc.trim());
      formData.append('type', fileType);

      await onUploadFile(formData);

      // Reset form
      setFile(null);
      setFileTitle('');
      setFileDesc('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadModal(false);
    } catch (err: any) {
      setFileError(err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Link Adding
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) {
      setLinkError('Please fill in both title and URL!');
      return;
    }

    setLinkError('');
    setIsLinking(true);

    try {
      await onAddLink(linkTitle.trim(), linkDesc.trim(), linkType, linkUrl.trim());

      // Reset
      setLinkTitle('');
      setLinkDesc('');
      setLinkUrl('');
      setShowUploadModal(false);
    } catch (err: any) {
      setLinkError(err.message || 'Failed to add external link.');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="mb-12" id="media-gallery-section">
      {/* Section controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-white/5 text-stone-300 border border-white/10">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-light text-white tracking-tight">
              The Creative Archive
            </h2>
            <p className="text-xs text-stone-500 font-serif italic">
              Play her beautiful songs, sing along, and celebrate her talent
            </p>
          </div>
        </div>

        {/* Filter & Upload Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filters */}
          <div className="bg-[#0e0e0e] border border-white/5 rounded-none p-1 flex items-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-stone-200 text-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('audio')}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold flex items-center gap-1 transition ${
                filter === 'audio'
                  ? 'bg-stone-200 text-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Music className="w-3 h-3" />
              Songs
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold flex items-center gap-1 transition ${
                filter === 'video'
                  ? 'bg-stone-200 text-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <VideoIcon className="w-3 h-3" />
              Videos
            </button>
          </div>

          {/* Add media button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 hover:bg-white text-black rounded-none font-bold text-xs shadow-md transition duration-300 uppercase tracking-wider"
            id="btn-add-media"
          >
            <Plus className="w-4 h-4" />
            Upload / Add Media
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#0e0e0e]/40 border border-white/5 rounded-none p-12 text-center text-stone-500 font-serif italic">
          No songs or videos found matching this filter. Click "Upload / Add Media" above to start uploading her media!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className={`group rounded-none border p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#121212] border-stone-300 shadow-none'
                    : 'bg-[#0e0e0e] border-white/10 hover:border-white/20 hover:bg-[#121212]'
                }`}
                onClick={() => onSelectItem(item)}
              >
                <div>
                  {/* Icon flag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-none border ${
                      isSelected
                        ? 'bg-white/10 text-white border-white/25'
                        : 'bg-[#0a0a0a] text-stone-400 border-white/5'
                    }`}>
                      {item.type === 'audio' ? <Music className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1.5 text-stone-500 hover:text-red-400 bg-[#0a0a0a] hover:bg-black rounded-none border border-white/5 transition-all"
                        title="Delete Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title / Description */}
                  <h3 className={`text-base font-display font-light mb-1 line-clamp-1 transition-colors ${
                    isSelected ? 'text-white underline decoration-stone-500 underline-offset-4' : 'text-stone-200'
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4 font-serif italic">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                  <span className="text-[9px] uppercase tracking-wider text-stone-500 font-sans">
                    {item.date}
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                    isSelected ? 'text-stone-300' : 'text-stone-500 group-hover:text-stone-300'
                  } transition-colors`}>
                    <Play className={`w-3 h-3 fill-current ${isSelected ? 'animate-pulse' : ''}`} />
                    <span>{isSelected ? 'Now playing' : 'Play now'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal / Dialog for Uploading and Adding Links */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-[#0e0e0e] border border-white/10 rounded-none p-8 w-full max-w-lg shadow-2xl relative"
            >
              {/* Close x */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-stone-500 hover:text-white p-1.5 rounded-none hover:bg-white/5 transition"
              >
                ✕
              </button>

              <h3 className="text-xl font-display font-light text-white mb-1">
                Add Sister's Creations
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-serif italic">
                Upload raw music/video files directly or link to an external track (like YouTube).
              </p>

              {/* Mode Toggler */}
              <div className="bg-black/50 border border-white/5 rounded-none p-1 flex items-center mb-6">
                <button
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 text-center rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    uploadMode === 'file'
                      ? 'bg-[#1a1a1a] border border-white/10 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload Local File
                </button>
                <button
                  onClick={() => setUploadMode('link')}
                  className={`flex-1 py-2 text-center rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    uploadMode === 'link'
                      ? 'bg-[#1a1a1a] border border-white/10 text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Link External URL
                </button>
              </div>

              {/* Form 1: File Upload */}
              {uploadMode === 'file' ? (
                <form onSubmit={handleFileUploadSubmit} className="space-y-4">
                  {/* File Selector Drag/Drop */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-none p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      isDragOver
                        ? 'border-white bg-white/5'
                        : file
                        ? 'border-white/30 bg-[#121212]'
                        : 'border-white/10 hover:border-white/25 bg-black/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className={`w-8 h-8 mb-2 ${file ? 'text-white' : 'text-stone-600'}`} />
                    {file ? (
                      <div>
                        <p className="text-xs text-stone-300 font-semibold truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono uppercase mt-1">
                          Type: {fileType}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-stone-300 font-medium font-sans uppercase tracking-wider">Drag & drop your file here</p>
                        <p className="text-[11px] text-stone-500 mt-1 font-serif italic">Or click to browse from computer</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
                      Media Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sweet Sister Cover Song"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2 text-xs outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
                      Description / Sister's Quote
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add an uplifting note about her performance!"
                      value={fileDesc}
                      onChange={(e) => setFileDesc(e.target.value)}
                      className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2 text-xs outline-none transition resize-none"
                    />
                  </div>

                  {fileError && <p className="text-xs text-red-400 font-mono">{fileError}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 py-2.5 bg-[#151515] hover:bg-[#1d1d1d] text-stone-400 hover:text-white rounded-none text-xs uppercase tracking-widest border border-white/5 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 py-2.5 bg-stone-200 hover:bg-white text-black rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 shadow-md disabled:opacity-50 transition"
                    >
                      {isUploading ? (
                        <span className="animate-spin text-xs">✦</span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Publish Song</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Form 2: External Link URL */
                <form onSubmit={handleLinkSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
                      Media Link URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="e.g., https://www.instagram.com/reel/... or youtube"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2.5 text-xs outline-none transition"
                    />
                    <p className="text-[9px] text-stone-500 mt-1 font-serif italic">
                      Supports direct mp3/mp4 links, Instagram Reels/Posts, and YouTube links.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
                        Media Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Song / Cover Name"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2.5 text-xs outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
                        Media Type
                      </label>
                      <select
                        value={linkType}
                        onChange={(e) => setLinkType(e.target.value as 'audio' | 'video')}
                        className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2 text-xs outline-none transition"
                      >
                        <option value="audio">Song (Audio) 🎵</option>
                        <option value="video">Video 🎥</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-stone-400 tracking-widest mb-2 font-sans">
                      Description / Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add an heartwarming caption about her performance!"
                      value={linkDesc}
                      onChange={(e) => setLinkDesc(e.target.value)}
                      className="w-full bg-black text-stone-200 border border-white/10 focus:border-stone-400 rounded-none px-4 py-2.5 text-xs outline-none transition resize-none"
                    />
                  </div>

                  {linkError && <p className="text-xs text-red-400 font-mono">{linkError}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 py-2.5 bg-[#151515] hover:bg-[#1d1d1d] text-stone-400 hover:text-white rounded-none text-xs uppercase tracking-widest border border-white/5 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="flex-1 py-2.5 bg-stone-200 hover:bg-white text-black rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 shadow-md disabled:opacity-50 transition"
                    >
                      {isLinking ? (
                        <span className="animate-spin text-xs">✦</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
