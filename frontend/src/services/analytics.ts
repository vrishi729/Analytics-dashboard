import { api } from '../lib/api'

export interface Kpi {
  total_revenue: number
  total_orders: number
  total_quantity_sold: number
  average_order_value: number
}

export interface ProductSummary {
  product_name: string
  total_quantity: number
  total_revenue: number
  order_count: number
  growth?: number
}

export interface CategorySummary {
  category: string
  total_quantity: number
  total_revenue: number
  order_count: number
}

export interface TrendPoint {
  period: string
  total_quantity: number
  total_revenue: number
  order_count: number
}

export interface SalesGrowth {
  growth_rate: number
  current_period_revenue: number
  previous_period_revenue: number
  current_period: string
  previous_period: string
}

export interface DatasetSummary {
  date_range: string | null
  avg_monthly_revenue: number
  highest_revenue_product: string | null
  lowest_revenue_product: string | null
  avg_monthly_growth: number
}

export interface AnalyticsData {
  kpi: Kpi
  products: ProductSummary[]
  category_performance: CategorySummary[]
  sales_trends: TrendPoint[]
  sales_growth: SalesGrowth
  dataset_summary?: DatasetSummary
}

export interface AnalyticsResponse extends AnalyticsData {
  available_years?: string[]
}

export async function getAnalytics(
  datasetId?: string,
  period?: string,
  year?: string,
): Promise<AnalyticsResponse> {
  const params = new URLSearchParams()
  if (datasetId) params.set('dataset_id', datasetId)
  if (period && period !== 'all') params.set('period', period)
  if (year) params.set('year', year)
  const qs = params.toString()
  return api.get<AnalyticsResponse>(`/analytics/overview${qs ? `?${qs}` : ''}`)
}

export async function uploadDataset(file: File): Promise<{
  dataset_id: string
  filename: string
  row_count: number
  is_valid: boolean
  health_summary: Record<string, unknown> | null
}> {
  return api.upload('/datasets/upload', file)
}

export interface CleanSummary {
  products: number
  categories: number
  date_range: string | null
  product_names: string[]
  category_names: string[]
}

export interface ColumnInfo {
  detected_columns: string[]
  sample_rows: Array<Record<string, string>>
  auto_mapping: Record<string, string>
  canonical_fields: string[]
  canonical_labels: Record<string, string>
  required_fields: string[]
}

export async function fetchColumns(
  datasetId: string,
): Promise<ColumnInfo> {
  return api.get(`/datasets/${datasetId}/columns`)
}

export async function cleanDataset(
  datasetId: string,
  columnMapping?: Record<string, string>,
): Promise<{
  dataset_id: string
  cleaning_report: Record<string, unknown>
  total_cleaned_records: number
  summary?: CleanSummary
}> {
  if (columnMapping) {
    return api.post(`/datasets/${datasetId}/clean`, { column_mapping: columnMapping })
  }
  return api.post(`/datasets/${datasetId}/clean`)
}
