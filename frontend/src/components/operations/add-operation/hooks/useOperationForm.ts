import { useEffect, useMemo } from 'react';
import type { UseFormReset, UseFormWatch } from 'react-hook-form';
import {
  getOperationChildren,
  type Operation as APIOperation,
  type OperationType,
} from '../../../../lib/api';
import { useNotifier } from '../../../common/Notifier';

interface FormData {
  operationDate: string;
  amount: string;
  description: string;
  accountId: number | '';
  categoryId: number | '';
  operationType: OperationType | '';
  isSplit: boolean;
}

export const useOperationForm = (
  open: boolean,
  editing: APIOperation | null | undefined,
  reset: UseFormReset<FormData>,
  watch: UseFormWatch<FormData>,
  onSplitItemsLoad: (items: any[]) => void
) => {
  const notifier = useNotifier();
  const watchedDate = watch('operationDate');

  const isPlanned = useMemo(() => {
    if (!watchedDate) return false;
    const selectedDate = new Date(watchedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate > today;
  }, [watchedDate]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      onSplitItemsLoad([{ category_id: 0, amount: 0, description: '' }]);
    }
  }, [open, reset, onSplitItemsLoad]);

  // Load editing data
  useEffect(() => {
    if (editing) {
      reset({
        operationDate: editing.operation_date ?? new Date().toISOString().split('T')[0],
        amount: String(editing.amount),
        description: editing.description ?? '',
        accountId: editing.asset_id ?? '',
        categoryId: editing.category_id ?? '',
        operationType: editing.operation_type ?? '',
        isSplit: editing.is_split || false,
      });

      // Load children if this is a split operation
      if (editing.is_split) {
        getOperationChildren(editing.id)
          .then((children) => {
            const items = children.map((child) => ({
              category_id: child.category_id || 0,
              amount: Number(child.amount) || 0,
              description: child.description || '',
            }));
            onSplitItemsLoad(
              items.length > 0 ? items : [{ category_id: 0, amount: 0, description: '' }]
            );
          })
          .catch((err) => {
            console.error('Failed to load children:', err);
            notifier.notify('Failed to load split items', 'error');
          });
      } else {
        onSplitItemsLoad([{ category_id: 0, amount: 0, description: '' }]);
      }
    }
  }, [editing, reset, notifier, onSplitItemsLoad]);

  return { isPlanned };
};
