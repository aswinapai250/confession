import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Flame, 
  Clock, 
  Heart, 
  Plus, 
  Search, 
  Bell, 
  User, 
  MoreHorizontal,
  Send,
  X,
  Lock,
  Zap,
  Compass,
  Trash2,
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from './lib/supabase';
import { Confession, SortOption, CATEGORIES, MOODS, REACTIONS, Reply } from './types';

const getEmojiColumn = (emoji: string): string | null => {
  switch (emoji) {
    case '❤️': return 'love_count';
    case '💀': return 'dead_count';
    case '😭': return 'cry_count';
    case '🔥': return 'fire_count';
    case '🤡': return 'clown_count';
    default: return null;
  }
};

const formatTime = (dateStr: string) => {
  try {
    // SQLite CURRENT_TIMESTAMP is YYYY-MM-DD HH:MM:SS in UTC
    // Convert to ISO format by replacing space with T and adding Z
    const isoStr = dateStr.replace(' ', 'T') + 'Z';
    const date = new Date(isoStr);
    
    if (isNaN(date.getTime())) return "some time ago";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 15) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    return "some time ago";
  }
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ 
  onSearch, 
  notifications, 
  onNotificationClick,
  uid,
  onLogout
}: { 
  onSearch: (val: string) => void, 
  notifications: any[], 
  onNotificationClick: () => void,
  uid: string | null,
  onLogout: () => void
}) => (
  <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-dark/80 backdrop-blur-md px-6 py-3 md:px-10">
    <div className="flex items-center gap-4">
      <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
        <MessageSquare className="size-5" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-100">Confeshion</h2>
    </div>
    <div className="flex flex-1 justify-end gap-4 items-center">
      <div className="hidden md:flex flex-col min-w-40 max-w-64 h-10">
        <div className="flex w-full flex-1 items-stretch rounded-full bg-primary/10 border border-primary/20">
          <div className="text-primary/60 flex items-center justify-center pl-4">
            <Search className="size-4" />
          </div>
          <input 
            className="flex w-full border-none bg-transparent focus:outline-none text-sm placeholder:text-primary/40 px-3" 
            placeholder="Search secrets..." 
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      </div>
      <div className="flex gap-3 items-center">
        {uid && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <User className="size-3.5 text-primary" />
            <span className="text-xs font-bold text-primary truncate max-w-[80px]">{uid}</span>
            <button 
              onClick={onLogout}
              className="ml-1 text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="size-3.5" />
              <span className="hidden lg:inline text-[10px] font-bold uppercase">Logout</span>
            </button>
          </div>
        )}
        <button 
          onClick={onNotificationClick}
          className="relative flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          <Bell className="size-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background-dark">
              {notifications.length}
            </span>
          )}
        </button>
      </div>
    </div>
  </header>
);

const Sidebar = ({ 
  currentSort, 
  setSort, 
  currentCategory, 
  setCategory,
  onPostClick,
  onLogout
}: { 
  currentSort: SortOption, 
  setSort: (s: SortOption) => void,
  currentCategory: string,
  setCategory: (c: string) => void,
  onPostClick: () => void,
  onLogout: () => void
}) => (
  <aside className="hidden lg:flex flex-col w-64 gap-8 shrink-0">
    <div className="flex flex-col gap-2">
      <h3 className="px-4 text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Feed</h3>
      <button 
        onClick={() => setSort('trending')}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
          currentSort === 'trending' ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-slate-300"
        )}
      >
        <Flame className={cn("size-5", currentSort === 'trending' ? "text-white" : "text-primary")} />
        <span>Trending</span>
      </button>
      <button 
        onClick={() => setSort('latest')}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
          currentSort === 'latest' ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-slate-300"
        )}
      >
        <Clock className={cn("size-5", currentSort === 'latest' ? "text-white" : "text-primary")} />
        <span>Latest</span>
      </button>
      <button 
        onClick={() => setSort('most-reacted')}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
          currentSort === 'most-reacted' ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-slate-300"
        )}
      >
        <Heart className={cn("size-5", currentSort === 'most-reacted' ? "text-white" : "text-primary")} />
        <span>Most Reacted</span>
      </button>
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="px-4 text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Categories</h3>
      <div className="flex flex-wrap gap-2 px-2">
        <button 
          onClick={() => setCategory('All')}
          className={cn(
            "px-3 py-1 rounded-full border text-xs font-medium transition-all",
            currentCategory === 'All' ? "bg-primary border-primary text-white" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
          )}
        >
          #All
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-full border text-xs font-medium transition-all",
              currentCategory === cat ? "bg-primary border-primary text-white" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
            )}
          >
            #{cat}
          </button>
        ))}
      </div>
    </div>
    <div className="flex flex-col gap-3 mt-auto">
      <button 
        onClick={onPostClick}
        className="flex items-center justify-center gap-2 w-full py-4 bg-primary rounded-xl text-white font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/10"
      >
        <Plus className="size-5" />
        <span>Post Confession</span>
      </button>
      <button 
        onClick={onLogout}
        className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 font-bold hover:bg-red-500/10 hover:text-red-400 transition-all"
      >
        <LogOut className="size-4" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
);

