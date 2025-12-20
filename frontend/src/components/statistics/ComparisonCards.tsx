import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Paper, Typography, Stack, Box } from '@mui/material'

export interface ComparisonPeriod {
  key: 'lastMonth' | 'lastQuarter' | 'lastYear'
  label: string
  income: number
  expense: number
  balance: number
}

interface ComparisonCardsProps {
  comparisonStats: ComparisonPeriod[]
  formatAmount: (amount: number) => string
}

const ComparisonCards: React.FC<ComparisonCardsProps> = ({ comparisonStats, formatAmount }) => {
  const { t } = useTranslation()

  return (
    <Grid container spacing={2}>
      {comparisonStats.map(period => (
        <Grid item xs={12} sm={6} md={4} key={period.key}>
          <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {period.label}
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  {t('operations.summary.totalIncome') ?? 'Income'}:
                </Typography>
                <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {formatAmount(period.income)} zł
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  {t('operations.summary.totalExpense') ?? 'Expense'}:
                </Typography>
                <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                  {formatAmount(period.expense)} zł
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', pt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {t('operations.summary.net') ?? 'Balance'}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: period.balance >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}
                >
                  {formatAmount(period.balance)} zł
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

export default ComparisonCards
