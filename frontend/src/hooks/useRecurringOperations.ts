import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = import.meta.env.VITE_BACKEND_URL

export interface RecurringOperation {
  id: number
  asset_id: number
  asset_name?: string  // JOINed from backend
  category_id?: number
  category_name?: string  // JOINed from backend
  description?: string
  amount: number
  operation_type: 'income' | 'expense'
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  is_active: boolean
  creation_date?: string
  last_generated?: string
}

export interface CreateRecurringOperationPayload {
  asset_id: number
  category_id?: number
  description?: string
  amount: number
  operation_type: 'income' | 'expense'
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
}

export interface UpdateRecurringOperationPayload {
  description?: string
  amount?: number
  category_id?: number
  end_date?: string
  is_active?: boolean
}

export const useRecurringOperations = () => {
  const qc = useQueryClient()

  // Get all recurring operations
  const query = useQuery<RecurringOperation[]>({
    queryKey: ['recurringOperations'],
    queryFn: async () => {
      const response = await fetch(`${API}/recurring-operations`)
      if (!response.ok) throw new Error('Failed to fetch recurring operations')
      return response.json()
    },
  })

  // Create recurring operation
  const createMutation = useMutation<RecurringOperation, Error, CreateRecurringOperationPayload>({
    mutationFn: async (payload) => {
      const response = await fetch(`${API}/recurring-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to create recurring operation')
      return response.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringOperations'] })
    },
  })

  // Update recurring operation
  const updateMutation = useMutation<RecurringOperation, Error, { id: number; payload: UpdateRecurringOperationPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await fetch(`${API}/recurring-operations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to update recurring operation')
      return response.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringOperations'] })
    },
  })

  // Delete recurring operation
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(`${API}/recurring-operations/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete recurring operation')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringOperations'] })
    },
  })

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