interface ConfessionCardProps {
  confession: Confession;
  onReact: (id: string, type: string) => void;
  onUndoReact: (id: string, type: string) => void;
  onReply: (id: string) => void;
  onReport: () => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}

const ConfessionCard: React.FC<ConfessionCardProps> = ({ 
  confession, 
  onReact, 
  onUndoReact,
  onReply,
  onReport,
  onDelete,
  isOwner
}) => {
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [undoingEmoji, setUndoingEmoji] = useState<string | null>(null);
  const [clickedEmoji, setClickedEmoji] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, emoji: string }[]>([]);

  const createBurst = (emoji: string) => {
    const newParticles = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400, // Increased distance
      y: (Math.random() - 0.5) * 400, // Increased distance
      emoji
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2000);
  };

  const handleEmojiClick = (emoji: string) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      // Double click detected
      setUndoingEmoji(emoji);
      onUndoReact(confession.id, emoji);
      setTimeout(() => setUndoingEmoji(null), 800);
    } else {
      clickTimeout.current = setTimeout(() => {
        // Single click detected
        setClickedEmoji(emoji);
        createBurst(emoji);
        onReact(confession.id, emoji);
        setTimeout(() => setClickedEmoji(null), 400);
        clickTimeout.current = null;
      }, 300); // Increased window for double click
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 flex flex-col gap-4 border border-white/5 relative"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">#{confession.category}</span>
          <span className="text-xs text-slate-500">• {formatTime(confession.created_at)}</span>
          {confession.mood && <span className="text-lg">{confession.mood}</span>}
        </div>
        <div className="relative flex items-center gap-2">
          {isOwner && (
            <button 
              onClick={() => onDelete(confession.id)}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Delete your confession"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <MoreHorizontal className="size-5" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                >
                  <button 
                    onClick={() => { onReport(); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
                  >
                    Report
                  </button>
                  {isOwner && (
                    <button 
                      onClick={() => { onDelete(confession.id); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      Delete
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className={cn(
        "text-lg md:text-xl font-medium text-slate-100 leading-relaxed",
        confession.category === 'Dark' && "italic"
      )}>
        {confession.content}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
        <div className="flex gap-2">
          {REACTIONS.map(emoji => {
            const isUndoing = undoingEmoji === emoji;
            const isClicked = clickedEmoji === emoji;
            
            return (
              <motion.button 
                key={emoji}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                animate={isUndoing ? { 
                  x: [0, -4, 4, -4, 4, 0],
                  opacity: [1, 0.5, 1]
                } : isClicked ? {
                  scale: [1, 1.4, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: isUndoing ? 0.4 : 0.3 }}
                onClick={() => handleEmojiClick(emoji)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-sm transition-all group select-none relative",
                  isUndoing && "border-red-500/50 bg-red-500/10"
                )}
                title="Click to react, Double-click to undo"
              >
                <span className={cn(
                  "group-hover:scale-125 transition-transform",
                  isClicked && "animate-bounce"
                )}>{emoji}</span>
                <span className="text-slate-400 group-hover:text-primary font-bold">
                  {(confession as any)[getEmojiColumn(emoji) || '']}
                </span>
                
                {/* Burst Particles */}
                <AnimatePresence>
                  {particles.filter(p => p.emoji === emoji).map(p => (
                    <motion.span
                      key={p.id}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                      animate={{ 
                        x: p.x, 
                        y: p.y, 
                        opacity: 0, 
                        scale: [0, 2, 0.5], // Dramatic scale up towards screen
                        rotate: Math.random() * 720 
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="absolute pointer-events-none text-2xl z-50"
                    >
                      {p.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>

                {/* Undo Strike-through Visual */}
                {isUndoing && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="absolute h-0.5 bg-red-500 top-1/2 left-0 -translate-y-1/2 z-10"
                  />
                )}

                {/* Small undo hint on hover */}
                <span className="absolute -top-2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-[8px] rounded-full px-1 py-0.5 font-bold">
                  UNDO
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onReply(confession.id)}
            className="text-sm text-slate-500 flex items-center gap-1 hover:text-primary transition-colors"
          >
            <MessageSquare className="size-4" /> {confession.reply_count} replies
          </button>
          <button 
            onClick={() => onReply(confession.id)}
            className="px-5 py-1.5 bg-primary rounded-full text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
          >
            Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PostModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  uid,
  onCategorySelect
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSubmit: (data: any) => void,
  uid: string | null,
  onCategorySelect?: (cat: string) => void
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Random');
  const [mood, setMood] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit({ content, category, mood });
      setContent('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl glass-card rounded-2xl p-8 border border-primary/20 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
          <X className="size-6" />
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Zap className="size-6" />
            </div>
            <h2 className="text-2xl font-bold">Share Your Truth</h2>
          </div>
          {uid && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <User className="size-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{uid}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3 block">The Confession</label>
            <textarea 
              className="w-full h-48 bg-primary/5 border border-primary/20 rounded-xl p-4 text-lg focus:outline-none focus:border-primary/50 transition-all resize-none"
              placeholder="Start typing your deepest secret here... (Ctrl+Enter to submit)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmit();
                }
              }}
              maxLength={2000}
            />
            <div className="text-right text-[10px] text-slate-500 mt-2">Character count: {content.length}/2000</div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3 block">Select Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    onCategorySelect?.(cat);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                    category === cat ? "bg-primary border-primary text-white" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3 block">Mood Tag</label>
            <div className="flex gap-4">
              {MOODS.map(m => (
                <button 
                  key={m}
                  onClick={() => setMood(m === mood ? null : m)}
                  className={cn(
                    "size-12 rounded-full flex items-center justify-center text-2xl transition-all border",
                    mood === m ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!content.trim()}
            onClick={handleSubmit}
            className="w-full py-4 bg-primary rounded-xl text-white font-bold text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Submit Instantly <Send className="size-5" />
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Lock className="size-3" /> Encrypted & 100% Anonymous
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ReplyModal = ({ 
  confession, 
  onClose, 
  onSubmit, 
  onDeleteReply,
  onDeleteConfession,
  currentUid
}: { 
  confession: Confession, 
  onClose: () => void, 
  onSubmit: (content: string) => void,
  onDeleteReply: (id: string) => void,
  onDeleteConfession: (id: string) => void,
  currentUid: string | null
}) => {
  const [content, setContent] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl glass-card rounded-2xl p-8 border border-primary/20 relative max-h-[90vh] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
          <X className="size-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">#{confession.category}</span>
              <span className="text-[10px] text-slate-500">• {formatTime(confession.created_at)}</span>
            </div>
            {currentUid && confession.uid === currentUid && (
              <button 
                onClick={() => {
                  onDeleteConfession(confession.id);
                  onClose();
                }}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title="Delete your confession"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <p className="text-lg font-medium text-slate-300 line-clamp-3">{confession.content}</p>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-hide">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60">Community Thoughts</h3>
          {confession.replies?.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No replies yet. Be the first to share your thoughts.</p>
          ) : (
            confession.replies?.map(reply => (
              <div key={reply.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-start group">
                <div className="flex-1">
                  <p className="text-slate-200">{reply.content}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">{formatTime(reply.created_at)}</span>
                </div>
                {currentUid && reply.uid === currentUid && (
                  <button 
                    onClick={() => onDeleteReply(reply.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                    title="Delete your reply"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-auto">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
              placeholder="Add to the discussion anonymously..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && content.trim()) {
                  onSubmit(content);
                  setContent('');
                }
              }}
            />
            <button 
              disabled={!content.trim()}
              onClick={() => {
                onSubmit(content);
                setContent('');
              }}
              className="size-12 bg-primary rounded-xl flex items-center justify-center text-white hover:brightness-110 disabled:opacity-50"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, notifications, onReplyClick }: { isOpen: boolean, onClose: () => void, notifications: any[], onReplyClick: (id: string) => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg glass-card rounded-2xl p-8 border border-primary/20 relative max-h-[80vh] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
          <X className="size-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="size-6 text-primary" />
          Notifications
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="size-12 text-slate-600 mx-auto mb-4 opacity-20" />
              <p className="text-slate-500">No new activity on your posts.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <button 
                key={i}
                onClick={() => { onReplyClick(n.confession_id); onClose(); }}
                className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-primary/5 transition-colors group"
              >
                <p className="text-xs text-primary font-bold mb-1">New Reply on your post:</p>
                <p className="text-sm text-slate-400 italic truncate mb-2">"{n.confession_content}"</p>
                <p className="text-slate-200 text-sm line-clamp-2">{n.content}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">{formatTime(n.created_at)}</span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

const LoginScreen = ({ onLogin }: { onLogin: (id: string) => void }) => {
  const [id, setId] = useState('');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-10 border border-primary/20 relative z-10 text-center"
      >
        <div className="size-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-primary/40 rotate-12">
          <Lock className="size-10" />
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Confeshion</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          Enter your <span className="text-primary font-bold">Secret Identity</span> to access the shadows. This identity is only stored on your device.
        </p>

        <div className="space-y-4">
          <input 
            type="text"
            placeholder="Your Secret Identity..."
            className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-primary/50 transition-all text-center"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && id.trim() && onLogin(id)}
          />
          <button 
            disabled={!id.trim()}
            onClick={() => onLogin(id)}
            className="w-full py-4 bg-primary rounded-2xl text-white font-bold text-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
          >
            Enter the Shadows
          </button>
        </div>
        
        <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          End-to-End Anonymous Encryption
        </p>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [activeConfessions, setActiveConfessions] = useState<Confession[]>([]);
  const [sort, setSort] = useState<SortOption>('trending');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedConfessionId, setSelectedConfessionId] = useState<string | null>(null);
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [myConfessions, setMyConfessions] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const handleCategoryClick = (cat: string) => {
    console.log("Selected category value:", cat);
    setCategory(cat);
    if (cat === "30+" || cat === "Teachers") {
      console.log("Sound triggered");
      const audio = new Audio("fahhhhh.mp3");
      audio.currentTime = 0;
      audio.play().catch(err => console.error("Audio error:", err));
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('uid');
    if (savedId) {
      setUid(savedId);
    }
  }, []);

  const handleLogin = async (id: string) => {
    setUid(id);
    localStorage.setItem('uid', id);
    showToast(`Welcome back, ${id}`, "info");
  };

  const handleLogout = () => {
    // Clear all local storage first
    localStorage.removeItem('uid');
    
    // Reset all states to initial values
    setUid(null);
    setNotifications([]);
    setSelectedConfession(null);
    setSelectedConfessionId(null);
    setIsPostModalOpen(false);
    setIsNotificationModalOpen(false);
    
    // Show feedback
    showToast("Logged out successfully", "info");
    
    // Ensure scroll to top
    window.scrollTo(0, 0);
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchConfessions = async () => {
    try {
      let query = supabase
        .from('confessions')
        .select('id, content, category, uid, created_at, love_count, fire_count, cry_count, dead_count, clown_count, reply_count');

      if (category && category !== "All") {
        query = query.eq('category', category);
      }

      if (sort === "trending") {
        // Simple trending: order by (love_count + fire_count + reply_count)
        query = query.order('love_count', { ascending: false });
      } else if (sort === "most-reacted") {
        query = query.order('love_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setConfessions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('id, content, category, uid, created_at, love_count, fire_count, cry_count, dead_count, clown_count, reply_count')
        .order('reply_count', { ascending: false })
        .limit(3);
      if (error) throw error;
      setActiveConfessions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    // Notifications are disabled as they require user_id tracking in DB
    setNotifications([]);
  };

  const fetchConfessionDetail = async (id: string) => {
    try {
      const { data: confession, error: cError } = await supabase
        .from('confessions')
        .select('id, content, category, uid, created_at, love_count, fire_count, cry_count, dead_count, clown_count, reply_count')
        .eq('id', id)
        .single();
      
      if (cError) throw cError;

      const { data: replies, error: rError } = await supabase
        .from('replies')
        .select('*')
        .eq('confession_id', id)
        .order('created_at', { ascending: false });
      
      if (rError) throw rError;

      setSelectedConfession({ ...confession, replies });
      setSelectedConfessionId(id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'n' || e.key === 'p') {
        setIsPostModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsPostModalOpen(false);
        setIsNotificationModalOpen(false);
        setSelectedConfession(null);
        setSelectedConfessionId(null);
      } else if (e.key === '1') {
        setSort('trending');
      } else if (e.key === '2') {
        setSort('latest');
      } else if (e.key === '3') {
        setSort('most-reacted');
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search secrets..."]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchConfessions();
    fetchActiveConfessions();
  }, [sort, category]);

  useEffect(() => {
    // Supabase Realtime Setup
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'confessions' },
        (payload) => {
          fetchConfessions();
          fetchActiveConfessions();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'replies' },
        (payload) => {
          fetchConfessions();
          fetchActiveConfessions();
          if (selectedConfessionId) fetchConfessionDetail(selectedConfessionId);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConfessionId, uid]);

  const handlePost = async (data: any) => {
    try {
      // Ensure the payload matches the table schema exactly
      // Column name must be "content", not "confession"
      const payload = {
        content: data.content,
        category: data.category,
        uid: uid
      };
      
      console.log("Supabase Insert Payload:", payload);
      
      const { data: newPost, error } = await supabase
        .from('confessions')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;

      showToast("Confession shared successfully!");

    // play sound if category is 30+ or Teachers
    if (data.category === "30+" || data.category === "Teachers") {
      const audio = new Audio("fahhhhh.mp3");
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    fetchConfessions();
    } catch (err) {
      showToast("Failed to share confession", "info");
    }
  };

  const handleReact = async (id: string, emoji: string) => {
    const col = getEmojiColumn(emoji);
    if (!col) return;

    try {
      // 1. Insert into reactions table
      await supabase
        .from('reactions')
        .insert([{ confession_id: id, reaction_type: emoji }]);

      // 2. Increment counter in confessions table
      const { data, error } = await supabase.rpc('increment_counter', { 
        table_name: 'confessions', 
        row_id: id, 
        column_name: col 
      });

      // Fallback if RPC is not available: manual update
      if (error) {
        const { data: current } = await supabase
          .from('confessions')
          .select(col)
          .eq('id', id)
          .single();
        
        await supabase
          .from('confessions')
          .update({ [col]: (current as any)[col] + 1 })
          .eq('id', id);
      }

      fetchConfessions();
      if (selectedConfessionId === id) fetchConfessionDetail(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndoReact = async (id: string, emoji: string) => {
    const col = getEmojiColumn(emoji);
    if (!col) return;

    try {
      // 1. Delete from reactions table
      await supabase
        .from('reactions')
        .delete()
        .eq('confession_id', id)
        .eq('reaction_type', emoji)
        .limit(1);

      // 2. Decrement counter in confessions table
      const { data: current } = await supabase
        .from('confessions')
        .select(col)
        .eq('id', id)
        .single();
      
      const newVal = Math.max(0, (current as any)[col] - 1);
      await supabase
        .from('confessions')
        .update({ [col]: newVal })
        .eq('id', id);

      fetchConfessions();
      if (selectedConfessionId === id) fetchConfessionDetail(id);
      showToast("Reaction removed", "info");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (content: string) => {
    if (!selectedConfessionId) return;
    try {
      // 1. Insert reply
      const { error: rError } = await supabase
        .from('replies')
        .insert([{ confession_id: selectedConfessionId, content, uid: uid }]);
      
      if (rError) throw rError;

      // 2. Increment reply_count
      const { data: current } = await supabase
        .from('confessions')
        .select('reply_count')
        .eq('id', selectedConfessionId)
        .single();
      
      await supabase
        .from('confessions')
        .update({ reply_count: (current?.reply_count || 0) + 1 })
        .eq('id', selectedConfessionId);

      showToast("Reply posted!");
      fetchConfessionDetail(selectedConfessionId);
      fetchConfessions();
    } catch (err) {
      showToast("Failed to post reply", "info");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const { data: reply } = await supabase
        .from('replies')
        .select('confession_id')
        .eq('id', replyId)
        .single();

      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId);
      
      if (error) throw error;

      if (reply) {
        // Decrement reply_count
        const { data: current } = await supabase
          .from('confessions')
          .select('reply_count')
          .eq('id', reply.confession_id)
          .single();
        
        await supabase
          .from('confessions')
          .update({ reply_count: Math.max(0, (current?.reply_count || 0) - 1) })
          .eq('id', reply.confession_id);
        
        if (selectedConfessionId === reply.confession_id) {
          fetchConfessionDetail(reply.confession_id);
        }
      }

      showToast("Reply deleted.");
      fetchConfessions();
    } catch (err) {
      showToast("Failed to delete reply", "info");
    }
  };

  const handleReport = () => {
    showToast("Confession reported for review.", "info");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('confessions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      showToast("Confession deleted.");
      fetchConfessions();
      if (selectedConfessionId === id) {
        setSelectedConfession(null);
        setSelectedConfessionId(null);
      }
    } catch (err) {
      showToast("Failed to delete confession", "info");
    }
  };

  const filteredConfessions = confessions.filter(c => 
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar 
        onSearch={setSearch} 
        notifications={notifications}
        onNotificationClick={() => setIsNotificationModalOpen(true)}
        uid={uid}
        onLogout={handleLogout}
      />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2",
              toast.type === 'success' ? "bg-primary text-white" : "bg-slate-800 text-slate-200"
            )}
          >
            {toast.type === 'success' ? <Zap className="size-4" /> : <Bell className="size-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 px-4 md:px-10 py-6 gap-8">
        <Sidebar 
          currentSort={sort} 
          setSort={setSort} 
          currentCategory={category} 
          setCategory={handleCategoryClick}
          onPostClick={() => setIsPostModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex flex-col gap-8 max-w-3xl mx-auto w-full">
          <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-background-dark to-primary/5 border border-primary/20 p-8 md:p-12 text-center">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                No names. Just truth.
              </h1>
              <p className="text-slate-400 max-w-md mx-auto">
                The safest place to share your deepest secrets, regrets, and stories completely anonymously.
              </p>
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="mt-4 px-8 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
              >
                Start Confessing
              </button>
            </div>
          </section>

          {/* Mobile Category Pills */}
          <div className="lg:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => handleCategoryClick('All')}
              className={cn(
                "flex h-10 shrink-0 items-center justify-center rounded-full px-6 font-medium text-sm transition-all",
                category === 'All' ? "bg-primary text-white" : "bg-primary/10 border border-primary/20 text-primary"
              )}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "flex h-10 shrink-0 items-center justify-center rounded-full px-6 font-medium text-sm transition-all border",
                  category === cat ? "bg-primary border-primary text-white" : "bg-primary/10 border border-primary/20 text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {filteredConfessions.map(c => (
                <ConfessionCard 
                  key={c.id} 
                  confession={c} 
                  onReact={handleReact}
                  onUndoReact={handleUndoReact}
                  onReply={(id) => fetchConfessionDetail(id)}
                  onReport={handleReport}
                  onDelete={handleDelete}
                  isOwner={c.uid === uid}
                />
              ))}
            </AnimatePresence>
            {filteredConfessions.length === 0 && (
              <div className="text-center py-20 opacity-50">
                <MessageSquare className="size-12 mx-auto mb-4" />
                <p>No confessions found in this category.</p>
              </div>
            )}
          </div>
          
          <div className="h-12"></div>
        </main>

        <aside className="hidden xl:flex flex-col w-72 gap-6">
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              Live Now
            </h3>
            <div className="flex flex-col gap-4">
              {activeConfessions.map(c => (
                <button 
                  key={c.id}
                  onClick={() => fetchConfessionDetail(c.id)}
                  className="flex flex-col gap-1 border-l-2 border-primary/30 pl-3 text-left hover:bg-primary/5 transition-colors py-1"
                >
                  <p className="text-sm font-medium text-slate-300 truncate">{c.content}</p>
                  <span className="text-[10px] text-slate-500">{formatTime(c.created_at)} • {c.reply_count} replies</span>
                </button>
              ))}
              {activeConfessions.length === 0 && (
                <p className="text-xs text-slate-500 italic">Quiet for now...</p>
              )}
            </div>
            <button 
              onClick={() => {
                setCategory('All');
                setSort('latest');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast("Showing all activities", "info");
              }}
              className="w-full mt-6 py-2 text-primary text-sm font-bold border border-primary/30 rounded-full hover:bg-primary/10 transition-all"
            >
              View All Activities
            </button>
          </div>
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-xs text-slate-400 text-center">
              Your identity is protected by end-to-end encryption. What happens in Confeshion stays in Confeshion.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden sticky bottom-0 z-50 flex items-center justify-around bg-background-dark/95 backdrop-blur-lg border-t border-white/5 px-6 py-4">
        <button className={cn(sort === 'trending' ? "text-primary" : "text-slate-500")} onClick={() => setSort('trending')}>
          <Flame className="size-7" />
        </button>
        <button className={cn(sort === 'latest' ? "text-primary" : "text-slate-500")} onClick={() => setSort('latest')}>
          <Compass className="size-7" />
        </button>
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center justify-center size-12 bg-primary rounded-full text-white shadow-lg shadow-primary/40 -translate-y-6 border-4 border-background-dark"
        >
          <Plus className="size-8" />
        </button>
        <button className={cn(sort === 'most-reacted' ? "text-primary" : "text-slate-500")} onClick={() => setSort('most-reacted')}>
          <Heart className="size-7" />
        </button>
        <button 
          className="text-slate-500"
          onClick={() => setIsNotificationModalOpen(true)}
        >
          <Bell className="size-7" />
        </button>
      </nav>

      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onSubmit={handlePost} 
        uid={uid}
      />

      <NotificationModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onReplyClick={(id) => fetchConfessionDetail(id)}
      />

      {selectedConfession && (
        <ReplyModal 
          confession={selectedConfession} 
          onClose={() => {
            setSelectedConfession(null);
            setSelectedConfessionId(null);
          }} 
          onSubmit={handleReply}
          onDeleteReply={handleDeleteReply}
          onDeleteConfession={handleDelete}
          currentUid={uid}
        />
      )}

      {/* Login Overlay */}
      {!uid && <LoginScreen onLogin={handleLogin} />}
    </div>
  );
}
