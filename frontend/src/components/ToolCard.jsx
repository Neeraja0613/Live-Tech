import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Tag, ArrowUpRight, Bookmark, BookmarkCheck } from 'lucide-react';
import React from 'react';

const ToolCard = React.memo(({ tool, isSaved, onToggleSave, onClick }) => {
  const topics = Array.isArray(tool.topics) 
    ? tool.topics 
    : typeof tool.topics === 'string' 
      ? tool.topics.split(',').map(t => t.trim())
      : [];

  const displayDate = tool.date || tool.created_at;
  const formattedDate = new Date(displayDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="glass-panel p-5 sm:p-6 flex flex-col h-[480px] group border border-white/5 hover:border-primary/30 transition-all duration-500 relative cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors duration-300 truncate">
                {tool.name}
              </h3>
              {tool.trending_score > 80 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-tighter flex items-center gap-1 shadow-[0_0_15px_var(--color-primary-glow)] shrink-0"
                >
                  <span className="animate-pulse">🔥</span> Trending
                </motion.span>
              )}
            </div>
            <p className="text-[11px] font-bold text-primary/70 uppercase tracking-[0.15em] truncate">
              {tool.tagline}
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onToggleSave(tool.id)}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                isSaved 
                ? 'bg-primary border-primary text-darker shadow-[0_0_15px_var(--color-primary-glow)]' 
                : 'bg-white/5 border-white/10 text-gray-500 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {isSaved ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
            </button>
            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all text-gray-500 group-hover:text-primary">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="min-h-[4.5rem] mb-6">
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
            {tool.description}
          </p>
        </div>

        {/* Topics Section */}
        <div className="min-h-[4.5rem] flex flex-col justify-start">
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 4).map((topic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] bg-white/5 text-primary/80 border border-white/10 hover:border-primary/30 transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Discovery Date</span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <Calendar className="h-3.5 w-3.5 text-primary/50" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-darker text-sm font-black hover:bg-white transition-all duration-300 hover:shadow-[0_0_20px_var(--color-primary-glow)] active:scale-95"
            >
              Visit
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ToolCard;
