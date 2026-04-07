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
  Settings,
  Eye,
  Info,
  Share2,
  Instagram,
  Sparkles
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
    let date = new Date(dateStr);
    
    if (isNaN(date.getTime()) && dateStr.includes(' ')) {
      const isoStr = dateStr.replace(' ', 'T') + 'Z';
      date = new Date(isoStr);
    }
    
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
    }, 15000);
    return () => clearInterval(interval);
  }, [dateStr]);

  return <>{timeStr}</>;
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
  onLogout,
  memeSound,
  setMemeSound
}: {
  onSearch: (val: string) => void
  notifications: any[]
  onNotificationClick: () => void
  uid: string | null
  onLogout: () => void
  memeSound: boolean
  setMemeSound: React.Dispatch<React.SetStateAction<boolean>>
}) => (
  <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-dark/80 backdrop-blur-md px-4 py-3 md:px-10 md:py-5 shadow-2xl shadow-black/20">
    {/* Logo */}
    <div className="flex items-center gap-3 md:gap-5">
      <div className="size-8 md:size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
        <MessageSquare className="size-5 md:size-6" />
      </div>
      <h2 className="text-lg md:text-2xl font-black tracking-tighter text-white">
        Confeshion
      </h2>
    </div>

    {/* Right Section */}
    <div className="flex flex-1 justify-end gap-4 items-center">

      {/* Search */}
      <div className="hidden md:flex flex-col min-w-48 max-w-72 h-11">
        <div className="flex w-full flex-1 items-stretch rounded-full bg-white/[0.03] border border-white/10 focus-within:border-primary/50 focus-within:bg-primary/5 focus-within:shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] transition-all">
          <div className="text-slate-500 flex items-center justify-center pl-4">
            <Search className="size-4" />
          </div>

          <input 
            className="flex w-full border-none bg-transparent focus:outline-none text-sm placeholder:text-slate-600 px-3 text-slate-200" 
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

        {/* Meme Toggle Switch */}
        <button
          onClick={() => setMemeSound(!memeSound)}
          className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
            memeSound ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10 hover:bg-white/10"
          )}
          title="Toggle Meme Sounds"
        >
          {memeSound ? <Volume2 className="size-3.5 text-primary" /> : <VolumeX className="size-3.5 text-slate-400" />}
          <span className={cn(
            "text-xs font-bold transition-colors hidden lg:inline",
            memeSound ? "text-primary" : "text-slate-400"
          )}>
            {memeSound ? "Sounds ON" : "Sounds OFF"}
          </span>
          <div className={cn(
            "relative w-7 h-4 rounded-full transition-colors flex items-center ml-1",
            memeSound ? "bg-primary/40" : "bg-slate-700"
          )}>
            <motion.div
              className={cn(
                "absolute top-0.5 left-0.5 w-3 h-3 rounded-full shadow-sm",
                memeSound ? "bg-primary" : "bg-slate-400"
              )}
              animate={{ x: memeSound ? 12 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>

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
  onShareToast: (msg: string) => void;
  isOwner: boolean;
}

const ConfessionCard: React.FC<ConfessionCardProps> = ({ 
  confession, 
  onReact, 
  onUndoReact,
  onReply,
  onReport,
  onDelete,
  onShareToast,
  isOwner
}) => {
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [undoingEmoji, setUndoingEmoji] = useState<string | null>(null);
  const [clickedEmoji, setClickedEmoji] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, emoji: string }[]>([]);

  const shareUrl = `${window.location.origin}/?id=${confession.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A truth from Confeshion',
          text: confession.content,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Native Share Error:", err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // showToast is passed down but we can access it from App context or use a prop.
    // For now, I'll rely on onReport or similar prop but it's easier to use a window event or simple toast if I add it to props.
    // Actually, I'll add onShareToast to props.
  };

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
  const totalReactions = (confession.love_count || 0) + 
                         (confession.fire_count || 0) + 
                         (confession.cry_count || 0) + 
                         (confession.dead_count || 0) + 
                         (confession.clown_count || 0);
  const isTrending = totalReactions > 10 || (confession.reply_count || 0) > 5;

  return (
    <motion.div 
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card rounded-2xl p-5 md:p-8 flex flex-col gap-6 md:gap-7 border transition-all relative group/card",
        isTrending 
          ? "border-primary/40 shadow-xl shadow-primary/10 ring-1 ring-primary/20" 
          : "border-white/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider border border-primary/20">#{confession.category}</span>
          {isTrending && (
             <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 animate-pulse whitespace-nowrap">
               <Flame className="size-3" /> Trending
             </span>
          )}
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">• <TimeAgo dateStr={confession.created_at} /></span>
          {confession.mood && <span className="text-xl ml-1">{confession.mood}</span>}
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

          {/* Share Button */}
          <div className="relative">
            <button 
              onClick={handleShare}
              className="text-slate-500 hover:text-primary transition-colors p-1"
              title="Share"
            >
              <Share2 className="size-4" />
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                  >
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(shareUrl); 
                        onShareToast("Link copied!");
                        setShowShareMenu(false); 
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <Plus className="size-4 rotate-45 text-slate-400" />
                      Copy Link
                    </button>
                    <a 
                      href={`https://wa.me/?text=Check%20out%20this%20truth%20on%20Confeshion:%20${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <MessageSquare className="size-4 text-green-500" />
                      WhatsApp
                    </a>
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(shareUrl); 
                        onShareToast("Copied for Instagram Story!");
                        setShowShareMenu(false); 
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <Instagram className="size-4 text-pink-500" />
                      Instagram
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

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
        "text-lg md:text-2xl font-medium text-white leading-[1.5] md:leading-[1.6] tracking-tight mb-2",
        confession.category === 'Dark' && "italic font-normal text-slate-200"
      )}>
        {confession.content}
      </p>

      {/* Reply Previews */}
      {confession.replies && confession.replies.length > 0 && (
        <div className="mt-4 mb-4 space-y-3 pl-4 border-l-2 border-white/10">
          {confession.replies.slice(0, 2).map((reply: any) => (
            <div key={reply.id} className="flex flex-col gap-1">
              <p className="text-xs md:text-sm text-slate-400 line-clamp-1">
                {reply.content}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">
                <TimeAgo dateStr={reply.created_at} />
              </span>
            </div>
          ))}
        </div>
      )}
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
        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          <button 
            onClick={() => onReply(confession.id)}
            className="text-xs md:text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-primary transition-colors group"
          >
            <MessageSquare className="size-4 group-hover:scale-110 transition-transform" /> 
            <span className="hidden sm:inline">{confession.reply_count} replies</span>
            <span className="sm:hidden">{confession.reply_count}</span>
          </button>
          <button 
            onClick={() => onReply(confession.id)}
            className="px-4 py-2 md:px-6 md:py-2.5 bg-primary rounded-xl text-white text-xs md:text-sm font-bold shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-5 md:p-8 flex flex-col gap-6 md:gap-7 border border-white/5 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="w-12 md:w-16 h-6 bg-white/5 rounded-lg" />
        <div className="w-20 md:w-24 h-4 bg-white/5 rounded-full" />
      </div>
      <div className="w-8 h-8 bg-white/5 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="w-full h-4 bg-white/5 rounded-full" />
      <div className="w-5/6 h-4 bg-white/5 rounded-full" />
      <div className="w-4/6 h-4 bg-white/5 rounded-full" />
    </div>
    <div className="flex items-center justify-between mt-auto">
      <div className="flex gap-2">
        {[1, 2].map(i => (
          <div key={i} className="w-10 md:w-12 h-8 bg-white/5 rounded-full" />
        ))}
      </div>
      <div className="w-16 md:w-20 h-10 bg-primary/20 rounded-xl" />
    </div>
  </div>
);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-background-dark/95 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-[95%] md:w-full max-w-2xl glass-card rounded-[2rem] px-6 py-8 md:px-10 md:py-12 border border-white/10 relative shadow-2xl shadow-primary/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
          <X className="size-6" />
        </button>

        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="size-10 md:size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Zap className="size-6 md:size-7" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black tracking-tight text-white">Share Your Truth</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Anonymous & Encrypted</p>
            </div>
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
              className="w-full h-32 md:h-48 bg-primary/5 border border-primary/20 rounded-xl p-4 text-base md:text-lg focus:outline-none focus:border-primary/50 transition-all resize-none"
              placeholder="Start typing your deepest secret here..."
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
            className="w-full py-5 bg-primary rounded-2xl text-white font-black text-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 mt-4 h-16"
          >
            Submit Instantly <Send className="size-6" />
          </button>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <Lock className="size-3" /> End-to-End Encrypted & 100% Anonymous
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
  onReact,
  onUndoReact,
  currentUid
}: { 
  confession: Confession & { reactions?: any[] }, 
  onClose: () => void, 
  onSubmit: (content: string) => void | Promise<void>,
  onDeleteReply: (id: string) => void | Promise<void>,
  onDeleteConfession: (id: string) => void | Promise<void>,
  onReact: (id: string, emoji: string, replyId?: string) => void,
  onUndoReact: (id: string, emoji: string, replyId?: string) => void,
  currentUid: string | null,
  key?: string
}) => {
  const [content, setContent] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-background-dark/95 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-[95%] md:w-full max-w-2xl glass-card rounded-[2rem] px-6 py-8 md:px-10 md:py-12 border border-white/10 relative max-h-[90vh] flex flex-col shadow-2xl shadow-primary/5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
          <X className="size-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">#{confession.category}</span>
              <span className="text-[10px] text-slate-500">• <TimeAgo dateStr={confession.created_at} /></span>
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
            <p className="text-slate-500 text-center py-12 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">No replies yet. Be the first to share your thoughts.</p>
          ) : (
            confession.replies?.map(reply => (
              <div key={reply.id} className={cn(
                "border rounded-2xl p-4 md:p-6 flex justify-between items-start group transition-all",
                reply.uid === 'SYSTEM_ADMIN' 
                  ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5" 
                  : "bg-white/[0.03] border-white/5 hover:border-white/10"
              )}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {reply.uid === 'SYSTEM_ADMIN' && (
                       <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black border border-primary/30 uppercase tracking-tighter animate-pulse">
                         <ShieldCheck className="size-2.5" /> Verified Admin
                       </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-slate-200",
                    reply.uid === 'SYSTEM_ADMIN' && "font-semibold text-slate-100"
                  )}>{reply.content}</p>
                  
                  {/* Reply Reactions */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {REACTIONS.map(emoji => {
                      const counts = confession.reactions?.filter(r => r.reply_id === reply.id && r.reaction_type === emoji);
                      const count = counts?.length || 0;
                      const hasReacted = counts?.some(r => r.uid === currentUid);
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => hasReacted ? onUndoReact(confession.id, emoji, reply.id) : onReact(confession.id, emoji, reply.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all border",
                            hasReacted 
                              ? "bg-primary/20 border-primary/40 text-primary" 
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                          )}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[10px] text-slate-500 mt-2 block"><TimeAgo dateStr={reply.created_at} /></span>
                </div>
                {currentUid && (reply.uid === currentUid || currentUid === 'SYSTEM_ADMIN') && (
                  <button 
                    onClick={() => onDeleteReply(reply.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 mt-1"
                    title="Delete reply"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 md:mt-8">
          <div className="flex gap-2 md:gap-3">
            <input 
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-sm md:text-base text-slate-200 placeholder:text-slate-600"
              placeholder="Add your thoughts..."
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
                <span className="text-[10px] text-slate-500 mt-2 block"><TimeAgo dateStr={n.created_at} /></span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ 
  confessions, 
  reactions,
  replies,
  onDelete, 
  onViewConfession,
  onLogout,
  loadingId
}: { 
  confessions: Confession[], 
  reactions: any[],
  replies: any[],
  onDelete: (id: string) => void,
  onViewConfession: (id: string) => void,
  onLogout: () => void,
  loadingId: string | null
}) => {
  const categoriesCount = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = confessions.filter(c => c.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const sortedCats = Object.entries(categoriesCount).sort((a,b) => b[1] - a[1]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-200">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 py-4 md:px-10">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="size-6" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Admin Dashboard</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Management Console</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 rounded-full transition-all font-bold text-xs"
        >
          <LogOut className="size-4" /> Exit Admin
        </button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Posts</p>
            <p className="text-4xl font-black text-white">{confessions.length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Reactions</p>
            <p className="text-4xl font-black text-white">
              {confessions.reduce((acc, c) => acc + (c.love_count + c.fire_count + c.cry_count + c.dead_count + c.clown_count), 0)}
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-left">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Recent 1h Activity</p>
             <p className="text-4xl font-black text-white">
               {reactions.filter(r => (Date.now() - new Date(r.created_at).getTime()) < 3600000).length}
             </p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-left">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Direct Replies</p>
             <p className="text-4xl font-black text-white">
               {confessions.reduce((acc, c) => acc + (c.reply_count || 0), 0)}
             </p>
          </div>
        </div>

        {/* Management Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Settings className="size-5 text-primary" />
            <h2 className="font-bold text-lg">Confession Management</h2>
          </div>
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="px-6 py-4">Confession</th>
                    <th className="px-6 py-4">Posted By (UID)</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Date/Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {confessions.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm line-clamp-2 text-slate-300 font-medium">{c.content}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center">
                             <User className="size-3 text-primary" />
                          </div>
                          <span className="text-xs font-mono text-slate-400">{c.uid === 'SYSTEM_ADMIN' ? '🛡️ ADMIN' : (c.uid || 'Anonymous')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-300">{new Date(c.created_at).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            disabled={loadingId === c.id}
                            onClick={() => onViewConfession(c.id)}
                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
                            title="View / Reply"
                          >
                            {loadingId === c.id ? (
                              <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <MessageSquare className="size-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this confession permanently?')) {
                                onDelete(c.id);
                              }
                            }}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Post"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reaction Monitor */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Eye className="size-5 text-primary" />
            <h2 className="font-bold text-lg">Engagement Monitor (Recent Reactions)</h2>
          </div>
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="px-6 py-4">Reaction</th>
                    <th className="px-6 py-4">Reacted By (UID)</th>
                    <th className="px-6 py-4">Target Post</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reactions.map((r, i) => {
                    const targetPost = confessions.find(c => c.id === r.confession_id);
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <span className="text-2xl">{r.reaction_type}</span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                               {getEmojiColumn(r.reaction_type)?.replace('_count', '')}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center">
                               <User className="size-3 text-primary" />
                            </div>
                            <span className="text-xs font-mono text-slate-400">{r.uid || 'Legacy User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <p className="text-xs text-slate-300 italic truncate opacity-60">"{(targetPost?.content || 'Reference Lost')}"</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] text-slate-500"><TimeAgo dateStr={r.created_at} /></span>
                        </td>
                      </tr>
                    );
                  })}
                  {reactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm italic">
                        No reaction data captured yet since upgrade.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Community Interaction Monitor (Replies) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <MessageSquare className="size-5 text-primary" />
            <h2 className="font-bold text-lg">Interaction Monitor (Recent Replies)</h2>
          </div>
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="px-6 py-4">Reply Content</th>
                    <th className="px-6 py-4">Replied By (UID)</th>
                    <th className="px-6 py-4">Target Post</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {replies.map((rep, i) => (
                    <tr key={rep.id || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 max-w-sm">
                        <p className="text-sm text-slate-300 font-medium">{rep.content}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center">
                             <User className="size-3 text-primary" />
                          </div>
                          <span className="text-xs font-mono text-slate-400">{rep.uid === 'SYSTEM_ADMIN' ? '🛡️ ADMIN' : (rep.uid || 'Anonymous')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-slate-500 truncate italic">
                          "{rep.confessions?.content || 'Loading post...'}"
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-slate-500"><TimeAgo dateStr={rep.created_at} /></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const LoginScreen = ({ onLogin, onAdminLogin }: { onLogin: (id: string) => void, onAdminLogin: (pass: string) => void }) => {
  const [id, setId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const generateRandomId = () => {
    const adjectives = ["Silent", "Shadow", "Ghost", "Mystic", "Dark", "Bright", "Lone", "Brave", "Swift", "Calm", "Wild", "Neon", "Cold", "Fire", "Crystal"];
    const nouns = ["Soul", "Fox", "Wolf", "Eagle", "Raven", "Phoenix", "Knight", "Nomad", "Spirit", "Echo", "Blade", "Heart", "Storm", "Voyager"];
    const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 99) + 1}`;
    setId(randomName);
  };

  const handleInitialSubmit = () => {
    if (id.trim().toLowerCase() === 'admin') {
      setShowPassword(true);
    } else {
      onLogin(id.trim());
    }
  };

  const handleAdminSubmit = () => {
    onAdminLogin(password);
  };

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
          {showPassword ? <ShieldCheck className="size-10" /> : <Lock className="size-10" />}
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Confeshion</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          {showPassword 
            ? "Enter the administrator password to access management tools." 
            : <>Tell us who you are, or <span className="text-primary font-bold">Roll the Dice</span> to generate an identity.</>}
        </p>

        <div className="space-y-4">
          {!showPassword ? (
            <>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Your Secret Identity..."
                  className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-primary/50 transition-all text-center pr-14"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInitialSubmit()}
                />
                <button 
                  onClick={generateRandomId}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white transition-colors bg-primary/10 rounded-xl hover:bg-primary"
                  title="Generate Random Name"
                >
                  <Sparkles className="size-5" />
                </button>
              </div>
              <button 
                onClick={handleInitialSubmit}
                className="w-full py-4 bg-primary rounded-2xl text-white font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/20"
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
                placeholder="Admin Password..."
                className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-primary/50 transition-all text-center"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && password.trim() && handleAdminSubmit()}
                autoFocus
              />
              <button 
                disabled={!password.trim()}
                onClick={handleAdminSubmit}
                className="w-full py-4 bg-primary rounded-2xl text-white font-bold text-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
              >
                Verify Admin
              </button>
            </>
          )}
        </div>
        
        <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          {showPassword ? "Restricted Access Area" : "End-to-End Anonymous Encryption"}
        </p>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isAdmin') === 'true';
    }
    return false;
  });
  const [memeSound, setMemeSound] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memeSound');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('memeSound', String(memeSound));
  }, [memeSound]);

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [activeConfessions, setActiveConfessions] = useState<Confession[]>([]);
  const [sort, setSort] = useState<SortOption>('trending');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedConfessionId, setSelectedConfessionId] = useState<string | null>(null);
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [myConfessions, setMyConfessions] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allReactions, setAllReactions] = useState<any[]>([]);
  const [allReplies, setAllReplies] = useState<any[]>([]);
  const [hasPosted, setHasPosted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      // Priority: Active session (Admin) -> Persistent Storage (User)
      return sessionStorage.getItem('uid') || localStorage.getItem('uid');
    }
    return null;
  });
  const socketRef = useRef<WebSocket | null>(null);

  const handleCategoryClick = (cat: string) => {
  setCategory(cat);

  if (memeSound && (cat === "30+" || cat === "Teachers")) {
    const audio = new Audio("fahhhhh.mp3");
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
};

  useEffect(() => {
    const savedId = sessionStorage.getItem('uid') || localStorage.getItem('uid');
    if (savedId) {
      setUid(savedId);
    }

    // Deep linking for shared confessions
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('id');
    if (sharedId) {
      fetchConfessionDetail(sharedId);
      // Clean up URL to keep it pretty
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }
  }, []);

  const handleLogin = async (id?: string) => {
    const adjectives = ["Silent", "Shadow", "Ghost", "Mystic", "Dark", "Bright", "Lone", "Brave", "Swift", "Calm", "Wild", "Neon", "Cold", "Fire", "Crystal"];
    const nouns = ["Soul", "Fox", "Wolf", "Eagle", "Raven", "Phoenix", "Knight", "Nomad", "Spirit", "Echo", "Blade", "Heart", "Storm", "Voyager"];
    
    const newId =
      id && id.trim()
        ? id.trim()
        : `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 99) + 1}`;

    try {
      // 1. Check if ID already exists in BOTH confessions and replies
      const { data: cData, error: cError } = await supabase
        .from("confessions")
        .select("uid")
        .eq("uid", newId)
        .limit(1);

      if (cError) throw cError;

      const { data: rData, error: rError } = await supabase
        .from("replies")
        .select("uid")
        .eq("uid", newId)
        .limit(1);

      if (rError) throw rError;

      const isTaken = (cData && cData.length > 0) || (rData && rData.length > 0);
      const currentStoredId = localStorage.getItem('uid');

      // 2. Reject if the ID is used elsewhere but NOT on this device
      if (isTaken && newId !== currentStoredId) {
        showToast("User ID already taken", "info");
        return;
      }

      setUid(newId);
      localStorage.setItem("uid", newId);
      showToast(`Welcome ${newId}`, "info");

    } catch (err) {
      console.error("Login Check Error:", err);
      showToast("Login failed", "info");
    }
  };

const handleAdminLogin = (pass: string) => {
    if (pass === 'passadmin2410') {
      setIsAdmin(true);
      setUid('SYSTEM_ADMIN');
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('uid', 'SYSTEM_ADMIN');
      showToast("Admin access granted", "success");
    } else {
    showToast("Invalid admin password", "info");
  }
};

  const handleLogout = () => {
    // Clear all storage for complete sign-out
    sessionStorage.removeItem('uid');
    sessionStorage.removeItem('isAdmin');
    localStorage.removeItem('uid');
    
    // Reset all states to initial values
    setUid(null);
    setIsAdmin(false);
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
    try {
      let query = supabase
        .from('confessions')
        .select(`
          id, content, category, uid, created_at, love_count, fire_count, cry_count, dead_count, clown_count, reply_count,
          replies (id, content, created_at, uid)
        `);

      if (category && category !== "All") {
        query = query.eq('category', category);
      }

      if (sort === "latest") {
        query = query.order('created_at', { ascending: false });
      } else {
        // For trending and most-reacted, we'll fetch then sort if needed
        query = query.order('love_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let processedData = data || [];

      if (sort === "trending") {
        processedData = [...processedData].sort((a, b) => {
          const scoreA = (a.love_count || 0) + (a.fire_count || 0) + ((a.reply_count || 0) * 2);
          const scoreB = (b.love_count || 0) + (b.fire_count || 0) + ((b.reply_count || 0) * 2);
          return scoreB - scoreA;
        });
      }

      setConfessions(processedData);
    } catch (err) {
      console.error("Fetch Confessions Error:", err);
      showToast("Could not load confessions. Please refresh.", "info");
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
      console.error("Fetch Active Confessions Error:", err);
    }
  };

  const fetchNotifications = async () => {
    // Notifications are disabled as they require user_id tracking in DB
    setNotifications([]);
  };

  const fetchAllReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setAllReactions(data || []);
    } catch (err) {
      console.error("Fetch All Reactions Error:", err);
    }
  };

  const fetchConfessionDetail = async (id: string) => {
    setLoadingPostId(id);
    try {
      const { data: confession, error: cError } = await supabase
        .from('confessions')
        .select('id, content, category, uid, created_at, love_count, fire_count, cry_count, dead_count, clown_count, reply_count')
        .eq('id', id)
        .single();
      
      if (cError) throw new Error("Could not find post details.");

      const { data: replies, error: rError } = await supabase
        .from('replies')
        .select('*')
        .eq('confession_id', id)
        .order('created_at', { ascending: false });
      
      if (rError) throw new Error("Could not load community thoughts.");

      // Fetch ALL reactions for this post AND its replies
      const { data: reactions, error: reactError } = await supabase
        .from('reactions')
        .select('*')
        .or(`confession_id.eq.${id},reply_id.in.(${replies.map(r => r.id).join(',') || 'NULL'})`);

      setSelectedConfession({ ...confession, replies, reactions: reactions || [] });
      setSelectedConfessionId(id);
    } catch (err: any) {
      showToast(err.message || "Failed to load post.", "info");
    } finally {
      setLoadingPostId(null);
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

  const checkParticipation = async () => {
    if (!uid || uid === 'SYSTEM_ADMIN') {
      setHasPosted(true); 
      return;
    }
    try {
      const { count, error } = await supabase
        .from('confessions')
        .select('id', { count: 'exact', head: true })
        .eq('uid', uid);
      
      if (error) throw error;
      setHasPosted((count || 0) > 0);
    } catch (err) {
      console.error("Participation Check Error:", err);
    }
  };

  const fetchAllReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          confessions (
            content
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setAllReplies(data || []);
    } catch (err) {
      console.error("Fetch All Replies Error:", err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchConfessions(),
        fetchActiveConfessions()
      ]);
      if (isAdmin) {
        fetchAllReactions();
        fetchAllReplies();
      }
      if (uid) {
        checkParticipation();
      }
    };
    fetchInitialData();
  }, [sort, category, isAdmin, uid]);

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
          checkParticipation();
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
          if (isAdmin) fetchAllReplies();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          if (isAdmin) fetchAllReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConfessionId, uid, isAdmin]);

  const handlePost = async (data: any) => {
  try {
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

    // 🔊 Meme sound (only if toggle is ON)
    if (memeSound && (data.category === "30+" || data.category === "Teachers")) {
      const audio = new Audio("fahhhhh.mp3");
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    fetchConfessions();

  } catch (err) {
    console.error("Post Confession Error:", err);
    showToast("Could not share confession. Check your connection.", "info");
  }
};

  const handleReact = async (id: string, emoji: string, replyId?: string) => {
    const col = getEmojiColumn(emoji);
    if (!col) return;

    if (!uid) {
      showToast("Sign in required to react", "info");
      return;
    }

    if (!hasPosted && uid !== 'SYSTEM_ADMIN') {
      showToast("You must share a secret first to react!", "info");
      return;
    }

    try {
      // 1. Insert into reactions table
      const payload: any = { reaction_type: emoji, uid: uid };
      if (replyId) payload.reply_id = replyId;
      else payload.confession_id = id;

      await supabase.from('reactions').insert([payload]);

      // 2. Increment counter in confessions table (only for posts)
      if (!replyId) {
        const { error } = await supabase.rpc('increment_counter', { 
          table_name: 'confessions', 
          row_id: id, 
          column_name: col 
        });

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
      }

      if (selectedConfessionId) fetchConfessionDetail(selectedConfessionId);
      fetchConfessions();
    } catch (err) {
      console.error("handleReact Error:", err);
      showToast("Reaction failed. Please try again.", "info");
    }
  };

  const handleUndoReact = async (id: string, emoji: string, replyId?: string) => {
    const col = getEmojiColumn(emoji);
    if (!col) return;

    try {
      // 1. Delete from reactions table
      const query = supabase
        .from('reactions')
        .delete()
        .eq('reaction_type', emoji)
        .eq('uid', uid);
      
      if (replyId) query.eq('reply_id', replyId);
      else query.eq('confession_id', id);

      await query.limit(1);

      // 2. Decrement counter in confessions table (only for posts)
      if (!replyId) {
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
      }

      if (selectedConfessionId) fetchConfessionDetail(selectedConfessionId);
      fetchConfessions();
      showToast("Reaction removed", "info");
    } catch (err) {
      console.error("handleUndoReact Error:", err);
      showToast("Could not remove reaction.", "info");
    }
  };

  const handleReply = async (content: string) => {
    if (!selectedConfessionId || !uid) {
      if (!uid) showToast("Sign in required to reply.", "info");
      return;
    }

    if (!hasPosted && uid !== 'SYSTEM_ADMIN') {
      showToast("You must share a secret first to join the conversation!", "info");
      return;
    }
    
    // Optimistic feedback
    showToast("Posting your thoughts...", "info");
    
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
      
      if (current) {
        await supabase
          .from('confessions')
          .update({ reply_count: (current.reply_count || 0) + 1 })
          .eq('id', selectedConfessionId);
      }

      showToast("Reply posted successfully!", "success");
      
      // Force refresh of the specific post data
      if (selectedConfessionId) {
        fetchConfessionDetail(selectedConfessionId);
      }
      fetchConfessions();
    } catch (err: any) {
      console.error("Reply Error:", err);
      showToast("Could not post reply. Please try again.", "info");
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
       console.error("Delete Reply Error:", err);
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
      console.error("Delete Confession Error:", err);
      showToast("Failed to delete confession", "info");
    }
  };

  const filteredConfessions = confessions.filter(c => 
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {isAdmin ? (
        <AdminDashboard 
          confessions={confessions}
          reactions={allReactions}
          replies={allReplies}
          onDelete={handleDelete}
          onViewConfession={(id) => fetchConfessionDetail(id)}
          onLogout={handleLogout}
          loadingId={loadingPostId}
        />
      ) : (
        <>
          <Navbar 
            onSearch={setSearch} 
            notifications={notifications}
            onNotificationClick={() => setIsNotificationModalOpen(true)}
            uid={uid}
            onLogout={handleLogout}
            memeSound={memeSound}
            setMemeSound={setMemeSound}
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
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  ) : filteredConfessions.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                      <Eye className="size-12 text-slate-600 mx-auto mb-4 opacity-20" />
                      <p className="text-xl text-slate-500 font-medium">No secrets found in this dimension.</p>
                      <p className="text-sm text-slate-600 mt-1">Try another category or search term.</p>
                    </div>
                  ) : (
                    filteredConfessions.map(c => (
                      <ConfessionCard 
                        key={c.id} 
                        confession={c} 
                        onReact={handleReact}
                        onUndoReact={handleUndoReact}
                        onReply={(id) => fetchConfessionDetail(id)}
                        onReport={handleReport}
                        onDelete={handleDelete}
                        onShareToast={(msg) => showToast(msg, "success")}
                        isOwner={c.uid === uid}
                      />
                    ))
                  )}
                </AnimatePresence>
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
                      <span className="text-[10px] text-slate-500"><TimeAgo dateStr={c.created_at} /> • {c.reply_count} replies</span>
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

          <footer className="w-full border-t border-white/5 mt-20 py-6 text-center text-xs text-slate-500">
            <p className="mb-2">
              Confeshion — An anonymous social experiment exploring privacy-first interactions.
            </p>
            <p className="mt-1 opacity-70">
              All posts are anonymous. Do not share personal or sensitive information.
            </p>
          </footer>
        </>
      )}

      {/* Global Overlays & Modals */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border",
              toast.type === 'success' ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-primary/20 border-primary/30 text-primary"
            )}
          >
            {toast.type === 'success' ? <ShieldCheck className="size-5" /> : <Info className="size-5" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
          key={selectedConfession.id}
          confession={selectedConfession} 
          onClose={() => {
            setSelectedConfession(null);
            setSelectedConfessionId(null);
          }} 
          onSubmit={handleReply}
          onDeleteReply={handleDeleteReply}
          onDeleteConfession={handleDelete}
          onReact={handleReact}
          onUndoReact={handleUndoReact}
          currentUid={uid}
        />
      )}

      {/* Login Screen */}
      {!uid && <LoginScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} />}
    </div>
  );
}
