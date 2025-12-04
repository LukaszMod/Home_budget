import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getAssetValuations, 
  createAssetValuation, 
  deleteAssetValuation
} from '../lib/api'

export function useAssetValuations(assetId?: number) {
  const queryClient = useQueryClient()
  
  const { data: valuations = [], ...queryState } = useQuery({
    queryKey: ['assetValuations', assetId],
    queryFn: () => getAssetValuations(assetId!),
    enabled: !!assetId,
  })

  const createMutation = useMutation({
    mutationFn: createAssetValuation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetValuations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAssetValuation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetValuations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  return {
    valuations,
    ...queryState,
    createValuation: createMutation.mutate,
    deleteValuation: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
