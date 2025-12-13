import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Account as APIAccount } from '../lib/api'
import { useAccountsData } from '../hooks/useAccountsData'
import {
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  IconButton,
  Stack,
  Box
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import StyledModal from '../components/common/StyledModal'
import AddAccountModal from '../components/users/AddAccountModal'
import UsersPanel from '../components/users/UsersPanel'
import AccountsSummary from '../components/users/AccountsSummary'

type Account = APIAccount

const Accounts: React.FC = () => {
  const { t } = useTranslation()
  
  // Hook for all account data and mutations
  const { 
    accountsQuery, 
    usersQuery, 
    operationsQuery,
    createAccountMut, 
    updateAccountMut, 
    deleteAccountMut,
    toggleAccountClosedMut,
    createUserMut,
    deleteUserMut
  } = useAccountsData()

  const allAccounts = accountsQuery.data ?? []
  const users = usersQuery.data ?? []
  const operations = operationsQuery.data ?? []
  const isError = accountsQuery.isError
  const error = accountsQuery.error

  // Separate active and closed accounts
  const activeAccounts = allAccounts.filter(acc => !acc.is_closed)
  const closedAccounts = allAccounts.filter(acc => acc.is_closed)

  // dialog state
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Account | null>(null)
  const [name, setName] = React.useState('')
  const [userId, setUserId] = React.useState<number | ''>('')
  const [accountNumber, setAccountNumber] = React.useState('')

  // react-query handles loading

  const handleOpenNew = () => {
    setEditing(null)
    setName('')
    setUserId('')
    setAccountNumber('')
    setOpen(true)
  }

  // users modal state
  const [userModalOpen, setUserModalOpen] = React.useState(false)
  const [userFullName, setUserFullName] = React.useState('')
  const [userNick, setUserNick] = React.useState('')

  const handleAddUser = async () => {
    await createUserMut.mutateAsync({ full_name: userFullName, nick: userNick })
    setUserFullName('')
    setUserNick('')
    setUserModalOpen(false)
  }

  const handleOpenEdit = (r: Account) => {
    setEditing(r)
    setName(r.name)
    setUserId(r.user_id)
    setAccountNumber(r.account_number ?? '')
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('accounts.confirmDelete'))) return
    await deleteAccountMut.mutateAsync(id)
  }

  const handleToggleClosed = async (id: number) => {
    await toggleAccountClosedMut.mutateAsync(id)
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Usuń użytkownika?')) return
    await deleteUserMut.mutateAsync(id)
  }

  const handleSave = async () => {
    const payload = { name, user_id: Number(userId), account_number: accountNumber || null }
    if (editing) {
      await updateAccountMut.mutateAsync({ id: editing.id, payload })
    } else {
      await createAccountMut.mutateAsync(payload)
    }
    setOpen(false)
  }

  const handleDialogClose = (_event?: object, reason?: string) => {
    // prevent closing on backdrop click
    if (reason === 'backdropClick') return
    setOpen(false)
  }

  if (isError) return <Paper sx={{ p: 2 }}><div>Error: {String(error)}</div></Paper>

  const AccountTable: React.FC<{ accounts: Account[]; showCloseBtn?: boolean }> = ({ accounts, showCloseBtn = true }) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('accounts.table.id')}</TableCell>
          <TableCell>{t('accounts.table.name')}</TableCell>
          <TableCell>{t('accounts.table.owner')}</TableCell>
          <TableCell>{t('accounts.table.accountNumber')}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {accounts.map((r) => {
          const hasOps = operations.some(op => op.asset_id === r.id)
          return (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>{(users.find(u => u.id === r.user_id)?.full_name) ?? r.user_id}</TableCell>
              <TableCell>{r.account_number ?? ''}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => handleOpenEdit(r)}><EditIcon /></IconButton>
                {showCloseBtn && (
                  <IconButton size="small" onClick={() => handleToggleClosed(r.id)} title={r.is_closed ? t('accounts.reopenAccount') : t('accounts.closeAccount')}>
                    {r.is_closed ? <LockOpenIcon /> : <LockIcon />}
                  </IconButton>
                )}
                {showCloseBtn && !hasOps && (
                  <IconButton size="small" onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">{t('accounts.title')}</Typography>
        <Button variant="contained" onClick={handleOpenNew}>{t('accounts.addButton')}</Button>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          {/* Active Accounts Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {t('accounts.activeAccounts') ?? 'Active Accounts'}
            </Typography>
            <AccountTable accounts={activeAccounts} showCloseBtn={true} />
          </Box>

          {/* Closed Accounts Section */}
          {closedAccounts.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {t('accounts.closedAccounts') ?? 'Closed Accounts'}
              </Typography>
              <AccountTable accounts={closedAccounts} showCloseBtn={true} />
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <AccountsSummary operations={operations ?? []} />
          <UsersPanel
            users={users}
            accounts={allAccounts}
            onAddUserClick={() => setUserModalOpen(true)}
            onDeleteUser={handleDeleteUser}
          />
        </Grid>
      </Grid>

      <StyledModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={'Nowy użytkownik'}
        footer={(<><Button onClick={() => setUserModalOpen(false)}>Anuluj</Button><Button variant="contained" onClick={handleAddUser}>Dodaj</Button></>)}
      >
        <TextField label={'Imię i nazwisko'} value={userFullName} onChange={(e) => setUserFullName(e.target.value)} fullWidth sx={{ mb: 1 }} />
        <TextField label={'Nick'} value={userNick} onChange={(e) => setUserNick(e.target.value)} fullWidth />
      </StyledModal>

      <AddAccountModal
        open={open}
        onClose={handleDialogClose}
        editing={editing}
        name={name}
        onNameChange={setName}
        userId={userId}
        onUserIdChange={setUserId}
        accountNumber={accountNumber}
        onAccountNumberChange={setAccountNumber}
        onSave={handleSave}
      />
    </Paper>
  )
}

export default Accounts