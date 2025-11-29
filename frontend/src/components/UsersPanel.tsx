import React from 'react'
import { useTranslation } from 'react-i18next'
import { Paper, Typography, Box, Button, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import type { User as APIUser, Account as APIAccount } from '../lib/api'

interface UsersPanelProps {
  users: APIUser[]
  accounts: APIAccount[]
  onAddUserClick: () => void
  onDeleteUser: (id: number) => void
}

const UsersPanel: React.FC<UsersPanelProps> = ({
  users,
  accounts,
  onAddUserClick,
  onDeleteUser,
}) => {
  const { t } = useTranslation()

  return (
    <Paper sx={{ p: 1, mt: 2 }}>
      <Typography variant="subtitle1">{t('accounts.users.title') ?? 'Użytkownicy'}</Typography>
      <Box>
        {users.map((u) => {
          const hasAccounts = accounts.some((r) => r.user_id === u.id)
          return (
            <Box
              key={u.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.5,
              }}
            >
              <div>
                {u.full_name} {u.nick ? `(${u.nick})` : ''}
              </div>
              <div>
                <IconButton
                  size="small"
                  disabled={hasAccounts}
                  onClick={() => onDeleteUser(u.id)}
                  title={t('actions.delete') ?? 'Delete'}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </Box>
          )
        })}
      </Box>
      <Button onClick={onAddUserClick} variant="outlined" fullWidth sx={{ mt: 1 }}>
        {t('accounts.users.add') ?? 'Dodaj użytkownika'}
      </Button>
    </Paper>
  )
}

export default UsersPanel
