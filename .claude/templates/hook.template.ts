import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFunction, createFunction, deleteFunction } from '../lib/api';
import type { Entity, CreatePayload } from '../lib/api';
import { useNotifier } from '../components/common/Notifier';

export const use{{HookName}} = () => {
  const qc = useQueryClient();
  const notifier = useNotifier();

  const entityQuery = useQuery<Entity[], Error>({
    queryKey: ['entityName'],
    queryFn: getFunction,
    staleTime: 0,
  });

  const createMutation = useMutation<Entity, Error, CreatePayload>({
    mutationFn: (payload) => createFunction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entityName'] });
      notifier.notify('Created successfully', 'success');
    },
    onError: (error) => {
      notifier.notify(error.message, 'error');
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteFunction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entityName'] });
      notifier.notify('Deleted successfully', 'success');
    },
  });

  return {
    entityQuery,
    createMutation,
    deleteMutation,
  };
};
