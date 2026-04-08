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
  LogOut,
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowLeft,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  RefreshCw,
  Database,
  Activity,
  Dices
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from './supabase';
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
    const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
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

const TimeAgo = ({ dateStr }: { dateStr: string }) => {
  const [timeStr, setTimeStr] = useState(formatTime(dateStr));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStr(formatTime(dateStr));
    }, 15000); // Update every 15s for high precision
    return () => clearInterval(interval);
  }, [dateStr]);

  return <>{timeStr}</>;
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

interface NavbarProps {
  onSearch: (val: string) => void;
  notifications: any[];
  onNotificationClick: () => void;
  uid: string | null;
  onLogout: () => void;
  memeSound: boolean;
  setMemeSound: (val: boolean | ((prev: boolean) => boolean)) => void;
  isAdmin: boolean;
  view: 'feed' | 'admin';
  setView: (val: 'feed' | 'admin') => void;
}

const Navbar = ({
  onSearch,
  notifications,
  onNotificationClick,
  uid,
  onLogout,
  memeSound,
  setMemeSound,
  isAdmin,
  view,
  setView
}: NavbarProps) => (
  <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-dark/80 backdrop-blur-md px-6 py-5 md:px-12">

    {/* Logo */}
    <div className="flex items-center gap-4">
      <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
        <MessageSquare className="size-5" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-100">
        Confeshion
      </h2>
    </div>

    {/* Right Section */}
    <div className="flex flex-1 justify-end gap-4 items-center">

      {/* Search */}
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

      {/* Buttons */}
      <div className="flex gap-3 items-center">

        {/* Meme Toggle Slider */}
        <div className="flex items-center gap-2 group">
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary/60 transition-colors">
            Meme Sounds
          </span>
          <button
            onClick={() => setMemeSound(!memeSound)}
            className={cn(
              "relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark disabled:cursor-not-allowed disabled:opacity-50",
              memeSound ? "bg-primary" : "bg-slate-700"
            )}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "pointer-events-none flex size-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform",
                memeSound ? "translate-x-5" : "translate-x-0"
              )}
            >
              {memeSound ? (
                <Volume2 className="size-3 text-primary" />
              ) : (
                <VolumeX className="size-3 text-slate-400" />
              )}
            </motion.span>
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => setView(view === 'admin' ? 'feed' : 'admin')}
            className={cn(
              "p-2 rounded-xl border transition-all flex items-center gap-2",
              view === 'admin' 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" 
                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            )}
          >
            <ShieldCheck className="size-4" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
              {view === 'admin' ? 'Exit Admin' : 'Admin Panel'}
            </span>
          </button>
        )}

        {/* User */}
        {uid && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <User className="size-3.5 text-primary" />

            <span className="text-xs font-bold text-primary truncate max-w-[80px]">
              {uid}
            </span>

            <button
              onClick={onLogout}
              className="ml-1 text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="size-3.5" />
              <span className="hidden lg:inline text-[10px] font-bold uppercase">
                Logout
              </span>
            </button>
          </div>
        )}

        {/* Notifications */}
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

interface SidebarProps {
  currentSort: SortOption;
  setSort: (s: SortOption) => void;
  currentCategory: string;
  setCategory: (c: string) => void;
  onPostClick: () => void;
  onLogout: () => void;
}

