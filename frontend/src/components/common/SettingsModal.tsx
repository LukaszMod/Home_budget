import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../contexts/SettingsContext'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const LANGUAGES = [
  { code: 'pl', name: 'Polski' },
  { code: 'en', name: 'English' }
]

const DATE_FORMATS = [
  { value: 'DD.MM.YYYY', label: '31.12.2025' },
  { value: 'YYYY-MM-DD', label: '2025-12-31' },
  { value: 'MM/DD/YYYY', label: '12/31/2025' }
]

const CURRENCIES = [
  { code: 'PLN', name: 'Polski Złoty (PLN)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'USD', name: 'US Dollar (USD)' },
  { code: 'GBP', name: 'British Pound (GBP)' },
  { code: 'CHF', name: 'Swiss Franc (CHF)' }
]

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettings()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('settings.title') ?? 'Ustawienia'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('settings.language') ?? 'Język'}</InputLabel>
            <Select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              label={t('settings.language') ?? 'Język'}
            >
              {LANGUAGES.map(lang => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{t('settings.dateFormat') ?? 'Format daty'}</InputLabel>
            <Select
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              label={t('settings.dateFormat') ?? 'Format daty'}
            >
              {DATE_FORMATS.map(format => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{t('settings.currency') ?? 'Waluta domyślna'}</InputLabel>
            <Select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              label={t('settings.currency') ?? 'Waluta domyślna'}
            >
              {CURRENCIES.map(curr => (
                <MenuItem key={curr.code} value={curr.code}>
                  {curr.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            {t('settings.hint') ?? 'Ustawienia są zapisywane w przeglądarce'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.close') ?? 'Zamknij'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsModal
