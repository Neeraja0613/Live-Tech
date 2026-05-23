import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter, Newspaper, X, ExternalLink, Info, Flame, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ToolCard from '../components/ToolCard';
import LoaderCard from '../components/LoaderCard';
import InfiniteLoader from '../components/InfiniteLoader';

const TOOLS_PER_PAGE = 10;

export default function Feed({ session, searchTerm, setSearchTerm, savedToolIds, toggleSaveTool }) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTool, setSelectedTool] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef();
  const lastToolElementRef = useCallback(node => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, hasMore]);

  // Initial fetch
  const [newToolNotification, setNewToolNotification] = useState(null);

  useEffect(() => {
    fetchInitialTools();

    const channel = supabase
      .channel("realtime ai_tools")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_tools" },
        (payload) => {
          setTools((prev) => {
            const exists = prev.find(t => t.id === payload.new.id);
            if (exists) return prev;
            
            // Trigger Notification
            setNewToolNotification(payload.new);
            setTimeout(() => setNewToolNotification(null), 5000);
            
            return [payload.new, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ai_tools" },
        (payload) => {
          setTools((prev) => prev.map(t => t.id === payload.new.id ? payload.new : t));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "ai_tools" },
        (payload) => {
          setTools((prev) => prev.filter(t => t.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch more tools when page changes
  useEffect(() => {
    if (page > 0) {
      fetchMoreTools();
    }
  }, [page]);

  const fetchInitialTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, TOOLS_PER_PAGE - 1);

      if (error) throw error;
      setTools(data || []);
      setHasMore(data.length === TOOLS_PER_PAGE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoreTools = useCallback(async () => {
    if (fetchingMore || !hasMore) return;
    
    try {
      setFetchingMore(true);
      const from = page * TOOLS_PER_PAGE;
      const to = from + TOOLS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      if (data) {
        setTools(prev => {
          // Use a Map to ensure unique tool IDs
          const combined = [...prev, ...data];
          const uniqueMap = new Map(combined.map(item => [item.id, item]));
          return Array.from(uniqueMap.values());
        });
        setHasMore(data.length === TOOLS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error fetching more tools:', err);
    } finally {
      setFetchingMore(false);
    }
  }, [fetchingMore, hasMore, page]);

  // Filtered tools based on search and category filter
  const processedTools = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return tools.filter(tool => {
      const matchesSearch = (tool.name?.toLowerCase() || '').includes(lowerSearch) ||
        (tool.tagline?.toLowerCase() || '').includes(lowerSearch);

      const topics = Array.isArray(tool.topics) ? tool.topics : tool.topics?.split(',') || [];
      const matchesFilter = activeFilter === 'All' || topics.some(t => t.trim() === activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [tools, searchTerm, activeFilter]);

  // Topic Analytics for Filters
  const topicStats = useMemo(() => {
    const stats = {};
    tools.forEach(tool => {
      const topics = Array.isArray(tool.topics) ? tool.topics : tool.topics?.split(',') || [];
      topics.forEach(t => {
        const cleaned = t.trim();
        if (cleaned) stats[cleaned] = (stats[cleaned] || 0) + 1;
      });
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [tools]);

  const uniqueFilters = ['All', ...topicStats.map(s => s[0])];

  return (
    <div className="relative min-h-screen bg-darker overflow-x-hidden">
      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {newToolNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[60] flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary shadow-[0_0_40px_var(--color-primary-glow)] border border-white/20"
          >
            <div className="h-10 w-10 rounded-xl bg-darker flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-darker/60 uppercase tracking-widest leading-none mb-1">New Intelligence Detected</p>
              <h4 className="text-darker font-black text-sm tracking-tight">{newToolNotification.name}</h4>
            </div>
            <button 
              onClick={() => setNewToolNotification(null)}
              className="ml-4 p-1 hover:bg-darker/10 rounded-full text-darker/40 hover:text-darker transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        
        {/* Hero Header */}
        <header className="mb-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-40 bg-primary/10 blur-[120px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-8 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
          >
            <Sparkles className="h-3 w-3" />
            Next-Gen AI Intelligence
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]"
          >
            Live <span className="text-gradient">Trending</span> <br/>AI Discovery
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto font-medium"
          >
            The world's most advanced real-time feed for AI breakthroughs, scored by our proprietary trending algorithm.
          </motion.p>
        </header>

        {/* Horizontal Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-12 no-scrollbar scroll-smooth">
          <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Filter</span>
          </div>
          <div className="flex items-center gap-2">
            {(activeFilter !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setActiveFilter('All');
                  setSearchTerm('');
                }}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 flex items-center gap-2 whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                Clear All
              </button>
            )}
            {uniqueFilters.map(topic => (
              <button
                key={topic}
                onClick={() => setActiveFilter(topic)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                  activeFilter === topic 
                  ? 'bg-primary text-darker shadow-[0_0_20px_var(--color-primary-glow)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-20">
          <div className="space-y-20">
            
            {/* Main Feed Section */}
            <section>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_var(--color-primary-glow)]">
                    {activeFilter === 'All' ? <Clock className="h-6 w-6 text-primary" /> : <Filter className="h-6 w-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      {activeFilter === 'All' ? 'Latest Feed' : `${activeFilter} Hub`}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                      {processedTools.length} Live Results
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <LoaderCard key={i} />)}
                </div>
              ) : error ? (
                <div className="glass-panel py-32 text-center border-red-500/10">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-black text-white mb-3">Database Connection Error</h3>
                  <p className="text-gray-500 text-lg mb-8">{error}</p>
                  <button 
                    onClick={fetchInitialTools}
                    className="px-8 py-3 bg-primary text-darker font-black rounded-xl hover:bg-white transition-all shadow-[0_0_20px_var(--color-primary-glow)] flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Retry Connection
                  </button>
                </div>
              ) : processedTools.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                    <AnimatePresence mode="popLayout">
                      {processedTools.map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          ref={index === processedTools.length - 1 ? lastToolElementRef : null}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index % 6 * 0.1 }}
                        >
                          <ToolCard
                            tool={tool}
                            isSaved={savedToolIds.includes(tool.id)}
                            onToggleSave={toggleSaveTool}
                            onClick={() => setSelectedTool(tool)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {fetchingMore && <InfiniteLoader />}
                  
                  {!hasMore && processedTools.length > 0 && (
                    <div className="mt-20 py-12 text-center border-t border-white/5">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">You've reached the end of known intelligence</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="glass-panel py-32 text-center border-dashed border-white/10">
                  <Newspaper className="h-16 w-16 text-gray-600 mx-auto mb-6 opacity-20" />
                  <h3 className="text-2xl font-black text-white mb-3">No matching intelligence found</h3>
                  <p className="text-gray-500 text-lg">Try adjusting your filters or search parameters</p>
                </div>
              )}
            </section>
          </div>
        </div>

      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="absolute inset-0 bg-darker/95 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl glass-panel bg-card border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-8 border-b border-white/5 flex justify-between items-start bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_var(--color-primary-glow)] shrink-0">
                    <Info className="h-7 w-7 sm:h-10 sm:w-10 text-darker" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter leading-none">
                        {selectedTool.name}
                      </h3>
                      {selectedTool.trending_score > 80 && (
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/20 border border-primary/30 text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-widest">🔥 Trending</span>
                      )}
                    </div>
                    <p className="text-primary font-bold text-sm sm:text-base uppercase tracking-[0.2em]">
                      {selectedTool.tagline}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                >
                  <X className="h-8 w-8" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Discovery Insight</h4>
                    <p className="text-gray-300 leading-relaxed text-xl font-medium whitespace-pre-wrap">
                      {selectedTool.description}
                    </p>
                  </div>

                  <div className="space-y-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Metadata</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Launch Date</span>
                          <span className="text-xs font-bold text-white">{new Date(selectedTool.date || selectedTool.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Trending Score</span>
                          <span className="text-xs font-bold text-primary">{selectedTool.trending_score || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Ecosystem Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedTool.topics) ? selectedTool.topics : selectedTool.topics?.split(',') || []).map((t, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <a
                        href={selectedTool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-darker font-black rounded-2xl hover:bg-white transition-all shadow-[0_0_40px_var(--color-primary-glow)] hover:scale-[1.02] active:scale-95"
                      >
                        Launch Platform
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}