const Sidebar = ({
  currentSort,
  setSort,
  currentCategory,
  setCategory,
  onPostClick,
  onLogout
}: SidebarProps) => (
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

const ConfessionSkeleton = () => (
  <div className="glass-card rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/5 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="size-6 rounded bg-white/5 animate-pulse" />
    </div>
    <div className="space-y-3">
      <div className="h-6 w-full rounded bg-white/5 animate-pulse" />
      <div className="h-6 w-3/4 rounded bg-white/5 animate-pulse" />
    </div>
    <div className="flex items-center gap-4 mt-2">
      <div className="h-8 w-20 rounded-full bg-white/5 animate-pulse" />
      <div className="h-8 w-20 rounded-full bg-white/5 animate-pulse" />
    </div>
  </div>
);

interface ConfessionCardProps {
  confession: Confession;
  onReact: (id: string, type: string) => void;
  onUndoReact: (id: string, type: string) => void;
  onReply: (id: string) => void;
  onReport: () => void;
  onDelete: (id: string) => void;
  onViewReactions?: (id: string) => void;
  isOwner: boolean;
  isAdmin?: boolean;
}

const ConfessionCard: React.FC<ConfessionCardProps> = ({
  confession,
  onReact,
  onUndoReact,
  onReply,
  onReport,
  onDelete,
  onViewReactions,
  isOwner,
  isAdmin = false
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
      whileHover={{ y: -4 }}
      className="glass-card rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 border border-white/5 hover:border-primary/30 transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(0,255,157,0.05)] relative group/card"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">#{confession.category}</span>
          <span className="text-xs text-slate-500">• <TimeAgo dateStr={confession.created_at} /></span>
          {confession.mood && <span className="text-lg">{confession.mood}</span>}
        </div>
        <div className="relative flex items-center gap-2">
          {(isOwner || isAdmin) && (
            <button
              onClick={() => onDelete(confession.id)}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title={isAdmin ? "Super Delete (Admin)" : "Delete your confession"}
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
                  {isAdmin && onViewReactions && (
                    <button
                      onClick={() => { onViewReactions(confession.id); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-primary/10 flex items-center gap-2"
                    >
                      <Activity className="size-4" /> Telemetry
                    </button>
                  )}
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => { onDelete(confession.id); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="size-4" /> Delete
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className={cn(
        "text-xl md:text-2xl font-semibold text-slate-100 leading-[1.6] tracking-tight",
        confession.category === 'Dark' && "italic font-medium"
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
                  "flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-sm transition-all group select-none relative",
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

interface ConfessionComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  uid: string | null;
  onCategorySelect?: (cat: string) => void;
}

const ConfessionComposer = ({
  isOpen,
  onClose,
  onSubmit,
  uid,
  onCategorySelect
}: ConfessionComposerProps) => {
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
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/95 backdrop-blur-md cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl glass-card bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] p-10 md:p-14 border border-white/10 relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] cursor-default"
      >
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-3 text-white hover:bg-white/20 rounded-full transition-all shadow-lg"
          title="Close Composer"
        >
          <X className="size-6" />
        </button>

        <div className="flex items-center justify-between mb-10">
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

interface ThreadExplorerProps {
  confession: Confession;
  onClose: () => void;
  onSubmit: (content: string) => void;
  onDeleteReply: (id: string) => void;
  onDeleteConfession: (id: string) => void;
  currentUid: string | null;
  isAdmin?: boolean;
}

const ThreadExplorer = ({ 
  confession, 
  onClose, 
  onSubmit, 
  onDeleteReply, 
  onDeleteConfession,
  currentUid,
  isAdmin = false 
}: ThreadExplorerProps) => {
  const [content, setContent] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl glass-card rounded-[2.5rem] p-10 md:p-14 border border-primary/20 relative max-h-[90vh] flex flex-col shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
          <X className="size-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">#{confession.category}</span>
              <span className="text-[10px] text-slate-500">• <TimeAgo dateStr={confession.created_at} /></span>
            </div>
            {(currentUid && confession.uid === currentUid || isAdmin) && (
              <button
                onClick={() => {
                  onDeleteConfession(confession.id);
                  onClose();
                }}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title={isAdmin ? "Super Delete Confession" : "Delete your confession"}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <p className="text-xl font-semibold text-slate-100 leading-relaxed mb-4">{confession.content}</p>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-hide">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60">Community Thoughts</h3>
          {confession.replies?.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No replies yet. Be the first to share your thoughts.</p>
          ) : (
            confession.replies?.map(reply => (
              <div 
                key={reply.id} 
                className={cn(
                  "bg-white/5 border rounded-xl p-4 flex justify-between items-start group relative overflow-hidden",
                  reply.uid === 'Admin' ? "border-primary/40 bg-primary/5" : "border-white/10"
                )}
              >
                {reply.uid === 'Admin' && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[8px] font-black uppercase tracking-widest text-white rounded-bl-lg shadow-lg flex items-center gap-1">
                    <ShieldCheck className="size-2.5" /> Verified Admin
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {reply.uid === 'Admin' ? (
                      <span className="text-[10px] font-bold text-primary uppercase">System Admin</span>
                    ) : (
                      currentUid === 'Admin' && (
                        <span className="text-[10px] font-bold text-red-500 uppercase font-mono bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          ID: {reply.uid || 'UNKNOWN'}
                        </span>
                      )
                    )}
                  </div>
                  <p className={cn("text-slate-200", reply.uid === 'Admin' && "text-white font-medium")}>{reply.content}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block"><TimeAgo dateStr={reply.created_at} /></span>
                </div>
                {((currentUid && reply.uid === currentUid) || currentUid === 'Admin' || isAdmin) && (
                  <button
                    onClick={() => onDeleteReply(reply.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                    title={isAdmin ? "Super Delete Reply" : "Delete reply"}
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

interface ActivityHubProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  onReplyClick: (id: string) => void;
}

const ActivityHub = ({ isOpen, onClose, notifications, onReplyClick }: ActivityHubProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl glass-card rounded-[2.5rem] p-10 md:p-14 border border-primary/20 relative max-h-[85vh] flex flex-col shadow-2xl"
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
              <span className="text-[10px] text-slate-500 mt-2 block"><TimeAgo dateStr={n.created_at} /></span>
            </button>
          ))
        )}
        </div>
      </motion.div>
    </div>
  );
};

interface AdminMonitorProps {
  confessions: Confession[];
  onDelete: (id: string) => void;
  onDeleteReply: (id: string) => void;
  onDeleteReaction: (reactionId: string, confessionId: string, emoji: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  onReply: (id: string) => void;
  onViewReactions: (id: string) => void;
  onViewReplies: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onlineUsersCount: number;
}

const AdminMonitor = ({ 
  confessions, 
  onDelete, 
  onDeleteReply,
  onDeleteReaction,
  onLogout, 
  onRefresh,
  onReply,
  onViewReactions,
  onViewReplies,
  onReact,
  onlineUsersCount
}: AdminMonitorProps) => {
  const [interactionData, setInteractionData] = useState<Record<string, { reactions: string[], replies: string[] }>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [recentReactions, setRecentReactions] = useState<any[]>([]);
  const [recentReplies, setRecentReplies] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const fetchActivityLogs = async () => {
    setIsLoadingActivity(true);
    try {
      // Fetch latest 50 reactions
      const { data: reactions } = await supabase
        .from('reactions')
        .select('*, confessions(content)')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch latest 50 replies
      const { data: replies } = await supabase
        .from('replies')
        .select('*, confessions(content)')
        .order('created_at', { ascending: false })
        .limit(50);

      setRecentReactions(reactions || []);
      setRecentReplies(replies || []);
    } catch (err) {
      console.error("Activity Fetch Error:", err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [confessions]);

  useEffect(() => {
    const fetchInteractions = async () => {
      if (confessions.length === 0) return;
      setIsScanning(true);
      const ids = confessions.map(c => c.id);

      try {
        // Fetch User Reactions
        const { data: reacts } = await supabase
          .from('reactions')
          .select('confession_id, uid')
          .in('confession_id', ids);

        // Fetch User Replies
        const { data: reps } = await supabase
          .from('replies')
          .select('confession_id, uid')
          .in('confession_id', ids);

        const mapping: Record<string, { reactions: string[], replies: string[] }> = {};
        ids.forEach(id => mapping[id] = { reactions: [], replies: [] });

        reacts?.forEach(r => {
          const user = r.uid || 'Anon';
          if (mapping[r.confession_id] && !mapping[r.confession_id].reactions.includes(user)) {
            mapping[r.confession_id].reactions.push(user);
          }
        });

        reps?.forEach(r => {
          const user = r.uid || 'Anon';
          if (mapping[r.confession_id] && !mapping[r.confession_id].replies.includes(user)) {
            mapping[r.confession_id].replies.push(user);
          }
        });

        setInteractionData(mapping);
      } catch (err) {
        console.error("Telemetry Error:", err);
      } finally {
        setIsScanning(false);
      }
    };

    fetchInteractions();
  }, [confessions]);

  const stats = {
    total: confessions.length,
    trending: confessions.filter(c => (c.love_count + c.fire_count + c.cry_count + c.dead_count + c.clown_count) > 10).length,
    replies: confessions.reduce((acc, c) => acc + (c.reply_count || 0), 0)
  };



  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff9d] font-mono selection:bg-primary selection:text-black">
      {/* Cyber/Terminal Header */}
      <div className="border-b border-primary/20 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShieldAlert className="size-8 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase text-white">Admin Dashboard</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1.5 text-[10px] text-primary/70">
                  <span className="size-1.5 bg-primary rounded-full animate-glow"></span>
                  Online
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Global Server</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 border-x border-white/5 px-8">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Posts</p>
                <p className="text-lg font-bold text-white leading-none mt-1">{stats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Replies</p>
                <p className="text-lg font-bold text-white leading-none mt-1">{stats.replies}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active Users</p>
                <p className="text-lg font-bold text-primary leading-none mt-1">{onlineUsersCount}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={onRefresh}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all group"
                title="Refresh Data"
              >
                <RefreshCw className="size-5 text-slate-400 group-hover:text-primary transition-colors" />
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        {/* Main Monitor Grid */}
        <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="bg-primary/5 px-6 py-3 border-b border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-widest opacity-80">
              <Database className="size-3" />
              Post Management
            </div>
            <div className="text-[10px] text-slate-500">
              FILTER: ALL_POSTS // SORT: LATEST_FIRST
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Posted By</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Post Content</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Activity Counts</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Interacting Users</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {confessions.map((c) => (
                  <tr key={c.id} className="hover:bg-primary/[0.03] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] text-slate-500 font-mono">
                      {new Date(c.created_at).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-primary px-2 py-0.5 border border-primary/20 rounded-md bg-primary/5">
                        {c.uid}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors uppercase">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-slate-100 transition-colors max-w-[200px]">
                        {c.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-primary opacity-60">Reactions:</span>
                          <span className="text-white font-bold">{(c.love_count || 0) + (c.fire_count || 0) + (c.cry_count || 0) + (c.dead_count || 0) + (c.clown_count || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-blue-400 opacity-60">Replies:</span>
                          <span className="text-white font-bold">{c.reply_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        {isScanning ? (
                          <span className="text-[9px] text-primary/60 animate-pulse font-mono tracking-widest">Loading...</span>
                        ) : (
                          <>
                            {interactionData[c.id]?.reactions.length > 0 && (
                              <div className="text-[9px] text-slate-300 break-words line-clamp-2">
                                <span className="text-primary/70 mr-1 uppercase font-bold text-[8px]">Reactors:</span>
                                {interactionData[c.id].reactions.join(', ')}
                              </div>
                            )}
                            {interactionData[c.id]?.replies.length > 0 && (
                              <div className="text-[9px] text-slate-300 break-words line-clamp-2">
                                <span className="text-blue-400/70 mr-1 uppercase font-bold text-[8px]">Repliers:</span>
                                {interactionData[c.id].replies.join(', ')}
                              </div>
                            )}
                            {(!interactionData[c.id]?.reactions.length && !interactionData[c.id]?.replies.length) && (
                              <span className="text-[9px] text-slate-600 italic">No activity</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex border border-white/5 bg-white/5 rounded-md p-1 gap-1">
                          {["❤️", "💀", "😭", "🔥", "🤡"].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => onReact(c.id, emoji)}
                              className="w-6 h-6 flex items-center justify-center text-[10px] hover:bg-white/10 rounded transition-colors"
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => onReply(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-bold text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all"
                        >
                          <MessageSquare className="size-3" />
                          Manage Post
                        </button>
                        <button 
                          onClick={() => onViewReactions(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-[10px] font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all"
                        >
                          <Activity className="size-3" />
                          View Reactions
                        </button>
                        <button 
                          onClick={() => onViewReplies(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md text-[10px] font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all"
                        >
                          <MessageSquare className="size-3" />
                          View Replies
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Delete this post permanently?')) {
                              onDelete(c.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-bold text-red-500 hover:bg-red-500/20 active:scale-95 transition-all"
                        >
                          <Trash2 className="size-3" />
                          Remove Post
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Split Activity Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
          {/* Recent Reactions Table */}
          <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-primary/5 px-6 py-3 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-widest opacity-80 uppercase">
                <Activity className="size-3" />
                Recent Reactions
              </div>
              <div className="text-[10px] text-slate-500 uppercase">
                Latest 50 events
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">Time</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">User</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">Post</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">Emoji</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingActivity ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-primary/20 text-[10px] font-mono">Loading...</td></tr>
                  ) : recentReactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs italic">No reactions found</td></tr>
                  ) : (
                    recentReactions.map((item) => (
                      <tr key={item.id} className="hover:bg-primary/[0.03] transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-[10px] text-slate-500 font-mono">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-[10px] text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                            {item.uid ? item.uid.substring(0, 8) : 'Anon'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-[10px] text-slate-400 line-clamp-1 italic max-w-[150px]">
                            "{item.confessions?.content || 'Deleted'}"
                          </p>
                        </td>
                        <td className="px-4 py-4 text-xl">{item.reaction_type}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              if (confirm('Delete this reaction?')) {
                                onDeleteReaction(item.id, item.confession_id, item.reaction_type);
                                fetchActivityLogs();
                              }
                            }}
                            className="w-full py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/20 hover:bg-red-500/20 transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Replies Table */}
          <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-primary/5 px-6 py-3 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 tracking-widest opacity-80 uppercase">
                <MessageSquare className="size-3" />
                Recent Replies
              </div>
              <div className="text-[10px] text-slate-500 uppercase">
                Latest 50 events
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">Time</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">User</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500">Content</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-500 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingActivity ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-primary/20 text-[10px] font-mono">Loading...</td></tr>
                  ) : recentReplies.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs italic">No replies found</td></tr>
                  ) : (
                    recentReplies.map((item) => (
                      <tr key={item.id} className="hover:bg-primary/[0.03] transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-[10px] text-slate-500 font-mono">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-[10px] text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                            {item.uid ? item.uid.substring(0, 8) : 'Anon'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-white line-clamp-1 max-w-[200px]">{item.content}</p>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              if (confirm('Delete this reply?')) {
                                onDeleteReply(item.id);
                                fetchActivityLogs();
                              }
                            }}
                            className="w-full py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/20 hover:bg-red-500/20 transition-all font-mono"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccessPortalProps {
  onLogin: (id: string) => void;
  onAdminLogin: (pass: string) => void;
}

const AccessPortal = ({ onLogin, onAdminLogin }: AccessPortalProps) => {
  const [id, setId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleInitialSubmit = () => {
    if (id.trim().toLowerCase() === 'admin') {
      setShowPassword(true);
    } else {
      onLogin(id);
    }
  };

  const generateUsername = () => {
    const adjectives = ["Shadow", "Silent", "Hidden", "Ancient", "Ghostly", "Mystical", "Dark", "Lone", "Whispering", "Frozen", "Crimson", "Golden", "Radiant", "Broken", "Cloudy", "Silver", "Night", "Ethereal", "Lost", "Wandering"];
    const nouns = ["Soul", "Fox", "Wolf", "Phantom", "Spirit", "Raven", "Seeker", "Hunter", "Ghost", "Echo", "Eagle", "Dragon", "Tiger", "Panther", "Guardian", "Serpent", "Watcher", "Shadow", "Truth", "Void"];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    
    const generated = `${adj}${noun}${num}`;
    setId(generated);
  };

  const handleAdminSubmit = () => {
    onAdminLogin(password);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[160px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary blur-[160px] rounded-full animate-pulse delay-700"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
        className="w-full max-w-md glass-card bg-white/[0.03] backdrop-blur-[40px] rounded-[2.5rem] p-12 border border-white/10 relative z-10 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
      >
        <div className="size-24 bg-primary rounded-[2rem] flex items-center justify-center text-white mx-auto mb-10 shadow-[0_0_40px_rgba(0,255,157,0.4)] rotate-12 relative group-hover:rotate-0 transition-all duration-500">
          {showPassword ? <ShieldCheck className="size-12" /> : <Lock className="size-12" />}
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
        </div>
        
        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Confeshion</h1>
        
        <div className="mb-10 px-6 py-3 rounded-2xl bg-white/[0.05] border border-white/5 backdrop-blur-md">
          <p className="text-slate-300 text-sm leading-relaxed">
            {showPassword 
              ? "Administrator restricted area. Enter key to proceed." 
              : <>Claim your <span className="text-primary font-bold">Secret Identity</span> and enter the shadows.</>}
          </p>
        </div>

        <div className="space-y-4">
          {!showPassword ? (
            <>
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Your Secret Identity..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-primary/50 transition-all text-center pr-14 placeholder:text-slate-600"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && id.trim() && handleInitialSubmit()}
                />
                <button
                  onClick={generateUsername}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Generate Identity"
                >
                  <Dices className="size-5" />
                </button>
              </div>
              <button 
                disabled={!id.trim()}
                onClick={handleInitialSubmit}
                className="w-full py-4 bg-primary rounded-2xl text-white font-bold text-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
              >
                Enter the Shadows
              </button>
            </>
          ) : (
            <>
              <div className="text-left mb-2">
                <button 
                  onClick={() => setShowPassword(false)} 
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
                >
                  <ArrowLeft className="size-3" /> Back
                </button>
              </div>
              <input 
                type="password"
                placeholder="Admin Password"
                autoFocus
                className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-primary/50 transition-all text-center"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && password.trim() && handleAdminSubmit()}
              />
              <button 
                disabled={!password.trim()}
                onClick={handleAdminSubmit}
                className="w-full py-4 bg-primary rounded-2xl text-white font-bold text-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
              >
                Unlock Dashboard
              </button>
            </>
          )}
        </div>

        <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          End-to-End Anonymous Encryption
        </p>
      </motion.div>
    </div>
  );
};

// --- Main App ---

// --- Base Layouts ---

interface PublicFeedProps {
  search: string;
  setSearch: (s: string) => void;
  notifications: any[];
  setIsNotificationModalOpen: (b: boolean) => void;
  uid: string | null;
  handleLogout: () => void;
  memeSound: boolean;
  setMemeSound: (b: boolean | ((prev: boolean) => boolean)) => void;
  isAdmin: boolean;
  view: 'feed' | 'admin';
  setView: (v: 'feed' | 'admin') => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  category: string;
  handleCategoryClick: (c: string) => void;
  setIsPostModalOpen: (b: boolean) => void;
  filteredConfessions: Confession[];
  handleReact: (id: string, emoji: string) => void;
  handleUndoReact: (id: string, emoji: string) => void;
  fetchConfessionDetail: (id: string) => void;
  handleReport: () => void;
  handleDelete: (id: string, isReply: boolean) => void;
  onViewReactions?: (id: string) => void;
  onlineUsersCount: number;
  totalConfessionsCount: number;
  isLoading: boolean;
  feedError: string | null;
}

const PublicFeed = ({
  search,
  setSearch,
  notifications,
  setIsNotificationModalOpen,
  uid,
  handleLogout,
  memeSound,
  setMemeSound,
  isAdmin,
  view,
  setView,
  sort,
  setSort,
  category,
  handleCategoryClick,
  setIsPostModalOpen,
  filteredConfessions,
  handleReact,
  handleUndoReact,
  fetchConfessionDetail,
  handleReport,
  handleDelete,
  onViewReactions,
  onlineUsersCount,
  totalConfessionsCount,
  isLoading,
  feedError
}: PublicFeedProps) => {
  return (
    <>
      <Navbar
        onSearch={setSearch}
        notifications={notifications}
        onNotificationClick={() => setIsNotificationModalOpen(true)}
        uid={uid}
        onLogout={handleLogout}
        memeSound={memeSound}
        setMemeSound={setMemeSound}
        isAdmin={isAdmin}
        view={view}
        setView={setView}
      />

      <div className="flex flex-1 px-4 md:px-10 py-6 gap-8">
        <Sidebar
          currentSort={sort}
          setSort={setSort}
          currentCategory={category}
          setCategory={handleCategoryClick}
          onPostClick={() => setIsPostModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex flex-col gap-10 max-w-3xl mx-auto w-full">
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-background-dark to-primary/5 border border-primary/20 p-12 md:p-16 text-center">
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
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <ConfessionSkeleton />
                    </motion.div>
                  ))
                ) : feedError ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 px-6 glass-card rounded-[2rem] border-primary/20"
                  >
                    <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Compass className="size-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Connection Lost</h3>
                    <p className="text-slate-400 mb-6 max-w-xs mx-auto">{feedError}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      Refresh Stream
                    </button>
                  </motion.div>
                ) : (
                  filteredConfessions.map((c: any) => (
                    <ConfessionCard
                      key={c.id}
                      confession={c}
                      onReact={handleReact}
                      onUndoReact={handleUndoReact}
                      onReply={(id: string) => fetchConfessionDetail(id)}
                      onReport={handleReport}
                      onDelete={handleDelete}
                      onViewReactions={onViewReactions}
                      isOwner={c.uid === uid}
                      isAdmin={isAdmin}
                    />
                  ))
                )}
              </AnimatePresence>
              {!isLoading && !feedError && filteredConfessions.length === 0 && (
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
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Active Souls
                </span>
                <span className="text-white font-black text-sm">{onlineUsersCount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Truths Shared</span>
                <span className="text-white font-black text-sm">{totalConfessionsCount.toLocaleString()}</span>
              </div>

              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (onlineUsersCount / (totalConfessionsCount || 1)) * 100)}%` }}
                  className="h-full bg-primary shadow-[0_0_15px_rgba(0,255,157,0.5)]"
                ></motion.div>
              </div>
            </div>
            <button
              onClick={() => {
                handleCategoryClick('All');
                setSort('latest');
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <nav className="lg:hidden sticky bottom-0 z-50 flex items-center justify-around bg-background-dark/95 backdrop-blur-2xl border-t border-white/5 px-6 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button 
          className={cn("relative transition-all", sort === 'trending' ? "text-primary scale-110" : "text-slate-500")} 
          onClick={() => setSort('trending')}
        >
          <Flame className="size-7" />
          {sort === 'trending' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,157,0.8)]" />}
        </button>
        <button 
          className={cn("relative transition-all", sort === 'latest' ? "text-primary scale-110" : "text-slate-500")} 
          onClick={() => setSort('latest')}
        >
          <Compass className="size-7" />
          {sort === 'latest' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,157,0.8)]" />}
        </button>
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center justify-center size-14 bg-primary rounded-full text-white shadow-[0_0_25px_rgba(0,255,157,0.4)] -translate-y-8 border-8 border-background-dark hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="size-10" />
        </button>
        <button 
          className={cn("relative transition-all", sort === 'most-reacted' ? "text-primary scale-110" : "text-slate-500")} 
          onClick={() => setSort('most-reacted')}
        >
          <Heart className="size-7" />
          {sort === 'most-reacted' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,157,0.8)]" />}
        </button>
        <button
          className="text-slate-500 relative"
          onClick={() => setIsNotificationModalOpen(true)}
        >
          <Bell className="size-7" />
        </button>
      </nav>

      <footer className="w-full border-t border-white/5 mt-20 py-6 text-center text-xs text-slate-500">
        <p className="mb-2">
          Confeshion — An anonymous social experiment exploring privacy-first interactions.
        </p>
        <p className="mt-1 opacity-70">
          All posts are anonymous. Do not share personal or sensitive information.
        </p>
        <p className="mt-4 text-[10px] text-primary/40 font-bold uppercase tracking-widest">
          any changes u need contact dev god
        </p>
      </footer>
    </>
  );
};

export default function App() {
  const [memeSound, setMemeSound] = useState(() => {
    const saved = localStorage.getItem('memeSound');
    return saved !== null ? saved === 'true' : true;
  });
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
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [view, setView] = useState<'feed' | 'admin'>('feed');

  useEffect(() => {
    localStorage.setItem('memeSound', String(memeSound));
  }, [memeSound]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [hasUserPosted, setHasUserPosted] = useState(false);
  const [selectedReactions, setSelectedReactions] = useState<{ id: string, data: any[] } | null>(null);
  const [selectedRepliesMonitor, setSelectedRepliesMonitor] = useState<{ id: string, data: any[] } | null>(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState(1);
  const [totalConfessionsCount, setTotalConfessionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Real-time Presence Tracking
  useEffect(() => {
    const channel = supabase.channel('room_presence', {
      config: {
        presence: {
          key: uid || 'anonymous',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineUsersCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [uid]);

  // Fetch Total Count
  const fetchTotalCount = async () => {
    const { count } = await supabase
      .from('confessions')
      .select('*', { count: 'exact', head: true });
    setTotalConfessionsCount(count || 0);
  };

  useEffect(() => {
    fetchTotalCount();
  }, []);

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);

    if (memeSound && (cat === "30+" || cat === "Teachers")) {
      const audio = new Audio("fahhhhh.mp3");
      audio.currentTime = 0;
      audio.play().catch(() => { });
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('uid');
    if (savedId) {
      setUid(savedId);
      // Check if user has already posted
      const checkPosts = async () => {
        const { count } = await supabase
          .from('confessions')
          .select('*', { count: 'exact', head: true })
          .eq('uid', savedId);
        if (count && count > 0) setHasUserPosted(true);
      };
      checkPosts();
    }
  }, []);

  const handleAdminLogin = (password: string) => {
    if (password === 'passadmin2410') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setUid('Admin');
      setView('admin'); // Automatically switch to admin view
      setIsPostModalOpen(false); // Force close any automatic popups
      showToast("Access Granted: Admin Mode", "success");
    } else {
      showToast("Invalid Admin Password", "info");
    }
  };

  const handleLogin = async (id?: string) => {
    const newId =
      id && id.trim()
        ? id.trim()
        : "anon_" + Math.random().toString(36).substring(2, 8);

    try {
      // 1. Check if this ID is already assigned to THIS browser
      const localId = localStorage.getItem("uid");
      if (localId === newId) {
        setUid(newId);
        showToast(`Welcome back, ${newId}`, "info");
        return;
      }

      // 2. Check if identity is already in database (Case-Insensitive)
      const { data: cData, error: cError } = await supabase
        .from("confessions")
        .select("uid")
        .ilike("uid", newId)
        .limit(1);

      if (cError) throw cError;

      const { data: rData, error: rError } = await supabase
        .from("replies")
        .select("uid")
        .ilike("uid", newId)
        .limit(1);

      if (rError) throw rError;

      if ((cData && cData.length > 0) || (rData && rData.length > 0)) {
        showToast("This identity (or a variation of it) is already claimed.", "info");
        return;
      }

      // 3. Success - Set global persistence
      setUid(newId);
      localStorage.setItem("uid", newId);
      setIsPostModalOpen(false); // Ensure no popups on entry
      showToast(`Identity Assigned: ${newId}`, "success");

    } catch (err) {
      console.error("[handleLogin] Error:", err);
      showToast("The shadows are unstable. Try logging in again.", "info");
    }
  };

  const handleLogout = () => {
    // Clear all local storage first
    localStorage.removeItem('uid');
    localStorage.removeItem('isAdmin');

    // Reset all states to initial values
    setUid(null);
    setHasUserPosted(false);
    setIsAdmin(false);
    setView('feed');
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
    setIsLoading(true);
    setFeedError(null);
    try {
      let query = supabase
        .from('confessions')
        .select('id, content, category, uid, created_at, love_count, fire_count, cry_count, dead_count, clown_count, reply_count');

      if (category && category !== "All") {
        query = query.eq('category', category);
      }

      if (sort === "most-reacted") {
        query = query.order('love_count', { ascending: false });
      } else if (sort === "latest") {
        query = query.order('created_at', { ascending: false });
      }

      let { data, error } = await query;
      if (error) throw error;

      let result = data || [];

      // Weighted Trending Logic: score = love + fire + (replies * 2)
      if (sort === "trending") {
        result = [...result].sort((a: any, b: any) => {
          const scoreA = (a.love_count || 0) + (a.fire_count || 0) + ((a.reply_count || 0) * 2);
          const scoreB = (b.love_count || 0) + (b.fire_count || 0) + ((b.reply_count || 0) * 2);
          return scoreB - scoreA;
        });
      }

      setConfessions(result);
    } catch (err) {
      console.error("[fetchConfessions] Error:", err);
      setFeedError("We couldn't reach the confessions. Pull down to refresh.");
    } finally {
      setIsLoading(false);
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
    } finally {
      setIsLoading(false);
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

  const fetchReactions = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('id, uid, reaction_type, created_at')
        .eq('confession_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSelectedReactions({ id, data: data || [] });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        const searchInput = document.querySelector(
          'input[placeholder="Search secrets..."]'
        ) as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
          fetchTotalCount();
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
    if (!data.content || !data.content.trim()) {
      showToast("A confession cannot be empty.", "info");
      return;
    }

    try {
      const payload = {
        content: data.content.trim(),
        category: data.category,
        uid: uid
      };

      const { data: newPost, error } = await supabase
        .from('confessions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      showToast("Confession shared successfully!");
      setHasUserPosted(true);

      // 🔊 Meme sound (only if toggle is ON)
      if (memeSound && (data.category === "30+" || data.category === "Teachers")) {
        const audio = new Audio("fahhhhh.mp3");
        audio.currentTime = 0;
        audio.play().catch(() => { });
      }

      fetchConfessions();
      fetchTotalCount();

    } catch (err) {
      console.error("[handlePost] Error:", err);
      showToast("Your secret couldn't be shared. Try again.", "info");
    }
  };

  const handleReact = async (id: string, emoji: string) => {
    if (!isAdmin && !hasUserPosted) {
      showToast("You must share a confession first before participating!", "info");
      return;
    }
    const col = getEmojiColumn(emoji);
    if (!col) return;

    try {
      // 1. Insert into reactions table
      await supabase
        .from('reactions')
        .insert([{ confession_id: id, reaction_type: emoji, uid: uid }]);

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
      console.error("[handleReact] Error:", err);
      showToast("Reaction failed. Try again.", "info");
    }
  };

  const handleUndoReact = async (id: string, emoji: string) => {
    if (!isAdmin && !hasUserPosted) {
      showToast("You must share a confession first before participating!", "info");
      return;
    }
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
      console.error("[handleUndoReact] Error:", err);
      showToast("Couldn't remove reaction.", "info");
    }
  };

  const handleReply = async (content: string) => {
    if (!content || !content.trim()) {
      showToast("Reply cannot be empty", "info");
      return;
    }
    if (!isAdmin && !hasUserPosted) {
      showToast("You must share a confession first before participating!", "info");
      return;
    }
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

        if (selectedRepliesMonitor && selectedRepliesMonitor.id === reply.confession_id) {
          setSelectedRepliesMonitor({
            ...selectedRepliesMonitor,
            data: selectedRepliesMonitor.data.filter((r: any) => r.id !== replyId)
          });
        }
      }

      showToast("Reply deleted.");
      fetchConfessions();
    } catch (err) {
      showToast("Failed to delete reply", "info");
    }
  };

  const handleReport = async () => {
    showToast("Report logged and encrypted for moderator review.", "info");
    // In a real app, you would insert into a 'reports' table here
  };

  const fetchRepliesForMonitor = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select('id, uid, content, created_at, confession_id')
        .eq('confession_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSelectedRepliesMonitor({ id, data: data || [] });
    } catch (err) {
      console.error(err);
    }
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
      fetchTotalCount();
      
      // Update posted status
      const { count } = await supabase
        .from('confessions')
        .select('*', { count: 'exact', head: true })
        .eq('uid', uid);
      
      if (count === 0) setHasUserPosted(false);

      if (selectedConfessionId === id) {
        setSelectedConfession(null);
        setSelectedConfessionId(null);
      }
    } catch (err) {
      showToast("Failed to delete confession", "info");
    }
  };

  const handleDeleteReaction = async (reactionId: string, confessionId: string, emoji: string) => {
    const col = getEmojiColumn(emoji);
    if (!col) return;

    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', reactionId);

      if (error) throw error;

      // Decrement counter in confessions table
      const { data: current } = await supabase
        .from('confessions')
        .select(col)
        .eq('id', confessionId)
        .single();

      if (current) {
        const newVal = Math.max(0, (current as any)[col] - 1);
        await supabase
          .from('confessions')
          .update({ [col]: newVal })
          .eq('id', confessionId);
      }

      showToast("Reaction terminated.", "info");

      if (selectedReactions && selectedReactions.id === confessionId) {
        setSelectedReactions({
          ...selectedReactions,
          data: selectedReactions.data.filter((r: any) => r.id !== reactionId)
        });
      }

      fetchConfessions();
      if (selectedConfessionId === confessionId) {
        fetchConfessionDetail(confessionId);
      }
    } catch (err) {
      showToast("Failed to terminate reaction", "info");
    }
  };

  const filteredConfessions = confessions.filter(c =>
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      
      {/* View Switcher (Separate Base Architecture) */}
      <AnimatePresence mode="wait">
        {view === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <AdminMonitor 
              confessions={confessions}
              onDelete={handleDelete}
              onDeleteReply={handleDeleteReply}
              onDeleteReaction={handleDeleteReaction}
              onLogout={handleLogout}
              onRefresh={fetchConfessions}
              onReply={(id) => fetchConfessionDetail(id)}
              onViewReactions={fetchReactions}
              onViewReplies={fetchRepliesForMonitor}
              onReact={handleReact}
              onlineUsersCount={onlineUsersCount}
            />
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <PublicFeed
              search={search}
              setSearch={setSearch}
              notifications={notifications}
              setIsNotificationModalOpen={setIsNotificationModalOpen}
              uid={uid}
              handleLogout={handleLogout}
              memeSound={memeSound}
              setMemeSound={setMemeSound}
              isAdmin={isAdmin}
              view={view}
              setView={setView}
              sort={sort}
              setSort={setSort}
              category={category}
              handleCategoryClick={handleCategoryClick}
              setIsPostModalOpen={setIsPostModalOpen}
              filteredConfessions={filteredConfessions}
              handleReact={handleReact}
              handleUndoReact={handleUndoReact}
              fetchConfessionDetail={fetchConfessionDetail}
              handleReport={handleReport}
              handleDelete={handleDelete}
              onViewReactions={isAdmin ? fetchReactions : undefined}
              onlineUsersCount={onlineUsersCount}
              totalConfessionsCount={totalConfessionsCount}
              isLoading={isLoading}
              feedError={feedError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!uid && <AccessPortal onLogin={handleLogin} onAdminLogin={handleAdminLogin} />}

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-bold flex items-center gap-3 backdrop-blur-2xl border border-white/10",
              toast.type === 'success' ? "bg-primary/20 text-primary border-primary/20" : "bg-white/5 text-slate-200"
            )}
          >
            <div className={cn(
               "size-8 rounded-xl flex items-center justify-center",
               toast.type === 'success' ? "bg-primary text-black" : "bg-white/10 text-white"
            )}>
              {toast.type === 'success' ? <Zap className="size-4" /> : <Bell className="size-4" />}
            </div>
            <span className="text-sm tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals & Overlays */}
      <ConfessionComposer
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handlePost}
        uid={uid}
      />

      <ActivityHub
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onReplyClick={(id: string = '') => fetchConfessionDetail(id)}
      />

      {selectedConfession && (
        <ThreadExplorer
          confession={selectedConfession}
          onClose={() => {
            setSelectedConfession(null);
            setSelectedConfessionId(null);
          }}
          onSubmit={handleReply}
          onDeleteReply={handleDeleteReply}
          onDeleteConfession={handleDelete}
          currentUid={uid}
          isAdmin={isAdmin}
        />
      )}

      {selectedReactions && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-primary/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-primary/10 px-6 py-4 flex items-center justify-between border-b border-primary/20">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Activity className="size-4" />
                TELEMETRY_LOG
              </h3>
              <button onClick={() => setSelectedReactions(null)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedReactions.data.length === 0 ? (
                <p className="text-center text-slate-500 py-8">NO_REACTIONS_FOUND</p>
              ) : (
                <div className="space-y-2">
                  {selectedReactions.data.map((r: any) => (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{r.reaction_type}</span>
                        <div>
                          <p className="text-xs text-slate-400 font-mono">UID: <span className="text-white">{r.uid}</span></p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(r.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReaction(r.id, selectedReactions.id, r.reaction_type)}
                        className="mt-2 sm:mt-0 px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all font-mono"
                      >
                        TERMINATE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedRepliesMonitor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-primary/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-primary/10 px-6 py-4 flex items-center justify-between border-b border-primary/20">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <MessageSquare className="size-4" />
                REPLY_TELEMETRY_LOG
              </h3>
              <button onClick={() => setSelectedRepliesMonitor(null)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedRepliesMonitor.data.length === 0 ? (
                <p className="text-center text-slate-500 py-8">NO_REPLIES_FOUND</p>
              ) : (
                <div className="space-y-4">
                  {selectedRepliesMonitor.data.map((r: any) => (
                    <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-lg group/reply">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary px-2 py-0.5 border border-primary/20 rounded bg-primary/5 font-mono">
                            UID: {r.uid}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('TERMINATE_REPLY: ARE YOU SURE?')) {
                              handleDeleteReply(r.id);
                            }
                          }}
                          className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/20 hover:bg-red-500/20 transition-all font-mono"
                        >
                          TERMINATE
                        </button>
                      </div>
                      <p className="text-sm text-slate-300 bg-black/40 p-3 rounded border border-white/5">
                        {r.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
