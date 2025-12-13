import React, { createContext, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

type Severity = 'success' | 'info' | 'warning' | 'error'
type Notifier = { notify: (message: string, severity?: Severity) => void }

const NotifierContext = createContext<Notifier>({ notify: () => {} })

export const NotifierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<Severity>('info')

  const notify = (msg: string, sev: Severity = 'info') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }

  return (
    <NotifierContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotifierContext.Provider>
  )
}

export const useNotifier = () => useContext(NotifierContext)
