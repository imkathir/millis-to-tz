import React, { useState } from 'react';
import { Copy, Check, Code2, Terminal } from 'lucide-react';
import { CODE_SNIPPETS } from '../services/snippetService';

export const SnippetView: React.FC = () => {
  const [selectedLangId, setSelectedLangId] = useState<string>('javascript');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeSnippet = CODE_SNIPPETS.find((s) => s.id === selectedLangId) || CODE_SNIPPETS[0];

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Language Bar */}
      <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Developer Code Snippet Library (12+ Languages)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Production-ready copy-paste examples
          </span>
        </div>

        {/* Language Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CODE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => setSelectedLangId(snippet.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedLangId === snippet.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] text-slate-500">[{snippet.badge}]</span>
              <span>{snippet.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Blocks */}
      <div className="space-y-4">
        
        {/* Block 1: Get Current Milliseconds */}
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-[#080c14] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Get Current Milliseconds & Seconds</span>
            </div>
            <button
              onClick={() => handleCopy(activeSnippet.nowSnippet, 'now')}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-emerald-300 transition-colors"
            >
              {copiedKey === 'now' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'now' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 bg-[#080c14]/60 overflow-x-auto leading-relaxed">
            <code>{activeSnippet.nowSnippet}</code>
          </pre>
        </div>

        {/* Block 2: Millis to Human & Timezone */}
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-[#080c14] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Convert Milliseconds to Human Date & Timezone</span>
            </div>
            <button
              onClick={() => handleCopy(activeSnippet.toHumanSnippet, 'toHuman')}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-emerald-300 transition-colors"
            >
              {copiedKey === 'toHuman' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'toHuman' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 bg-[#080c14]/60 overflow-x-auto leading-relaxed">
            <code>{activeSnippet.toHumanSnippet}</code>
          </pre>
        </div>

        {/* Block 3: Human Date to Millis */}
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-[#080c14] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Parse Date String into Unix Milliseconds</span>
            </div>
            <button
              onClick={() => handleCopy(activeSnippet.toDateToMillisSnippet, 'toDate')}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-emerald-300 transition-colors"
            >
              {copiedKey === 'toDate' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'toDate' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 bg-[#080c14]/60 overflow-x-auto leading-relaxed">
            <code>{activeSnippet.toDateToMillisSnippet}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
