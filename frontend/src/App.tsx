import React from 'react'
import { CssBaseline, Container, ThemeProvider } from '@mui/material'
import NavBar from './components/NavBar'
import Budget from './pages/Budget'
import Accounts from './pages/Accounts'
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
  const tab = useStore((s) => s.tab)
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
        {tab === 'budget' && <Budget />}
        {tab === 'accounts' && <Accounts />}
        {tab === 'assets' && <Assets />}
        {tab === 'operations' && <Operations />}
        {tab === 'categories' && <Categories />}
        {tab === 'goals' && <Goals />}
        {tab === 'hashtags' && <Hashtags />}
        {tab === 'recurring' && <RecurringOperations />}
        {tab === 'statistics' && <Statistics />}
      </Container>
    </ThemeProvider>
  )
}

export default App
