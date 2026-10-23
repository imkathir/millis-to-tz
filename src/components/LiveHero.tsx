import React, { useState } from 'react';
import { Copy, Check, Pause, Play, RotateCcw, FastForward, Rewind } from 'lucide-react';
import { clockService } from '../services/clockService';

interface LiveHeroProps {
  currentMillis: number;
  isPaused: boolean;
}

export const LiveHero: React.FC<LiveHeroProps> = ({ currentMillis, isPaused }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [precisionMode, setPrecisionMode] = useState<'millis' | 'seconds' | 'micros' | 'nanos'>('millis');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const seconds = Math.floor(currentMillis / 1000);
  const micros = (BigInt(Math.floor(currentMillis)) * 1000n).toString();
  const nanos = (BigInt(Math.floor(currentMillis)) * 1000000n).toString();
  const dateObj = new Date(currentMillis);
  const utcIso = dateObj.toISOString();

  let mainDisplayNumber = currentMillis.toString();
  let mainUnitLabel = 'milliseconds';
  if (precisionMode === 'seconds') {
    mainDisplayNumber = seconds.toString();
    mainUnitLabel = 'seconds';
  } else if (precisionMode === 'micros') {
    mainDisplayNumber = micros;
    mainUnitLabel = 'microseconds';
  } else if (precisionMode === 'nanos') {
    mainDisplayNumber = nanos;
    mainUnitLabel = 'nanoseconds';
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#0f1422] border border-slate-800/80 p-5 sm:p-8 shadow-xl">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top row: Status & Precision mode buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused
                  ? 'bg-amber-400 ring-4 ring-amber-500/20'
                  : 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse'
              }`}
            />
            <span className="text-xs font-mono font-medium tracking-wide uppercase text-slate-300">
              {isPaused ? 'TIME FROZEN (INSPECTING)' : 'LIVE UNIX EPOCH TICKER'}
            </span>
          </div>
          
          <button
            onClick={() => clockService.togglePause()}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-md border transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Resume Live
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" /> Freeze Time
              </>
            )}
          </button>
        </div>

        {/* Precision segment switch */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-slate-800">
          {(['millis', 'seconds', 'micros', 'nanos'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setPrecisionMode(unit)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                precisionMode === unit
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {unit === 'millis' ? 'ms (13)' : unit === 'seconds' ? 'sec (10)' : unit === 'micros' ? 'μs (16)' : 'ns (19)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Epoch Number Display */}
      <div className="my-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-5xl md:text-6xl font-mono font-bold tracking-tight text-emerald-400 tabular-nums break-all selection:bg-emerald-500/30">
            {mainDisplayNumber}
          </span>
          <span className="text-sm font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
            {mainUnitLabel}
          </span>
        </div>
        <p className="mt-2 text-xs font-mono text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>UTC: {utcIso}</span>
          <span className="text-slate-600">·</span>
          <span>Local: {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}</span>
        </p>
      </div>

      {/* Action Row: Copy actions + Time shifts */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        
        {/* Quick copy buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => copyToClipboard(currentMillis.toString(), 'millis')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            {copiedKey === 'millis' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy Millis</span>
          </button>

          <button
            onClick={() => copyToClipboard(seconds.toString(), 'seconds')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            {copiedKey === 'seconds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy Seconds</span>
          </button>

          <button
            onClick={() => copyToClipboard(utcIso, 'utcIso')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            {copiedKey === 'utcIso' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy ISO-8601</span>
          </button>
        </div>

        {/* Time Shift Stepper Buttons */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-slate-500 mr-1 hidden lg:inline">Shift:</span>
          <button
            onClick={() => clockService.shiftTime(-604800000)}
            title="Minus 1 Week"
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 hover:border-slate-700"
          >
            -1w
          </button>
          <button
            onClick={() => clockService.shiftTime(-86400000)}
            title="Minus 1 Day"
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 hover:border-slate-700"
          >
            -1d
          </button>
          <button
            onClick={() => clockService.shiftTime(-3600000)}
            title="Minus 1 Hour"
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 hover:border-slate-700"
          >
            -1h
          </button>
          
          <button
            onClick={() => clockService.resetToNow()}
            title="Reset to current real-time moment"
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Now</span>
          </button>

          <button
            onClick={() => clockService.shiftTime(3600000)}
            title="Plus 1 Hour"
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 hover:border-slate-700"
          >
            +1h
          </button>
          <button
            onClick={() => clockService.shiftTime(86400000)}
            title="Plus 1 Day"
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 hover:border-slate-700"
          >
            +1d
          </button>
          <button
            onClick={() => clockService.shiftTime(604800000)}
            title="Plus 1 Week"
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 hover:border-slate-700"
          >
            +1w
          </button>
        </div>

      </div>
    </section>
  );
};
