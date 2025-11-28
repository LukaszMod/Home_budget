import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccounts, createAccount, updateAccount, deleteAccount, Account as APIAccount, AccountPayload } from '../lib/api'
import { useNotifier } from '../components/Notifier'
import {
  Typography,
  Paper,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

type Account = APIAccount

const Accounts: React.FC = () => {
  const { t } = useTranslation()

  // data (react-query)
  const qc = useQueryClient()
  const { data: rows = [], isLoading, isError, error } = useQuery(['accounts'], getAccounts)
  const notifier = useNotifier()

  // dialog state
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Account | null>(null)
  const [name, setName] = React.useState('')
  const [owner, setOwner] = React.useState<number | ''>('')
  const [accountNumber, setAccountNumber] = React.useState('')

  const createMut = useMutation((payload: AccountPayload) => createAccount(payload), {
    onSuccess: () => {
      qc.invalidateQueries(['accounts'])
      notifier.notify(t('accounts.messages.created') ?? 'Account created', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error')
  })
  const updateMut = useMutation(({ id, payload }: { id: number; payload: AccountPayload }) => updateAccount({ id, payload }), {
    onSuccess: () => {
      qc.invalidateQueries(['accounts'])
      notifier.notify(t('accounts.messages.updated') ?? 'Account updated', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error')
  })
  const deleteMut = useMutation((id: number) => deleteAccount(id), {
    onSuccess: () => {
      qc.invalidateQueries(['accounts'])
      notifier.notify(t('accounts.messages.deleted') ?? 'Account deleted', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error')
  })

  // react-query handles loading

  const handleOpenNew = () => {
    setEditing(null)
    setName('')
    setOwner('')
    setAccountNumber('')
    setOpen(true)
  }

  const handleOpenEdit = (r: Account) => {
    setEditing(r)
    setName(r.name)
    setOwner(r.owner)
    setAccountNumber(r.account_number ?? '')
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('accounts.confirmDelete'))) return
    await deleteMut.mutateAsync(id)
  }

  const handleSave = async () => {
    const payload = { name, owner: Number(owner), account_number: accountNumber || null }
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload })
    } else {
      await createMut.mutateAsync(payload)
    }
    setOpen(false)
  }


  const handleDialogClose = (_event: object, reason?: string) => {
    // prevent closing on backdrop click
    if (reason === 'backdropClick') return
    setOpen(false)
  }

  if (isError) return <Paper sx={{ p: 2 }}><div>Error: {String(error)}</div></Paper>

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">{t('accounts.title')}</Typography>
        <Button variant="contained" onClick={handleOpenNew}>{t('accounts.addButton')}</Button>
      </Stack>

      <Box sx={{ mt: 2 }}>
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
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.owner}</TableCell>
                <TableCell>{r.account_number ?? ''}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenEdit(r)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog
        open={open}
        onClose={handleDialogClose}
        disableEscapeKeyDown
        aria-labelledby="account-dialog-title"
      >
        <DialogTitle id="account-dialog-title">{editing ? t('accounts.dialog.edit') : t('accounts.dialog.new')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, width: 400 }}>
          <TextField label={t('accounts.fields.name')} value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label={t('accounts.fields.owner')} value={String(owner)} onChange={(e) => setOwner(e.target.value === '' ? '' : Number(e.target.value))} />
          <TextField label={t('accounts.fields.accountNumber')} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('actions.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('actions.save')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Accounts
