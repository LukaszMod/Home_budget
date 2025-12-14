import React, { useCallback } from 'react'
import { Box, Typography, Button, Paper, Alert } from '@mui/material'
import { CloudUpload as UploadIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import Papa from 'papaparse'
import type { CSVRow } from './types'

interface UploadCSVStepProps {
  onCSVParsed: (data: CSVRow[], headers: string[]) => void
  onError: (error: string) => void
}

const UploadCSVStep: React.FC<UploadCSVStepProps> = ({
  onCSVParsed,
  onError,
}) => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = React.useState(false)

  const processFile = useCallback((file: File) => {
    if (!file) return

      if (!file.name.endsWith('.csv')) {
        onError(t('import.errors.invalidFile', 'Nieprawidłowy format pliku. Wybierz plik CSV.'))
        return
      }

      Papa.parse(file, {
        delimiter: ';', // Explicitly use semicolon as delimiter
        skipEmptyLines: true, // Skip empty lines
        encoding: 'UTF-8', // Try UTF-8 first
        complete: (results: Papa.ParseResult<any>) => {
          if (results.errors.length > 0) {
            // Filter out non-critical errors
            const criticalErrors = results.errors.filter(
              (err) => err.type === 'Quotes' || err.type === 'FieldMismatch'
            )
            if (criticalErrors.length > 0) {
              console.warn('CSV parsing errors:', results.errors)
            }
          }

          if (results.data.length === 0) {
            onError(t('import.errors.emptyFile', 'Plik CSV jest pusty'))
            return
          }

          const headers = (results.data[0] as string[])
            .map((h) => (typeof h === 'string' ? h.trim() : ''))
            .filter((h) => h !== '') // Remove empty headers

          const data = results.data.slice(1) as any[]

          // Convert to object format
          const parsedData: CSVRow[] = data
            .filter((row) => row.length > 0 && row.some((cell: any) => cell !== '' && cell != null))
            .map((row) => {
              const obj: CSVRow = {}
              headers.forEach((header, index) => {
                const value = row[index]
                // Clean up the value: remove apostrophes and extra spaces
                let cleanValue = typeof value === 'string' ? value.trim() : value
                if (typeof cleanValue === 'string') {
                  cleanValue = cleanValue.replace(/^['"]|['"]$/g, '') // Remove quotes/apostrophes from start/end
                }
                obj[header] = cleanValue || ''
              })
              return obj
            })

          if (parsedData.length === 0) {
            onError(t('import.errors.noData', 'Brak danych do zaimportowania'))
            return
          }

          onCSVParsed(parsedData, headers)
        },
        error: (error: Error) => {
          onError(
            t('import.errors.readError', 'Błąd podczas odczytu pliku: ' + error.message)
          )
        },
      })
    },
    [onCSVParsed, onError, t]
  )

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t(
          'import.uploadDescription',
          'Wybierz plik CSV z danymi operacji. Plik powinien zawierać nagłówki w pierwszym wierszu.'
        )}
      </Typography>

      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          backgroundColor: isDragging ? 'action.hover' : 'transparent',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload-file"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload-file">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <UploadIcon sx={{ fontSize: 60, color: 'action.active' }} />
            <Button variant="contained" component="span">
              {t('import.selectFile', 'Wybierz plik CSV')}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {t('import.dragDrop', 'lub przeciągnij i upuść plik tutaj')}
            </Typography>
          </Box>
        </label>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>{t('import.csvFormat', 'Format CSV:')}</strong>
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>{t('import.csvTip1', 'Pierwszy wiersz powinien zawierać nagłówki kolumn')}</li>
            <li>{t('import.csvTip2', 'Separator: średnik (;) - automatycznie wykrywany')}</li>
            <li>{t('import.csvTip3', 'Kodowanie: UTF-8 (polecane) lub Windows-1250')}</li>
            <li>{t('import.csvTip4', 'Liczby: akceptowane zarówno z kropką (100.50) jak i przecinkiem (100,50)')}</li>
          </ul>
        </Typography>
      </Alert>
      
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>{t('import.encodingWarning', 'Problem z polskimi znakami?')}</strong>
        </Typography>
        <Typography variant="body2">
          {t('import.encodingTip', 'Jeśli widzisz dziwne znaki (np. £ zamiast Ł), przekonwertuj plik do UTF-8. W Excel: Plik → Zapisz jako → CSV UTF-8 (rozdzielany przecinkami).')}
        </Typography>
      </Alert>
    </Box>
  )
}

export default UploadCSVStep
