/**
 * Millis to TZ — Unix Timestamp & Timezone Studio
 * Inspired by CurrentMillis.com with rich developer extensions & GitHub Pages hosting.
 */

import React, { useState, useEffect } from 'react';
import { clockService } from './services/clockService';
import { Header, ActiveTab } from './components/Header';
import { LiveHero } from './components/LiveHero';
import { ConverterView } from './components/ConverterView';
import { TimezoneMatrixView } from './components/TimezoneMatrixView';
import { BatchParserView } from './components/BatchParserView';
import { CronStudioView } from './components/CronStudioView';
import { SnippetView } from './components/SnippetView';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { CountdownModal } from './components/CountdownModal';
import { Timer, Github } from 'lucide-react';

export default function App() {
  const [currentMillis, setCurrentMillis] = useState<number>(clockService.getEffectiveMillis());
  const [isPaused, setIsPaused] = useState<boolean>(clockService.getIsPaused());
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');
  const [isGhModalOpen, setIsGhModalOpen] = useState<boolean>(false);
  const [isCountdownOpen, setIsCountdownOpen] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to Ember-style clock service
    const unsubscribe = clockService.subscribe((millis) => {
      setCurrentMillis(millis);
      setIsPaused(clockService.getIsPaused());
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* 1. Header (Adheres to Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenGhPagesModal={() => setIsGhModalOpen(true)}
        isPaused={isPaused}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Hero Live Epoch Component */}
        <LiveHero
          currentMillis={currentMillis}
          isPaused={isPaused}
        />

        {/* Floating Quick Action Pill Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 py-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Active View:</span>
            <span className="text-emerald-400 capitalize font-medium">
              {activeTab === 'converter' ? 'Converter & Epoch Inspector' : activeTab === 'timezone' ? 'World Timezone Matrix' : activeTab === 'batch' ? 'Batch CSV Parser' : activeTab === 'cron' ? 'Cron Expression Studio' : 'Code Snippets'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCountdownOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Countdown</span>
            </button>

            <button
              onClick={() => setIsGhModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>GH Pages Guide</span>
            </button>
          </div>
        </div>

        {/* View Routing Based on Active Tab */}
        <div>
          {activeTab === 'converter' && <ConverterView currentMillis={currentMillis} />}
          {activeTab === 'timezone' && <TimezoneMatrixView currentMillis={currentMillis} />}
          {activeTab === 'batch' && <BatchParserView />}
          {activeTab === 'cron' && <CronStudioView />}
          {activeTab === 'snippets' && <SnippetView />}
        </div>

      </main>

      {/* 3. Footer (Clean typography, no fake telemetry tickers) */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#080c14] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold">Millis to TZ</span>
            <span>·</span>
            <span>Unix Epoch: 1970-01-01T00:00:00Z</span>
            <span>·</span>
            <span>100% Client-Side Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGhModalOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Deploy to GitHub Pages
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Ember & 14+ Snippets
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GitHubPagesModal
        isOpen={isGhModalOpen}
        onClose={() => setIsGhModalOpen(false)}
      />

      <CountdownModal
        isOpen={isCountdownOpen}
        onClose={() => setIsCountdownOpen(false)}
        currentMillis={currentMillis}
      />

    </div>
  );
}
