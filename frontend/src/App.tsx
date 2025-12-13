import React from 'react'
import { CssBaseline, Container, ThemeProvider } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
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


const App: React.FC = () => {
  const mode = useStore((s) => s.theme)

  const theme = React.useMemo(() => getTheme(mode), [mode])

  const lang = useStore((s) => s.lang)
  React.useEffect(() => {
    if (lang) i18n.changeLanguage(lang)
  }, [lang])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar />
      <Container maxWidth={false} disableGutters sx={{ mt: 4, display: 'flex', flexDirection: 'column', flex: 1, height: 'calc(100vh - 64px)' }}>
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
      </Container>
    </ThemeProvider>
  )
}

export default App
