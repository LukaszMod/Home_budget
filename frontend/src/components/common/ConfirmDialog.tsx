import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = 'error',
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText || t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor}>
          {confirmText || t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
