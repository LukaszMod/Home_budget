import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useStore from '../../store'
import { Box, Select, MenuItem, IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Brightness4, Brightness7 } from '@mui/icons-material'

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)

  const handleLangChange = (value: string) => {
    setLang(value)
    i18n.changeLanguage(value)
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          💰 {t('app.title') || 'Home Budget'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={theme === 'dark' ? t('app.lightMode') || 'Light Mode' : t('app.darkMode') || 'Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value as string)}
            size="small"
            sx={{
              ml: 1,
              color: 'inherit',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiSvgIcon-root': { color: 'inherit' },
            }}
          >
            <MenuItem value="pl">🇵🇱 PL</MenuItem>
            <MenuItem value="en">🇬🇧 EN</MenuItem>
          </Select>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
