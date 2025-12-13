import React, { useMemo, useState } from 'react'
import {
  Paper,
  Stack,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  TextField,
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'
import { useOperations } from '../hooks/useOperations'
import { useCategories } from '../hooks/useCategories'
import { useAccountsData } from '../hooks/useAccountsData'
import { useHashtags } from '../hooks/useHashtags'

interface FilterState {
  period: 'currentMonth' | 'lastMonth' | 'lastQuarter' | 'lastYear' | 'custom'
  customDateFrom: string
  customDateTo: string
  selectedAccounts: number[]
  selectedCategories: number[]
  selectedHashtags: number[]
}

interface ComparisonPeriod {
  key: 'lastMonth' | 'lastQuarter' | 'lastYear'
  label: string
  income: number
  expense: number
  balance: number
}

const Statistics: React.FC = () => {
  const { t } = useTranslation()
  const { operationsQuery } = useOperations()
  const { categoriesQuery } = useCategories()
  const { accountsQuery } = useAccountsData()
  const { hashtags } = useHashtags()

  const operations = operationsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const accounts = accountsQuery.data ?? []

  const activeAccountIds = accounts.filter(a => !a.is_closed).map(a => a.id)

  // Helper to parse BigDecimal (string | number) to number
  const parseAmount = (amount: number | string | undefined | null): number => {
    if (amount === undefined || amount === null) return 0
    return typeof amount === 'string' ? parseFloat(amount) : amount
  }

  // Helper to format amount
  const formatAmount = (amount: number): string => {
    return isNaN(amount) ? '0.00' : amount.toFixed(2)
  }

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    period: 'currentMonth',
    customDateFrom: '',
    customDateTo: '',
    selectedAccounts: activeAccountIds,
    selectedCategories: [],
    selectedHashtags: [],
  })

  // Modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [comparisonEnabled, setComparisonEnabled] = useState(false)

  // Helper function to get date range based on period
  const getDateRange = (period: string, customFrom?: string, customTo?: string) => {
    const now = new Date()
    let startDate: Date, endDate: Date

    switch (period) {
      case 'currentMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'lastQuarter':
        const quarterStart = Math.floor((now.getMonth() - 3) / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0, 23, 59, 59)
        break
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
        break
      case 'custom':
        startDate = customFrom ? new Date(customFrom) : new Date()
        endDate = customTo ? new Date(customTo) : new Date()
        break
      default:
        startDate = new Date(0)
        endDate = new Date()
    }

    return { startDate, endDate }
  }

  // Helper to filter operations by all criteria including hashtags
  const filterOperations = (ops: typeof operations, filterState: FilterState) => {
    const { startDate, endDate } = getDateRange(
      filterState.period,
      filterState.customDateFrom,
      filterState.customDateTo
    )

    return ops.filter(o => {
      const opDate = new Date(o.operation_date)
      const inRange = opDate >= startDate && opDate <= endDate
      const accountMatch =
        filterState.selectedAccounts.length === 0 || filterState.selectedAccounts.includes(o.asset_id)
      const categoryMatch =
        filterState.selectedCategories.length === 0 || 
        (o.category_id && filterState.selectedCategories.includes(o.category_id))
      const hashtagMatch =
        filterState.selectedHashtags.length === 0 ||
        (o.hashtags && o.hashtags.some(h => filterState.selectedHashtags.includes(h.id)))

      return inRange && accountMatch && categoryMatch && hashtagMatch
    })
  }

  // Statystyki ogólne (wszystkie konta, wszystkie okresy)
  const overallStats = useMemo(() => {
    const totalIncome = operations
      .filter(o => o.operation_type === 'income')
      .reduce((sum, o) => sum + parseAmount(o.amount), 0)

    const totalExpense = operations
      .filter(o => o.operation_type === 'expense')
      .reduce((sum, o) => sum + parseAmount(o.amount), 0)

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    }
  }, [operations])

  // Statystyki filtrowane
  const filteredStats = useMemo(() => {
    const { startDate, endDate } = getDateRange(
      filters.period,
      filters.customDateFrom,
      filters.customDateTo
    )

    const filtered = filterOperations(operations, filters)

    const income = filtered
      .filter(o => o.operation_type === 'income')
      .reduce((sum, o) => sum + parseAmount(o.amount), 0)

    const expense = filtered
      .filter(o => o.operation_type === 'expense')
      .reduce((sum, o) => sum + parseAmount(o.amount), 0)

    return {
      income,
      expense,
      balance: income - expense,
      periodStart: startDate.toLocaleDateString(),
      periodEnd: endDate.toLocaleDateString(),
    }
  }, [operations, filters])

  // Comparison data for 3 periods
  const comparisonStats = useMemo(() => {
    const result: ComparisonPeriod[] = []

    const periods: Array<'lastMonth' | 'lastQuarter' | 'lastYear'> = ['lastMonth', 'lastQuarter', 'lastYear']
    const labels = {
      lastMonth: t('statistics.period.lastMonth') ?? 'Last Month',
      lastQuarter: t('statistics.period.lastQuarter') ?? 'Last Quarter',
      lastYear: t('statistics.period.lastYear') ?? 'Last Year',
    }

    periods.forEach(period => {
      const { startDate, endDate } = getDateRange(period)
      
      const filtered = operations.filter(o => {
        const opDate = new Date(o.operation_date)
        const inRange = opDate >= startDate && opDate <= endDate
        const accountMatch =
          filters.selectedAccounts.length === 0 || filters.selectedAccounts.includes(o.asset_id)
        const categoryMatch =
          filters.selectedCategories.length === 0 || 
          (o.category_id && filters.selectedCategories.includes(o.category_id))
        const hashtagMatch =
          filters.selectedHashtags.length === 0 ||
          (o.hashtags && o.hashtags.some(h => filters.selectedHashtags.includes(h.id)))

        return inRange && accountMatch && categoryMatch && hashtagMatch
      })

      const income = filtered
        .filter(o => o.operation_type === 'income')
        .reduce((sum, o) => sum + parseAmount(o.amount), 0)

      const expense = filtered
        .filter(o => o.operation_type === 'expense')
        .reduce((sum, o) => sum + parseAmount(o.amount), 0)

      result.push({
        key: period,
        label: labels[period],
        income,
        expense,
        balance: income - expense,
      })
    })

    return result
  }, [operations, filters, t])

  // Statystyki po kategoriach dla wykresu
  const chartData = useMemo(() => {
    const categoryExpenses: { [key: number]: { name: string; amount: number } } = {}

    const filtered = filterOperations(operations, filters)

    filtered
      .filter(o => o.operation_type === 'expense' && o.category_id)
      .forEach(o => {
        if (o.category_id) {
          if (!categoryExpenses[o.category_id]) {
            // Use JOINed data from backend instead of find()
            const categoryName = o.category_name || 'Unknown'
            const fullName = o.parent_category_name 
              ? `${o.parent_category_name} → ${categoryName}` 
              : categoryName
            categoryExpenses[o.category_id] = {
              name: fullName,
              amount: 0,
            }
          }
          categoryExpenses[o.category_id].amount += parseAmount(o.amount)
        }
      })

    return Object.values(categoryExpenses)
      .sort((a, b) => b.amount - a.amount)
      .map(cat => ({
        name: cat.name.length > 20 ? cat.name.substring(0, 20) + '...' : cat.name,
        value: cat.amount,
        fullName: cat.name,
      }))
  }, [operations, filters])

  const COLORS = ['#ff7c7c', '#8884d8', '#82ca9d', '#ffc658', '#ff85a2', '#a4de6c', '#d084d0', '#ffb347', '#87ceeb', '#f0e68c']

  const subcategories = categories.filter(c => c.parent_id !== null).sort((a, b) => a.name.localeCompare(b.name))

  // Count active filters

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4">{t('statistics.title') ?? 'Statystyki'}</Typography>
      </Paper>

      {/* Górny panel - sumaryczne wartości na wszystkich kontach */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('operations.summary.totalIncome') ?? 'Total Income'}
              </Typography>
              <Typography variant="h5" sx={{ color: '#4caf50' }}>
                {formatAmount(overallStats.totalIncome)} zł
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('operations.summary.totalExpense') ?? 'Total Expense'}
              </Typography>
              <Typography variant="h5" sx={{ color: '#f44336' }}>
                {formatAmount(overallStats.totalExpense)} zł
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('operations.summary.net') ?? 'Net Balance'}
              </Typography>
              <Typography variant="h5" sx={{ color: overallStats.netBalance >= 0 ? '#4caf50' : '#f44336' }}>
                {formatAmount(overallStats.netBalance)} zł
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Konta
              </Typography>
              <Typography variant="h5">
                {accounts.filter(a => !a.is_closed).length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('statistics.activeAccounts') ?? 'Active'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pasek filtrów */}
      <Paper sx={{ p: 2, bgcolor: '#f0f4ff' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            📊 {t('statistics.activeFilters') ?? 'Active Filters'}:
          </Typography>
          {filters.period === 'currentMonth' && <Chip label="📅 Bieżący miesiąc" />}
          {filters.period === 'lastMonth' && <Chip label="📅 Ostatni miesiąc" />}
          {filters.period === 'lastQuarter' && <Chip label="📅 Ostatni kwartał" />}
          {filters.period === 'lastYear' && <Chip label="📅 Ostatni rok" />}
          {filters.period === 'custom' && <Chip label="📅 Niestandardowy" />}

          {filters.selectedAccounts.length < activeAccountIds.length && filters.selectedAccounts.length > 0 && (
            <Chip label={`💰 Konta (${filters.selectedAccounts.length})`} size="small" />
          )}

          {filters.selectedCategories.length > 0 && (
            <Chip label={`📂 Kategorie (${filters.selectedCategories.length})`} size="small" />
          )}

          {filters.selectedHashtags.length > 0 && (
            <Chip label={`#️⃣ Hashtagi (${filters.selectedHashtags.length})`} size="small" />
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            size="small"
            onClick={() => setFilterModalOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            ⚙️ {t('statistics.editFilters') ?? 'Edit Filters'}
          </Button>

          <Button
            variant={comparisonEnabled ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setComparisonEnabled(!comparisonEnabled)}
            sx={{ textTransform: 'none' }}
          >
            📊 {t('statistics.comparison') ?? 'Compare'}
          </Button>
        </Stack>
      </Paper>

      {/* Podsumowanie filtrowanych danych */}
      <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          📊 {t('statistics.period') ?? 'Period'}: <strong>{filteredStats.periodStart}</strong> -{' '}
          <strong>{filteredStats.periodEnd}</strong>
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {t('operations.summary.totalIncome') ?? 'Income'}
              </Typography>
              <Typography variant="h6" sx={{ color: '#4caf50' }}>
                {formatAmount(filteredStats.income)} zł
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {t('operations.summary.totalExpense') ?? 'Expense'}
              </Typography>
              <Typography variant="h6" sx={{ color: '#f44336' }}>
                {formatAmount(filteredStats.expense)} zł
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {t('operations.summary.net') ?? 'Balance'}
              </Typography>
              <Typography variant="h6" sx={{ color: filteredStats.balance >= 0 ? '#4caf50' : '#f44336' }}>
                {formatAmount(filteredStats.balance)} zł
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Porównanie 3 okresów */}
      {comparisonEnabled && (
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
      )}

      {/* Wykres słupkowy - Wydatki po kategoriach */}
      {chartData.length > 0 && (
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
      )}

      {chartData.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('statistics.noData') ?? 'No data to display for selected filters'}
          </Typography>
        </Paper>
      )}

      {/* Modal do edycji filtrów */}
      <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('statistics.editFilters') ?? 'Edit Filters'}
        </DialogTitle>
        <DialogContent dividers sx={{ overflow: 'visible' }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Okres */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('operations.dateFilter.label') ?? 'Period'}
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={filters.period}
                  onChange={e => setFilters({ ...filters, period: e.target.value as any })}
                >
                  <MenuItem value="currentMonth">{t('statistics.period.currentMonth') ?? 'Current Month'}</MenuItem>
                  <MenuItem value="lastMonth">{t('statistics.period.lastMonth') ?? 'Last Month'}</MenuItem>
                  <MenuItem value="lastQuarter">{t('statistics.period.lastQuarter') ?? 'Last Quarter'}</MenuItem>
                  <MenuItem value="lastYear">{t('statistics.period.lastYear') ?? 'Last Year'}</MenuItem>
                  <MenuItem value="custom">{t('operations.dateFilter.custom') ?? 'Custom'}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Custom dates */}
            {filters.period === 'custom' && (
              <Stack direction="row" spacing={1}>
                <TextField
                  label={t('operations.dateFilter.from') ?? 'From'}
                  type="date"
                  value={filters.customDateFrom}
                  onChange={e => setFilters({ ...filters, customDateFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label={t('operations.dateFilter.to') ?? 'To'}
                  type="date"
                  value={filters.customDateTo}
                  onChange={e => setFilters({ ...filters, customDateTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Stack>
            )}

            {/* Konta */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('operations.fields.account') ?? 'Accounts'}
              </Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', bgcolor: '#fafafa' }}>
                {accounts.filter(a => !a.is_closed).map(account => (
                  <ListItem key={account.id} dense disablePadding>
                    <ListItemButton
                      onClick={() => {
                        const isSelected = filters.selectedAccounts.includes(account.id)
                        setFilters({
                          ...filters,
                          selectedAccounts: isSelected
                            ? filters.selectedAccounts.filter(id => id !== account.id)
                            : [...filters.selectedAccounts, account.id],
                        })
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox checked={filters.selectedAccounts.includes(account.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={account.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Kategorie */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('operations.fields.category') ?? 'Categories'}
              </Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', bgcolor: '#fafafa' }}>
                {subcategories.map(cat => {
                  const parent = categories.find(c => c.id === cat.parent_id)
                  const label = parent ? `${parent.name} → ${cat.name}` : cat.name
                  return (
                    <ListItem key={cat.id} dense disablePadding>
                      <ListItemButton
                        onClick={() => {
                          const isSelected = filters.selectedCategories.includes(cat.id)
                          setFilters({
                            ...filters,
                            selectedCategories: isSelected
                              ? filters.selectedCategories.filter(id => id !== cat.id)
                              : [...filters.selectedCategories, cat.id],
                          })
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox checked={filters.selectedCategories.includes(cat.id)} size="small" />
                        </ListItemIcon>
                        <ListItemText primary={label} />
                      </ListItemButton>
                    </ListItem>
                  )
                })}
              </List>
            </Box>

            {/* Hashtagi */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('statistics.hashtags') ?? 'Hashtags'}
              </Typography>
              {hashtags.length > 0 ? (
                <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', bgcolor: '#fafafa' }}>
                  {hashtags.map(tag => (
                    <ListItem key={tag.id} dense disablePadding>
                      <ListItemButton
                        onClick={() => {
                          const isSelected = filters.selectedHashtags.includes(tag.id)
                          setFilters({
                            ...filters,
                            selectedHashtags: isSelected
                              ? filters.selectedHashtags.filter(id => id !== tag.id)
                              : [...filters.selectedHashtags, tag.id],
                          })
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox checked={filters.selectedHashtags.includes(tag.id)} size="small" />
                        </ListItemIcon>
                        <ListItemText primary={`#${tag.name}`} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {t('statistics.noHashtags') ?? 'No hashtags available'}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterModalOpen(false)}>
            {t('common.cancel') ?? 'Cancel'}
          </Button>
          <Button
            onClick={() => {
              setFilters({
                period: 'currentMonth',
                customDateFrom: '',
                customDateTo: '',
                selectedAccounts: activeAccountIds,
                selectedCategories: [],
                selectedHashtags: [],
              })
            }}
            variant="outlined"
          >
            {t('statistics.resetFilters') ?? 'Reset'}
          </Button>
          <Button onClick={() => setFilterModalOpen(false)} variant="contained">
            {t('common.save') ?? 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Statistics
