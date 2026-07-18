import { useState } from 'react'
import type { ProductSummary } from '../services/analytics'
import { TrendingUp, TrendingDown, Minus, Search, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '../lib/format'
import { useCurrencyStore } from '../store/currency'

type SortKey = 'revenue' | 'quantity' | 'orders' | 'growth'

interface ProductsTableProps {
  title: string
  products: ProductSummary[]
}

export default function ProductsTable({
  title,
  products,
}: ProductsTableProps) {
  const currency = useCurrencyStore((s) => s.currency)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortAsc, setSortAsc] = useState(false)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((p) => !p)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const filtered = query
    ? products.filter((p) => p.product_name.toLowerCase().includes(query.toLowerCase()))
    : products

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortAsc ? 1 : -1
    switch (sortKey) {
      case 'revenue': return (a.total_revenue - b.total_revenue) * dir
      case 'quantity': return (a.total_quantity - b.total_quantity) * dir
      case 'orders': return (a.order_count - b.order_count) * dir
      case 'growth': return ((a.growth ?? 0) - (b.growth ?? 0)) * dir
    }
  })

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={11} className="ml-0.5 inline opacity-30" />
    return <span className="ml-0.5 text-indigo-400">{sortAsc ? '↑' : '↓'}</span>
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-[#5a5d8a]">No data available</p>
      </div>
    )
  }

  return (
    <div className="group gradient-border card-hover animate-slide-up rounded-2xl bg-[#12132e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-[#888bb0]">
            Sorted by {sortKey}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <TrendingUp size={18} />
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d8a]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-[#23254a] bg-[#1a1b3a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#5a5d8a] outline-none transition-all focus:border-indigo-500/50"
        />
      </div>

      <div className="mb-2 hidden grid-cols-[28px_1fr_70px_80px_80px_60px] gap-3 px-1 text-xs font-medium text-[#5a5d8a] sm:grid">
        <div />
        <div>Product</div>
        <div
          className="relative text-right cursor-pointer select-none hover:text-[#c4c6db] transition-colors"
          onClick={() => toggleSort('growth')}
          title="Sort by growth"
        >
          Trend{sortArrow('growth')}
        </div>
        <div
          className="text-right cursor-pointer select-none hover:text-[#c4c6db] transition-colors"
          onClick={() => toggleSort('revenue')}
          title="Sort by revenue"
        >
          Revenue{sortArrow('revenue')}
        </div>
        <div
          className="text-right cursor-pointer select-none hover:text-[#c4c6db] transition-colors"
          onClick={() => toggleSort('quantity')}
          title="Sort by units sold"
        >
          Units{sortArrow('quantity')}
        </div>
        <div
          className="text-right cursor-pointer select-none hover:text-[#c4c6db] transition-colors"
          onClick={() => toggleSort('orders')}
          title="Sort by order count"
        >
          Orders{sortArrow('orders')}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((p) => {
          const g = p.growth ?? 0
          const baseRank = products.findIndex((x) => x.product_name === p.product_name) + 1
          return (
            <div
              key={p.product_name}
              className="group/item rounded-xl bg-[#1a1b3a] px-4 py-3 transition-all hover:bg-[#23254a]"
            >
              <div className="grid grid-cols-[28px_1fr_70px_80px_80px_60px] items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-400">
                  {baseRank}
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{p.product_name}</p>
                  <p className="text-xs text-[#5a5d8a]">
                    {p.order_count} order{p.order_count !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right">
                  {g > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-green-400" title="Year-over-year revenue change">
                      <TrendingUp size={14} />
                      {g.toFixed(0)}%
                    </span>
                  ) : g < 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-red-400" title="Year-over-year revenue change">
                      <TrendingDown size={14} />
                      {Math.abs(g).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-sm text-[#5a5d8a]" title="No change from previous month">
                      <Minus size={14} />
                      —
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(p.total_revenue, currency)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-[#c4c6db]">{p.total_quantity}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#5a5d8a]">{p.order_count}</p>
                </div>
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5a5d8a]">No products match "{query}"</p>
        )}
      </div>
    </div>
  )
}