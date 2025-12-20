import React, { useState } from 'react'
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Stack,
  Typography,
  Box
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useAccountsData } from '../hooks/useAccountsData'
import StyledModal from '../components/common/StyledModal'
import { TextField } from '@mui/material'
import { useNotifier } from '../components/common/Notifier'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../components/common/ConfirmDialog'

const Users: React.FC = () => {
  const { t } = useTranslation()
  const notifier = useNotifier()
  const { usersQuery, createUserMut, deleteUserMut } = useAccountsData()
  
  const users = usersQuery.data ?? []
  
  const [modalOpen, setModalOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [nick, setNick] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  const handleAddUser = async () => {
    if (!fullName || !nick) {
      notifier.notify(
        t('users.validation.fillRequired') ?? 'Wypełnij wszystkie pola',
        'error'
      )
      return
    }
    
    try {
      await createUserMut.mutateAsync({ full_name: fullName, nick: nick })
      notifier.notify(
        t('users.messages.created') ?? 'Użytkownik utworzony',
        'success'
      )
      setFullName('')
      setNick('')
      setModalOpen(false)
    } catch (e: any) {
      notifier.notify(String(e), 'error')
    }
  }

  const handleDeleteUser = async (id: number) => {
    setUserToDelete(id)
    setDeleteConfirmOpen(true)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Użytkownicy</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
          >
            Dodaj użytkownika
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Imię i nazwisko</TableCell>
              <TableCell>Nick</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell><strong>{user.nick}</strong></TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <StyledModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Dodaj użytkownika"
        footer={
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => setModalOpen(false)}>Anuluj</Button>
            <Button onClick={handleAddUser} variant="contained">Zapisz</Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          <TextField
            label="Imię i nazwisko"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            fullWidth
            required
          />
        </Stack>
      </StyledModal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        message="Czy na pewno chcesz usunąć tego użytkownika?"
        onConfirm={async () => {
          if (userToDelete !== null) {
            await deleteUserMut.mutateAsync(userToDelete)
          }
          setDeleteConfirmOpen(false)
          setUserToDelete(null)
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setUserToDelete(null)
        }}
      />
    </Box>
  )
}

export default Users
