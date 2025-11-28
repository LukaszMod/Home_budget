import { createTheme } from '@mui/material'

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
    },
  })
