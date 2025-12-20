import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useStore from '../../store'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Brightness4, Brightness7, Settings } from '@mui/icons-material'
import SettingsModal from './SettingsModal'

const NavBar: React.FC = () => {
  const { t } = useTranslation()
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            💰 {t('app.title') || 'Home Budget'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={t('settings.title') ?? 'Ustawienia'}>
              <IconButton onClick={() => setSettingsOpen(true)} color="inherit" size="small">
                <Settings />
              </IconButton>
            </Tooltip>

            <Tooltip title={theme === 'dark' ? t('app.lightMode') || 'Light Mode' : t('app.darkMode') || 'Dark Mode'}>
              <IconButton onClick={toggleTheme} color="inherit" size="small">
                {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

export default NavBar
