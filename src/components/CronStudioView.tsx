import React, { useState } from 'react';
import { CalendarClock, AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';
import { cronService, CRON_PRESETS } from '../services/cronService';

export const CronStudioView: React.FC = () => {
  const [expression, setExpression] = useState<string>('*/15 9-17 * * 1-5');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const analysis = cronService.analyze(expression);

  const copyExecution = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Interactive Cron Builder */}
      <div className="bg-[#0f1422] rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Cron Expression Studio & Next Runs Debugger
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Standard 5-Field Unix Cron Format
          </span>
        </div>

        {/* Input & Field Breakdown */}
        <div>
          <label htmlFor="cronInput" className="block text-xs font-mono text-slate-400 mb-1.5">
            Cron Expression:
          </label>
          <div className="relative">
            <input
              id="cronInput"
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. */15 * * * *"
              className="w-full bg-[#080c14] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-4 py-3 text-base sm:text-lg font-mono text-emerald-300 placeholder:text-slate-600 outline-none tabular-nums"
            />
          </div>

          {/* 5-Field visual breakdown guide */}
          <div className="grid grid-cols-5 gap-2 mt-2 text-center text-xs font-mono">
            <div className="bg-[#080c14] p-1.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Minute</span>
              <span className="text-slate-300">{analysis.fields.minute || '*'}</span>
              <span className="text-[9px] text-slate-600 block">(0 - 59)</span>
            </div>
            <div className="bg-[#080c14] p-1.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Hour</span>
              <span className="text-slate-300">{analysis.fields.hour || '*'}</span>
              <span className="text-[9px] text-slate-600 block">(0 - 23)</span>
            </div>
            <div className="bg-[#080c14] p-1.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Day (Month)</span>
              <span className="text-slate-300">{analysis.fields.dayOfMonth || '*'}</span>
              <span className="text-[9px] text-slate-600 block">(1 - 31)</span>
            </div>
            <div className="bg-[#080c14] p-1.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Month</span>
              <span className="text-slate-300">{analysis.fields.month || '*'}</span>
              <span className="text-[9px] text-slate-600 block">(1 - 12)</span>
            </div>
            <div className="bg-[#080c14] p-1.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Day (Week)</span>
              <span className="text-slate-300">{analysis.fields.dayOfWeek || '*'}</span>
              <span className="text-[9px] text-slate-600 block">(0 - 6, Sun=0)</span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2">
          <span className="text-xs font-mono text-slate-500 block mb-1.5">Common Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.expression}
                onClick={() => setExpression(p.expression)}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                  expression === p.expression
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
                title={p.description}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Human Translation Banner */}
        <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${
          analysis.isValid
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
            : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
        }`}>
          {analysis.isValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-mono">
            <span className="font-semibold block mb-0.5">
              {analysis.isValid ? 'Plain English Translation:' : 'Syntax Error:'}
            </span>
            <span>{analysis.isValid ? analysis.explanation : analysis.errorMessage}</span>
          </div>
        </div>

      </div>

      {/* Next 10 Executions Table */}
      {analysis.isValid && (
        <div className="bg-[#0f1422] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Upcoming 10 Trigger Executions
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              Synchronized with system clock
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-slate-800">
              <thead className="bg-[#080c14] text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-medium">#</th>
                  <th className="py-2.5 px-3 font-medium">UTC Scheduled Time</th>
                  <th className="py-2.5 px-3 font-medium">Local Device Time</th>
                  <th className="py-2.5 px-3 font-medium">Relative Countdown</th>
                  <th className="py-2.5 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {analysis.nextExecutions.map((exec, idx) => (
                  <tr key={exec.millis} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-500 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2 px-3 text-cyan-300 tabular-nums">
                      {exec.utcString}
                    </td>
                    <td className="py-2 px-3 text-slate-200 tabular-nums">
                      {exec.localString}
                    </td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">
                      {exec.relative}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => copyExecution(exec.millis.toString(), idx)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy epoch millis"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400 inline" /> : <Copy className="w-3.5 h-3.5 inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
