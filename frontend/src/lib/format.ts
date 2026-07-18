import type { CurrencyCode } from '../store/currency'
import { CURRENCIES } from '../store/currency'

const cache = new Map<string, Intl.NumberFormat>()
const symCache = new Map<string, string>()

function symbolFor(currency: CurrencyCode): string {
  let s = symCache.get(currency)
  if (!s) {
    s = CURRENCIES.find((c) => c.code === currency)?.symbol || '$'
    symCache.set(currency, s)
  }
  return s
}

export function formatCurrency(value: number, currency: CurrencyCode = 'USD'): string {
  const key = `currency-${currency}`
  let formatter = cache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    cache.set(key, formatter)
  }
  return formatter.format(value)
}

export function shortCurrency(value: number, currency: CurrencyCode = 'USD'): string {
  const s = symbolFor(currency)
  if (value >= 1_000_000) return `${s}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${s}${(value / 1_000).toFixed(0)}K`
  return `${s}${value.toFixed(0)}`
}
