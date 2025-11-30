import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHashtags, createHashtag, deleteHashtag, type Hashtag } from '../lib/api'
import { useNotifier } from '../components/Notifier'

export const useHashtags = () => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  const hashtagsQuery = useQuery<Hashtag[], Error>({
    queryKey: ['hashtags'],
    queryFn: getHashtags,
  })

  const createHashtagMut = useMutation<Hashtag, Error, string>({
    mutationFn: (name: string) => createHashtag(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hashtags'] })
      notifier.notify('Hashtag created', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error'),
  })

  const deleteHashtagMut = useMutation<void, Error, number>({
    mutationFn: (id: number) => deleteHashtag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hashtags'] })
      notifier.notify('Hashtag deleted', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error'),
  })

  return {
    hashtags: hashtagsQuery.data ?? [],
    isLoading: hashtagsQuery.isLoading,
    isError: hashtagsQuery.isError,
    error: hashtagsQuery.error,
    createHashtagMut,
    deleteHashtagMut,
  }
}
