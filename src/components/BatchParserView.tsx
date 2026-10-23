import React, { useState } from 'react';
import { Download, Copy, Check, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { batchParserService } from '../services/batchParserService';
import { TimestampUnit } from '../services/converterService';

export const BatchParserView: React.FC = () => {
  const [rawText, setRawText] = useState<string>(() => batchParserService.getSampleBatchData());
  const [forcedUnit, setForcedUnit] = useState<TimestampUnit | 'auto'>('auto');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const parsedResult = batchParserService.parseRawText(
    rawText,
    forcedUnit === 'auto' ? undefined : forcedUnit
  );

  const handleDownloadCsv = () => {
    if (parsedResult.items.length === 0) return;
    batchParserService.exportToCsv(parsedResult.items);
  };

  const handleCopyJson = () => {
    if (parsedResult.items.length === 0) return;
    const json = batchParserService.exportToJson(parsedResult.items);
    navigator.clipboard.writeText(json);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const handleLoadSample = () => {
    setRawText(batchParserService.getSampleBatchData());
  };

  return (
    <div className="space-y-6">
      
      {/* Input Console */}
      <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Batch Timestamp & Log Ingestion Console
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              Load Sample Log Data
            </button>
            <button
              onClick={() => setRawText('')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 rounded border border-slate-800 hover:border-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="rawBatchInput" className="block text-xs font-mono text-slate-400 mb-1.5">
            Paste multiline timestamps, server log strings, or comma-separated epochs:
          </label>
          <textarea
            id="rawBatchInput"
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw timestamps here (one per line, or comma-delimited)..."
            className="w-full bg-[#080c14] border border-slate-700/80 focus:border-emerald-500 rounded-lg p-3 text-xs font-mono text-emerald-300 placeholder:text-slate-600 outline-none tabular-nums"
          />
        </div>

        {/* Toolbar: Precision force + Export Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">Unit interpretation:</span>
            {(['auto', 'milliseconds', 'seconds', 'microseconds', 'nanoseconds'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setForcedUnit(unit)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  forcedUnit === unit
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {unit === 'auto' ? 'Auto-Detect' : unit.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              disabled={parsedResult.items.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>Copy JSON</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={parsedResult.items.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-3 text-xs font-mono">
        <div className="bg-[#0f1422] p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">Total Records</span>
          <span className="text-lg font-bold text-slate-200 tabular-nums">{parsedResult.totalCount}</span>
        </div>
        <div className="bg-[#0f1422] p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">Valid Parsed</span>
          <span className="text-lg font-bold text-emerald-400 tabular-nums">{parsedResult.validCount}</span>
        </div>
        <div className="bg-[#0f1422] p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">Invalid Entries</span>
          <span className={`text-lg font-bold tabular-nums ${parsedResult.invalidCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {parsedResult.invalidCount}
          </span>
        </div>
      </div>

      {/* Structured Results Table */}
      <div className="bg-[#0f1422] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Parsed Batch Dataset
          </h4>
          <span className="text-[11px] font-mono text-slate-500">
            {parsedResult.validCount} of {parsedResult.totalCount} converted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-slate-800">
            <thead className="bg-[#080c14] text-slate-400">
              <tr>
                <th className="py-2.5 px-3 font-medium">Input Token</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Detected</th>
                <th className="py-2.5 px-3 font-medium text-right">Milliseconds</th>
                <th className="py-2.5 px-3 font-medium">UTC ISO-8601</th>
                <th className="py-2.5 px-3 font-medium">Local Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {parsedResult.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No timestamps entered yet. Paste data above or click "Load Sample Log Data".
                  </td>
                </tr>
              ) : (
                parsedResult.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-300 max-w-[160px] truncate" title={item.original}>
                      {item.original}
                    </td>
                    <td className="py-2 px-3">
                      {item.isValid ? (
                        <span className="text-emerald-400 text-[11px]">VALID</span>
                      ) : (
                        <span className="text-rose-400 text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> INVALID
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 capitalize text-[11px]">
                      {item.detectedUnit}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-400 tabular-nums">
                      {item.isValid ? item.millis : '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-300 tabular-nums">
                      {item.utcIso}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {item.localFormatted}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
