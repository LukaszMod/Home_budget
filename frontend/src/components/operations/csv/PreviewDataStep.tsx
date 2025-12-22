import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Chip,
  Stack,
} from '@mui/material'
import {
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import CategoryAutocomplete from '../../common/ui/CategoryAutocomplete'
import type { CSVRow, ColumnMapping } from './types'

interface PreviewDataStepProps {
  data: CSVRow[]
  columnMapping: ColumnMapping
  accounts: any[]
  categories: any[]
  onDataChange: (data: CSVRow[]) => void
}

const PreviewDataStep: React.FC<PreviewDataStepProps> = ({
  data,
  columnMapping,
  accounts,
  categories,
  onDataChange,
}) => {
  const { t } = useTranslation()
  const [initialized, setInitialized] = useState(false)
  const [originalData, setOriginalData] = useState<CSVRow[]>([])

  // Initialize __asset_id__ and __category_id__ for all rows based on column mapping
  useEffect(() => {
    if (initialized || data.length === 0) return

    const headers = data.length > 0 ? Object.keys(data[0]) : []
    const newData = data.map((row) => {
      const updatedRow = { ...row }

      // Initialize asset_id from sourceAccount column
      if (columnMapping.sourceAccount !== undefined) {
        const accountHeader = headers[columnMapping.sourceAccount]
        const accountName = String(row[accountHeader] || '').trim()
        if (accountName && !updatedRow['__asset_id__']) {
          // Try exact match first
          let account = accounts.find(
            (a) => a.name.toLowerCase() === accountName.toLowerCase()
          )
          // Try partial match if exact match fails
          if (!account) {
            account = accounts.find((a) =>
              a.name.toLowerCase().includes(accountName.toLowerCase())
            )
          }
          if (account) {
            updatedRow['__asset_id__'] = account.id
          }
        }
      }

      // Initialize category_id from category column
      if (columnMapping.category !== undefined) {
        const categoryHeader = headers[columnMapping.category]
        const categoryName = String(row[categoryHeader] || '').trim()
        if (categoryName && !updatedRow['__category_id__']) {
          // Try exact match first
          let category = categories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase()
          )
          // Try partial match if exact match fails
          if (!category) {
            category = categories.find((c) =>
              c.name.toLowerCase().includes(categoryName.toLowerCase())
            )
          }
          if (category) {
            updatedRow['__category_id__'] = category.id
          }
        }
      }

      // Initialize operation_type from operationType column or amount
      if (!updatedRow['__operation_type__']) {
        if (columnMapping.operationType !== undefined) {
          const typeHeader = headers[columnMapping.operationType]
          const type = String(row[typeHeader] || '').toLowerCase()
          updatedRow['__operation_type__'] = type.includes('income') || type.includes('przychód') ? 'income' : 'expense'
        } else if (columnMapping.amount !== undefined) {
          const amountHeader = headers[columnMapping.amount]
          const amount = parseFloat(String(row[amountHeader] || '0').replace(/,/g, '.').replace(/[^\d.-]/g, ''))
          updatedRow['__operation_type__'] = amount < 0 ? 'expense' : 'income'
        }
      }

      return updatedRow
    })

    // Store original data for helper text
    if (originalData.length === 0) {
      setOriginalData(data)
    }

    onDataChange(newData)
    setInitialized(true)
  }, [data, columnMapping, accounts, categories, initialized, onDataChange, originalData])



  const handleDelete = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex)
    onDataChange(newData)
  }

  const handleFieldChange = (field: string, value: string | number, rowIndex?: number) => {
    if (rowIndex !== undefined) {
      const newData = [...data]
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: value,
      }
      onDataChange(newData)
    }
  }

  const getOperationType = (row: CSVRow): 'income' | 'expense' => {
    // Check special field first (set by dropdown edits)
    if (row['__operation_type__']) {
      return row['__operation_type__'] as 'income' | 'expense'
    }

    if (columnMapping.operationType !== undefined) {
      const headers = Object.keys(row)
      const header = headers[columnMapping.operationType]
      const type = String(row[header] || '').toLowerCase()
      return type.includes('income') || type.includes('przychód') ? 'income' : 'expense'
    }

    // Default based on amount
    if (columnMapping.amount !== undefined) {
      const headers = Object.keys(row)
      const header = headers[columnMapping.amount]
      const amount = parseFloat(String(row[header] || '0').replace(/,/g, '.').replace(/[^\d.-]/g, ''))
      return amount < 0 ? 'expense' : 'income'
    }

    return 'expense'
  }

  const getCategoryIdFromName = (categoryName: string, row?: CSVRow): number | '' => {
    if (!categoryName) return ''
    // Check if __category_id__ is already set (from previous edit or initialization)
    if (row && row['__category_id__']) {
      return row['__category_id__'] as number
    }
    // Search by name
    const category = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())
    return category ? category.id : ''
  }

  const getCategoryNameFromId = (categoryId: number | ''): string => {
    if (!categoryId) return ''
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : ''
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body1">
          {t('import.previewDescription', 'Sprawdź i edytuj dane przed importem')}
        </Typography>
        <Chip
          label={`${data.length} ${t('import.operations', 'operacji')}`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('import.fields.date', 'Data')}</TableCell>
              <TableCell>{t('import.fields.description', 'Opis')}</TableCell>
              <TableCell align="right">{t('import.fields.amount', 'Kwota')}</TableCell>
              <TableCell>{t('import.fields.operationType', 'Typ')}</TableCell>
              <TableCell>{t('import.fields.sourceAccount', 'Konto')}</TableCell>
              <TableCell>{t('import.fields.category', 'Kategoria')}</TableCell>
              <TableCell align="center">{t('common.actions', 'Akcje')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => {
              const currentRow = row
              const headers = Object.keys(row)

              return (
                <TableRow key={rowIndex} hover>
                  <TableCell sx={{ width: 150 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={
                        columnMapping.date !== undefined
                          ? String(currentRow[headers[columnMapping.date]] || '')
                          : ''
                      }
                      onChange={(e) =>
                        columnMapping.date !== undefined &&
                        handleFieldChange(headers[columnMapping.date], e.target.value, rowIndex)
                      }
                      helperText={
                        originalData[rowIndex] && columnMapping.date !== undefined
                          ? String(originalData[rowIndex][headers[columnMapping.date]] || '')
                          : ' '
                      }
                      FormHelperTextProps={{ sx: { fontSize: '0.65rem', mt: 0.25 } }}
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 180 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={
                        columnMapping.description !== undefined
                          ? String(currentRow[headers[columnMapping.description]] || '')
                          : ''
                      }
                      onChange={(e) =>
                        columnMapping.description !== undefined &&
                        handleFieldChange(headers[columnMapping.description], e.target.value, rowIndex)
                      }
                      helperText={
                        originalData[rowIndex] && columnMapping.description !== undefined
                          ? String(originalData[rowIndex][headers[columnMapping.description]] || '')
                          : undefined
                      }
                      FormHelperTextProps={{ sx: { fontSize: '0.65rem', mt: 0.25 } }}
                    />
                  </TableCell>

                  <TableCell align="right" sx={{ width: 120 }}>
                    <TextField
                      size="small"
                      type="text"
                      value={
                        columnMapping.amount !== undefined
                          ? String(currentRow[headers[columnMapping.amount]] || '')
                          : ''
                      }
                      onChange={(e) => {
                        if (columnMapping.amount !== undefined) {
                          // Allow numbers with comma or dot as decimal separator
                          const value = e.target.value
                          if (value === '' || /^-?\d*[,.]?\d*$/.test(value)) {
                            handleFieldChange(headers[columnMapping.amount], value, rowIndex)
                          }
                        }
                      }}
                      helperText={
                        originalData[rowIndex] && columnMapping.amount !== undefined
                          ? String(originalData[rowIndex][headers[columnMapping.amount]] || '')
                          : ' '
                      }
                      FormHelperTextProps={{ sx: { fontSize: '0.65rem', mt: 0.25 } }}
                      fullWidth
                    />
                  </TableCell>

                  <TableCell sx={{ width: 120 }}>
                    <FormControl size="small" fullWidth sx={{ pb: 2 }}>
                      <Select
                        value={getOperationType(currentRow)}
                        onChange={(e) => {
                          // Store in special field to avoid column conflicts
                          handleFieldChange('__operation_type__', e.target.value, rowIndex)
                        }}
                      >
                        <MenuItem value="income">{t('operations.type.income', 'Przychód')}</MenuItem>
                        <MenuItem value="expense">{t('operations.type.expense', 'Wydatek')}</MenuItem>
                      </Select>
                      <FormHelperText sx={{ fontSize: '0.65rem', mt: 0.25 }}>
                        {originalData[rowIndex]
                          ? (columnMapping.operationType !== undefined
                              ? String(originalData[rowIndex][headers[columnMapping.operationType]] || '')
                              : ' ')
                          : ' '}
                      </FormHelperText>
                    </FormControl>
                  </TableCell>

                  <TableCell sx={{ width: 180 }}>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={(() => {
                          if (currentRow['__asset_id__']) {
                            const acc = accounts.find((a) => a.id === currentRow['__asset_id__'])
                            return acc ? acc.name : ''
                          }
                          return columnMapping.sourceAccount !== undefined
                            ? String(currentRow[headers[columnMapping.sourceAccount]] || '')
                            : ''
                        })()}
                        onChange={(e) => {
                          if (columnMapping.sourceAccount !== undefined) {
                            const accountName = e.target.value
                            const account = accounts.find(a => a.name === accountName)
                            handleFieldChange(headers[columnMapping.sourceAccount], accountName, rowIndex)
                            // Store asset_id in special field
                            if (account) {
                              handleFieldChange('__asset_id__', account.id, rowIndex)
                            }
                          }
                        }}
                      >
                        {accounts.map((account) => (
                          <MenuItem key={account.id} value={account.name}>
                            {account.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {originalData[rowIndex] && columnMapping.sourceAccount !== undefined && (
                        <FormHelperText sx={{ fontSize: '0.65rem', mt: 0.25 }}>
                          {String(originalData[rowIndex][headers[columnMapping.sourceAccount]] || '')}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </TableCell>

                  <TableCell sx={{ minWidth: 260 }}>
                    <Box>
                      <CategoryAutocomplete
                        categories={categories}
                        value={
                          currentRow['__category_id__'] 
                            ? currentRow['__category_id__'] as number
                            : columnMapping.category !== undefined
                            ? getCategoryIdFromName(String(currentRow[headers[columnMapping.category]] || ''), currentRow)
                            : ''
                        }
                        onChange={(categoryId) => {
                          if (columnMapping.category !== undefined) {
                            const categoryName = getCategoryNameFromId(categoryId)
                            handleFieldChange(headers[columnMapping.category], categoryName, rowIndex)
                            // Store category_id in special field
                            handleFieldChange('__category_id__', categoryId, rowIndex)
                          }
                        }}
                        label=""
                      />
                      {originalData[rowIndex] && columnMapping.category !== undefined && (
                        <FormHelperText sx={{ fontSize: '0.65rem', mt: 0.25 }}>
                          {String(originalData[rowIndex][headers[columnMapping.category]] || '')}
                        </FormHelperText>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(rowIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {data.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <Typography color="text.secondary">
            {t('import.noData', 'Brak danych do wyświetlenia')}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default PreviewDataStep
