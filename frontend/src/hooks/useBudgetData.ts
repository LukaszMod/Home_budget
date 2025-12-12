import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getBudgetData, updateBudget, createBudget } from '../lib/api'
import type { Category, Budget as BudgetType, CreateBudgetPayload, BudgetDataResponse } from '../lib/api'
import { useNotifier } from '../components/Notifier'

export const useBudgetData = (month: string) => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  // Categories still needed for dropdowns (full list)
  const categoriesQuery = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  // Optimized query: budgets with category info + spending aggregations
  const budgetDataQuery = useQuery<BudgetDataResponse, Error>({
    queryKey: ['budgetData', month],
    queryFn: () => getBudgetData(month),
  })

  // Mutations
  const updateMutation = useMutation<BudgetType, Error, { id: number; payload: CreateBudgetPayload }>({
    mutationFn: ({ id, payload }) => updateBudget({ id, payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgetData'] })
      notifier.notify('Budget updated', 'success')
    },
  })

  const createMutation = useMutation<BudgetType, Error, CreateBudgetPayload>({
    mutationFn: (payload) => createBudget(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgetData'] })
      notifier.notify('Budget created', 'success')
    },
  })

  return {
    categoriesQuery,
    budgetDataQuery,
    updateMutation,
    createMutation,
  }
}
