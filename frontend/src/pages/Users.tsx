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
import StyledModal from '../components/StyledModal'
import { TextField } from '@mui/material'

const Users: React.FC = () => {
  const { usersQuery, createUserMut, deleteUserMut } = useAccountsData()
  
  const users = usersQuery.data ?? []
  
  const [modalOpen, setModalOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [nick, setNick] = useState('')

  const handleAddUser = async () => {
    if (!fullName || !nick) {
      alert('Wypełnij wszystkie pola')
      return
    }
    
    await createUserMut.mutateAsync({ full_name: fullName, nick: nick })
    setFullName('')
    setNick('')
    setModalOpen(false)
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm('Czy na pewno chcesz usunąć użytkownika?')) {
      await deleteUserMut.mutateAsync(id)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Użytkownicy</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Dodaj użytkownika
        </Button>
      </Stack>

      <Paper>
        <Table>
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
                <TableCell><strong>@{user.nick}</strong></TableCell>
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
    </Box>
  )
}

export default Users
