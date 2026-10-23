import React, { useState, useMemo } from 'react';
import { Plus, X, Search, Sliders, RotateCcw, Copy, Check, Globe } from 'lucide-react';
import { timezoneService, TimezoneEntry } from '../services/timezoneService';

interface TimezoneMatrixViewProps {
  currentMillis: number;
}

export const TimezoneMatrixView: React.FC<TimezoneMatrixViewProps> = ({ currentMillis }) => {
  const [activeTimezones, setActiveTimezones] = useState<TimezoneEntry[]>(() => timezoneService.getActiveTimezones());
  const [scrubberDeltaHours, setScrubberDeltaHours] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTz, setCopiedTz] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  const availableTimezones = useMemo(() => {
    return timezoneService.getAllAvailableTimezones();
  }, []);

  const filteredAvailableTz = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const currentIds = new Set(activeTimezones.map((tz) => tz.id));
    return availableTimezones
      .filter((tz) => tz.toLowerCase().includes(q) && !currentIds.has(tz))
      .slice(0, 8);
  }, [searchQuery, availableTimezones, activeTimezones]);

  const targetMillis = currentMillis + scrubberDeltaHours * 3600000;

  const handleAddTimezone = (ianaId: string) => {
    timezoneService.addTimezone(ianaId);
    setActiveTimezones([...timezoneService.getActiveTimezones()]);
    setSearchQuery('');
    setShowAddMenu(false);
  };

  const handleRemoveTimezone = (ianaId: string) => {
    timezoneService.removeTimezone(ianaId);
    setActiveTimezones([...timezoneService.getActiveTimezones()]);
  };

  const handleResetDefaults = () => {
    timezoneService.resetToDefaults();
    setActiveTimezones([...timezoneService.getActiveTimezones()]);
  };

  const handleCopyTz = (text: string, tzId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTz(tzId);
    setTimeout(() => setCopiedTz(null), 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Time Scrubber & Control Panel */}
      <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Synchronous Time Scrubber Matrix
            </h3>
            {scrubberDeltaHours !== 0 && (
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded">
                Simulating {scrubberDeltaHours > 0 ? `+${scrubberDeltaHours}h` : `${scrubberDeltaHours}h`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {scrubberDeltaHours !== 0 && (
              <button
                onClick={() => setScrubberDeltaHours(0)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>Sync Real-Time</span>
              </button>
            )}

            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Timezone</span>
            </button>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>-24 hours</span>
            <span className="font-semibold text-slate-200">
              {scrubberDeltaHours === 0 ? 'Live Now (±0h)' : `${scrubberDeltaHours > 0 ? '+' : ''}${scrubberDeltaHours} Hours`}
            </span>
            <span>+24 hours</span>
          </div>
          <input
            type="range"
            min="-24"
            max="24"
            step="1"
            value={scrubberDeltaHours}
            onChange={(e) => setScrubberDeltaHours(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-center gap-1.5 pt-1 text-xs font-mono">
            {[-12, -6, -1, 0, 1, 6, 12].map((step) => (
              <button
                key={step}
                onClick={() => setScrubberDeltaHours(step)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  scrubberDeltaHours === step
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                {step === 0 ? 'Now' : `${step > 0 ? '+' : ''}${step}h`}
              </button>
            ))}
          </div>
        </div>

        {/* Add Timezone Search Drawer */}
        {showAddMenu && (
          <div className="pt-3 border-t border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IANA timezone (e.g. Rome, Vancouver, Bangkok, Nairobi)..."
                className="w-full bg-[#080c14] border border-slate-700/80 focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none"
                autoFocus
              />
            </div>

            {filteredAvailableTz.length > 0 && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {filteredAvailableTz.map((tz) => (
                  <button
                    key={tz}
                    onClick={() => handleAddTimezone(tz)}
                    className="flex items-center justify-between p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs font-mono text-slate-300 hover:text-white"
                  >
                    <span className="truncate">{tz}</span>
                    <Plus className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* World Clock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeTimezones.map((tz) => {
          const data = timezoneService.formatForTimezone(targetMillis, tz, currentMillis);
          const isCopied = copiedTz === tz.id;

          return (
            <div
              key={tz.id}
              className={`relative group bg-[#0f1422] rounded-xl border p-4.5 transition-all ${
                tz.id === 'UTC'
                  ? 'border-cyan-500/40 shadow-sm shadow-cyan-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: City, Abbreviation, and Action buttons */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-100 font-sans truncate">
                      {data.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1 py-0.2 rounded shrink-0">
                      {data.abbreviation}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    {tz.id}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopyTz(`${data.label}: ${data.time24} (${data.date}) [${data.offsetString}]`, tz.id)}
                    className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors"
                    title="Copy timezone time"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  
                  {activeTimezones.length > 3 && (
                    <button
                      onClick={() => handleRemoveTimezone(tz.id)}
                      className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                      title="Remove timezone"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Time Display */}
              <div className="my-3">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 tabular-nums tracking-tight">
                  {data.time24}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1">
                  <span>{data.time12}</span>
                  <span className="text-slate-500">{data.dayOfWeek}, {data.date}</span>
                </div>
              </div>

              {/* Metadata row */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">{data.offsetString}</span>
                  {data.isDst && (
                    <span className="text-amber-400/90 text-[10px] bg-amber-950/40 border border-amber-800/30 px-1 rounded">
                      DST
                    </span>
                  )}
                </div>
                <span>{data.relativeDifferenceHours}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer controls for matrix */}
      <div className="flex justify-between items-center text-xs font-mono text-slate-500 px-2">
        <span>Showing {activeTimezones.length} active global zones</span>
        <button
          onClick={handleResetDefaults}
          className="hover:text-slate-300 underline underline-offset-2 transition-colors cursor-pointer"
        >
          Reset to Default 12 Hubs
        </button>
      </div>

    </div>
  );
};
