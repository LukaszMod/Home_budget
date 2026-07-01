import type { CreateOperationPayload, OperationType, SplitItem } from '../../../../lib/api';

interface FormData {
  operationDate: string;
  amount: string;
  description: string;
  accountId: number | '';
  categoryId: number | '';
  operationType: OperationType | '';
  isSplit: boolean;
}

export const buildOperationPayload = (
  data: FormData,
  splitItems?: SplitItem[]
): CreateOperationPayload => {
  const payload: CreateOperationPayload = {
    asset_id: Number(data.accountId),
    amount:
      data.operationType === 'expense'
        ? -Math.abs(Number(data.amount))
        : Math.abs(Number(data.amount)),
    description: data.description || null,
    category_id: data.categoryId === '' ? null : Number(data.categoryId),
    operation_type: (data.operationType as OperationType) || 'expense',
    operation_date: data.operationDate || new Date().toISOString().split('T')[0],
    split_items:
      data.isSplit && splitItems
        ? splitItems.map((item) => ({
            category_id: Number(item.category_id),
            amount: Number(item.amount),
            description: item.description || null,
          }))
        : undefined,
  };

  return payload;
};
