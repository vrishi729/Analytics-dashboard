import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  TrendingUp,
} from 'lucide-react'

interface Recommendation {
  type: string
  title: string
  description: string
}

const typeConfig: Record<
  string,
  { icon: typeof Lightbulb; color: string; border: string; bg: string; badge: string; badgeColor: string; badgeBg: string }
> = {
  positive: {
    icon: CheckCircle2,
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
    badge: 'Opportunity',
    badgeColor: 'text-green-400',
    badgeBg: 'bg-green-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    badge: 'Warning',
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
  },
  action: {
    icon: TrendingUp,
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-500/5',
    badge: 'Action',
    badgeColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    badge: 'Info',
    badgeColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10',
  },
}

export default function RecommendationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get<Recommendation[]>('/recommendations/'),
  })

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Business Insights</h1>
        <p className="mt-1 text-sm text-[#888bb0]">
          Data-driven recommendations based on your sales data
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <p className="mt-4 text-sm text-[#888bb0]">Analyzing your data...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>
            {error instanceof Error ? error.message : 'Could not load recommendations'}
          </span>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1b3a]">
            <Info size={32} className="text-[#5a5d8a]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            No Insights Yet
          </h3>
          <p className="mt-1 text-sm text-[#888bb0]">
            Upload and clean a dataset to receive business recommendations.
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((rec, i) => {
            const cfg = (typeConfig[rec.type] ?? typeConfig.info)!
            const Icon = cfg.icon
            return (
              <div
                key={i}
                className={`animate-slide-up rounded-2xl border ${cfg.border} ${cfg.bg} p-5`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{rec.title}</h3>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.badgeColor} ${cfg.badgeBg}`}>
                        {cfg.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#c4c6db]">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}