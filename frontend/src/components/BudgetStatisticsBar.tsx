import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Paper, Typography, Divider } from '@mui/material'

interface BudgetStatsType {
  plannedIncome: number
  plannedExpense: number
  realIncome: number
  realExpense: number
  plannedCashFlow: number
  realCashFlow: number
}

interface BudgetStatisticsBarProps {
  stats: BudgetStatsType
}

const BudgetStatisticsBar: React.FC<BudgetStatisticsBarProps> = ({ stats }) => {
  const { t } = useTranslation()

  const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <Box sx={{ py: 1.5 }}>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value.toFixed(2)}
      </Typography>
    </Box>
  )

  return (
    <Paper sx={{ p: 2, minWidth: 280, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {t('budget.statistics.title')}
      </Typography>
      
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
          {t('budget.statistics.income')}
        </Typography>
        <StatItem label={t('budget.statistics.plannedIncome')} value={stats.plannedIncome} />
        <StatItem label={t('budget.statistics.realIncome')} value={stats.realIncome} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
          {t('budget.statistics.expenses')}
        </Typography>
        <StatItem label={t('budget.statistics.plannedExpense')} value={stats.plannedExpense} />
        <StatItem label={t('budget.statistics.realExpense')} value={stats.realExpense} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
          {t('budget.statistics.cashFlow')}
        </Typography>
        <StatItem label={t('budget.statistics.plannedCashFlow')} value={stats.plannedCashFlow} />
        <StatItem label={t('budget.statistics.realCashFlow')} value={stats.realCashFlow} />
      </Box>
    </Paper>
  )
}

export default BudgetStatisticsBar
