import React from 'react'
import { Paper, Typography, Box, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../common/DatePickerProvider'
import type { Operation } from '../../lib/api'

type RangeKey = 'month' | 'quarter' | 'year'

function rangeFor(key: RangeKey): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getFullYear()
  if (key === 'month') {
    const start = new Date(year, now.getMonth(), 1)
    const end = new Date(year, now.getMonth() + 1, 1)
    return { start, end }
  }
  if (key === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    const start = new Date(year, q * 3, 1)
    const end = new Date(year, q * 3 + 3, 1)
    return { start, end }
  }
  // year
  return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) }
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const AccountsSummary: React.FC<{ operations: Operation[] }> = ({ operations }) => {
  const { i18n } = useTranslation()
  const [range, setRange] = React.useState<RangeKey>('month')

  const { start, end } = React.useMemo(() => rangeFor(range), [range])

  const { income, expense } = React.useMemo(() => {
    let inc = 0
    let exp = 0
    for (const op of operations || []) {
      if (!op.operation_date) continue
      const d = new Date(op.operation_date)
      if (isNaN(d.getTime())) continue
      if (d < start || d >= end) continue
      const t = (op.operation_type || '').toString().toLowerCase()
      if (t === 'income' || t === 'in' || t === 'inflow') inc += Number(op.amount || 0)
      else exp += Number(op.amount || 0)
    }
    return { income: inc, expense: exp }
  }, [operations, start, end])

  const cashflow = income - expense

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Podsumowanie</Typography>

        <FormControl size="small">
          <InputLabel id="summary-range-label">Zakres</InputLabel>
          <Select
            labelId="summary-range-label"
            value={range}
            label="Zakres"
            onChange={(e) => setRange(e.target.value as RangeKey)}
          >
            <MenuItem value="month">Bieżący miesiąc</MenuItem>
            <MenuItem value="quarter">Bieżący kwartał</MenuItem>
            <MenuItem value="year">Bieżący rok</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="subtitle2">Przychody</Typography>
          <Typography variant="h6">{formatCurrency(income)}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2">Wydatki</Typography>
          <Typography variant="h6">{formatCurrency(expense)}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2">Cashflow</Typography>
          <Typography variant="h6">{formatCurrency(cashflow)}</Typography>
        </Box>

        <Typography variant="caption">Zakres: {formatDate(start, i18n.language)} – {formatDate(new Date(end.getTime() - 1), i18n.language)}</Typography>
      </Stack>
    </Paper>
  )
}

export default AccountsSummary
