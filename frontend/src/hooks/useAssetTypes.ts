import { useQuery } from '@tanstack/react-query'
import { getAssetTypes } from '../lib/api'

export function useAssetTypes() {
  const { data: assetTypes = [], ...rest } = useQuery({
    queryKey: ['assetTypes'],
    queryFn: getAssetTypes,
  })
  
  return { assetTypes, ...rest }
}
