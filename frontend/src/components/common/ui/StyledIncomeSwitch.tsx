import React from 'react'
import { Box, Switch, Typography, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface StyledIncomeSwitchProps {
  value: 'income' | 'expense' | ''
  onChange: (value: 'income' | 'expense') => void
  disabled?: boolean
}

const StyledIncomeSwitch: React.FC<StyledIncomeSwitchProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const isExpense = value === 'expense'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : '#f9f9f9',
        borderRadius: 1,
      }}
    >
      <Stack>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {t('operations.fields.type') ?? 'Typ'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isExpense ? 'error.main' : 'success.main',
            fontWeight: 500,
          }}
        >
          {isExpense
            ? t('operations.type.expense') ?? 'Wydatek'
            : t('operations.type.income') ?? 'Przychód'}
        </Typography>
      </Stack>
      <Switch
        checked={isExpense}
        onChange={(e) => onChange(e.target.checked ? 'expense' : 'income')}
        disabled={disabled}
        color="default"
      />
    </Box>
  )
}

export default StyledIncomeSwitch
