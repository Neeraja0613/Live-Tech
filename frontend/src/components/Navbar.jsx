import { LogOut, Search, User, LayoutGrid, BookmarkCheck, X, Command } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ session, profile, searchTerm, setSearchTerm }) {
  const location = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Keyboard shortcut (Ctrl+K) to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchExpanded(true);
      }
      if (e.key === 'Escape') {
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const userName = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];
  const avatarUrl = profile?.avatar_url;

  return (
    <nav className="sticky top-0 z-50 bg-darker/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-3 group shrink-0">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_var(--color-primary-glow)]">
          <LayoutGrid className="h-4 w-4 text-darker font-bold" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter hidden sm:block text-gradient leading-none">
            LIVE TECH
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            />
            <span className="text-[8px] font-black text-green-500/80 uppercase tracking-[0.2em]">Live Intelligence</span>
          </div>
        </div>
      </Link>

      {/* Interactive Search Bar */}
      <div className={`flex-1 flex items-center justify-center px-2 sm:px-4 ${isSearchExpanded ? 'absolute inset-x-0 mx-6 bg-darker sm:relative sm:inset-auto sm:mx-0' : ''}`}>
        <div className="relative flex items-center justify-center w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!isSearchExpanded ? (
              <motion.button
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsSearchExpanded(true)}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-white/10 transition-all shadow-sm group relative"
              >
                <Search className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.div
                key="input"
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative flex items-center w-full"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-24 py-2.5 border border-primary/30 rounded-full leading-5 bg-primary/5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.05)]"
                  placeholder="Type to search innovations..."
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsSearchExpanded(false)}
                    className="px-3 sm:px-4 py-1.5 bg-primary text-darker font-bold rounded-full text-[10px] sm:text-xs hover:bg-white transition-all whitespace-nowrap"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <Link 
          to="/saved" 
          className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
            location.pathname === '/saved' 
            ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookmarkCheck className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest hidden lg:block">Saved</span>
        </Link>

        <Link 
          to="/profile"
          className={`flex items-center gap-3 pl-4 border-l border-white/5 transition-colors group ${
            location.pathname === '/profile' ? 'text-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <span className="text-sm font-medium hidden lg:block max-w-[100px] truncate">{userName}</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all ml-2"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}

