import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Target } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: number
  icon?: keyof typeof iconMap
}

const iconMap = {
  revenue: DollarSign,
  orders: ShoppingCart,
  quantity: Package,
  target: Target,
}

export default function KpiCard({ title, value, subtitle, trend, icon }: KpiCardProps) {
  const Icon = icon ? iconMap[icon] : null

  return (
    <div className="group gradient-border card-hover animate-fade-in min-w-0 rounded-2xl bg-[#12132e] p-6">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[#888bb0]">{title}</p>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-all group-hover:bg-indigo-500/20">
            <Icon size={20} />
          </div>
        )}
      </div>
      <p className="mt-3 text-xl font-bold text-white truncate">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {trend !== undefined && trend !== 0 && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}
            title="Year-over-year revenue change"
          >
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-[#5a5d8a]" title="Compared to previous month">{subtitle}</span>}
      </div>
    </div>
  )
}