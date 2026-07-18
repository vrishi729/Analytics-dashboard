import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import type { CategorySummary } from '../services/analytics'
import { useCurrencyStore } from '../store/currency'
import { formatCurrency, shortCurrency } from '../lib/format'

interface CategoryChartProps {
  data: CategorySummary[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

export default function CategoryChart({ data }: CategoryChartProps) {
  const currency = useCurrencyStore((s) => s.currency)
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
        <h3 className="text-lg font-semibold text-white">Category Performance</h3>
        <p className="mt-2 text-sm text-[#5a5d8a]">No data available</p>
      </div>
    )
  }

  return (
    <div className="group gradient-border card-hover animate-slide-up rounded-2xl bg-[#12132e] p-6">
      <h3 className="mb-1 text-lg font-semibold text-white">Category Performance</h3>
      <p className="mb-6 text-sm text-[#888bb0]">Revenue by product category</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#23254a" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: '#888bb0' }}
            axisLine={{ stroke: '#23254a' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#888bb0' }}
            axisLine={{ stroke: '#23254a' }}
            tickLine={false}
            tickFormatter={(v: number) => shortCurrency(v, currency)}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value, currency), 'Revenue']}
            contentStyle={{
              background: '#1a1b3a',
              border: '1px solid #23254a',
              borderRadius: '12px',
              color: '#fff',
            }}
          />
          <Bar dataKey="total_revenue" radius={[6, 6, 0, 0]} name="Revenue">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}