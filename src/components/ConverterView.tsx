import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowRightLeft, Calendar, HelpCircle } from 'lucide-react';
import { converterService, TimestampUnit } from '../services/converterService';

interface ConverterViewProps {
  currentMillis: number;
}

export const ConverterView: React.FC<ConverterViewProps> = ({ currentMillis }) => {
  const [activeMode, setActiveMode] = useState<'epochToHuman' | 'humanToEpoch'>('epochToHuman');
  
  // Epoch -> Human state
  const [epochInput, setEpochInput] = useState<string>(currentMillis.toString());
  const [selectedUnit, setSelectedUnit] = useState<TimestampUnit | 'auto'>('auto');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Human -> Epoch state
  const [inputDate, setInputDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [inputTime, setInputTime] = useState<string>(() => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  });
  const [inputTimezone, setInputTimezone] = useState<string>('UTC');

  // Sync initial epochInput once if user hasn't edited
  useEffect(() => {
    // Only if blank
    if (!epochInput) {
      setEpochInput(currentMillis.toString());
    }
  }, [currentMillis, epochInput]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Compute conversion for Epoch -> Human
  const { millis: parsedMillis, detectedUnit, isValid } = converterService.parseInputToMillis(
    epochInput,
    selectedUnit === 'auto' ? undefined : selectedUnit
  );
  const conversionOutput = converterService.convertMillis(parsedMillis, detectedUnit);

  // Compute conversion for Human -> Epoch
  const handleHumanToEpoch = () => {
    try {
      const combined = `${inputDate}T${inputTime}`;
      let calculatedMillis = NaN;

      if (inputTimezone === 'UTC') {
        calculatedMillis = Date.parse(`${combined}Z`);
      } else {
        // Approximate or browser local
        calculatedMillis = new Date(combined).getTime();
      }

      if (!isNaN(calculatedMillis)) {
        setEpochInput(calculatedMillis.toString());
        setActiveMode('epochToHuman');
      }
    } catch {
      // Invalid date
    }
  };

  const setPreset = (presetMillis: number) => {
    setEpochInput(presetMillis.toString());
    setActiveMode('epochToHuman');
  };

  return (
    <div className="space-y-6">
      
      {/* Mode Selector and Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f1422] p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMode('epochToHuman')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activeMode === 'epochToHuman'
                ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Timestamp → Human Date</span>
          </button>
          
          <button
            onClick={() => setActiveMode('humanToEpoch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activeMode === 'humanToEpoch'
                ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Human Date → Timestamp</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline text-slate-500">Presets:</span>
          <button
            onClick={() => setPreset(currentMillis)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors"
          >
            Now
          </button>
          <button
            onClick={() => setPreset(2147483647000)}
            title="Year 2038 32-bit signed overflow limit"
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors"
          >
            Y2038
          </button>
          <button
            onClick={() => setPreset(0)}
            title="Unix Epoch Genesis: Jan 1 1970 00:00:00 UTC"
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors"
          >
            Epoch (0)
          </button>
          <button
            onClick={() => {
              const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
              setPreset(startOfYear);
            }}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors"
          >
            Jan 1
          </button>
        </div>
      </div>

      {/* Main Conversion Form Area */}
      {activeMode === 'epochToHuman' ? (
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label htmlFor="epochInput" className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Enter Timestamp (or ISO String / natural word e.g. "now", "yesterday"):
              </label>
              
              {/* Unit detection status / manual override */}
              <div className="flex items-center gap-1 text-xs font-mono">
                <span className="text-slate-500 hidden md:inline">Precision:</span>
                {(['auto', 'milliseconds', 'seconds', 'microseconds', 'nanoseconds'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSelectedUnit(unit)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      selectedUnit === unit
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {unit === 'auto' ? `Auto (${detectedUnit.slice(0, 3)})` : unit.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                id="epochInput"
                type="text"
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                placeholder="e.g. 1774320000000 or 1774320000 or 2026-10-23T00:00:00Z"
                className="w-full bg-[#080c14] border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-4 py-3 text-base sm:text-lg font-mono text-emerald-400 placeholder:text-slate-600 outline-none tabular-nums"
              />
              <button
                onClick={() => setEpochInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 hover:text-slate-300 px-2 py-1 rounded bg-slate-800/60"
              >
                Clear
              </button>
            </div>

            {!isValid && (
              <p className="mt-2 text-xs font-mono text-rose-400">
                Invalid timestamp value. Please enter a valid number or date string.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Human Date to Epoch Input */
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="calendarDate" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Calendar Date:
              </label>
              <input
                id="calendarDate"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full bg-[#080c14] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 outline-none"
              />
            </div>

            <div>
              <label htmlFor="timePicker" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Time (HH:MM:SS):
              </label>
              <input
                id="timePicker"
                type="time"
                step="1"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="w-full bg-[#080c14] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 outline-none"
              />
            </div>

            <div>
              <label htmlFor="targetTimezone" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Target Timezone:
              </label>
              <select
                id="targetTimezone"
                value={inputTimezone}
                onChange={(e) => setInputTimezone(e.target.value)}
                className="w-full bg-[#080c14] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 outline-none"
              >
                <option value="UTC">UTC (Universal Coordinated)</option>
                <option value="Local">Local Device Timezone</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleHumanToEpoch}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold rounded-lg shadow-sm transition-all"
            >
              Convert to Unix Milliseconds →
            </button>
          </div>
        </div>
      )}

      {/* Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* UTC Card */}
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                Universal Time (UTC / GMT)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">ISO 8601 & RFC 2822</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* UTC ISO */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>ISO 8601:</span>
                <button
                  onClick={() => copyToClipboard(conversionOutput.utcIso, 'utcIso')}
                  className="flex items-center gap-1 text-[11px] hover:text-emerald-300 transition-colors"
                >
                  {copiedField === 'utcIso' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-sm text-slate-100 bg-[#080c14] p-2.5 rounded border border-slate-800/80 select-all tabular-nums">
                {conversionOutput.utcIso || '—'}
              </div>
            </div>

            {/* UTC RFC 2822 */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>RFC 2822 String:</span>
                <button
                  onClick={() => copyToClipboard(conversionOutput.utcRfc, 'utcRfc')}
                  className="flex items-center gap-1 text-[11px] hover:text-emerald-300 transition-colors"
                >
                  {copiedField === 'utcRfc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-sm text-slate-100 bg-[#080c14] p-2.5 rounded border border-slate-800/80 select-all">
                {conversionOutput.utcRfc || '—'}
              </div>
            </div>

            {/* Micro & Nanos */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
              <div className="bg-[#080c14] p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] uppercase">Seconds (s)</span>
                <span className="text-slate-200 tabular-nums">{conversionOutput.seconds}</span>
              </div>
              <div className="bg-[#080c14] p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] uppercase">Microseconds (μs)</span>
                <span className="text-slate-200 tabular-nums truncate block" title={conversionOutput.microseconds}>
                  {conversionOutput.microseconds}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Local Time Card */}
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Local Device Time ({conversionOutput.localTimezoneName})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{conversionOutput.metrics.relativeTime}</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Local ISO */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Local ISO with Offset:</span>
                <button
                  onClick={() => copyToClipboard(conversionOutput.localIso, 'localIso')}
                  className="flex items-center gap-1 text-[11px] hover:text-emerald-300 transition-colors"
                >
                  {copiedField === 'localIso' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-sm text-slate-100 bg-[#080c14] p-2.5 rounded border border-slate-800/80 select-all tabular-nums">
                {conversionOutput.localIso || '—'}
              </div>
            </div>

            {/* Local Formatted */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Local Calendar Time:</span>
                <button
                  onClick={() => copyToClipboard(conversionOutput.localRfc, 'localRfc')}
                  className="flex items-center gap-1 text-[11px] hover:text-emerald-300 transition-colors"
                >
                  {copiedField === 'localRfc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-sm text-slate-100 bg-[#080c14] p-2.5 rounded border border-slate-800/80 select-all">
                {conversionOutput.localDate} · {conversionOutput.localTime}
              </div>
            </div>

            {/* Relative & Nanoseconds */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
              <div className="bg-[#080c14] p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] uppercase">Relative Position</span>
                <span className="text-emerald-400 font-semibold">{conversionOutput.metrics.relativeTime}</span>
              </div>
              <div className="bg-[#080c14] p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] uppercase">Nanoseconds (ns)</span>
                <span className="text-slate-200 tabular-nums truncate block" title={conversionOutput.nanoseconds}>
                  {conversionOutput.nanoseconds}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Calendar & Epoch Metrics Inspector (Domain-Native Telemetry) */}
      <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Calendar & Astronomical Metrics
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Year breakdown & representation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase mb-1">Day of Year</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              {conversionOutput.metrics.dayOfYear}
            </span>
            <span className="text-[10px] text-slate-500 block">of {conversionOutput.metrics.totalDaysInYear}</span>
          </div>

          <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase mb-1">ISO Week #</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              Week {conversionOutput.metrics.isoWeek}
            </span>
            <span className="text-[10px] text-slate-500 block">ISO-8601</span>
          </div>

          <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase mb-1">Quarter</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              Q{conversionOutput.metrics.quarter}
            </span>
            <span className="text-[10px] text-slate-500 block">Fiscal / Cal</span>
          </div>

          <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase mb-1">Leap Year?</span>
            <span className={`text-base font-bold tabular-nums ${conversionOutput.metrics.isLeapYear ? 'text-emerald-400' : 'text-slate-300'}`}>
              {conversionOutput.metrics.isLeapYear ? 'Yes (366d)' : 'No (365d)'}
            </span>
            <span className="text-[10px] text-slate-500 block">Feb 29 test</span>
          </div>

          <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase mb-1">Julian Day</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              {conversionOutput.metrics.julianDay}
            </span>
            <span className="text-[10px] text-slate-500 block">JD count</span>
          </div>

          <div className="bg-[#080c14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase mb-1">Epoch in Hex</span>
            <span className="text-sm font-bold text-cyan-400 tabular-nums truncate block" title={conversionOutput.metrics.hexValue}>
              {conversionOutput.metrics.hexValue}
            </span>
            <span className="text-[10px] text-slate-500 block">Base-16 hex</span>
          </div>
        </div>
      </div>

    </div>
  );
};
