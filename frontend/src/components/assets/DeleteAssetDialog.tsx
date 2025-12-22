import React from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'
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

  const message = asset
    ? `${t('assets.deleteModal.confirmMessage')} "${asset.name}"? ${t('assets.deleteModal.warning')}`
    : t('assets.deleteModal.confirmMessage')

  return (
    <ConfirmDialog
      open={open}
      title={t('assets.deleteModal.title')}
      message={message}
      confirmColor="error"
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  )
}

export default DeleteAssetDialog
