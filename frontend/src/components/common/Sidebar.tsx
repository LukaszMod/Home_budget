import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  EmojiEvents as GoalsIcon,
  Tag as TagIcon,
  Replay as ReplayIcon,
  BarChart as StatsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname.slice(1) || 'budget'

  const menuItems = [
    { path: 'budget', label: t('nav.budget'), icon: <DashboardIcon /> },
    { path: 'users', label: t('nav.users'), icon: <PeopleIcon /> },
    { path: 'assets', label: t('nav.assets'), icon: <AccountBalanceIcon /> },
    { path: 'operations', label: t('nav.operations'), icon: <ReceiptIcon /> },
    { path: 'categories', label: t('nav.categories'), icon: <CategoryIcon /> },
    { path: 'goals', label: t('nav.goals'), icon: <GoalsIcon /> },
    { path: 'hashtags', label: t('nav.hashtags'), icon: <TagIcon /> },
    { path: 'recurring', label: t('nav.recurring'), icon: <ReplayIcon /> },
    { path: 'statistics', label: t('nav.statistics'), icon: <StatsIcon /> },
  ]

  const drawerWidth = open ? 240 : 60

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          overflowX: 'hidden',
          top: 64, // Height of AppBar
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
        <IconButton onClick={onToggle} size="small">
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => navigate(`/${item.path}`)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: open ? 1 : 0,
                  transition: 'opacity 0.3s',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default Sidebar
