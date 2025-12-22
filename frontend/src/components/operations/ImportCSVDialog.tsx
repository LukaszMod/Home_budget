import React, { useState, useEffect } from 'react'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import UploadCSVStep from './csv/UploadCSVStep.js'
import MapColumnsStep from './csv/MapColumnsStep.js'
import PreviewDataStep from './csv/PreviewDataStep.js'
import type { CSVRow, ColumnMapping, ImportTemplate } from './csv/types.js'
import { useNotifier } from '../common/Notifier.js'

// Zod schema for single operation validation
const operationSchema = z.object({
  amount: z.number().positive('Kwota musi być większa od 0'),
  operation_date: z.string().min(1, 'Data jest wymagana'),
  asset_id: z.number().positive('Konto jest wymagane'),
  description: z.string().optional(),
  category_id: z.number().optional(),
  operation_type: z.enum(['income', 'expense']),
})

// Schema for entire import form
const importFormSchema = z.object({
  operations: z.array(operationSchema),
})

type ImportFormData = z.infer<typeof importFormSchema>

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
  userId,
}) => {
  const { t } = useTranslation()
  const { notify } = useNotifier()
  const [activeStep, setActiveStep] = useState(0)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [editedData, setEditedData] = useState<CSVRow[]>([])
  const [error, setError] = useState<string>('')
  const [isImporting, setIsImporting] = useState(false)
  const [isMappingValid, setIsMappingValid] = useState(false)
  
  // React Hook Form setup
  const { setValue, getValues } = useForm<ImportFormData>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      operations: [],
    },
    mode: 'onChange',
  })

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
    // Update form values when mapping changes
    updateFormOperations(csvData, mapping)
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

  // Function to convert CSV rows to operations and update form
  const updateFormOperations = (data: CSVRow[], mapping: ColumnMapping) => {
    const operations = data.map((row) => convertRowToOperation(row, mapping))
    setValue('operations', operations)
  }

  // Update form when edited data changes
  useEffect(() => {
    if (activeStep === 2 && editedData.length > 0) {
      updateFormOperations(editedData, columnMapping)
    }
  }, [editedData, columnMapping, activeStep])

  // Function to convert a single CSV row to operation format
  const convertRowToOperation = (row: CSVRow, mapping: ColumnMapping): any => {
    const operation: any = {}

    // Get header names from column indices
    const amountHeader = mapping.amount !== undefined ? headers[mapping.amount] : undefined
    const descriptionHeader = mapping.description !== undefined ? headers[mapping.description] : undefined
    const dateHeader = mapping.date !== undefined ? headers[mapping.date] : undefined
    const sourceAccountHeader = mapping.sourceAccount !== undefined ? headers[mapping.sourceAccount] : undefined
    const categoryHeader = mapping.category !== undefined ? headers[mapping.category] : undefined
    const operationTypeHeader = mapping.operationType !== undefined ? headers[mapping.operationType] : undefined

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
        mapping.dateFormat || 'YYYY-MM-DD'
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
        
        // If no exact match, try partial match
        if (!account) {
          account = accounts.find(
            (a) => 
              a.name.toLowerCase().includes(accountName.toLowerCase()) ||
              accountName.toLowerCase().includes(a.name.toLowerCase())
          )
        }
        
        if (account) {
          operation.asset_id = account.id
        }
      }
    }

    // Check for special __category_id__ field first
    if (row['__category_id__']) {
      operation.category_id = row['__category_id__']
    } else if (categoryHeader) {
      const categoryName = String(row[categoryHeader] || '').trim()
      if (categoryName) {
        let category = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase()
        )
        
        if (!category) {
          category = categories.find(
            (c) => 
              c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
              categoryName.toLowerCase().includes(c.name.toLowerCase())
          )
        }
        
        if (category) {
          operation.category_id = category.id
        }
      }
    }

    // Determine operation type and normalize amount
    // First, determine the type from various sources
    let operationType: 'income' | 'expense' = 'expense'
    
    if (row['__operation_type__']) {
      // Use manually edited type
      const editedType = String(row['__operation_type__'])
      operationType = editedType === 'income' ? 'income' : 'expense'
    } else if (operationTypeHeader) {
      // Use type from CSV column
      const type = String(row[operationTypeHeader] || '').toLowerCase()
      operationType = type.includes('income') || type.includes('przychód')
        ? 'income'
        : 'expense'
    } else {
      // Determine type from amount sign (negative = expense, positive = income)
      operationType = operation.amount < 0 ? 'expense' : 'income'
    }
    
    // Keep amount sign as-is (negative amounts are expenses, positive are income)
    operation.operation_type = operationType

    return operation
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      setError('')

      // Get operations from form
      const formData = getValues()
      const operations = formData.operations

      // Validate each operation and collect errors
      const validOperations: any[] = []
      const errorRows: string[] = []

      operations.forEach((op, index) => {
        const rowNumber = index + 1
        const result = operationSchema.safeParse(op)
        
        if (result.success) {
          validOperations.push(op)
        } else {
          // Collect error messages for this row
          const errors = result.error.issues.map((e: any) => e.message).join(', ')
          errorRows.push(`Wiersz ${rowNumber}: ${errors}`)
        }
      })

      // If there are validation errors, show them in Snackbar
      if (errorRows.length > 0) {
        const errorMessage = errorRows.length <= 3 
          ? errorRows.join(' | ')
          : `Błędy walidacji w ${errorRows.length} wierszach: ${errorRows.slice(0, 3).join(' | ')} ...`
        
        notify(errorMessage, 'error')
        setIsImporting(false)
        return
      }

      // If no valid operations, show error
      if (validOperations.length === 0) {
        notify(t('import.errors.noValidOperations', 'Brak poprawnych operacji do zaimportowania'), 'error')
        setIsImporting(false)
        return
      }

      // Import valid operations
      await onImport(validOperations)
      
      // Show success message
      notify(t('import.success', `Zaimportowano ${validOperations.length} operacji`), 'success')
      handleClose()
    } catch (err: any) {
      notify(err.message || 'Import failed', 'error')
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
            userId={userId || 0}
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
            disabled={isImporting}
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
