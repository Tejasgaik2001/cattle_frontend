'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { WeeklyMilkPoint } from '../types';
import { format, parseISO } from 'date-fns';

interface WeeklyMilkTrendCardProps {
  data: WeeklyMilkPoint[];
}

export function WeeklyMilkTrendCard({ data }: WeeklyMilkTrendCardProps) {
  const formatted = data.map((d) => ({
    day: (() => {
      try { return format(parseISO(d.date), 'EEE'); } catch { return d.date; }
    })(),
    liters: d.liters,
  }));

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30">
          <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Weekly Milk Trend</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-36 text-xs text-slate-400 dark:text-slate-500">
          No trend data available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={formatted} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,23,42,0.9)',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                color: '#f1f5f9',
              }}
              formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} L`, 'Milk']}
            />
            <Area
              type="monotone"
              dataKey="liters"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#milkGradient)"
              dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
