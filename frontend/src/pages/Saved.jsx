import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Filter, Newspaper, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import ToolCard from '../components/ToolCard';

export default function Saved({ savedToolIds, toggleSaveTool }) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedTools();
  }, [savedToolIds]);

  const fetchSavedTools = async () => {
    if (savedToolIds.length === 0) {
      setTools([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .in('id', savedToolIds);

      if (error) throw error;
      setTools(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <Link 
          to="/feed" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
            <BookmarkCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Your Saved <span className="text-gradient">Innovations</span></h2>
            <p className="text-gray-400 mt-1">Access your curated list of AI tools and updates.</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {[1, 2, 3, 4].map(i => (
            <LoaderCard key={i} />
          ))}
        </div>
      ) : tools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {tools.map(tool => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                isSaved={true}
                onToggleSave={toggleSaveTool}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel py-32 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <BookmarkCheck className="h-10 w-10 text-gray-700" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No tools saved yet</h3>
          <p className="text-gray-400 mb-8">Save your favorite AI tools from the feed to see them here.</p>
          <Link 
            to="/feed" 
            className="px-8 py-3 bg-primary text-darker font-black rounded-xl hover:bg-white transition-all shadow-[0_0_20px_var(--color-primary-glow)]"
          >
            Explore Feed
          </Link>
        </motion.div>
      )}
    </main>
  );
}
