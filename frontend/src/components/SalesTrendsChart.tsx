import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts'
import type { TrendPoint } from '../services/analytics'
import { useCurrencyStore } from '../store/currency'
import { formatCurrency, shortCurrency } from '../lib/format'

interface SalesTrendsChartProps {
  data: TrendPoint[]
}

export default function SalesTrendsChart({ data }: SalesTrendsChartProps) {
  const currency = useCurrencyStore((s) => s.currency)
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
        <h3 className="text-lg font-semibold text-white">Sales Trends</h3>
        <p className="mt-2 text-sm text-[#5a5d8a]">No data available</p>
      </div>
    )
  }

  return (
    <div className="group gradient-border card-hover animate-slide-up rounded-2xl bg-[#12132e] p-6">
      <h3 className="mb-1 text-lg font-semibold text-white">Sales Trends</h3>
      <p className="mb-6 text-sm text-[#888bb0]">Revenue over time</p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#23254a" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: '#888bb0' }}
            axisLine={{ stroke: '#23254a' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#888bb0' }}
            axisLine={{ stroke: '#23254a' }}
            tickLine={false}
            tickFormatter={(v: number) => shortCurrency(v, currency)}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'Revenue') return [formatCurrency(value, currency), name]
              return [value, name]
            }}
            contentStyle={{
              background: '#1a1b3a',
              border: '1px solid #23254a',
              borderRadius: '12px',
              color: '#fff',
            }}
          />
          <Area
            type="monotone"
            dataKey="total_revenue"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={{ fill: '#6366f1', r: 4 }}
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}