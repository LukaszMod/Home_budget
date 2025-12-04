import React, { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOperation,
  type Operation as APIOperation,
  type CreateOperationPayload,
  type OperationType,
  type Account,
  type Category,
} from '../lib/api'
import { useNotifier } from './Notifier'
import StyledModal from './StyledModal'
import TextFieldWithHashtagSuggestions from './TextFieldWithHashtagSuggestions'
import { useHashtags } from '../hooks/useHashtags'
import {
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Autocomplete,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface AddOperationModalProps {
  open: boolean
  onClose: () => void
  accounts: Account[]
  categories: Category[]
  editing?: APIOperation | null
}

interface FormData {
  operationDate: string
  amount: string
  description: string
  accountId: number | ''
  categoryId: number | ''
  operationType: OperationType | ''
}

const AddOperationModal: React.FC<AddOperationModalProps> = ({
  open,
  onClose,
  accounts,
  categories,
  editing,
}) => {
  const qc = useQueryClient()
  const notifier = useNotifier()
  const { t } = useTranslation()
  const { hashtags } = useHashtags()

  // Debug log
  React.useEffect(() => {
    console.log('AddOperationModal - hashtags from hook:', hashtags)
  }, [hashtags])

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      operationDate: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      accountId: '',
      categoryId: '',
      operationType: '',
    },
  })

  const watchedDate = watch('operationDate')
  const isPlanned = React.useMemo(() => {
    if (!watchedDate) return false
    const selectedDate = new Date(watchedDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate > today
  }, [watchedDate])

  const createMut = useMutation<APIOperation, Error, CreateOperationPayload>({
    mutationFn: (p) => createOperation(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      qc.invalidateQueries({ queryKey: ['hashtags'] })
    },
  })

  // Obserwuj zmianę categoryId aby automatycznie ustawić typ
  const watchedCategoryId = watch('categoryId')

  // Kategorie główne (parent_id === null)
  const mainCategories = useMemo(
    () => categories.filter(c => c.parent_id === null),
    [categories]
  )

  // Mapa: parent_id -> [subkategorie]
  const subcategoriesByParent = useMemo(() => {
    const map = new Map<number, Category[]>()
    mainCategories.forEach(main => {
      map.set(main.id, categories.filter(c => c.parent_id === main.id))
    })
    return map
  }, [mainCategories, categories])

  // Subkategorie z grupy (format: { id, name, group: mainCat.name })
  const subcategoriesForAutocomplete = useMemo(() => {
    const result: Array<Category & { group: string }> = []
    mainCategories.forEach((mainCat) => {
      const subs = subcategoriesByParent.get(mainCat.id) || []
      subs.forEach((sub: Category) => {
        result.push({ ...sub, group: mainCat.name })
      })
    })
    return result
  }, [mainCategories, subcategoriesByParent])

  // Auto-ustaw typ na podstawie wybranej subkategorii
  React.useEffect(() => {
    if (watchedCategoryId) {
      const selectedCategory = categories.find(c => c.id === watchedCategoryId)
      if (selectedCategory && selectedCategory.type) {
        setValue('operationType', selectedCategory.type as OperationType)
      }
    }
  }, [watchedCategoryId, categories, setValue])

  React.useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  React.useEffect(() => {
    if (editing) {
      reset({
        operationDate: editing.operation_date ?? new Date().toISOString().split('T')[0],
        amount: String(editing.amount),
        description: editing.description ?? '',
        accountId: editing.asset_id ?? '',
        categoryId: editing.category_id ?? '',
        operationType: editing.operation_type ?? '',
      })
    }
  }, [editing, reset])

  const handleSave = async (data: FormData, keepOpen = false) => {
    // Walidacja
    if (!data.accountId || !data.amount) {
      return notifier.notify(
        t('operations.messages.fillRequired') ?? 'Uzupełnij wymagane pola',
        'error'
      )
    }

    const payload: CreateOperationPayload = {
      asset_id: Number(data.accountId),
      amount: Number(data.amount),
      description: data.description || null,
      category_id: data.categoryId === '' ? null : Number(data.categoryId),
      operation_type: (data.operationType as OperationType) || 'expense',
      operation_date: data.operationDate || new Date().toISOString().split('T')[0],
    }

    try {
      await createMut.mutateAsync(payload)
      notifier.notify(
        t('operations.messages.saved') ?? 'Operacja zapisana',
        'success'
      )
      if (!keepOpen) {
        onClose()
      } else {
        reset({
          operationDate: new Date().toISOString().split('T')[0],
          amount: '',
          description: '',
          accountId: '',
          categoryId: '',
          operationType: '',
        })
      }
    } catch (e: any) {
      notifier.notify(String(e), 'error')
    }
  }

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={
        editing
          ? t('operations.edit') ?? 'Edytuj operację'
          : t('operations.add') ?? 'Dodaj operację'
      }
    >
      <form onSubmit={handleSubmit((data) => handleSave(data, false))}>
        <Stack spacing={2}>
          {isPlanned && (
            <Box sx={{ 
              p: 2, 
              bgcolor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500 }}>
                ⏰ {t('operations.plannedWarning') ?? 'Operacja zaplanowana na przyszłą datę'}
              </Typography>
            </Box>
          )}

          <Controller
            name="operationDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('operations.fields.date') ?? 'Data'}
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          />

          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>
                  {t('operations.fields.account') ?? 'Konto'}
                </InputLabel>
                <Select
                  {...field}
                  label={t('operations.fields.account') ?? 'Konto'}
                >
                  {accounts.filter(a => !a.is_closed).map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('operations.fields.amount') ?? 'Kwota'}
                type="number"
                fullWidth
                inputProps={{ step: '0.01' }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextFieldWithHashtagSuggestions
                value={field.value || ''}
                onChange={(newValue) => field.onChange(newValue)}
                allHashtags={hashtags.map(h => h.name)}
                label={t('operations.fields.description') ?? 'Opis'}
                placeholder={t('operations.fields.description') ?? 'Opis'}
                fullWidth
                multiline
                rows={3}
              />
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => {
              const selectedCategory = field.value ? subcategoriesForAutocomplete.find(c => c.id === field.value) : null
              return (
                <Autocomplete
                  options={subcategoriesForAutocomplete}
                  groupBy={(option) => option.group}
                  getOptionLabel={(option) => option.name}
                  value={selectedCategory || null}
                  onChange={(_, newValue) => {
                    field.onChange(newValue ? newValue.id : '')
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('operations.fields.category') ?? 'Kategoria'}
                    />
                  )}
                  noOptionsText={t('operations.filters.none') ?? 'Brak'}
                  fullWidth
                  disableClearable={false}
                />
              )
            }}
          />

          <Controller
            name="operationType"
            control={control}
            render={({ field }) => {
              const isExpense = field.value === 'expense'
              return (
                <FormControl fullWidth>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                    <Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {t('operations.fields.type') ?? 'Typ'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {isExpense ? (t('operations.type.expense') ?? 'Wydatek') : (t('operations.type.income') ?? 'Przychód')}
                      </Typography>
                    </Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isExpense}
                          onChange={(e) => field.onChange(e.target.checked ? 'expense' : 'income')}
                        />
                      }
                      label=""
                    />
                  </Box>
                </FormControl>
              )
            }}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained">
              {t('common.save') ?? 'Zapisz'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleSubmit((data) => handleSave(data, true))}
            >
              {t('operations.addAnother') ?? 'Dodaj kolejną'}
            </Button>
            <Button onClick={onClose}>
              {t('common.cancel') ?? 'Anuluj'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </StyledModal>
  )
}

export default AddOperationModal
