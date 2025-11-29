import React from 'react'
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
import {
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface AddOperationModalProps {
  open: boolean
  onClose: () => void
  accounts: Account[]
  categories: Category[]
  editing?: APIOperation | null
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

  const createMut = useMutation<APIOperation, Error, CreateOperationPayload>({
    mutationFn: (p) => createOperation(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operations'] }),
  })

  const [operationDate, setOperationDate] = React.useState<string>('')
  const [amount, setAmount] = React.useState<number | string>('')
  const [description, setDescription] = React.useState('')
  const [accountId, setAccountId] = React.useState<number | ''>('')
  const [categoryId, setCategoryId] = React.useState<number | ''>('')
  const [operationType, setOperationType] = React.useState<OperationType | ''>('')

  React.useEffect(() => {
    if (!open) {
      setOperationDate('')
      setAmount('')
      setDescription('')
      setAccountId('')
      setCategoryId('')
      setOperationType('')
    }
  }, [open])

  React.useEffect(() => {
    if (editing) {
      setOperationDate(editing.operation_date ?? '')
      setAmount(editing.amount)
      setDescription(editing.description ?? '')
      setAccountId(editing.account_id ?? '')
      setCategoryId(editing.category_id ?? '')
      setOperationType(editing.operation_type ?? '')
    }
  }, [editing])

  const handleSave = async (keepOpen = false) => {
    // basic validation
    if (!accountId || !amount) {
      return notifier.notify(
        t('operations.messages.fillRequired') ?? 'Uzupełnij wymagane pola',
        'error'
      )
    }

    const payload: CreateOperationPayload = {
      account_id: Number(accountId),
      amount: Number(amount),
      description: description || null,
      category_id: categoryId === '' ? null : Number(categoryId),
      operation_type: (operationType as OperationType) || 'expense',
      operation_date: operationDate || new Date().toISOString().split('T')[0],
    }

    try {
      await createMut.mutateAsync(payload)
      notifier.notify(
        t('operations.messages.saved') ?? 'Operacja zapisana',
        'success'
      )
      if (!keepOpen) onClose()
      else {
        // reset fields for next entry but keep modal open
        setAmount('')
        setDescription('')
        setAccountId('')
        setCategoryId('')
        setOperationType('')
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
      <Stack spacing={2}>
        <TextField
          label={t('operations.fields.date') ?? 'Data'}
          type="date"
          value={operationDate}
          onChange={(e) => setOperationDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>
            {t('operations.fields.account') ?? 'Konto'}
          </InputLabel>
          <Select
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
            label={t('operations.fields.account') ?? 'Konto'}
          >
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label={t('operations.fields.amount') ?? 'Kwota'}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          inputProps={{ step: '0.01' }}
        />

        <TextField
          label={t('operations.fields.description') ?? 'Opis'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>
            {t('operations.fields.category') ?? 'Kategoria'}
          </InputLabel>
          <Select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(Number(e.target.value) || '')
            }
            label={t('operations.fields.category') ?? 'Kategoria'}
          >
            <MenuItem value="">
              <em>{t('operations.filters.none') ?? 'Brak'}</em>
            </MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{t('operations.fields.type') ?? 'Typ'}</InputLabel>
          <Select
            value={operationType}
            onChange={(e) =>
              setOperationType(e.target.value as OperationType)
            }
            label={t('operations.fields.type') ?? 'Typ'}
          >
            <MenuItem value="expense">
              {t('operations.type.expense') ?? 'Wydatek'}
            </MenuItem>
            <MenuItem value="income">
              {t('operations.type.income') ?? 'Przychód'}
            </MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => handleSave(false)}>
            {t('common.save') ?? 'Zapisz'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleSave(true)}
          >
            {t('operations.addAnother') ?? 'Dodaj kolejną'}
          </Button>
          <Button onClick={onClose}>
            {t('common.cancel') ?? 'Anuluj'}
          </Button>
        </Stack>
      </Stack>
    </StyledModal>
  )
}

export default AddOperationModal
