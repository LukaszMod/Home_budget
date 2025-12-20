import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DatePickerProvider, getDateFormat } from '../common/DatePickerProvider'
import dayjs from 'dayjs'
import CalcTextField from '../common/ui/CalcTextField'
import StyledIncomeSwitch from '../common/ui/StyledIncomeSwitch'
import CategoryAutocomplete from '../common/ui/CategoryAutocomplete'
import TextFieldWithHashtagSuggestions from './TextFieldWithHashtagSuggestions'
import type { Account, Category, Hashtag } from '../../lib/api'

interface FormData {
  operationDate: string
  amount: string
  description: string
  accountId: number | ''
  categoryId: number | ''
  operationType: 'income' | 'expense' | ''
  isSplit: boolean
}

interface OperationBasicFieldsProps {
  control: Control<FormData>
  accounts: Account[]
  categories: Category[]
  hashtags: Hashtag[]
  isPlanned: boolean
  isSplit: boolean
  onSplitToggle: (enabled: boolean) => void
}

const OperationBasicFields: React.FC<OperationBasicFieldsProps> = ({
  control,
  accounts,
  categories,
  hashtags,
  isPlanned,
  isSplit,
  onSplitToggle,
}) => {
  const { t, i18n } = useTranslation()

  return (
    <Stack spacing={2}>
      {isPlanned && (
        <Box
          sx={{
            p: 2,
            bgcolor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
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
                  required: true,
                },
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
            <InputLabel>{t('operations.fields.account') ?? 'Konto'}</InputLabel>
            <Select {...field} label={t('operations.fields.account') ?? 'Konto'}>
              {accounts.filter((a) => !a.is_closed).map((a) => (
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
            allHashtags={hashtags.map((h) => h.name)}
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
                  onSplitToggle(e.target.checked)
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
          <StyledIncomeSwitch value={field.value as 'income' | 'expense' | ''} onChange={field.onChange} />
        )}
      />
    </Stack>
  )
}

export default OperationBasicFields
