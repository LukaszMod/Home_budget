// Types for CSV import functionality

export type CSVRow = Record<string, string | number>

export interface ColumnMapping {
  amount?: number
  description?: number
  date?: number
  dateFormat?: string
  sourceAccount?: number
  targetAccount?: number
  category?: number
  operationType?: number
}

export interface ImportTemplate {
  id: string | number
  name: string
  columnMapping?: ColumnMapping
  template_data?: {
    columnMapping: ColumnMapping
  }
  createdAt?: string
  created_at?: string | null
  user_id?: number
}
