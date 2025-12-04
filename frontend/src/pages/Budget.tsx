import React, { useMemo, useState, useEffect } from 'react'
import { Box, Button, Paper, IconButton, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import SaveIcon from '@mui/icons-material/Save'
import { useBudgetData } from '../hooks/useBudgetData'
import type { Category, Budget as BudgetType, Operation } from '../lib/api'
import BudgetStatisticsBar from '../components/BudgetStatisticsBar'
import BudgetTable from '../components/BudgetTable'
import type { BudgetRow } from '../components/BudgetTable'
import BudgetCalendar from '../components/BudgetCalendar'

const Budget: React.FC = () => {
  const { t } = useTranslation()
  const { categoriesQuery, budgetsQuery, operationsQuery, updateMutation, createMutation } = useBudgetData()
  
  const categories = categoriesQuery.data ?? []
  const budgets = budgetsQuery.data ?? []
  const operations = operationsQuery.data ?? []
  
  const [editedRows, setEditedRows] = useState<Map<string, Partial<BudgetRow>>>(new Map())
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7))
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLButtonElement | null>(null)

  const categorySpending = useMemo(() => {
    const spending: Record<number, number> = {}
    operations.forEach((op: Operation) => {
      if (op.category_id) {
        const amount = typeof op.amount === 'number' ? op.amount : parseFloat(String(op.amount))
        spending[op.category_id] = (spending[op.category_id] || 0) + Math.abs(amount)
      }
    })
    return spending
  }, [operations])

  const budgetStats = useMemo(() => {
    let plannedIncome = 0, plannedExpense = 0, realIncome = 0, realExpense = 0
    const subCategories = categories.filter((cat: Category) => cat.parent_id !== null)
    subCategories.forEach((cat: Category) => {
      const budget = budgets.find((b: BudgetType) => b.category_id === cat.id && b.month.startsWith(selectedMonth))
      const monthStart = selectedMonth + '-01'
      const monthEnd = new Date(selectedMonth + '-01')
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      const monthEndStr = monthEnd.toISOString().split('T')[0]
      const monthOperations = operations.filter((op: Operation) => op.category_id === cat.id && op.operation_date && op.operation_date >= monthStart && op.operation_date <= monthEndStr)
      monthOperations.forEach((op: Operation) => {
        const amount = Math.abs(typeof op.amount === 'number' ? op.amount : parseFloat(String(op.amount)))
        if (op.operation_type === 'income') realIncome += amount
        else realExpense += amount
      })
      if (budget) {
        if (cat.type === 'income') plannedIncome += budget.planned_amount
        else plannedExpense += budget.planned_amount
      }
    })
    return { plannedIncome, plannedExpense, realIncome, realExpense, plannedCashFlow: plannedIncome - plannedExpense, realCashFlow: realIncome - realExpense }
  }, [categories, budgets, categorySpending, operations, selectedMonth])

  const mainCategories = useMemo(() => categories.filter((cat: Category) => cat.parent_id === null).sort((a: Category, b: Category) => a.id - b.id), [categories])

  useEffect(() => {
    const parentIds = new Set<string>()
    mainCategories.forEach((cat: Category) => {
      if (categories.filter((c: Category) => c.parent_id === cat.id).length > 0) parentIds.add(`parent-${cat.id}`)
    })
    setExpandedParents(parentIds)
  }, [mainCategories, categories])

  const rows = useMemo(() => {
    const result: BudgetRow[] = []
    mainCategories.forEach((mainCat: Category) => {
      const subCategories = categories.filter((cat: Category) => cat.parent_id === mainCat.id)
      if (subCategories.length === 0) return
      let mainCatPlan = 0, mainCatSpending = 0
      subCategories.forEach((subCat: Category) => {
        const budget = budgets.find((b: BudgetType) => b.category_id === subCat.id && b.month.startsWith(selectedMonth))
        const plan = budget?.planned_amount ?? 0
        const spending = categorySpending[subCat.id] ?? 0
        mainCatPlan += plan
        mainCatSpending += spending
      })
      result.push({ id: `parent-${mainCat.id}`, category_name: mainCat.name, plan: mainCatPlan, spending: mainCatSpending, remaining: mainCatPlan - mainCatSpending, isParent: true, parentId: undefined })
      subCategories.sort((a: Category, b: Category) => a.id - b.id).forEach((subCat: Category) => {
        const budget = budgets.find((b: BudgetType) => b.category_id === subCat.id && b.month.startsWith(selectedMonth))
        const plan = budget?.planned_amount ?? 0
        const spending = categorySpending[subCat.id] ?? 0
        result.push({ id: `sub-${subCat.id}`, category_id: subCat.id, category_name: subCat.name, plan, spending, remaining: plan - spending, isParent: false, parentId: `parent-${mainCat.id}` })
      })
    })
    return result
  }, [categories, budgets, categorySpending, mainCategories, selectedMonth])

  const handleSavePlan = async () => {
    const updates = Array.from(editedRows.entries()).map(([id, row]) => ({ category_id: parseInt(id.split('-')[1]), planned_amount: row.plan || 0 }))
    if (updates.length > 0) {
      try {
        for (const update of updates) {
          const existingBudget = budgets.find((b: BudgetType) => b.category_id === update.category_id && b.month.startsWith(selectedMonth))
          if (existingBudget) await updateMutation.mutateAsync({ id: existingBudget.id, payload: { ...existingBudget, planned_amount: update.planned_amount } })
          else await createMutation.mutateAsync({ asset_id: 1, category_id: update.category_id, month: selectedMonth + '-01', planned_amount: update.planned_amount })
        }
        setEditedRows(new Map())
      } catch (error) { console.error('Failed to save budgets:', error) }
    }
  }

  const handleEditPlan = (rowId: string, newValue: number) => {
    const row = rows.find((r) => r.id === rowId)
    if (!row || row.isParent) return
    const updated = new Map(editedRows)
    updated.set(rowId, { ...row, plan: newValue })
    setEditedRows(updated)
  }

  const toggleExpandParent = (parentId: string) => {
    const updated = new Set(expandedParents)
    if (updated.has(parentId)) updated.delete(parentId)
    else updated.add(parentId)
    setExpandedParents(updated)
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const getPreviousMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    let y = parseInt(year), m = parseInt(month) - 1
    if (m < 1) { m = 12; y -= 1 }
    return `${y}-${String(m).padStart(2, '0')}`
  }

  const getNextMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    let y = parseInt(year), m = parseInt(month) + 1
    if (m > 12) { m = 1; y += 1 }
    return `${y}-${String(m).padStart(2, '0')}`
  }

  const handleCopyPreviousMonthPlan = async () => {
    const previousMonth = getPreviousMonth(selectedMonth)
    const previousMonthBudgets = budgets.filter((b) => b.month.startsWith(previousMonth))
    if (previousMonthBudgets.length === 0) { alert('No budgets found for previous month'); return }
    try {
      for (const budget of previousMonthBudgets) {
        const existingBudget = budgets.find((b) => b.category_id === budget.category_id && b.month.startsWith(selectedMonth))
        if (existingBudget) await updateMutation.mutateAsync({ id: existingBudget.id, payload: { ...existingBudget, planned_amount: budget.planned_amount } })
        else await createMutation.mutateAsync({ asset_id: 1, category_id: budget.category_id, month: selectedMonth + '-01', planned_amount: budget.planned_amount })
      }
      setEditedRows(new Map())
    } catch (error) { console.error('Failed to copy previous month plan:', error) }
  }

  const handleCopyPreviousMonthSpending = async () => {
    const previousMonth = getPreviousMonth(selectedMonth)
    const previousMonthOperations = operations.filter((op) => op.creation_date?.startsWith(previousMonth))
    const spendingByCategory: Record<number, number> = {}
    previousMonthOperations.forEach((op) => {
      if (op.category_id) {
        const amount = typeof op.amount === 'number' ? op.amount : parseFloat(String(op.amount))
        spendingByCategory[op.category_id] = (spendingByCategory[op.category_id] || 0) + Math.abs(amount)
      }
    })
    if (Object.keys(spendingByCategory).length === 0) { alert('No spending found for previous month'); return }
    try {
      for (const categoryId in spendingByCategory) {
        const spending = spendingByCategory[categoryId]
        const existingBudget = budgets.find((b) => b.category_id === parseInt(categoryId) && b.month.startsWith(selectedMonth))
        if (existingBudget) await updateMutation.mutateAsync({ id: existingBudget.id, payload: { ...existingBudget, planned_amount: spending } })
        else await createMutation.mutateAsync({ asset_id: 1, category_id: parseInt(categoryId), month: selectedMonth + '-01', planned_amount: spending })
      }
      setEditedRows(new Map())
    } catch (error) { console.error('Failed to copy previous month spending:', error) }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <h1 style={{ margin: 0 }}>{t('budget.title')}</h1>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <IconButton size="small" onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}><ChevronLeftIcon /></IconButton>
          <Button variant="outlined" onClick={(e) => setCalendarAnchor(e.currentTarget)} sx={{ minWidth: '200px' }}>{getMonthName(selectedMonth)}</Button>
          <IconButton size="small" onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}><ChevronRightIcon /></IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button size="small" variant="outlined" startIcon={<FileCopyIcon />} onClick={handleCopyPreviousMonthPlan} title={t('budget.copyPlan')}>{t('budget.copyPlan')}</Button>
          <Button size="small" variant="outlined" startIcon={<FileCopyIcon />} onClick={handleCopyPreviousMonthSpending} title={t('budget.copySpending')}>{t('budget.copySpending')}</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSavePlan} disabled={editedRows.size === 0}>{t('budget.saveButton')}</Button>
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <BudgetTable rows={rows} expanded={expandedParents} onToggleExpanded={toggleExpandParent} editedRows={editedRows} onEditPlan={handleEditPlan} />
        </Grid>
        <Grid item xs={12} md={3}>
          <BudgetStatisticsBar stats={budgetStats} />
        </Grid>
      </Grid>
      
      <BudgetCalendar open={Boolean(calendarAnchor)} anchorEl={calendarAnchor} onClose={() => setCalendarAnchor(null)} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
    </Paper>
  )
}

export default Budget
