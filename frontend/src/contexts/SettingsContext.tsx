import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface AppSettings {
  language: string
  dateFormat: string
  currency: string
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'pl',
  dateFormat: 'DD.MM.YYYY',
  currency: 'PLN'
}

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('app_settings')
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      } catch {
        return DEFAULT_SETTINGS
      }
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings))
    i18n.changeLanguage(settings.language)
  }, [settings, i18n])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
