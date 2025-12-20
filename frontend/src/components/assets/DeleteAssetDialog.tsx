import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'
import StyledModal from '../common/StyledModal'
import type { Asset } from '../../lib/api'

interface DeleteAssetDialogProps {
  open: boolean
  onClose: () => void
  asset: Asset | null
  onConfirm: () => void
}

const DeleteAssetDialog: React.FC<DeleteAssetDialogProps> = ({
  open,
  onClose,
  asset,
  onConfirm,
}) => {
  const { t } = useTranslation()

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={t('assets.deleteDialog.title') ?? 'Usuń aktywo'}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography>
          {t('assets.deleteDialog.message') ?? 'Czy na pewno chcesz usunąć to aktywo?'}
        </Typography>
        {asset && (
          <Typography variant="body2" color="textSecondary">
            {asset.name}
          </Typography>
        )}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose}>
            {t('common.cancel') ?? 'Anuluj'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
          >
            {t('common.delete') ?? 'Usuń'}
          </Button>
        </Stack>
      </Box>
    </StyledModal>
  )
}

export default DeleteAssetDialog
