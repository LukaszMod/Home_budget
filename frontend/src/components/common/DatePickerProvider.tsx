import React from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../contexts/SettingsContext'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import 'dayjs/locale/en-gb'

interface DatePickerProviderProps {
  children: React.ReactNode
}

export const DatePickerProvider: React.FC<DatePickerProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()
  
  // Map i18n language to dayjs locale
  const dayjsLocale = i18n.language === 'pl' ? 'pl' : 'en-gb'
  
  // Set dayjs global locale
  React.useEffect(() => {
    dayjs.locale(dayjsLocale)
  }, [dayjsLocale])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjsLocale}>
      {children}
    </LocalizationProvider>
  )
}

// Helper to get date format from settings
export const getDateFormat = (settingsFormat?: string): string => {
  // If settings format is provided, use it
  if (settingsFormat) {
    return settingsFormat
  }
  // Fallback to default
  return 'DD.MM.YYYY'
}

// Hook to get date format from settings context
export const useDateFormat = (): string => {
  const { settings } = useSettings()
  return settings.dateFormat
}

// Hook to get locale string based on current language
export const useLocale = (): string => {
  const { i18n } = useTranslation()
  return i18n.language === 'pl' ? 'pl-PL' : 'en-US'
}

// Helper function to format date strings based on settings
export const formatDate = (dateString: string | Date, settingsFormat?: string): string => {
  if (!dateString) return '-'
  const date = typeof dateString === 'string' ? dayjs(dateString) : dayjs(dateString)
  // Use provided format or fallback to DD.MM.YYYY
  return date.format(settingsFormat || 'DD.MM.YYYY')
}

// Hook to format dates using settings
export const useFormatDate = () => {
  const { settings } = useSettings()
  return (dateString: string | Date): string => {
    if (!dateString) return '-'
    const date = typeof dateString === 'string' ? dayjs(dateString) : dayjs(dateString)
    return date.format(settings.dateFormat)
  }
}
