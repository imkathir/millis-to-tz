/**
 * Top Bar adhering to the Top Bar Contract:
 * [Brand title, one line] — [4-5 nav links, 1-2 word labels, single-line] — [1 primary action]
 */
import React from 'react';
import { Github, Clock } from 'lucide-react';

export type ActiveTab = 'converter' | 'timezone' | 'batch' | 'cron' | 'snippets';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenGhPagesModal: () => void;
  isPaused: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenGhPagesModal,
  isPaused,
}) => {
  const localTz = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Local';
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img src="./favicon.svg" alt="Millis to TZ Logo" className="w-8 h-8 rounded-lg border border-slate-700/80 shadow-sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans whitespace-nowrap">
                Millis to TZ
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                v2.0
              </span>
            </div>
            <span className="hidden md:inline text-[11px] font-mono text-slate-500">
              {localTz} {isPaused ? '· [PAUSED]' : '· [LIVE]'}
            </span>
          </div>
        </div>

        {/* Zone 2: Clean single-line nav tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs font-medium">
          <button
            onClick={() => onTabChange('converter')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'converter'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Live & Converter
          </button>
          
          <button
            onClick={() => onTabChange('timezone')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'timezone'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Timezone Matrix
          </button>

          <button
            onClick={() => onTabChange('batch')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'batch'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Batch CSV Parser
          </button>

          <button
            onClick={() => onTabChange('cron')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cron'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Cron Studio
          </button>

          <button
            onClick={() => onTabChange('snippets')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'snippets'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Code Snippets
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGhPagesModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
            title="Deploy to your own GitHub Pages"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Host on GitHub Pages</span>
            <span className="sm:hidden">Deploy</span>
          </button>
        </div>

      </div>
    </header>
  );
};
