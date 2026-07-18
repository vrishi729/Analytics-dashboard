import { create } from 'zustand'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

interface CurrencyState {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('currency') : null

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: (stored as CurrencyCode) || 'USD',
  setCurrency: (code) => {
    localStorage.setItem('currency', code)
    set({ currency: code })
  },
}))
