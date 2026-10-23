import React, { useState } from 'react';
import { X, Timer, Copy, Check, Calendar, Play, RotateCcw } from 'lucide-react';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMillis: number;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({
  isOpen,
  onClose,
  currentMillis,
}) => {
  const [targetMillis, setTargetMillis] = useState<number>(() => currentMillis + 86400000); // 24h default
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const diffMs = targetMillis - currentMillis;
  const isPast = diffMs <= 0;
  const absDiff = Math.abs(diffMs);

  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);
  const minutes = Math.floor((absDiff % 3600000) / 60000);
  const seconds = Math.floor((absDiff % 60000) / 1000);
  const millis = absDiff % 1000;

  const targetDate = new Date(targetMillis);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const setOffsetFromNow = (offsetMs: number) => {
    setTargetMillis(currentMillis + offsetMs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl flex flex-col bg-[#0f1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080c14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans text-white">
                Future Timestamp Scheduler & Countdown
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Precision millisecond-level countdown timer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs font-mono">
          
          {/* Quick offsets */}
          <div>
            <span className="text-slate-400 block mb-2">Quick Target Schedules:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setOffsetFromNow(3600000)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              >
                +1 Hour
              </button>
              <button
                onClick={() => setOffsetFromNow(86400000)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              >
                +24 Hours
              </button>
              <button
                onClick={() => setOffsetFromNow(604800000)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              >
                +7 Days
              </button>
              <button
                onClick={() => setOffsetFromNow(2592000000)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              >
                +30 Days
              </button>
            </div>
          </div>

          {/* Target Input */}
          <div>
            <label htmlFor="targetMillisInput" className="block text-slate-400 mb-1.5">
              Target Epoch Milliseconds:
            </label>
            <input
              id="targetMillisInput"
              type="number"
              value={targetMillis}
              onChange={(e) => setTargetMillis(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#080c14] border border-slate-700 focus:border-emerald-500 rounded-lg p-2.5 text-base font-mono text-emerald-400 tabular-nums outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              UTC: {targetDate.toUTCString()} · Local: {targetDate.toLocaleString()}
            </p>
          </div>

          {/* Countdown Clock Face */}
          <div className="bg-[#080c14] p-5 rounded-xl border border-slate-800 text-center space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
              {isPast ? 'Target Timestamp Passed' : 'Time Remaining Until Target'}
            </span>

            <div className="grid grid-cols-5 gap-2 font-mono">
              <div className="bg-[#0f1422] p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl sm:text-3xl font-bold text-slate-100 tabular-nums block">
                  {days}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Days</span>
              </div>
              <div className="bg-[#0f1422] p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl sm:text-3xl font-bold text-slate-100 tabular-nums block">
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Hours</span>
              </div>
              <div className="bg-[#0f1422] p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl sm:text-3xl font-bold text-slate-100 tabular-nums block">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Mins</span>
              </div>
              <div className="bg-[#0f1422] p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums block">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Secs</span>
              </div>
              <div className="bg-[#0f1422] p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl sm:text-3xl font-bold text-cyan-400 tabular-nums block">
                  {String(millis).padStart(3, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Millis</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => handleCopy(`${days}d ${hours}h ${minutes}m ${seconds}s (Epoch: ${targetMillis})`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Countdown Target</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#080c14] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
