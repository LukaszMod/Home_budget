import { useForm } from 'react-hook-form';
import { getCategories, getBudgetData, updateBudget, createBudget } from '../../../lib/api';
import type {
  Category,
  Budget as BudgetType,
  CreateBudgetPayload,
  BudgetDataResponse,
  OperationType,
} from '../../../lib/api';
import React from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifier } from '../../common/Notifier';

type BudgetForm = {
  id?: number;
  category_id: number;
  category_name: string;
  parent_id: number;
  type: OperationType;
  spending: number;
  planned: number;
  description: string;
};

export type FullBudget = { budgets: Array<BudgetForm> };

const useBudget = (selectedMonth: string) => {
  const qc = useQueryClient();
  const notifier = useNotifier();
  const categoriesQuery = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Optimized query: budgets with category info + spending aggregations
  const budgetDataQuery = useQuery<BudgetDataResponse, Error>({
    queryKey: ['budgetData', selectedMonth],
    queryFn: () => getBudgetData(selectedMonth),
  });
  const categories = categoriesQuery.data ?? [];
  const budgetsData = budgetDataQuery.data?.budgets ?? [];
  const spendingData = budgetDataQuery.data?.spending ?? [];

  const methods = useForm<FullBudget>({
    defaultValues: { budgets: [] },
    mode: 'onBlur',
  });

  const { handleSubmit, reset } = methods;

  React.useEffect(() => {
    const subCategories = categories.filter(
      (c) => c.parent_id !== null && c.is_hidden === false && c.is_system === false
    );
    const formBudgets = subCategories.map((c) => {
      const budget = budgetsData.find((b) => b.category_id === c.id);
      const spend = spendingData.find((s) => s.category_id === c.id);
      return {
        id: budget?.id ?? 0,
        category_id: c.id,
        category_name: c.name,
        planned: Number(budget?.planned_amount ?? 0),
        description: budget?.description ?? '',
        parent_id: c.parent_id as number,
        spending: Number(spend?.amount ?? 0),
        type: c.type,
      };
    });
    reset({ budgets: formBudgets });
  }, [budgetsData, categories, spendingData, selectedMonth, reset]);

  // Mutations
  const updateMutation = useMutation<BudgetType, Error, CreateBudgetPayload[]>({
    mutationFn: (payload) => updateBudget(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgetData'] });
      notifier.notify('Budget updated', 'success');
    },
  });

  const createMutation = useMutation<BudgetType, Error, CreateBudgetPayload>({
    mutationFn: (payload) => createBudget(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgetData'] });
      notifier.notify('Budget created', 'success');
    },
  });

  const handleSave = handleSubmit(async (data: FullBudget) => {
    try {
      const updateData = data.budgets
        .filter((item) => item.id && item.id > 0)
        .map((item) => ({
          id: item.id,
          category_id: item.category_id,
          planned_amount: item.planned,
          description: item.description,
          month: `${selectedMonth}-01`, // selectedMonth = YYYY-MM
        }));

      await updateMutation.mutateAsync(updateData as CreateBudgetPayload[]);
      // for (const item of data.budgets) {
      //   if (item.id && item.id > 0) {
      //     // update
      //     await updateMutation.mutateAsync({
      //       id: item.id,
      //       payload: {
      //         category_id: item.category_id,
      //         month: `${selectedMonth}-01`, // selectedMonth = YYYY-MM
      //         planned_amount: item.planned,
      //         description: item.description,
      //       },
      //     });
      //   } else if (item.planned !== 0 || item.description !== '') {
      //     // create
      //     await createMutation.mutateAsync({
      //       category_id: item.category_id,
      //       month: `${selectedMonth}-01`, // selectedMonth = YYYY-MM
      //       planned_amount: item.planned,
      //       description: item.description,
      //     });
      // }
      // }

      notifier.notify('Budgets saved', 'success');
    } catch (err) {
      notifier.notify('Error saving budgets', 'error');
      console.error(err);
    }
  });

  return { methods, categories, handleSave };
};

export default useBudget;
