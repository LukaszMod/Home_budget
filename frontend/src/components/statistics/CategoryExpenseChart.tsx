import React from 'react'
import { useTranslation } from 'react-i18next'
import { Paper, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ChartDataItem {
  name: string
  value: number
  fullName: string
}

interface CategoryExpenseChartProps {
  chartData: ChartDataItem[]
  formatAmount: (amount: number) => string
}

const COLORS = ['#ff7c7c', '#8884d8', '#82ca9d', '#ffc658', '#ff85a2', '#a4de6c', '#d084d0', '#ffb347', '#87ceeb', '#f0e68c']

const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({ chartData, formatAmount }) => {
  const { t } = useTranslation()

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          {t('statistics.noData') ?? 'No data to display for selected filters'}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        💰 {t('statistics.expensesByCategory') ?? 'Expenses by Category'}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip
            formatter={(value: any) => `${formatAmount(value)} zł`}
            labelFormatter={() => 'Wartość'}
          />
          <Bar dataKey="value" fill="#8884d8" name={t('operations.summary.totalExpense') ?? 'Expense'}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  )
}

export default CategoryExpenseChart
