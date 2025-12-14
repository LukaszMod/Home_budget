import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import { Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import type { CSVRow, ColumnMapping, ImportTemplate } from './types'
import { getImportTemplates, createImportTemplate, deleteImportTemplate } from '../../../lib/api'

interface MapColumnsStepProps {
  headers: string[]
  csvData: CSVRow[]
  accounts?: any[]
  categories?: any[]
  initialMapping: ColumnMapping
  onMappingComplete: (mapping: ColumnMapping) => void
  onSaveTemplate: (template: ImportTemplate) => void
  onLoadTemplate: (template: ImportTemplate) => void
  onValidationChange?: (isValid: boolean) => void
  userId: number
}

const MapColumnsStep: React.FC<MapColumnsStepProps> = ({
  headers,
  csvData,
  accounts: _accounts,
  categories: _categories,
  initialMapping,
  onMappingComplete,
  onSaveTemplate,
  onLoadTemplate,
  onValidationChange,
  userId,
}) => {
  const { t } = useTranslation()
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping)
  const [dateFormat, setDateFormat] = useState<string>('YYYY-MM-DD')
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [savedTemplates, setSavedTemplates] = useState<ImportTemplate[]>([])

  useEffect(() => {
    // Load saved templates from database
    const loadTemplates = async () => {
      try {
        const templates = await getImportTemplates(userId)
        setSavedTemplates(templates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }
    loadTemplates()
  }, [userId])

  useEffect(() => {
    if (initialMapping.dateFormat) {
      setDateFormat(initialMapping.dateFormat)
    }
  }, [initialMapping])

  // Notify parent of validation status
  useEffect(() => {
    const isValid = mapping.amount !== undefined && mapping.date !== undefined && mapping.sourceAccount !== undefined
    onValidationChange?.(isValid)
  }, [mapping, onValidationChange])

  const handleMappingChange = (field: keyof ColumnMapping, value: number | undefined) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateFormatChange = (format: string) => {
    setDateFormat(format)
    setMapping((prev) => ({
      ...prev,
      dateFormat: format,
    }))
  }

  const completeMapping = () => {
    const finalMapping = {
      ...mapping,
      dateFormat,
    }
    onMappingComplete(finalMapping)
  }

  // Expose completeMapping to parent via ref
  useEffect(() => {
    ;(window as any).__mapColumnsStepRef = { completeMapping }
  }, [mapping, dateFormat])

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return

    try {
      const newTemplate = await createImportTemplate(userId, {
        name: templateName,
        template_data: {
          columnMapping: { ...mapping, dateFormat },
        },
      })

      const formattedTemplate: ImportTemplate = {
        id: newTemplate.id.toString(),
        name: newTemplate.name,
        columnMapping: newTemplate.template_data.columnMapping,
        createdAt: newTemplate.created_at || new Date().toISOString(),
      }

      onSaveTemplate(formattedTemplate)
      setSavedTemplates((prev) => [...prev, newTemplate])
      setTemplateName('')
      setTemplateDialogOpen(false)
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  const handleLoadTemplate = (template: ImportTemplate) => {
    const columnMapping = template.template_data?.columnMapping || template.columnMapping
    if (columnMapping) {
      setMapping(columnMapping)
      if (columnMapping.dateFormat) {
        setDateFormat(columnMapping.dateFormat)
      }
    }
    onLoadTemplate(template)
  }

  const handleDeleteTemplate = async (templateId: string | number) => {
    try {
      await deleteImportTemplate(Number(templateId))
      setSavedTemplates((prev) => prev.filter((t) => t.id !== Number(templateId)))
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const columnOptions = headers.map((header, index) => ({
    value: index,
    label: header,
  }))

  const dateFormats = [
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-14)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (14/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/14/2024)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (14.12.2024)' },
    { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (2024/12/14)' },
  ]

  const previewRows = csvData.slice(0, 3)

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t('import.mapDescription', 'Dopasuj kolumny z CSV do pól w aplikacji')}
      </Typography>

      <Stack spacing={3}>
        {/* Template Management */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              disabled={!mapping.amount || !mapping.date}
            >
              {t('import.saveTemplate', 'Zapisz szablon')}
            </Button>
            {savedTemplates.length > 0 && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('import.savedTemplates', 'Zapisane szablony:')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {savedTemplates.map((template) => (
                    <Paper
                      key={template.id}
                      sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleLoadTemplate(template)}
                    >
                      <Typography variant="body2">{template.name}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(template.id)
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Column Mapping */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('import.columnMapping', 'Mapowanie kolumn')}
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>{t('import.fields.amount', 'Kwota')}</InputLabel>
              <Select
                value={mapping.amount ?? ''}
                onChange={(e) => handleMappingChange('amount', e.target.value as number)}
                label={t('import.fields.amount', 'Kwota')}
              >
                <MenuItem value="">
                  <em>{t('common.none', 'Brak')}</em>
                </MenuItem>
                {columnOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>{t('import.fields.date', 'Data')}</InputLabel>
              <Select
                value={mapping.date ?? ''}
                onChange={(e) => handleMappingChange('date', e.target.value as number)}
                label={t('import.fields.date', 'Data')}
              >
                <MenuItem value="">
                  <em>{t('common.none', 'Brak')}</em>
                </MenuItem>
                {columnOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {mapping.date !== undefined && (
              <FormControl fullWidth>
                <InputLabel>{t('import.fields.dateFormat', 'Format daty')}</InputLabel>
                <Select
                  value={dateFormat}
                  onChange={(e) => handleDateFormatChange(e.target.value)}
                  label={t('import.fields.dateFormat', 'Format daty')}
                >
                  {dateFormats.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>{t('import.fields.description', 'Opis')}</InputLabel>
              <Select
                value={mapping.description ?? ''}
                onChange={(e) => handleMappingChange('description', e.target.value as number)}
                label={t('import.fields.description', 'Opis')}
              >
                <MenuItem value="">
                  <em>{t('common.none', 'Brak')}</em>
                </MenuItem>
                {columnOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('import.fields.sourceAccount', 'Konto źródłowe')}</InputLabel>
              <Select
                value={mapping.sourceAccount ?? ''}
                onChange={(e) => handleMappingChange('sourceAccount', e.target.value as number)}
                label={t('import.fields.sourceAccount', 'Konto źródłowe')}
              >
                <MenuItem value="">
                  <em>{t('common.none', 'Brak')}</em>
                </MenuItem>
                {columnOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('import.fields.category', 'Kategoria')}</InputLabel>
              <Select
                value={mapping.category ?? ''}
                onChange={(e) => handleMappingChange('category', e.target.value as number)}
                label={t('import.fields.category', 'Kategoria')}
              >
                <MenuItem value="">
                  <em>{t('common.none', 'Brak')}</em>
                </MenuItem>
                {columnOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('import.fields.operationType', 'Typ operacji')}</InputLabel>
              <Select
                value={mapping.operationType ?? ''}
                onChange={(e) => handleMappingChange('operationType', e.target.value as number)}
                label={t('import.fields.operationType', 'Typ operacji')}
              >
                <MenuItem value="">
                  <em>{t('common.none', 'Brak')}</em>
                </MenuItem>
                {columnOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Preview */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('import.preview', 'Podgląd (pierwsze 3 wiersze)')}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableCell key={index}>
                      <strong>{header}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <TableCell key={colIndex}>{String(row[header] || '')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      {/* Save Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)}>
        <DialogTitle>{t('import.saveTemplateTitle', 'Zapisz szablon')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('import.templateName', 'Nazwa szablonu')}
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>
            {t('common.cancel', 'Anuluj')}
          </Button>
          <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
            {t('common.save', 'Zapisz')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MapColumnsStep
