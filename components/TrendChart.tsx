
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceDot, Label 
} from 'recharts';
import { TREND_MOCK } from '../constants';

const CustomTooltip = ({ active, payload, label, currentMetric }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isFunding = currentMetric === 'funding';
    const fundingEvent = data.fundingEvents?.[0];

    return (
      <div className="glass p-4 rounded-xl border border-cyan-500/30 shadow-2xl z-[1000] min-w-[200px] bg-white/90 dark:bg-slate-900/90">
        <p className="text-cyan-600 dark:text-cyan-400 font-bold mb-2 uppercase text-[10px] tracking-widest">{label} Report</p>
        <div className="flex justify-between items-end gap-8 mb-2">
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase">{currentMetric}:</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mono">
            {isFunding ? `$${data.funding}M` : data[currentMetric].toLocaleString()}
          </span>
        </div>
        
        {isFunding && fundingEvent && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg">
                {fundingEvent.logo}
              </div>
              <div>
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase">Critical Node</div>
                <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">{fundingEvent.company}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded">
                <div className="text-[8px] text-slate-500 font-bold uppercase">Amount</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{fundingEvent.amount}</div>
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded">
                <div className="text-[8px] text-slate-500 font-bold uppercase">Lead</div>
                <div className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">{fundingEvent.investor}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface TrendChartProps {
  metric?: string;
  onMetricChange?: (metric: string) => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({ metric: controlledMetric, onMetricChange }) => {
  const [internalMetric, setInternalMetric] = useState<string>('compositeIndex');

  const metric = controlledMetric !== undefined ? controlledMetric : internalMetric;
  const setMetric = onMetricChange || setInternalMetric;

  const metricConfig: Record<string, { color: string; name: string }> = {
    compositeIndex: { color: '#06b6d4', name: 'Composite Index' },
    papers: { color: '#8b5cf6', name: 'Paper Volume' },
    citations: { color: '#10b981', name: 'Citations' },
    social: { color: '#ec4899', name: 'Social Buzz' },
    news: { color: '#f97316', name: 'News Reports' },
    funding: { color: '#eab308', name: 'Funding ($M)' },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(metricConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
              metric === key 
                ? 'bg-opacity-20 border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
            style={metric === key ? { backgroundColor: `${config.color}20`, borderColor: config.color, color: config.color } : {}}
          >
            {config.name}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-[300px] overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TREND_MOCK}>
            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip currentMetric={metric} />} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={metricConfig[metric].color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
