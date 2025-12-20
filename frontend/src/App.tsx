import React, { useState } from 'react'
import { CssBaseline, Box, ThemeProvider } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import { NavBar, Sidebar } from './components'
import Budget from './pages/Budget'
import Users from './pages/Users'
import Assets from './pages/Assets'
import Operations from './pages/Operations'
import Categories from './pages/Categories'
import Goals from './pages/Goals'
import Hashtags from './pages/Hashtags'
import RecurringOperations from './pages/RecurringOperations'
import Statistics from './pages/Statistics'
import useStore from './store'
import { getTheme } from './theme'
import i18n from './i18n'
import { SettingsProvider } from './contexts/SettingsContext'


const App: React.FC = () => {
  const mode = useStore((s) => s.theme)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const theme = React.useMemo(() => getTheme(mode), [mode])

  const lang = useStore((s) => s.lang)
  React.useEffect(() => {
    if (lang) i18n.changeLanguage(lang)
  }, [lang])

  return (
    <SettingsProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <NavBar />
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginTop: '64px',
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            transition: 'margin-left 0.3s',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/budget" replace />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/users" element={<Users />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/hashtags" element={<Hashtags />} />
            <Route path="/recurring" element={<RecurringOperations />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Box>
      </Box>
      </ThemeProvider>
    </SettingsProvider>
  )
}

export default App
