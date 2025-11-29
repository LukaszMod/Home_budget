import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Paper, Typography } from '@mui/material'

interface BudgetStatsType {
  plannedIncome: number
  plannedExpense: number
  realIncome: number
  realExpense: number
  plannedCashFlow: number
  realCashFlow: number
}

interface BudgetStatisticsProps {
  stats: BudgetStatsType
}

const BudgetStatistics: React.FC<BudgetStatisticsProps> = ({ stats }) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 1.5, backgroundColor: '#e8f5e9' }}>
            <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {t('budget.statistics.plannedIncome')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {stats.plannedIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 1.5, backgroundColor: '#c8e6c9' }}>
            <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
              {t('budget.statistics.realIncome')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {stats.realIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 1.5, backgroundColor: '#ffebee' }}>
            <Typography variant="caption" sx={{ color: '#c62828', fontWeight: 'bold' }}>
              {t('budget.statistics.plannedExpense')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {stats.plannedExpense.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 1.5, backgroundColor: '#ffcdd2' }}>
            <Typography variant="caption" sx={{ color: '#b71c1c', fontWeight: 'bold' }}>
              {t('budget.statistics.realExpense')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {stats.realExpense.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 1.5, backgroundColor: stats.plannedCashFlow >= 0 ? '#e3f2fd' : '#ffebee' }}>
            <Typography variant="caption" sx={{ color: stats.plannedCashFlow >= 0 ? '#1565c0' : '#c62828', fontWeight: 'bold' }}>
              {t('budget.statistics.plannedCashFlow')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {stats.plannedCashFlow.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 1.5, backgroundColor: stats.realCashFlow >= 0 ? '#e3f2fd' : '#ffebee' }}>
            <Typography variant="caption" sx={{ color: stats.realCashFlow >= 0 ? '#0d47a1' : '#b71c1c', fontWeight: 'bold' }}>
              {t('budget.statistics.realCashFlow')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {stats.realCashFlow.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default BudgetStatistics
