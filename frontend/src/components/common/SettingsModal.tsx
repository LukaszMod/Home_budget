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
import { LANGUAGES, DATE_FORMATS, CURRENCIES } from '../../models'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettings()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('settings.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('settings.language')}</InputLabel>
            <Select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              label={t('settings.language')}
            >
              {LANGUAGES.map(lang => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{t('settings.dateFormat')}</InputLabel>
            <Select
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              label={t('settings.dateFormat')}
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
