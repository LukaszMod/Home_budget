import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import type { FullBudget } from './hooks/useBudget';

const BudgetStatisticsBar = () => {
  const { t } = useTranslation();
  const { getValues } = useFormContext<FullBudget>();
  const budgets = getValues('budgets');

  // Helper to format numeric values
  const formatAmount = (amount: number): string => {
    return isNaN(amount) || typeof amount !== 'number' ? '0.00' : amount.toFixed(2);
  };

  const plannedIncome = budgets.reduce((total, budget) => {
    return total + (budget.type === 'income' ? budget.planned : 0);
  }, 0);

  const plannedExpense = budgets.reduce((total, budget) => {
    return total + (budget.type === 'expense' ? budget.planned : 0);
  }, 0);

  const realIncome = budgets.reduce((total, budget) => {
    return total + (budget.type === 'income' ? budget.spending : 0);
  }, 0);

  const realExpense = budgets.reduce((total, budget) => {
    return total + (budget.type === 'expense' ? budget.spending : 0);
  }, 0);

  const plannedCashFlow = plannedIncome - plannedExpense;
  const realCashFlow = realIncome - realExpense;

  const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <Box sx={{ py: 1.5 }}>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {formatAmount(value)}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, minWidth: 280, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {t('budget.statistics.title')}
      </Typography>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
          {t('budget.statistics.income')}
        </Typography>
        <StatItem label={t('budget.statistics.plannedIncome')} value={plannedIncome} />
        <StatItem label={t('budget.statistics.realIncome')} value={realIncome} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
          {t('budget.statistics.expenses')}
        </Typography>
        <StatItem label={t('budget.statistics.plannedExpense')} value={plannedExpense} />
        <StatItem label={t('budget.statistics.realExpense')} value={realExpense} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
          {t('budget.statistics.cashFlow')}
        </Typography>
        <StatItem label={t('budget.statistics.plannedCashFlow')} value={plannedCashFlow} />
        <StatItem label={t('budget.statistics.realCashFlow')} value={realCashFlow} />
      </Box>
    </Box>
  );
};

export default BudgetStatisticsBar;
