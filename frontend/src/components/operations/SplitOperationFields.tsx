import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  Paper,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CalcTextField from '../common/ui/CalcTextField'
import type { SplitItem, Category } from '../../lib/api'

interface SplitOperationFieldsProps {
  splitItems: SplitItem[]
  onSplitItemsChange: (items: SplitItem[]) => void
  subcategoriesForAutocomplete: Array<Category & { group: string }>
  totalAmount: string
  loading?: boolean
}

const SplitOperationFields: React.FC<SplitOperationFieldsProps> = ({
  splitItems,
  onSplitItemsChange,
  subcategoriesForAutocomplete,
  totalAmount,
  loading = false,
}) => {
  const { t } = useTranslation()

  const handleAddSplit = () => {
    onSplitItemsChange([...splitItems, { category_id: 0, amount: 0, description: '' }])
  }

  const handleRemoveSplit = (index: number) => {
    if (splitItems.length > 1) {
      onSplitItemsChange(splitItems.filter((_, i) => i !== index))
    }
  }

  const handleSplitChange = (index: number, field: keyof SplitItem, value: any) => {
    const updated = [...splitItems]
    updated[index] = { ...updated[index], [field]: value }
    onSplitItemsChange(updated)
  }

  const splitSum = splitItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalVal = Number(totalAmount) || 0
  const remaining = totalVal - splitSum

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: '100%',
        maxHeight: '600px',
        overflow: 'auto',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        {t('operations.splitItems') ?? 'Pozycje podziału'}
        {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Typography>

      <Stack spacing={2}>
        {splitItems.map((item, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              bgcolor: (theme) => theme.palette.background.paper,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ minWidth: 30 }}>
                  #{index + 1}
                </Typography>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={subcategoriesForAutocomplete}
                  groupBy={(option) => option.group}
                  getOptionLabel={(option) => option.name}
                  value={subcategoriesForAutocomplete.find((c) => c.id === item.category_id) || null}
                  onChange={(_, newValue) => {
                    handleSplitChange(index, 'category_id', newValue ? newValue.id : 0)
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('operations.fields.category') ?? 'Kategoria'}
                      size="small"
                      required
                    />
                  )}
                  noOptionsText={t('operations.filters.none') ?? 'Brak'}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSplit(index)}
                  disabled={splitItems.length <= 1}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>

              <CalcTextField
                value={String(item.amount || '')}
                onChange={(val) => handleSplitChange(index, 'amount', Number(val) || 0)}
                label={t('operations.fields.amount') ?? 'Kwota'}
                size="small"
                fullWidth
                required
              />

              <TextField
                value={item.description || ''}
                onChange={(e) => handleSplitChange(index, 'description', e.target.value)}
                label={t('operations.fields.description') ?? 'Opis'}
                size="small"
                fullWidth
                multiline
                rows={2}
              />
            </Stack>
          </Paper>
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddSplit} variant="outlined" size="small">
          {t('operations.addItem') ?? 'Dodaj pozycję'}
        </Button>

        <Divider />

        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2">{t('operations.split.total') ?? 'Suma całkowita'}:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {totalVal.toFixed(2)} zł
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2">{t('operations.split.splitSum') ?? 'Suma podziału'}:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {splitSum.toFixed(2)} zł
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color={remaining === 0 ? 'success.main' : 'error.main'}>
              {t('operations.split.remaining') ?? 'Pozostało'}:
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={remaining === 0 ? 'success.main' : 'error.main'}>
              {remaining.toFixed(2)} zł
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default SplitOperationFields
