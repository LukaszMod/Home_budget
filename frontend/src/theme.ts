import { createTheme } from '@mui/material'
import type { ThemeOptions } from '@mui/material'

const commonTypography = {
  h4: {
    fontSize: '1.75rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
}

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Zielony
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#66bb6a', // Jasnozielony
      light: '#98ee99',
      dark: '#338a3e',
      contrastText: '#000000',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: commonTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
}

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50', // Zielony - jaśniejszy dla lepszej widoczności
      light: '#80e27e',
      dark: '#087f23',
      contrastText: '#000000',
    },
    secondary: {
      main: '#66bb6a', // Jasnozielony - lepiej widoczny
      light: '#98ee99',
      dark: '#338a3e',
      contrastText: '#000000',
    },
    success: {
      main: '#66bb6a',
      light: '#98ee99',
      dark: '#338a3e',
    },
    error: {
      main: '#ef5350',
      light: '#ff867c',
      dark: '#b61827',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: commonTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#2a2a2a',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#404040',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404040',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#66bb6a',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4caf50',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2a2a2a',
        },
        option: {
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(76, 175, 80, 0.3) !important',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(76, 175, 80, 0.2) !important',
          },
        },
      },
    },
  },
}

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions)
