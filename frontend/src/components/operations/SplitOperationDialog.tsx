import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Alert,
  MenuItem,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import type { Operation, SplitItem, Category } from '../../lib/api'
import CalcTextField from '../common/CalcTextField'

type SplitOperationDialogProps = {
  open: boolean
  operation: Operation | null
  categories: Category[]
  onClose: () => void
  onSplit: (items: SplitItem[]) => void
}

type SplitItemInput = {
  id: string
  category_id: number | ''
  amount: string
  description: string
}

export default function SplitOperationDialog({
  open,
  operation,
  categories,
  onClose,
  onSplit,
}: SplitOperationDialogProps) {
  const { t } = useTranslation()
  const [items, setItems] = useState<SplitItemInput[]>([
    { id: crypto.randomUUID(), category_id: '', amount: '', description: '' },
    { id: crypto.randomUUID(), category_id: '', amount: '', description: '' },
  ])

  const parentAmount = useMemo(() => {
    if (!operation) return 0
    return typeof operation.amount === 'string' 
      ? parseFloat(operation.amount) 
      : operation.amount
  }, [operation])

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0
      return sum + amount
    }, 0)
  }, [items])

  const remaining = useMemo(() => {
    return parentAmount - totalAmount
  }, [parentAmount, totalAmount])

  const isValid = useMemo(() => {
    // All items must have category and amount
    const allFilled = items.every(
      (item) => item.category_id !== '' && item.amount !== '' && parseFloat(item.amount) > 0
    )
    // Remaining must be close to 0 (tolerance ±0.01)
    const sumMatches = Math.abs(remaining) < 0.01
    // Minimum 2 items
    const enoughItems = items.length >= 2
    
    return allFilled && sumMatches && enoughItems
  }, [items, remaining])

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), category_id: '', amount: '', description: '' },
    ])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length <= 2) return // Minimum 2 items
    setItems(items.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof SplitItemInput, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSubmit = () => {
    if (!isValid) return

    const splitItems: SplitItem[] = items.map((item) => ({
      category_id: item.category_id as number,
      amount: parseFloat(item.amount),
      description: item.description || null,
    }))

    onSplit(splitItems)
    handleClose()
  }

  const handleClose = () => {
    // Reset form
    setItems([
      { id: crypto.randomUUID(), category_id: '', amount: '', description: '' },
      { id: crypto.randomUUID(), category_id: '', amount: '', description: '' },
    ])
    onClose()
  }

  if (!operation) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('operations.splitOperation')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('operations.originalOperation')}: {operation.description || '-'}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {t('operations.totalAmount')}: {parentAmount.toFixed(2)} zł
          </Typography>
        </Box>

        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              gap: 1,
              mb: 2,
              alignItems: 'flex-start',
            }}
          >
            <TextField
              select
              label={t('operations.category')}
              value={item.category_id}
              onChange={(e) => handleItemChange(item.id, 'category_id', parseInt(e.target.value))}
              size="small"
              sx={{ minWidth: 200 }}
              required
            >
              {categories.map((cat) => {
                const parentCat = cat.parent_id ? categories.find(c => c.id === cat.parent_id) : null
                const label = parentCat ? `${parentCat.name} → ${cat.name}` : cat.name
                return (
                  <MenuItem key={cat.id} value={cat.id}>
                    {label}
                  </MenuItem>
                )
              })}
            </TextField>

            <CalcTextField
              label={t('operations.amount')}
              value={item.amount}
              onChange={(val) => handleItemChange(item.id, 'amount', val)}
              size="small"
              sx={{ width: 120 }}
              required
            />

            <TextField
              label={t('operations.description')}
              value={item.description}
              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />

            <IconButton
              onClick={() => handleRemoveItem(item.id)}
              disabled={items.length <= 2}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        >
          {t('operations.addItem')}
        </Button>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2">
            {t('operations.allocated')}: {totalAmount.toFixed(2)} zł
          </Typography>
          <Typography
            variant="h6"
            color={Math.abs(remaining) < 0.01 ? 'success.main' : 'error.main'}
          >
            {t('operations.remaining')}: {remaining.toFixed(2)} zł
          </Typography>
        </Box>

        {!isValid && items.every(item => item.category_id !== '' && item.amount !== '') && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {Math.abs(remaining) >= 0.01 
              ? t('operations.sumMustMatch')
              : t('operations.fillAllFields')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>
          {t('operations.split')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
