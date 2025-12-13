import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  Stack,
  Chip,
  Paper,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import type { Operation } from '../../lib/api'

interface OperationDetailsDrawerProps {
  open: boolean
  operation: Operation | null
  onClose: () => void
}

const OperationDetailsDrawer: React.FC<OperationDetailsDrawerProps> = ({
  open,
  operation,
  onClose,
}) => {
  const { t } = useTranslation()

  if (!operation) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL')
  }

  const formatAmount = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '0.00'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return t('operations.type.income') || 'Income'
      case 'expense':
        return t('operations.type.expense') || 'Expense'
      default:
        return type
    }
  }

  const getOperationTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'success'
      case 'expense':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          p: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{t('operations.details.title') || 'Operation Details'}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {/* Typ operacji */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('operations.fields.type') || 'Type'}
          </Typography>
          <Chip
            label={getOperationTypeLabel(operation.operation_type)}
            color={getOperationTypeColor(operation.operation_type)}
            size="medium"
          />
        </Box>

        {/* Kwota */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('operations.fields.amount') || 'Amount'}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: operation.operation_type === 'income' ? 'success.main' : 'error.main',
            }}
          >
            {formatAmount(operation.amount)} zł
          </Typography>
        </Box>

        {/* Data */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('operations.fields.date') || 'Date'}
          </Typography>
          <Typography variant="body1">{formatDate(operation.operation_date)}</Typography>
        </Box>

        {/* Opis */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('operations.fields.description') || 'Description'}
          </Typography>
          <Typography variant="body1">{operation.description || '-'}</Typography>
        </Box>

        {/* Konto */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('operations.fields.account') || 'Account'}
          </Typography>
          <Typography variant="body1">{operation.asset_name || '-'}</Typography>
        </Box>

        {/* Kategoria */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {t('operations.fields.category') || 'Category'}
          </Typography>
          <Typography variant="body1">
            {operation.parent_category_name && operation.category_name
              ? `${operation.parent_category_name} → ${operation.category_name}`
              : operation.category_name || '-'}
          </Typography>
        </Box>

        {/* Hashtagi */}
        {operation.hashtags && operation.hashtags.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {t('operations.fields.hashtags') || 'Hashtags'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {operation.hashtags.map((tag) => (
                <Chip key={tag.id} label={`#${tag.name}`} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Split info */}
        {operation.is_split && (
          <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {operation.parent_operation_id
                ? t('operations.splitChild') || 'Part of split operation'
                : t('operations.splitParent') || 'Split operation'}
            </Typography>
          </Paper>
        )}

        {/* Dodatkowe informacje */}
        <Divider />
        <Box>
          <Typography variant="caption" color="text.secondary">
            ID: {operation.id}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  )
}

export default OperationDetailsDrawer
