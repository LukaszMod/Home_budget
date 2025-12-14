import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import type { Operation } from '../../lib/api'
import { formatDate as formatDateHelper } from '../common/DatePickerProvider'

interface OperationsTableProps {
  operations: Operation[]
  onEdit: (operation: Operation) => void
  onDelete: (id: number) => void
  onSelect: (operation: Operation | null) => void
  selectedOperationId: number | null
}

const OperationsTable: React.FC<OperationsTableProps> = ({
  operations,
  onEdit,
  onDelete,
  onSelect,
  selectedOperationId,
}) => {
  const { t, i18n } = useTranslation()

  const formatDate = (dateString: string) => {
    return formatDateHelper(dateString, i18n.language)
  }

  const formatAmount = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '0.00'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? '0.00' : num.toFixed(2)
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

  return (
    <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('operations.fields.date') || 'Date'}</TableCell>
            <TableCell>{t('operations.fields.description') || 'Description'}</TableCell>
            <TableCell>{t('operations.fields.account') || 'Account'}</TableCell>
            <TableCell>{t('operations.fields.category') || 'Category'}</TableCell>
            <TableCell align="right">{t('operations.fields.amount') || 'Amount'}</TableCell>
            <TableCell>{t('operations.fields.type') || 'Type'}</TableCell>
            <TableCell align="center">{t('common.actions') || 'Actions'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {operations.map((operation) => (
            <TableRow
              key={operation.id}
              hover
              selected={selectedOperationId === operation.id}
              onClick={() => onSelect(operation)}
              sx={{
                cursor: 'pointer',
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <TableCell>{formatDate(operation.operation_date)}</TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">{operation.description}</Typography>
                  {operation.hashtags && operation.hashtags.length > 0 && (
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {operation.hashtags.map((tag) => (
                        <Chip key={tag.id} label={`#${tag.name}`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell>{operation.asset_name || '-'}</TableCell>
              <TableCell>
                {operation.parent_category_name && operation.category_name
                  ? `${operation.parent_category_name} → ${operation.category_name}`
                  : operation.category_name || '-'}
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: operation.operation_type === 'income' ? 'success.main' : 'error.main',
                  }}
                >
                  {formatAmount(operation.amount)} zł
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getOperationTypeLabel(operation.operation_type)}
                  color={getOperationTypeColor(operation.operation_type)}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(operation)
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(t('operations.confirmDelete') || 'Delete this operation?')) {
                      onDelete(operation.id)
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {operations.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('operations.noData') || 'No operations found'}
          </Typography>
        </Box>
      )}
    </TableContainer>
  )
}

export default OperationsTable
