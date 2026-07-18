import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Line,
  ComposedChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from 'recharts'
import { api } from '../lib/api'
import {
  BarChart3,
  Loader2,
  AlertCircle,
  TrendingUp,
  Layers,
  Brain,
} from 'lucide-react'


interface ForecastPayload {
  forecast_data: ForecastData
  confidence_score: number
  model_used: string
  cached: boolean
}

interface ForecastData {
  historical: Array<{ date: string; value: number }>
  forecast: Array<{ date: string; value: number; upper?: number; lower?: number }>
  confidence_score: number
  mae: number
  mape: number | null
  model_used: string
}

export default function ForecastPage() {
  const [horizon, setHorizon] = useState('week')
  const [selectedProduct, setSelectedProduct] = useState('')

  const { data: products } = useQuery({
    queryKey: ['forecast-products'],
    queryFn: () => api.get<string[]>('/forecast/products'),
  })

  const forecast = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ product_name: selectedProduct, horizon })
      const res = await api.get<ForecastPayload>(`/forecast/run?${params.toString()}`)
      return res
    },
  })

  const fd = forecast.data?.forecast_data

  const combinedData = fd?.historical?.length || fd?.forecast?.length
    ? [
        ...(fd.historical ?? []).map((d) => ({
          date: d.date,
          actual: d.value,
          forecast: null as number | null,
          forecastUpper: null as number | null,
          forecastLower: null as number | null,
        })),
        ...(fd.forecast ?? []).map((d) => ({
          date: d.date,
          actual: null as number | null,
          forecast: d.value,
          forecastUpper: d.upper ?? null,
          forecastLower: d.lower ?? null,
        })),
      ]
    : []

  const forecastStartDate = fd?.forecast?.[0]?.date ?? null

  const horizonOptions = [
    { value: 'day', label: 'Next 7 Days', icon: Layers },
    { value: 'week', label: 'Next 4 Weeks', icon: TrendingUp },
    { value: 'month', label: 'Next 3 Months', icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Demand Forecast</h1>
        <p className="mt-1 text-sm text-[#888bb0]">
          Predict future demand using Holt-Winters time series model
        </p>
      </div>

      <div className="animate-slide-up rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c4c6db]">
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="block w-full rounded-xl border border-[#23254a] bg-[#0a0b1a] px-4 py-2.5 text-sm text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" className="bg-[#0a0b1a]">Select product</option>
              {products?.map((p) => (
                <option key={p} value={p} className="bg-[#0a0b1a]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c4c6db]">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {horizonOptions.map((opt) => {
                const Icon = opt.icon
                const active = horizon === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setHorizon(opt.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-[#23254a] text-[#888bb0] hover:border-[#3d4070] hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (selectedProduct) forecast.mutate()
          }}
          disabled={!selectedProduct || forecast.isPending}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-500 disabled:opacity-60"
        >
          {forecast.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Brain size={16} />
          )}
          {forecast.isPending ? 'Computing...' : 'Generate Forecast'}
        </button>
      </div>

      {forecast.isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>
            {forecast.error instanceof Error
              ? forecast.error.message
              : 'Forecast failed'}
          </span>
        </div>
      )}

      {forecast.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="animate-fade-in rounded-2xl border border-[#23254a] bg-[#12132e] p-5">
              <p className="text-xs font-medium text-[#888bb0] uppercase tracking-wider">Confidence</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {((fd?.confidence_score ?? 0) * 100).toFixed(1)}%
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#5a5d8a]">
                Model confidence score based on how well the forecast fits historical patterns. Higher is better.
              </p>
            </div>
            <div className="animate-fade-in rounded-2xl border border-[#23254a] bg-[#12132e] p-5" style={{ animationDelay: '0.1s' }}>
              <p className="text-xs font-medium text-[#888bb0] uppercase tracking-wider">MAE</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {fd?.mae?.toFixed(2) ?? '-'}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#5a5d8a]">
                Mean Absolute Error — average forecast error in units. Lower means more accurate.
              </p>
            </div>
            <div className="animate-fade-in rounded-2xl border border-[#23254a] bg-[#12132e] p-5" style={{ animationDelay: '0.2s' }}>
              <p className="text-xs font-medium text-[#888bb0] uppercase tracking-wider">Model</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {fd?.model_used ?? '-'}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#5a5d8a]">
                Triple Exponential Smoothing that captures trends and seasonal patterns in demand.
              </p>
            </div>
          </div>

          <div className="animate-slide-up rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
            <h3 className="mb-1 text-lg font-semibold text-white">
              Forecast for {selectedProduct}
            </h3>
            <p className="mb-6 text-sm text-[#888bb0]">
              Actual vs predicted demand
            </p>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23254a" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#888bb0' }}
                  axisLine={{ stroke: '#23254a' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#888bb0' }}
                  axisLine={{ stroke: '#23254a' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1b3a',
                    border: '1px solid #23254a',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend />
                {forecastStartDate && (
                  <ReferenceLine
                    x={forecastStartDate}
                    stroke="#5a5d8a"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Forecast →',
                      position: 'top',
                      fill: '#5a5d8a',
                      fontSize: 11,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="forecastUpper"
                  stroke="none"
                  fill="#f59e0b"
                  fillOpacity={0.08}
                  legendType="none"
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="forecastLower"
                  stroke="none"
                  fill="#f59e0b"
                  fillOpacity={0.08}
                  legendType="none"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#6366f1' }}
                  name="Historical Demand"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 2, fill: '#f59e0b' }}
                  name="Forecast"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}