import React, { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOperation,
  updateOperation,
  getOperationChildren,
  unsplitOperation,
  type Operation as APIOperation,
  type CreateOperationPayload,
  type OperationType,
  type Account,
  type Category,
  type SplitItem,
} from '../../lib/api'
import { useNotifier } from '../common/Notifier'
import StyledModal from '../common/StyledModal'
import OperationBasicFields from './OperationBasicFields'
import SplitOperationFields from './SplitOperationFields'
import { useHashtags } from '../../hooks/useHashtags'
import { Button, Grid } from '@mui/material'
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
  isSplit: boolean
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
  const { t, i18n } = useTranslation()
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
      isSplit: false,
    },
  })

  // State for split items
  const [splitItems, setSplitItems] = React.useState<SplitItem[]>([
    { category_id: 0, amount: 0, description: '' }
  ])
  const [loadingChildren, setLoadingChildren] = React.useState(false)

  const isSplit = watch('isSplit')
  const totalAmount = watch('amount')

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

  const updateMut = useMutation<APIOperation, Error, { id: number; payload: CreateOperationPayload }>({
    mutationFn: ({ id, payload }) => updateOperation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      qc.invalidateQueries({ queryKey: ['hashtags'] })
    },
  })

  const unsplitMut = useMutation<void, Error, number>({
    mutationFn: (id) => unsplitOperation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations'] })
      notifier.notify('Operation unsplit', 'success')
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
      setSplitItems([{ category_id: 0, amount: 0, description: '' }])
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
        isSplit: editing.is_split || false,
      })

      // Load children if this is a split operation
      if (editing.is_split) {
        setLoadingChildren(true)
        getOperationChildren(editing.id)
          .then((children) => {
            const items: SplitItem[] = children.map(child => ({
              category_id: child.category_id || 0,
              amount: Number(child.amount) || 0,
              description: child.description || '',
            }))
            setSplitItems(items.length > 0 ? items : [{ category_id: 0, amount: 0, description: '' }])
          })
          .catch((err) => {
            console.error('Failed to load children:', err)
            notifier.notify('Failed to load split items', 'error')
          })
          .finally(() => {
            setLoadingChildren(false)
          })
      } else {
        setSplitItems([{ category_id: 0, amount: 0, description: '' }])
      }
    }
  }, [editing, reset, notifier])

  // Calculate split totals
  const allocatedAmount = React.useMemo(() => {
    return splitItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }, [splitItems])

  const remainingAmount = React.useMemo(() => {
    const total = Number(totalAmount) || 0
    return total - allocatedAmount
  }, [totalAmount, allocatedAmount])

  // Add split item
  const handleAddSplitItem = () => {
    setSplitItems([...splitItems, { category_id: 0, amount: 0, description: '' }])
  }

  // Remove split item
  const handleRemoveSplitItem = (index: number) => {
    if (splitItems.length > 1) {
      setSplitItems(splitItems.filter((_, i) => i !== index))
    }
  }

  // Update split item
  const handleUpdateSplitItem = (index: number, field: keyof SplitItem, value: any) => {
    const updated = [...splitItems]
    updated[index] = { ...updated[index], [field]: value }
    setSplitItems(updated)
  }

  const handleSave = async (data: FormData, keepOpen = false) => {
    // Walidacja
    if (!data.accountId || !data.amount) {
      return notifier.notify(
        t('operations.messages.fillRequired') ?? 'Uzupełnij wymagane pola',
        'error'
      )
    }

    // Walidacja split
    if (data.isSplit) {
      // Sprawdź czy wszystkie pola są wypełnione
      const hasEmptyFields = splitItems.some(item => 
        !item.category_id || !item.amount || item.amount <= 0
      )
      if (hasEmptyFields) {
        return notifier.notify(
          t('operations.fillAllFields') ?? 'Wypełnij wszystkie wymagane pola',
          'error'
        )
      }

      // Sprawdź czy suma się zgadza
      const tolerance = 0.01
      if (Math.abs(remainingAmount) > tolerance) {
        return notifier.notify(
          t('operations.sumMustMatch') ?? 'Suma pozycji musi się zgadzać z kwotą całkowitą',
          'error'
        )
      }

      // Minimum 2 pozycje
      if (splitItems.length < 2) {
        return notifier.notify(
          'Podział wymaga minimum 2 pozycji',
          'error'
        )
      }
    }

    const payload: CreateOperationPayload = {
      asset_id: Number(data.accountId),
      amount: Number(data.amount),
      description: data.description || null,
      category_id: data.categoryId === '' ? null : Number(data.categoryId),
      operation_type: (data.operationType as OperationType) || 'expense',
      operation_date: data.operationDate || new Date().toISOString().split('T')[0],
      split_items: data.isSplit ? splitItems.map(item => ({
        category_id: Number(item.category_id),
        amount: Number(item.amount),
        description: item.description || null
      })) : undefined,
    }

    try {
      if (editing) {
        // Editing existing operation
        if (editing.is_split && !data.isSplit) {
          // Was split, now regular - unsplit first
          await unsplitMut.mutateAsync(editing.id)
        }
        
        // Then update the operation
        await updateMut.mutateAsync({ id: editing.id, payload })
        
        notifier.notify(
          t('operations.messages.updated') ?? 'Operacja zaktualizowana',
          'success'
        )
        onClose()
      } else {
        // Creating new operation
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
            isSplit: false,
          })
          setSplitItems([{ category_id: 0, amount: 0, description: '' }])
        }
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
        <Grid container spacing={2}>
          {/* Left Column: Main Form */}
          <Grid item xs={12} md={(isSplit || (editing && editing.is_split)) ? 6 : 12}>
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
                  <DatePickerProvider>
                    <DatePicker
                      label={t('operations.fields.date') ?? 'Data'}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                      format={getDateFormat(i18n.language)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </DatePickerProvider>
                )}
              />

              <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required>
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
                render={({ field: { onChange, value, ...field } }) => (
                  <CalcTextField
                    {...field}
                    value={value || ''}
                    onChange={(val) => onChange(val)}
                    label={t('operations.fields.amount') ?? 'Kwota'}
                    fullWidth
                    required
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
                    rows={2}
                  />
                )}
              />

              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <CategoryAutocomplete
                    categories={categories}
                    value={field.value || ''}
                    onChange={field.onChange}
                    disabled={isSplit}
                  />
                )}
              />

              {/* Split Operations Toggle */}
              <Controller
                name="isSplit"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => {
                            field.onChange(e.target.checked)
                            if (e.target.checked) {
                              // Clear category when enabling split
                              setValue('categoryId', '')
                            }
                          }}
                        />
                      }
                      label={t('operations.enableSplit') ?? 'Podziel operację'}
                    />
                  )}
                />

              <Controller
                name="operationType"
                control={control}
                render={({ field }) => (
                  <StyledIncomeSwitch
                    value={field.value as 'income' | 'expense' | ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Right Column: Split Items (only when enabled) */}
          {(isSplit || (editing && editing.is_split)) && (
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  maxHeight: '600px',
                  overflow: 'auto'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('operations.splitItems') ?? 'Pozycje podziału'}
                  {loadingChildren && <CircularProgress size={16} sx={{ ml: 1 }} />}
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
                            value={subcategoriesForAutocomplete.find(c => c.id === item.category_id) || null}
                            onChange={(_, newValue) => {
                              handleUpdateSplitItem(index, 'category_id', newValue ? newValue.id : 0)
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
                            onClick={() => handleRemoveSplitItem(index)}
                            disabled={splitItems.length <= 1}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>

                        <CalcTextField
                          value={String(item.amount || '')}
                          onChange={(val) => handleUpdateSplitItem(index, 'amount', Number(val) || 0)}
                          label={t('operations.fields.amount') ?? 'Kwota'}
                          size="small"
                          fullWidth
                          required
                        />

                        <TextField
                          value={item.description || ''}
                          onChange={(e) => handleUpdateSplitItem(index, 'description', e.target.value)}
                          label={t('operations.fields.description') ?? 'Opis'}
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Stack>
                    </Paper>
                  ))}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddSplitItem}
                    variant="outlined"
                    size="small"
                  >
                    {t('operations.addItem') ?? 'Dodaj pozycję'}
                  </Button>

                  <Divider />

                  {/* Summary */}
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        {t('operations.totalAmount') ?? 'Kwota całkowita'}:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {Number(totalAmount || 0).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        {t('operations.allocated') ?? 'Przydzielono'}:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {allocatedAmount.toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color={Math.abs(remainingAmount) > 0.01 ? 'error' : 'success'}>
                        {t('operations.remaining') ?? 'Pozostało'}:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={Math.abs(remainingAmount) > 0.01 ? 'error' : 'success'}
                      >
                        {remainingAmount.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          )}

          {/* Buttons Section */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button type="submit" variant="contained">
                {t('common.save') ?? 'Zapisz'}
              </Button>
              {editing && isSplit && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={async () => {
                    if (confirm(t('operations.confirmUnsplit') ?? 'Czy na pewno chcesz cofnąć podział? Dzieci zostaną usunięte.')) {
                      try {
                        await unsplitMut.mutateAsync(editing.id)
                        onClose()
                      } catch (e: any) {
                        notifier.notify(String(e), 'error')
                      }
                    }
                  }}
                >
                  {t('operations.unsplit') ?? 'Cofnij podział'}
                </Button>
              )}
              {!editing && (
                <Button
                  variant="outlined"
                  onClick={handleSubmit((data) => handleSave(data, true))}
                >
                  {t('operations.addAnother') ?? 'Dodaj kolejną'}
                </Button>
              )}
              <Button onClick={onClose}>
                {t('common.cancel') ?? 'Anuluj'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </StyledModal>
  )
}

export default AddOperationModal
