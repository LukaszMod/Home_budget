import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'
import StyledModal from '../common/StyledModal'
import CalcTextField from '../common/ui/CalcTextField'
import type { Asset } from '../../lib/api'

interface CorrectBalanceDialogProps {
  open: boolean
  onClose: () => void
  asset: Asset | null
  targetBalance: string
  onTargetBalanceChange: (value: string) => void
  onConfirm: () => void
  formatValue: (value: number | string | null | undefined, currency: string) => string
}

const CorrectBalanceDialog: React.FC<CorrectBalanceDialogProps> = ({
  open,
  onClose,
  asset,
  targetBalance,
  onTargetBalanceChange,
  onConfirm,
  formatValue,
}) => {
  const { t } = useTranslation()

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={t('assets.correctBalance.title') ?? 'Wyrównanie salda'}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {t('assets.correctBalance.description') ?? 'Podaj docelowe saldo konta. Zostanie utworzona operacja korygująca różnicę.'}
        </Typography>
        
        {asset && (
          <Typography variant="body2">
            <strong>{t('assets.correctBalance.currentBalance') ?? 'Aktualne saldo'}:</strong>{' '}
            {formatValue(asset.current_valuation, asset.currency)}
          </Typography>
        )}
        
        <CalcTextField
          label={t('assets.correctBalance.targetBalance') ?? 'Docelowe saldo'}
          value={targetBalance}
          onChange={(val) => onTargetBalanceChange(String(val))}
          fullWidth
          required
          autoFocus
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose}>
            {t('common.cancel') ?? 'Anuluj'}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={!targetBalance}
          >
            {t('assets.correctBalance.confirm') ?? 'Wyrównaj'}
          </Button>
        </Stack>
      </Box>
    </StyledModal>
  )
}

export default CorrectBalanceDialog
