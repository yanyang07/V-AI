
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { REGIONAL_TRENDS } from '../constants';

interface ComparisonChartProps {
  metric: 'papers' | 'funding' | 'social';
  region1: string;
  region2: string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ metric, region1, region2 }) => {
  const data1 = REGIONAL_TRENDS[region1] || [];
  const data2 = REGIONAL_TRENDS[region2] || [];

  const data = data1.map((d1, idx) => ({
    time: d1.time,
    [region1]: d1[metric],
    [region2]: data2[idx] ? data2[idx][metric] : 0,
  }));

  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend iconType="circle" />
          <Line type="monotone" dataKey={region1} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey={region2} stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
