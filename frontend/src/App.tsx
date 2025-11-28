import React from 'react'
import { CssBaseline, Container, ThemeProvider } from '@mui/material'
import NavBar from './components/NavBar'
import Budget from './pages/Budget'
import Accounts from './pages/Accounts'
import Operations from './pages/Operations'
import Categories from './pages/Categories'
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
      <Container sx={{ mt: 4 }}>
        {tab === 'budget' && <Budget />}
        {tab === 'accounts' && <Accounts />}
        {tab === 'operations' && <Operations />}
        {tab === 'categories' && <Categories />}
      </Container>
    </ThemeProvider>
  )
}

export default App
