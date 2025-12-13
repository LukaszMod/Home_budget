import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, createCategory, updateCategory, deleteCategory, getOperations } from '../lib/api'
import type { Category as APICategory, CreateCategoryPayload, Operation as APIOperation } from '../lib/api'
import { useNotifier } from '../components/common/Notifier'

export const useCategories = () => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  // Queries
  const categoriesQuery = useQuery<APICategory[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const operationsQuery = useQuery<APIOperation[], Error>({
    queryKey: ['operations'],
    queryFn: getOperations,
  })

  // Mutations
  const createMut = useMutation<APICategory, Error, CreateCategoryPayload>({
    mutationFn: (p) => createCategory(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      notifier.notify('Category created', 'success')
    },
    onError: (e: any) => notifier.notify(String(e), 'error'),
  })

  const updateMut = useMutation<APICategory, Error, { id: number; payload: CreateCategoryPayload }>({
    mutationFn: ({ id, payload }) => updateCategory({ id, payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      notifier.notify('Category updated', 'success')
    },
    onError: (e: any) => notifier.notify(String(e), 'error'),
  })

  const deleteMut = useMutation<void, Error, number>({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      notifier.notify('Category deleted', 'success')
    },
    onError: (e: any) => notifier.notify(String(e), 'error'),
  })

  return {
    categoriesQuery,
    operationsQuery,
    createMut,
    updateMut,
    deleteMut,
  }
}
