import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOperation,
  updateOperation,
  unsplitOperation,
  type Operation as APIOperation,
  type CreateOperationPayload,
} from '../../../../lib/api';
import { useNotifier } from '../../../common/Notifier';
import { useTranslation } from 'react-i18next';

export const useOperationMutations = () => {
  const qc = useQueryClient();
  const notifier = useNotifier();
  const { t } = useTranslation();

  const createMut = useMutation<APIOperation, Error, CreateOperationPayload>({
    mutationFn: (p) => createOperation(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] });
      qc.invalidateQueries({ queryKey: ['hashtags'] });
    },
  });

  const updateMut = useMutation<
    APIOperation,
    Error,
    { id: number; payload: CreateOperationPayload }
  >({
    mutationFn: ({ id, payload }) => updateOperation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] });
      qc.invalidateQueries({ queryKey: ['hashtags'] });
    },
  });

  const unsplitMut = useMutation<void, Error, number>({
    mutationFn: (id) => unsplitOperation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] });
      notifier.notify(t('operations.messages.saved') ?? 'Operation unsplit', 'success');
    },
  });

  return { createMut, updateMut, unsplitMut, notifier, t };
};
