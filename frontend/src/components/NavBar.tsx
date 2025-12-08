import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import useStore from '../store'
import { Switch, Box, Select, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const tab = useStore((s) => s.tab)
  const setTab = useStore((s) => s.setTab)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setTab(newValue as any)
  }

  const handleLangChange = (value: string) => {
    setLang(value)
    i18n.changeLanguage(value)
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 2 }}>
          {t('Home Budget')}
        </Typography>
        <Tabs value={tab} onChange={handleChange} textColor="inherit" indicatorColor="secondary">
          <Tab label={t('Budget')} value="budget" />
          <Tab label={t('Users')} value="users" />
          <Tab label={t('Assets')} value="assets" />
          <Tab label={t('Operations')} value="operations" />
          <Tab label={t('Categories')} value="categories" />
          <Tab label={t('Goals')} value="goals" />
          <Tab label={t('Hashtags')} value="hashtags" />
          <Tab label={t('RecurringOperations')} value="recurring" />
          <Tab label={t('Statistics')} value="statistics" />
        </Tabs>

        <Box sx={{ flexGrow: 1 }} />

        <Switch checked={theme === 'dark'} onChange={toggleTheme} color="default" />

        <Select value={lang} onChange={(e) => handleLangChange(e.target.value as string)} size="small" sx={{ ml: 1, color: 'inherit' }}>
          <MenuItem value="pl">PL</MenuItem>
          <MenuItem value="en">EN</MenuItem>
        </Select>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
