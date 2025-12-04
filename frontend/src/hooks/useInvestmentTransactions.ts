import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getInvestmentTransactions, 
  createInvestmentTransaction, 
  deleteInvestmentTransaction
} from '../lib/api'

export function useInvestmentTransactions(assetId?: number) {
  const queryClient = useQueryClient()
  
  const { data: transactions = [], ...queryState } = useQuery({
    queryKey: ['investmentTransactions', assetId],
    queryFn: () => getInvestmentTransactions(assetId!),
    enabled: !!assetId,
  })

  const createMutation = useMutation({
    mutationFn: createInvestmentTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investmentTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInvestmentTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investmentTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  return {
    transactions,
    ...queryState,
    createTransaction: createMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
