import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import UploadCSVStep from './csv/UploadCSVStep.js'
import MapColumnsStep from './csv/MapColumnsStep.js'
import PreviewDataStep from './csv/PreviewDataStep.js'
import type { CSVRow, ColumnMapping, ImportTemplate } from './csv/types.js'

interface ImportCSVDialogProps {
  open: boolean
  onClose: () => void
  onImport: (operations: any[]) => Promise<void>
  accounts: any[]
  categories: any[]
  userId?: number
}

const ImportCSVDialog: React.FC<ImportCSVDialogProps> = ({
  open,
  onClose,
  onImport,
  accounts,
  categories,
  userId = 1, // Default to user 1 if not specified
}) => {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [editedData, setEditedData] = useState<CSVRow[]>([])
  const [error, setError] = useState<string>('')
  const [isImporting, setIsImporting] = useState(false)
  const [isMappingValid, setIsMappingValid] = useState(false)
  const [canImport, setCanImport] = useState(false)

  const steps = [
    t('import.steps.upload', 'Wczytaj CSV'),
    t('import.steps.mapColumns', 'Mapuj kolumny'),
    t('import.steps.preview', 'Podgląd i edycja'),
  ]

  const handleCSVParsed = (data: CSVRow[], parsedHeaders: string[]) => {
    setCsvData(data)
    setEditedData(data)
    setHeaders(parsedHeaders)
    setError('')
    setActiveStep(1)
  }

  const handleMappingComplete = (mapping: ColumnMapping) => {
    setEditedData(csvData)
    setColumnMapping(mapping)
    setActiveStep(2)
  }

  const handleMappingNext = () => {
    // Trigger the completeMapping function exposed by MapColumnsStep
    if ((window as any).__mapColumnsStepRef) {
      ;(window as any).__mapColumnsStepRef.completeMapping()
    }
  }

  const handleSaveTemplate = (template: ImportTemplate) => {
    // Template is already saved to database by MapColumnsStep
    // Just update the column mapping state
    const columnMapping = template.template_data?.columnMapping || template.columnMapping
    if (columnMapping) {
      setColumnMapping(columnMapping)
    }
  }

  const handleLoadTemplate = (template: ImportTemplate) => {
    const columnMapping = template.template_data?.columnMapping || template.columnMapping
    if (columnMapping) {
      setColumnMapping(columnMapping)
    }
  }

  // Validate edited data for import
  React.useEffect(() => {
    if (activeStep !== 2 || editedData.length === 0) {
      setCanImport(false)
      return
    }

    // Check if all rows have required fields
    const allValid = editedData.every((row) => {
      // Get header names from column indices
      const amountHeader = columnMapping.amount !== undefined ? headers[columnMapping.amount] : undefined
      const dateHeader = columnMapping.date !== undefined ? headers[columnMapping.date] : undefined

      // Check amount
      const amountStr = amountHeader ? String(row[amountHeader] || '') : ''
      const amount = parseFloat(amountStr.replace(',', '.'))
      
      // Check date
      const dateStr = dateHeader ? String(row[dateHeader] || '') : ''
      
      // Check asset_id
      const hasAssetId = row['__asset_id__'] !== undefined && row['__asset_id__'] !== null

      return amount > 0 && dateStr.trim() !== '' && hasAssetId
    })

    setCanImport(allValid)
  }, [editedData, columnMapping, headers, activeStep])

  const handleImport = async () => {
    try {
      setIsImporting(true)
      setError('')

      // Convert CSV data to operations format
      const operations = editedData.map((row) => {
        const operation: any = {}

        // Get header names from column indices
        const amountHeader = columnMapping.amount !== undefined ? headers[columnMapping.amount] : undefined
        const descriptionHeader = columnMapping.description !== undefined ? headers[columnMapping.description] : undefined
        const dateHeader = columnMapping.date !== undefined ? headers[columnMapping.date] : undefined
        const sourceAccountHeader = columnMapping.sourceAccount !== undefined ? headers[columnMapping.sourceAccount] : undefined
        const categoryHeader = columnMapping.category !== undefined ? headers[columnMapping.category] : undefined
        const operationTypeHeader = columnMapping.operationType !== undefined ? headers[columnMapping.operationType] : undefined

        if (amountHeader) {
          const amountStr = String(row[amountHeader] || '0')
            .replace(/,/g, '.')
            .replace(/[^\d.-]/g, '')
          operation.amount = parseFloat(amountStr) || 0
        }

        if (descriptionHeader) {
          operation.description = String(row[descriptionHeader] || '')
        }

        if (dateHeader) {
          operation.operation_date = parseDate(
            String(row[dateHeader] || ''),
            columnMapping.dateFormat || 'YYYY-MM-DD'
          )
        }

        // Check for special __asset_id__ field first (set by dropdown edits)
        if (row['__asset_id__']) {
          operation.asset_id = row['__asset_id__']
        } else if (sourceAccountHeader) {
          const accountName = String(row[sourceAccountHeader] || '').trim()
          if (accountName) {
            // Try exact match first
            let account = accounts.find(
              (a) => a.name.toLowerCase() === accountName.toLowerCase()
            )
            
            // If no exact match, try partial match (account name contains CSV name or vice versa)
            if (!account) {
              account = accounts.find(
                (a) => 
                  a.name.toLowerCase().includes(accountName.toLowerCase()) ||
                  accountName.toLowerCase().includes(a.name.toLowerCase())
              )
            }
            
            if (account) {
              operation.asset_id = account.id
            } else {
              console.warn(`Account not found for name: "${accountName}". Available accounts:`, accounts.map(a => a.name))
            }
          }
        }

        // Check for special __category_id__ field first (set by autocomplete edits)
        if (row['__category_id__']) {
          operation.category_id = row['__category_id__']
        } else if (categoryHeader) {
          const categoryName = String(row[categoryHeader] || '').trim()
          if (categoryName) {
            // Try exact match first
            let category = categories.find(
              (c) => c.name.toLowerCase() === categoryName.toLowerCase()
            )
            
            // If no exact match, try partial match
            if (!category) {
              category = categories.find(
                (c) => 
                  c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
                  categoryName.toLowerCase().includes(c.name.toLowerCase())
              )
            }
            
            if (category) {
              operation.category_id = category.id
            } else {
              console.warn(`Category not found for name: "${categoryName}". Available categories:`, categories.map(c => c.name))
            }
          }
        }

        // Check for special __operation_type__ field first (set by dropdown edits)
        if (row['__operation_type__']) {
          operation.operation_type = row['__operation_type__']
        } else if (operationTypeHeader) {
          const type = String(row[operationTypeHeader] || '').toLowerCase()
          operation.operation_type = type.includes('income') || type.includes('przychód')
            ? 'income'
            : 'expense'
        } else {
          // Default to expense if not specified
          operation.operation_type = operation.amount >= 0 ? 'expense' : 'income'
          operation.amount = Math.abs(operation.amount)
        }

        return operation
      })

      // Filter out invalid operations (must have amount, date, and account)
      const validOperations = operations.filter((op) => {
        const missingFields = []
        if (!op.amount || op.amount <= 0) missingFields.push('amount')
        if (!op.operation_date) missingFields.push('operation_date')
        if (!op.asset_id) missingFields.push('asset_id (konto)')
        
        const isValid = missingFields.length === 0
        if (!isValid) {
          console.warn(`Skipping invalid operation (missing: ${missingFields.join(', ')}):`, op)
        }
        return isValid
      })

      if (validOperations.length === 0) {
        setError(t('import.errors.noValidOperations', 'Brak poprawnych operacji do zaimportowania. Upewnij się, że kolumny kwota, data i konto są poprawnie zmapowane.'))
        setIsImporting(false)
        return
      }

      if (validOperations.length < operations.length) {
        const skipped = operations.length - validOperations.length
        console.warn(`Pominięto ${skipped} niepełnych operacji`)
      }

      await onImport(validOperations)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const parseDate = (dateStr: string, format: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0]

    // Try to parse based on format
    const formats: Record<string, RegExp> = {
      'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
      'DD.MM.YYYY': /^(\d{2})\.(\d{2})\.(\d{4})$/,
      'YYYY/MM/DD': /^(\d{4})\/(\d{2})\/(\d{2})$/,
    }

    const regex = formats[format]
    if (regex) {
      const match = dateStr.match(regex)
      if (match) {
        let year, month, day
        switch (format) {
          case 'DD/MM/YYYY':
          case 'DD.MM.YYYY':
            day = match[1]
            month = match[2]
            year = match[3]
            break
          case 'MM/DD/YYYY':
            month = match[1]
            day = match[2]
            year = match[3]
            break
          case 'YYYY-MM-DD':
          case 'YYYY/MM/DD':
            year = match[1]
            month = match[2]
            day = match[3]
            break
        }
        return `${year}-${month}-${day}`
      }
    }

    // Fallback to Date parsing
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }

    return new Date().toISOString().split('T')[0]
  }

  const handleClose = () => {
    setActiveStep(0)
    setCsvData([])
    setEditedData([])
    setHeaders([])
    setColumnMapping({})
    setError('')
    onClose()
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        {t('import.title', 'Import operacji z CSV')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <UploadCSVStep
            onCSVParsed={handleCSVParsed}
            onError={setError}
          />
        )}

        {activeStep === 1 && (
          <MapColumnsStep
            headers={headers}
            csvData={csvData}
            accounts={accounts}
            categories={categories}
            initialMapping={columnMapping}
            onMappingComplete={handleMappingComplete}
            onSaveTemplate={handleSaveTemplate}
            onLoadTemplate={handleLoadTemplate}
            onValidationChange={setIsMappingValid}
            userId={userId}
          />
        )}

        {activeStep === 2 && (
          <PreviewDataStep
            data={editedData}
            columnMapping={columnMapping}
            accounts={accounts}
            categories={categories}
            onDataChange={setEditedData}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {t('common.cancel', 'Anuluj')}
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            {t('common.back', 'Wstecz')}
          </Button>
        )}
        {activeStep === 1 && (
          <Button
            onClick={handleMappingNext}
            variant="contained"
            disabled={!isMappingValid}
          >
            {t('common.next', 'Dalej')}
          </Button>
        )}
        {activeStep === 2 && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={isImporting || !canImport}
          >
            {isImporting
              ? t('import.importing', 'Importowanie...')
              : t('import.import', 'Importuj')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ImportCSVDialog
