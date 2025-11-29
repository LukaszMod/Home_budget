import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOperations, createOperation, deleteOperation } from '../lib/api'
import type { Operation, CreateOperationPayload } from '../lib/api'
import { useNotifier } from '../components/Notifier'

export const useOperations = () => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  const operationsQuery = useQuery<Operation[], Error>({
    queryKey: ['operations'],
    queryFn: getOperations,
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

  return {
    operationsQuery,
    createMutation,
    deleteMutation,
  }
}
