import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTransfer, type TransferRequest, type TransferResponse } from '../lib/api'
import { useNotifier } from '../components/common/Notifier'
import { useTranslation } from 'react-i18next'

export function useTransfer() {
  const queryClient = useQueryClient()
  const notifier = useNotifier()
  const { t } = useTranslation()

  const mutation = useMutation<TransferResponse, Error, TransferRequest>({
    mutationFn: createTransfer,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['operations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset-valuations'] })
      queryClient.invalidateQueries({ queryKey: ['investment-transactions'] })
      
      notifier.notify(
        t('transfer.success', 'Transfer wykonany pomyślnie'),
        'success'
      )
    },
    onError: (error) => {
      notifier.notify(
        t('transfer.error', 'Błąd podczas wykonywania transferu: {{error}}', {
          error: error.message
        }),
        'error'
      )
    },
  })

  return mutation
}
