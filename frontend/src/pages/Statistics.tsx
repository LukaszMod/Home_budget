import React, { useMemo, useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOperations } from '../hooks/useOperations'
import { useCategories } from '../hooks/useCategories'
import { useAccountsData } from '../hooks/useAccountsData'
import { useHashtags } from '../hooks/useHashtags'
import { useFormatDate } from '../components/common/DatePickerProvider'
import StatisticsFiltersDialog, { type FilterState } from '../components/statistics/StatisticsFiltersDialog'
import ComparisonCards, { type ComparisonPeriod } from '../components/statistics/ComparisonCards'
import CategoryExpenseChart from '../components/statistics/CategoryExpenseChart'

const Statistics: React.FC = () => {
  const { t } = useTranslation()
  const formatDate = useFormatDate()
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
      periodStart: formatDate(startDate),
      periodEnd: formatDate(endDate),
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
        <ComparisonCards comparisonStats={comparisonStats} formatAmount={formatAmount} />
      )}

      {/* Wykres słupkowy - Wydatki po kategoriach */}
      <CategoryExpenseChart chartData={chartData} formatAmount={formatAmount} />

      {/* Modal do edycji filtrów */}
      <StatisticsFiltersDialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        accounts={accounts}
        categories={categories}
        hashtags={hashtags}
        activeAccountIds={activeAccountIds}
      />
    </Box>
  )
}

export default Statistics
