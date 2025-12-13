import React, { useMemo, useState, useEffect } from 'react'
import { Box, Button, Paper, IconButton, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import SaveIcon from '@mui/icons-material/Save'
import { useBudgetData } from '../hooks/useBudgetData'
import { getBudgetData } from '../lib/api'
import type { Category, BudgetWithCategory } from '../lib/api'
import BudgetStatisticsBar from '../components/budget/BudgetStatisticsBar'
import BudgetTable from '../components/budget/BudgetTable'
import type { BudgetRow } from '../components/budget/BudgetTable'
import BudgetCalendar from '../components/budget/BudgetCalendar'

const Budget: React.FC = () => {
  const { t } = useTranslation()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7))
  const { categoriesQuery, budgetDataQuery, updateMutation, createMutation } = useBudgetData(selectedMonth)
  
  const categories = categoriesQuery.data ?? []
  const budgetData = budgetDataQuery.data
  const budgets = budgetData?.budgets ?? []
  const spending = budgetData?.spending ?? []
  
  const [editedRows, setEditedRows] = useState<Map<string, Partial<BudgetRow>>>(new Map())
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLButtonElement | null>(null)

  // Helper to parse BigDecimal string/number to number
  const parseAmount = (amount: number | string | undefined | null): number => {
    if (amount === undefined || amount === null) return 0
    return typeof amount === 'string' ? parseFloat(amount) : amount
  }

  // Convert spending array to map for quick lookup
  const categorySpending = useMemo(() => {
    const spendingMap: Record<number, number> = {}
    spending.forEach(s => {
      spendingMap[s.category_id] = parseAmount(s.amount)
    })
    return spendingMap
  }, [spending])

  const budgetStats = useMemo(() => {
    let plannedIncome = 0, plannedExpense = 0, realIncome = 0, realExpense = 0
    
    budgets.forEach((budget: BudgetWithCategory) => {
      const plannedAmount = parseAmount(budget.planned_amount)
      const spent = categorySpending[budget.category_id] ?? 0
      
      if (budget.category_type === 'income') {
        plannedIncome += plannedAmount
        realIncome += spent
      } else {
        plannedExpense += plannedAmount
        realExpense += spent
      }
    })
    
    return {
      plannedIncome,
      plannedExpense,
      realIncome,
      realExpense,
      plannedCashFlow: plannedIncome - plannedExpense,
      realCashFlow: realIncome - realExpense
    }
  }, [budgets, categorySpending])

  const mainCategories = useMemo(() => 
    categories.filter((cat: Category) => cat.parent_id === null).sort((a: Category, b: Category) => a.id - b.id),
    [categories]
  )

  useEffect(() => {
    const parentIds = new Set<string>()
    mainCategories.forEach((cat: Category) => {
      if (categories.filter((c: Category) => c.parent_id === cat.id).length > 0) {
        parentIds.add(`parent-${cat.id}`)
      }
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
        const budget = budgets.find((b: BudgetWithCategory) => b.category_id === subCat.id)
        const plan = parseAmount(budget?.planned_amount)
        const spending = categorySpending[subCat.id] ?? 0
        mainCatPlan += plan
        mainCatSpending += spending
      })
      
      result.push({
        id: `parent-${mainCat.id}`,
        category_name: mainCat.name,
        plan: mainCatPlan,
        spending: mainCatSpending,
        remaining: mainCatPlan - mainCatSpending,
        isParent: true,
        parentId: undefined
      })
      
      subCategories.sort((a: Category, b: Category) => a.id - b.id).forEach((subCat: Category) => {
        const budget = budgets.find((b: BudgetWithCategory) => b.category_id === subCat.id)
        const plan = parseAmount(budget?.planned_amount)
        const spending = categorySpending[subCat.id] ?? 0
        result.push({
          id: `sub-${subCat.id}`,
          category_id: subCat.id,
          category_name: subCat.name,
          plan,
          spending,
          remaining: plan - spending,
          isParent: false,
          parentId: `parent-${mainCat.id}`
        })
      })
    })
    return result
  }, [categories, budgets, categorySpending, mainCategories])

  const handleSavePlan = async () => {
    const updates = Array.from(editedRows.entries()).map(([id, row]) => ({ 
      category_id: parseInt(id.split('-')[1]), 
      planned_amount: row.plan || 0 
    }))
    
    if (updates.length > 0) {
      try {
        for (const update of updates) {
          const existingBudget = budgets.find((b: BudgetWithCategory) => b.category_id === update.category_id)
          if (existingBudget) {
            await updateMutation.mutateAsync({ 
              id: existingBudget.id, 
              payload: { 
                asset_id: existingBudget.asset_id,
                category_id: existingBudget.category_id,
                month: existingBudget.month,
                planned_amount: update.planned_amount 
              } 
            })
          } else {
            await createMutation.mutateAsync({ 
              asset_id: 1, 
              category_id: update.category_id, 
              month: selectedMonth + '-01', 
              planned_amount: update.planned_amount 
            })
          }
        }
        setEditedRows(new Map())
      } catch (error) { 
        console.error('Failed to save budgets:', error) 
      }
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
    try {
      // Fetch previous month's budget data
      const previousMonthData = await getBudgetData(previousMonth)
      if (previousMonthData.budgets.length === 0) { 
        alert('No budgets found for previous month')
        return 
      }
      
      for (const prevBudget of previousMonthData.budgets) {
        const existingBudget = budgets.find((b) => b.category_id === prevBudget.category_id)
        const plannedAmount = parseAmount(prevBudget.planned_amount)
        
        if (existingBudget) {
          await updateMutation.mutateAsync({ 
            id: existingBudget.id, 
            payload: { 
              asset_id: existingBudget.asset_id,
              category_id: existingBudget.category_id,
              month: existingBudget.month,
              planned_amount: plannedAmount 
            } 
          })
        } else {
          await createMutation.mutateAsync({ 
            asset_id: 1, 
            category_id: prevBudget.category_id, 
            month: selectedMonth + '-01', 
            planned_amount: plannedAmount 
          })
        }
      }
      setEditedRows(new Map())
    } catch (error) { 
      console.error('Failed to copy previous month plan:', error) 
    }
  }

  const handleCopyPreviousMonthSpending = async () => {
    const previousMonth = getPreviousMonth(selectedMonth)
    try {
      // Fetch previous month's spending data
      const previousMonthData = await getBudgetData(previousMonth)
      if (previousMonthData.spending.length === 0) { 
        alert('No spending found for previous month')
        return 
      }
      
      for (const spending of previousMonthData.spending) {
        const spendingAmount = parseAmount(spending.amount)
        const existingBudget = budgets.find((b) => b.category_id === spending.category_id)
        
        if (existingBudget) {
          await updateMutation.mutateAsync({ 
            id: existingBudget.id, 
            payload: { 
              asset_id: existingBudget.asset_id,
              category_id: existingBudget.category_id,
              month: existingBudget.month,
              planned_amount: spendingAmount 
            } 
          })
        } else {
          await createMutation.mutateAsync({ 
            asset_id: 1, 
            category_id: spending.category_id, 
            month: selectedMonth + '-01', 
            planned_amount: spendingAmount 
          })
        }
      }
      setEditedRows(new Map())
    } catch (error) { 
      console.error('Failed to copy previous month spending:', error) 
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h4">{t('budget.title')}</Typography>
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
