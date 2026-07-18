import type { CategorySummary } from '../services/analytics'
import { useCurrencyStore } from '../store/currency'
import { formatCurrency } from '../lib/format'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

interface CategoryMiniBarsProps {
  data: CategorySummary[]
}

export default function CategoryMiniBars({ data }: CategoryMiniBarsProps) {
  const currency = useCurrencyStore((s) => s.currency)
  if (data.length === 0) return null

  const maxRev = Math.max(...data.map((c) => c.total_revenue))
  const totalRev = data.reduce((s, c) => s + c.total_revenue, 0)

  return (
    <div className="rounded-2xl border border-[#23254a] bg-[#12132e] p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">Category Revenue Share</h3>
      <div className="space-y-2.5">
        {data.map((c, i) => {
          const pct = totalRev > 0 ? (c.total_revenue / totalRev) * 100 : 0
          const barW = maxRev > 0 ? (c.total_revenue / maxRev) * 100 : 0
          return (
            <div key={c.category}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#c4c6db]">{c.category}</span>
                <span className="text-[#888bb0]">
                  {formatCurrency(c.total_revenue, currency)}
                  <span className="ml-1 text-[#5a5d8a]">({pct.toFixed(0)}% · {c.order_count} orders)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1b3a]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barW}%`, backgroundColor: COLORS[i % COLORS.length] }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
