import React, { useState } from 'react'
import {
  Paper,
  Stack,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { useTranslation } from 'react-i18next'
import { useRecurringOperations, type RecurringOperation } from '../hooks/useRecurringOperations'
import { useAccountsData } from '../hooks/useAccountsData'
import { useCategories } from '../hooks/useCategories'
import { useNotifier } from '../components/Notifier'

const RecurringOperations: React.FC = () => {
  const { t } = useTranslation()
  const notifier = useNotifier()
  const { query, createMutation, updateMutation, deleteMutation } = useRecurringOperations()
  const { accountsQuery } = useAccountsData()
  const { categoriesQuery } = useCategories()

  const recurringOps = query.data ?? []
  const accounts = accountsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringOperation | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [operationType, setOperationType] = useState<'income' | 'expense'>('expense')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  const handleOpenNew = () => {
    setEditing(null)
    setDescription('')
    setAmount('')
    setAccountId('')
    setCategoryId('')
    setOperationType('expense')
    setFrequency('monthly')
    setStartDate('')
    setEndDate('')
    setIsActive(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (op: RecurringOperation) => {
    setEditing(op)
    setDescription(op.description || '')
    setAmount(String(op.amount))
    setAccountId(op.asset_id)
    setCategoryId(op.category_id || '')
    setOperationType(op.operation_type as 'income' | 'expense')
    setFrequency(op.frequency as any)
    setStartDate(op.start_date)
    setEndDate(op.end_date || '')
    setIsActive(op.is_active)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!accountId || !amount || !startDate || !frequency) {
      notifier.notify(t('recurringOperations.messages.fillRequired') ?? 'Fill all required fields', 'error')
      return
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: {
            description: description || undefined,
            amount: Number(amount),
            category_id: categoryId === '' ? undefined : Number(categoryId),
            end_date: endDate || undefined,
            is_active: isActive,
          },
        })
        notifier.notify(t('recurringOperations.messages.updated') ?? 'Updated', 'success')
      } else {
        await createMutation.mutateAsync({
          asset_id: Number(accountId),
          amount: Number(amount),
          description: description || undefined,
          category_id: categoryId === '' ? undefined : Number(categoryId),
          operation_type: operationType,
          frequency,
          start_date: startDate,
          end_date: endDate || undefined,
        })
        notifier.notify(t('recurringOperations.messages.created') ?? 'Created', 'success')
      }
      setModalOpen(false)
    } catch (e: any) {
      notifier.notify(String(e), 'error')
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget !== null) {
      try {
        await deleteMutation.mutateAsync(deleteTarget)
        notifier.notify(t('recurringOperations.messages.deleted') ?? 'Deleted', 'success')
        setDeleteConfirmOpen(false)
        setDeleteTarget(null)
      } catch (e: any) {
        notifier.notify(String(e), 'error')
      }
    }
  }

  const frequencies = [
    { key: 'daily', label: t('recurringOperations.frequency.daily') ?? 'Daily' },
    { key: 'weekly', label: t('recurringOperations.frequency.weekly') ?? 'Weekly' },
    { key: 'biweekly', label: t('recurringOperations.frequency.biweekly') ?? 'Bi-weekly' },
    { key: 'monthly', label: t('recurringOperations.frequency.monthly') ?? 'Monthly' },
    { key: 'quarterly', label: t('recurringOperations.frequency.quarterly') ?? 'Quarterly' },
    { key: 'yearly', label: t('recurringOperations.frequency.yearly') ?? 'Yearly' },
  ]

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{t('recurringOperations.title') ?? 'Recurring Operations'}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          {t('recurringOperations.add') ?? 'Add Recurring'}
        </Button>
      </Box>

      {recurringOps.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>{t('recurringOperations.table.description') ?? 'Description'}</TableCell>
              <TableCell>{t('recurringOperations.table.account') ?? 'Account'}</TableCell>
              <TableCell align="right">{t('recurringOperations.table.amount') ?? 'Amount'}</TableCell>
              <TableCell>{t('recurringOperations.table.type') ?? 'Type'}</TableCell>
              <TableCell>{t('recurringOperations.table.frequency') ?? 'Frequency'}</TableCell>
              <TableCell>{t('recurringOperations.table.startDate') ?? 'Start Date'}</TableCell>
              <TableCell>{t('recurringOperations.table.endDate') ?? 'End Date'}</TableCell>
              <TableCell>{t('recurringOperations.table.status') ?? 'Status'}</TableCell>
              <TableCell align="right">{t('recurringOperations.table.actions') ?? 'Actions'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurringOps.map((op) => (
              <TableRow key={op.id}>
                <TableCell>{op.description || '-'}</TableCell>
                <TableCell>{accounts.find(a => a.id === op.asset_id)?.name ?? '-'}</TableCell>
                <TableCell align="right">{op.amount.toFixed(2)} zł</TableCell>
                <TableCell>
                  <Chip
                    label={op.operation_type === 'income' ? t('operations.type.income') : t('operations.type.expense')}
                    color={op.operation_type === 'income' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {frequencies.find(f => f.key === op.frequency)?.label ?? op.frequency}
                </TableCell>
                <TableCell>{new Date(op.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{op.end_date ? new Date(op.end_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={op.is_active ? 'Active' : 'Inactive'}
                    color={op.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenEdit(op)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(op.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" sx={{ color: '#999', p: 2, textAlign: 'center' }}>
          {t('recurringOperations.empty') ?? 'No recurring operations yet'}
        </Typography>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing
            ? t('recurringOperations.edit') ?? 'Edit Recurring'
            : t('recurringOperations.add') ?? 'Add Recurring Operation'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label={t('recurringOperations.fields.description') ?? 'Description'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>{t('recurringOperations.fields.account') ?? 'Account'}</InputLabel>
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value as number)}
                label={t('recurringOperations.fields.account') ?? 'Account'}
              >
                {accounts.filter(a => !a.is_closed).map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('recurringOperations.fields.amount') ?? 'Amount'}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              inputProps={{ step: '0.01' }}
            />

            <FormControl fullWidth>
              <InputLabel>{t('recurringOperations.fields.category') ?? 'Category'}</InputLabel>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as number | '')}
                label={t('recurringOperations.fields.category') ?? 'Category'}
              >
                <MenuItem value="">{t('operations.filters.none') ?? 'None'}</MenuItem>
                {categories
                  .filter(c => c.parent_id !== null)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {categories.find(cat => cat.id === c.parent_id)?.name} → {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {!editing && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={operationType === 'income'}
                      onChange={(e) => setOperationType(e.target.checked ? 'income' : 'expense')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {operationType === 'income' ? t('operations.type.income') : t('operations.type.expense')}
                      </Typography>
                      <Chip
                        label={operationType === 'income' ? '✅ Income' : '💔 Expense'}
                        color={operationType === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  }
                  sx={{ mb: 1 }}
                />

                <FormControl fullWidth>
                  <InputLabel>{t('recurringOperations.fields.frequency') ?? 'Frequency'}</InputLabel>
                  <Select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    label={t('recurringOperations.fields.frequency') ?? 'Frequency'}
                  >
                    {frequencies.map((f) => (
                      <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label={t('recurringOperations.fields.startDate') ?? 'Start Date'}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            <TextField
              label={t('recurringOperations.fields.endDate') ?? 'End Date (optional)'}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>{t('common.cancel') ?? 'Cancel'}</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {t('common.save') ?? 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('recurringOperations.confirmDelete') ?? 'Delete recurring operation?'}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('common.cancel') ?? 'Cancel'}</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            {t('common.delete') ?? 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default RecurringOperations
