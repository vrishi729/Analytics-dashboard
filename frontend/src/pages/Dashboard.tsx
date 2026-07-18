import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Activity, FileUp } from 'lucide-react'
import CategoryChart from '../components/CategoryChart'
import CategoryMiniBars from '../components/CategoryMiniBars'
import KpiCard from '../components/KpiCard'
import ProductsTable from '../components/ProductsTable'
import SalesTrendsChart from '../components/SalesTrendsChart'
import { api } from '../lib/api'
import { formatCurrency, shortCurrency } from '../lib/format'
import { useCurrencyStore } from '../store/currency'
import { useDatasetStore } from '../store/dataset'
import { getAnalytics } from '../services/analytics'

const PERIODS = [
  { value: '1m', label: '1 Month' },
  { value: '6m', label: '6 Months' },
  { value: '12m', label: '12 Months' },
  { value: 'all', label: 'All Time' },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState('6m')
  const [year, setYear] = useState('')
  const navigate = useNavigate()
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId)
  const setActiveDataset = useDatasetStore((s) => s.setActiveDataset)
  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => api.get<Array<{ id: string; original_filename?: string; status: string }>>('/datasets/'),
    select: (list) => activeDatasetId
      ? list.find((d) => d.id === activeDatasetId) || list[0]
      : list.find((d) => d.status === 'cleaned') || list[0],
  })

  const currency = useCurrencyStore((s) => s.currency)

  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics', datasets?.id, period, year],
    queryFn: () => getAnalytics(datasets?.id, period, year || undefined),
    enabled: !!datasets,
  })

  const isLoadingDatasets = !datasets && datasets !== undefined

  if (isLoadingDatasets || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="h-8 w-48 shimmer-bg rounded-lg" />
          <div className="mt-2 h-4 w-72 shimmer-bg rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 shimmer-bg rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[400px] shimmer-bg rounded-2xl" />
          <div className="h-[400px] shimmer-bg rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!datasets || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
          <Activity size={32} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">
          {analyticsError ? 'Unable to load dashboard' : 'No Data Yet'}
        </h2>
        <p className="mt-2 text-sm text-[#888bb0]">
          {analyticsError
            ? analyticsError instanceof Error ? analyticsError.message : 'An unexpected error occurred'
            : 'Upload a dataset to see your analytics dashboard.'}
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-500"
        >
          <FileUp size={16} />
          Upload Data
        </button>
      </div>
    )
  }

  const { kpi, category_performance, sales_trends, sales_growth } = analyticsData

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {activeDatasetId && datasets?.original_filename && (
            <span className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs text-indigo-400">
              {datasets.original_filename}
              <button
                onClick={() => setActiveDataset(null)}
                className="ml-1 text-indigo-400/60 hover:text-indigo-300"
                title="Show latest dataset"
              >
                ✕
              </button>
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[#888bb0]">
          Your sales performance at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpi.total_revenue, currency)}
          trend={sales_growth.growth_rate}
          subtitle={sales_growth.growth_rate !== 0 ? 'vs last year' : undefined}
          icon="revenue"
        />
        <KpiCard
          title="Total Orders"
          value={kpi.total_orders.toLocaleString()}
          icon="orders"
        />
        <KpiCard
          title="Units Sold"
          value={kpi.total_quantity_sold.toLocaleString()}
          icon="quantity"
        />
        <KpiCard
          title="Avg Order Value"
          value={formatCurrency(kpi.average_order_value, currency)}
          icon="target"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesTrendsChart data={sales_trends} />
        <CategoryChart data={category_performance} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Product Performance</h2>
          <div className="flex items-center gap-2">
            {analyticsData.available_years && analyticsData.available_years.length > 0 && (
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-[#23254a] bg-[#0a0b1a] px-2.5 py-1.5 text-xs text-[#c4c6db] focus:border-indigo-500 focus:outline-none"
              >
                <option value="" className="bg-[#0a0b1a]">All Years</option>
                {analyticsData.available_years.map((y) => (
                  <option key={y} value={y} className="bg-[#0a0b1a]">{y}</option>
                ))}
              </select>
            )}
            <div className="flex gap-1 rounded-lg bg-[#1a1b3a] p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    period === p.value
                      ? 'bg-indigo-500 text-white'
                      : 'text-[#888bb0] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ProductsTable title="Top Products" products={analyticsData.products.slice(0, 5)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryMiniBars data={analyticsData.category_performance} />
        </div>
        <div className="rounded-2xl border border-[#23254a] bg-[#12132e] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Dataset Summary</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888bb0]">Products</span>
              <span className="text-[#c4c6db] font-medium">{analyticsData.products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888bb0]">Categories</span>
              <span className="text-[#c4c6db] font-medium">{analyticsData.category_performance.length}</span>
            </div>
            {analyticsData.dataset_summary?.date_range && (
              <div className="flex justify-between">
                <span className="text-[#888bb0]">Date Range</span>
                <span className="text-[#c4c6db] font-medium text-right text-[11px]">{analyticsData.dataset_summary.date_range}</span>
              </div>
            )}
            {analyticsData.dataset_summary?.avg_monthly_revenue ? (
              <div className="flex justify-between">
                <span className="text-[#888bb0]">Avg Monthly Rev</span>
                <span className="text-[#c4c6db] font-medium">{shortCurrency(analyticsData.dataset_summary.avg_monthly_revenue, currency)}</span>
              </div>
            ) : null}
            {analyticsData.dataset_summary?.avg_monthly_growth ? (
              <div className="flex justify-between">
                <span className="text-[#888bb0]">Avg Monthly Growth</span>
                <span className={`font-medium ${analyticsData.dataset_summary.avg_monthly_growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analyticsData.dataset_summary.avg_monthly_growth > 0 ? '+' : ''}{analyticsData.dataset_summary.avg_monthly_growth.toFixed(1)}%
                </span>
              </div>
            ) : null}
            {analyticsData.dataset_summary?.highest_revenue_product && (
              <div className="flex justify-between">
                <span className="text-[#888bb0]">Top Product</span>
                <span className="text-[#c4c6db] font-medium text-right text-[11px] truncate max-w-[120px]">{analyticsData.dataset_summary.highest_revenue_product}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888bb0]">YOY Growth</span>
              <span className={`font-medium ${analyticsData.sales_growth.growth_rate > 0 ? 'text-green-400' : analyticsData.sales_growth.growth_rate < 0 ? 'text-red-400' : 'text-[#c4c6db]'}`}>
                {analyticsData.sales_growth.growth_rate > 0 ? '+' : ''}{analyticsData.sales_growth.growth_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}