import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getAssets, 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  toggleAssetActive,
  correctAssetBalance
} from '../lib/api'

export function useAssets() {
  const queryClient = useQueryClient()
  
  const { data: assets = [], ...queryState } = useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  })

  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: toggleAssetActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const correctBalanceMutation = useMutation({
    mutationFn: ({ id, target_balance }: { id: number; target_balance: number }) => 
      correctAssetBalance(id, target_balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['operations'] })
    },
  })

  return {
    assets,
    ...queryState,
    createAsset: createMutation.mutate,
    updateAsset: updateMutation.mutate,
    deleteAsset: deleteMutation.mutate,
    toggleAssetActive: toggleActiveMutation.mutate,
    correctBalance: correctBalanceMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
    isCorrectingBalance: correctBalanceMutation.isPending,
  }
}
