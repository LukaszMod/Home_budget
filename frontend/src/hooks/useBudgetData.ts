import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getBudgets, getOperations, updateBudget, createBudget } from '../lib/api'
import type { Category, Budget as BudgetType, Operation, CreateBudgetPayload } from '../lib/api'
import { useNotifier } from '../components/Notifier'

export const useBudgetData = () => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  // Queries
  const categoriesQuery = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const budgetsQuery = useQuery<BudgetType[], Error>({
    queryKey: ['budgets'],
    queryFn: getBudgets,
  })

  const operationsQuery = useQuery<Operation[], Error>({
    queryKey: ['operations'],
    queryFn: getOperations,
  })

  // Mutations
  const updateMutation = useMutation<BudgetType, Error, { id: number; payload: CreateBudgetPayload }>({
    mutationFn: ({ id, payload }) => updateBudget({ id, payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      notifier.notify('Budget updated', 'success')
    },
  })

  const createMutation = useMutation<BudgetType, Error, CreateBudgetPayload>({
    mutationFn: (payload) => createBudget(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      notifier.notify('Budget created', 'success')
    },
  })

  return {
    categoriesQuery,
    budgetsQuery,
    operationsQuery,
    updateMutation,
    createMutation,
  }
}
