import React from 'react'
import { type OperationType } from '../lib/api'
import type { Operation as APIOperation } from '../lib/api'
import { useOperations } from '../hooks/useOperations'
import { useAccountsData } from '../hooks/useAccountsData'
import { useCategories } from '../hooks/useCategories'
import { useHashtags } from '../hooks/useHashtags'
import AddOperationModal from '../components/AddOperationModal'
import { Typography, Paper, Box, IconButton, Button, TextField, Stack, MenuItem, Select, FormControl, InputLabel, Chip, Checkbox, ListItemText } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { useTranslation } from 'react-i18next'

function computeStartDate(preset: string): Date | null {
  const now = new Date()
  switch (preset) {
    case 'last7': return new Date(new Date().setDate(now.getDate() - 7))
    case 'last30': return new Date(new Date().setDate(now.getDate() - 30))
    case 'thisMonth': return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'thisQuarter': return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    case 'thisYear': return new Date(now.getFullYear(), 0, 1)
    case 'prevYear': return new Date(now.getFullYear() - 1, 0, 1)
    default: return null
  }
}

const Operations: React.FC = () => {
  const { t } = useTranslation()
  const { operationsQuery, deleteMutation } = useOperations()
  const { accountsQuery } = useAccountsData()
  const { categoriesQuery } = useCategories()
  const { hashtags } = useHashtags()

  const operations = operationsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<APIOperation | null>(null)
  const [datePreset, setDatePreset] = React.useState<string>('thisMonth')
  const [customDateFrom, setCustomDateFrom] = React.useState<string>('')
  const [customDateTo, setCustomDateTo] = React.useState<string>('')
  const [filterAccountIds, setFilterAccountIds] = React.useState<number[]>([])
  const [filterCategoryIds, setFilterCategoryIds] = React.useState<number[]>([])
  const [filterOperationType, setFilterOperationType] = React.useState<OperationType | ''>('')
  const [filterHashtagIds, setFilterHashtagIds] = React.useState<number[]>([])

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (op: APIOperation) => { setEditing(op); setModalOpen(true) }

  // Grupowanie kategorii - główne i podkategorie
  const mainCategories = React.useMemo(() => 
    categories.filter(c => c.parent_id === null),
    [categories]
  )
  
  const getSubcategories = React.useCallback((parentId: number) => 
    categories.filter(c => c.parent_id === parentId),
    [categories]
  )

  // Handler dla zaznaczania głównej kategorii razem z podkategoriami
  const handleCategoryChange = React.useCallback((e: any) => {
    const newValue = typeof e.target.value === 'string' ? [] : e.target.value
    const selectedId = newValue.find((id: number) => !filterCategoryIds.includes(id))
    
    // Jeśli zaznaczono główną kategorię
    if (selectedId !== undefined) {
      const mainCat = categories.find(c => c.id === selectedId && c.parent_id === null)
      if (mainCat) {
        const subcats = getSubcategories(mainCat.id).map(c => c.id)
        setFilterCategoryIds([...new Set([...newValue, ...subcats])])
        return
      }
    }
    
    setFilterCategoryIds(newValue)
  }, [filterCategoryIds, categories, getSubcategories])

  const datePresets = React.useMemo(() => [
    { key: 'all', label: t('operations.dateFilter.all') ?? 'Wszystko' },
    { key: 'last7', label: t('operations.dateFilter.last7') ?? 'Ostatnie 7 dni' },
    { key: 'last30', label: t('operations.dateFilter.last30') ?? 'Ostatnie 30 dni' },
    { key: 'thisMonth', label: t('operations.dateFilter.thisMonth') ?? 'Obecny miesiąc' },
    { key: 'thisQuarter', label: t('operations.dateFilter.thisQuarter') ?? 'Obecny kwartał' },
    { key: 'thisYear', label: t('operations.dateFilter.thisYear') ?? 'Obecny rok' },
    { key: 'prevYear', label: t('operations.dateFilter.prevYear') ?? 'Poprzedni rok' },
    { key: 'planned', label: t('operations.dateFilter.planned') ?? 'Operacje zaplanowane' },
    { key: 'custom', label: t('operations.dateFilter.custom') ?? 'Zakres niestandardowy' },
  ], [t])

  const rows = React.useMemo(() => operations.map(o => ({ id: o.id, operation_date: o.operation_date ?? '', amount: o.amount, description: o.description ?? '', asset_id: o.asset_id, category_id: o.category_id, operation_type: o.operation_type })), [operations])

  const filteredRows = React.useMemo(() => {
    let filtered = rows
    let start: Date | null = null, end: Date | null = null
    
    if (datePreset === 'planned') {
      // Show only future operations
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter(r => {
        if (!r.operation_date) return false
        const d = new Date(r.operation_date)
        d.setHours(0, 0, 0, 0)
        return d > today
      })
    } else if (datePreset === 'custom') {
      if (customDateFrom) start = new Date(customDateFrom)
      if (customDateTo) end = new Date(customDateTo)
    } else {
      start = computeStartDate(datePreset)
      end = new Date()
      if (datePreset === 'prevYear') {
        const y = new Date().getFullYear() - 1
        start = new Date(y, 0, 1)
        end = new Date(y, 11, 31, 23, 59, 59)
      }
    }
    
    if ((start || end) && datePreset !== 'planned') {
      filtered = filtered.filter(r => {
        if (!r.operation_date) return false
        const d = new Date(r.operation_date).getTime()
        if (start && d < start.getTime()) return false
        if (end && d > end.getTime()) return false
        return true
      })
    }
    if (filterAccountIds.length > 0) filtered = filtered.filter(r => filterAccountIds.includes(r.asset_id))
    if (filterCategoryIds.length > 0) filtered = filtered.filter(r => r.category_id && filterCategoryIds.includes(r.category_id))
    if (filterOperationType !== '') filtered = filtered.filter(r => r.operation_type === filterOperationType)
    if (filterHashtagIds.length > 0) {
      const selectedHashtagNames = hashtags
        .filter(h => filterHashtagIds.includes(h.id))
        .map(h => h.name)
      filtered = filtered.filter(r => {
        const description = r.description?.toLowerCase() || ''
        return selectedHashtagNames.some(tag => description.includes(`#${tag.toLowerCase()}`))
      })
    }
    return filtered
  }, [rows, datePreset, customDateFrom, customDateTo, filterAccountIds, filterCategoryIds, filterOperationType, filterHashtagIds, hashtags])

  const columns: GridColDef[] = [
    { field: 'operation_date', headerName: t('operations.fields.date'), width: 150, valueGetter: (p: any) => p.row.operation_date ? new Date(p.row.operation_date).toLocaleString() : '', sortable: true },
    { field: 'account_id', headerName: t('operations.fields.account'), width: 180, valueGetter: (p: any) => accounts.find(a => a.id === p.row.asset_id)?.name ?? '' },
    { field: 'amount', headerName: t('operations.fields.amount'), width: 120 },
    { field: 'description', headerName: t('operations.fields.description'), flex: 1 },
    { field: 'category_id', headerName: t('operations.fields.category'), width: 180, valueGetter: (p: any) => categories.find(c => c.id === p.row.category_id)?.name ?? '' },
    { field: 'operation_type', headerName: t('operations.fields.type'), width: 160, valueGetter: (p: any) => p.row.operation_type },
    { field: 'actions', headerName: '', width: 120, sortable: false, filterable: false, renderCell: (params: GridRenderCellParams<any>) => {
      const id = params.row.id as number
      const op = operations.find(o => o.id === id)
      return (<div>
        <IconButton size="small" onClick={() => op && openEdit(op)}><EditIcon /></IconButton>
        <IconButton size="small" onClick={() => { if (confirm(t('operations.confirmSingle') ?? 'Usuń operację?')) deleteMutation.mutate(id) }}><DeleteIcon /></IconButton>
      </div>)
    } }
  ]

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{t('operations.title') ?? 'Operacje'}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>{t('operations.add') ?? 'Dodaj operację'}</Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('operations.dateFilter.label') ?? 'Zakres czasu'}</InputLabel>
              <Select value={datePreset} onChange={e => setDatePreset(e.target.value)} label={t('operations.dateFilter.label') ?? 'Zakres czasu'}>
                {datePresets.map(p => (<MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>))}
              </Select>
            </FormControl>

            {datePreset === 'custom' && (
              <>
                <TextField label={t('operations.dateFilter.from') ?? 'Od'} type="date" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
                <TextField label={t('operations.dateFilter.to') ?? 'Do'} type="date" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
              </>
            )}

            <FormControl sx={{ width: 200, flex: '0 0 auto' }}>
              <InputLabel>{t('operations.fields.account') ?? 'Konto'}</InputLabel>
              <Select 
                multiple
                value={filterAccountIds} 
                onChange={e => setFilterAccountIds(typeof e.target.value === 'string' ? [] : e.target.value)}
                label={t('operations.fields.account') ?? 'Konto'}
                renderValue={(selected) => {
                  if (selected.length === 0) return <em>{t('operations.filters.all') ?? 'Wszystkie'}</em>
                  if (selected.length <= 2) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
                        {selected.map((id) => (
                          <Chip key={id} label={accounts.find(a => a.id === id)?.name || id} size="small" />
                        ))}
                      </Box>
                    )
                  }
                  return <Chip label={`${selected.length} ${t('operations.filters.selected') ?? 'wybrane'} ...`} size="small" />
                }}
              >
                {accounts.filter(a => !a.is_closed).map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    <Checkbox checked={filterAccountIds.includes(a.id)} />
                    <ListItemText primary={a.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: 200, flex: '0 0 auto' }}>
              <InputLabel>{t('operations.fields.category') ?? 'Kategoria'}</InputLabel>
              <Select 
                multiple
                value={filterCategoryIds} 
                onChange={handleCategoryChange}
                label={t('operations.fields.category') ?? 'Kategoria'}
                renderValue={(selected) => {
                  if (selected.length === 0) return <em>{t('operations.filters.all') ?? 'Wszystkie'}</em>
                  if (selected.length <= 2) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
                        {selected.map((id) => (
                          <Chip key={id} label={categories.find(c => c.id === id)?.name || id} size="small" />
                        ))}
                      </Box>
                    )
                  }
                  return <Chip label={`${selected.length} ${t('operations.filters.selected') ?? 'wybrane'} ...`} size="small" />
                }}
              >
                {mainCategories.map(mainCat => (
                  <React.Fragment key={mainCat.id}>
                    <MenuItem value={mainCat.id} onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryChange({target: {value: filterCategoryIds.includes(mainCat.id) 
                        ? filterCategoryIds.filter(id => id !== mainCat.id && !getSubcategories(mainCat.id).map(c => c.id).includes(id))
                        : [...filterCategoryIds, mainCat.id, ...getSubcategories(mainCat.id).map(c => c.id)]
                      }})
                    }}>
                      <Checkbox 
                        checked={filterCategoryIds.includes(mainCat.id)} 
                        indeterminate={getSubcategories(mainCat.id).some(c => filterCategoryIds.includes(c.id)) && !getSubcategories(mainCat.id).every(c => filterCategoryIds.includes(c.id))}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <ListItemText primary={<strong>{mainCat.name}</strong>} />
                    </MenuItem>
                    {getSubcategories(mainCat.id).map(subCat => (
                      <MenuItem key={subCat.id} value={subCat.id} sx={{ pl: 4 }} onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryChange({target: {value: filterCategoryIds.includes(subCat.id)
                          ? filterCategoryIds.filter(id => id !== subCat.id)
                          : [...filterCategoryIds, subCat.id]
                        }})
                      }}>
                        <Checkbox 
                          checked={filterCategoryIds.includes(subCat.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ListItemText primary={subCat.name} />
                      </MenuItem>
                    ))}
                  </React.Fragment>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>{t('operations.fields.type') ?? 'Typ'}</InputLabel>
              <Select value={filterOperationType} onChange={e => setFilterOperationType(e.target.value as OperationType | '')} label={t('operations.fields.type') ?? 'Typ'}>
                <MenuItem value=""><em>{t('operations.filters.all') ?? 'Wszystkie'}</em></MenuItem>
                <MenuItem value="income">{t('operations.type.income') ?? 'Przychód'}</MenuItem>
                <MenuItem value="expense">{t('operations.type.expense') ?? 'Wydatek'}</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: 200, flex: '0 0 auto' }}>
              <InputLabel>{t('operations.fields.hashtags') ?? 'Hashtagi'}</InputLabel>
              <Select 
                multiple
                value={filterHashtagIds} 
                onChange={e => setFilterHashtagIds(typeof e.target.value === 'string' ? [] : e.target.value)}
                label={t('operations.fields.hashtags') ?? 'Hashtagi'}
                renderValue={(selected) => {
                  if (selected.length === 0) return <em>{t('operations.filters.all') ?? 'Wszystkie'}</em>
                  if (selected.length <= 2) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
                        {selected.map((id) => (
                          <Chip key={id} label={`#${hashtags.find(h => h.id === id)?.name || id}`} size="small" />
                        ))}
                      </Box>
                    )
                  }
                  return <Chip label={`${selected.length} ${t('operations.filters.selected') ?? 'wybrane'} ...`} size="small" />
                }}
              >
                {hashtags.map(h => (
                  <MenuItem key={h.id} value={h.id}>
                    <Checkbox checked={filterHashtagIds.includes(h.id)} />
                    <ListItemText primary={`#${h.name}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="body2" color="text.secondary">{t('operations.summary.totalIncome') ?? 'Przychody'}</Typography>
            <Typography variant="h6" sx={{ color: 'success.main' }}>
              {filteredRows.filter(r => r.operation_type === 'income').reduce((sum, r) => sum + r.amount, 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{t('operations.summary.totalExpense') ?? 'Wydatki'}</Typography>
            <Typography variant="h6" sx={{ color: 'error.main' }}>
              {filteredRows.filter(r => r.operation_type === 'expense').reduce((sum, r) => sum + r.amount, 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{t('operations.summary.net') ?? 'Saldo'}</Typography>
            <Typography variant="h6">
              {(filteredRows.filter(r => r.operation_type === 'income').reduce((sum, r) => sum + r.amount, 0) - filteredRows.filter(r => r.operation_type === 'expense').reduce((sum, r) => sum + r.amount, 0)).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ height: 500 }}>
        <DataGrid rows={filteredRows} columns={columns} pageSizeOptions={[10, 25, 50]} />
      </Box>

      <AddOperationModal open={modalOpen} onClose={() => setModalOpen(false)} accounts={accounts} categories={categories} editing={editing} />
    </Paper>
  )
}

export default Operations
