import React from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useTranslation } from 'react-i18next'
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

// Helper to get date format based on current language
export const getDateFormat = (lang: string): string => {
  return lang === 'pl' ? 'DD/MM/YYYY' : 'MM/DD/YYYY'
}

// Helper function to format date strings based on language
export const formatDate = (dateString: string | Date, lang: string): string => {
  if (!dateString) return '-'
  const locale = lang === 'pl' ? 'pl-PL' : 'en-US'
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString(locale)
}
