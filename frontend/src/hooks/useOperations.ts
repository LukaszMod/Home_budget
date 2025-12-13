import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOperations, createOperation, deleteOperation, splitOperation, unsplitOperation } from '../lib/api'
import type { Operation, CreateOperationPayload, SplitOperationRequest } from '../lib/api'
import { useNotifier } from '../components/Notifier'

export const useOperations = () => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  const operationsQuery = useQuery<Operation[], Error>({
    queryKey: ['operations'],
    queryFn: getOperations,
    staleTime: 0, // Always fetch fresh data
  })

  const createMutation = useMutation<Operation, Error, CreateOperationPayload>({
    mutationFn: (payload: CreateOperationPayload) => createOperation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      notifier.notify('Operation created', 'success')
    },
  })

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => deleteOperation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      notifier.notify('Operation deleted', 'success')
    },
  })

  const splitMutation = useMutation<Operation[], Error, { id: number; request: SplitOperationRequest }>({
    mutationFn: ({ id, request }) => splitOperation(id, request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      notifier.notify('Operation split', 'success')
    },
  })

  const unsplitMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => unsplitOperation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      notifier.notify('Operation unsplit', 'success')
    },
  })

  return {
    operationsQuery,
    createMutation,
    deleteMutation,
    splitMutation,
    unsplitMutation,
  }
}
