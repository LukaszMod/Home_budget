import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, TextField, Stack } from '@mui/material'
import StyledModal from './StyledModal'
import type { Account } from '../lib/api'

interface AddAccountModalProps {
  open: boolean
  onClose: () => void
  editing: Account | null
  name: string
  onNameChange: (value: string) => void
  userId: number | ''
  onUserIdChange: (value: number | '') => void
  accountNumber: string
  onAccountNumberChange: (value: string) => void
  onSave: () => void
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  open,
  onClose,
  editing,
  name,
  onNameChange,
  userId,
  onUserIdChange,
  accountNumber,
  onAccountNumberChange,
  onSave,
}) => {
  const { t } = useTranslation()

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      title={editing ? t('accounts.dialog.edit') : t('accounts.dialog.new')}
      footer={
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>{t('actions.cancel')}</Button>
          <Button onClick={onSave} variant="contained">
            {t('actions.save')}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <TextField
          label={t('accounts.fields.name')}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          fullWidth
        />
        <TextField
          label={t('accounts.fields.owner')}
          value={String(userId)}
          onChange={(e) => onUserIdChange(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
        />
        <TextField
          label={t('accounts.fields.accountNumber')}
          value={accountNumber}
          onChange={(e) => onAccountNumberChange(e.target.value)}
          fullWidth
        />
      </Stack>
    </StyledModal>
  )
}

export default AddAccountModal
