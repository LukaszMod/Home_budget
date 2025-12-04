import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Goal as APIGoal, CreateGoalPayload } from '../lib/api'
import { useGoals } from '../hooks/useGoals'
import {
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

type Goal = APIGoal

const Goals: React.FC = () => {
  const { t } = useTranslation()
  
  const { 
    goals, 
    goalsLoading,
    goalsError,
    accounts,
    users,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
  } = useGoals()

  // Dialog state
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Goal | null>(null)
  const [name, setName] = React.useState('')
  const [userId, setUserId] = React.useState<number | ''>('')
  const [accountId, setAccountId] = React.useState<number | ''>('')
  const [targetAmount, setTargetAmount] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')

  const handleOpenNew = () => {
    setEditing(null)
    setName('')
    setUserId('')
    setAccountId('')
    setTargetAmount('')
    setTargetDate('')
    setOpen(true)
  }

  const handleOpenEdit = (goal: Goal) => {
    setEditing(goal)
    setName(goal.name)
    setUserId(goal.user_id)
    setAccountId(goal.asset_id)
    setTargetAmount(String(goal.target_amount))
    setTargetDate(goal.target_date)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSave = async () => {
    if (!name || !userId || !accountId || !targetAmount || !targetDate) {
      alert(t('goals.requiredFields') || 'Uzupełnij wszystkie pola')
      return
    }

    const payload: CreateGoalPayload = {
      user_id: Number(userId),
      asset_id: Number(accountId),
      name,
      target_amount: parseFloat(targetAmount),
      target_date: targetDate,
    }

    if (editing) {
      updateGoal({ id: editing.id, payload })
    } else {
      createGoal(payload)
    }
    handleClose()
  }

  const handleDelete = (goal: Goal) => {
    if (window.confirm(t('common.confirmDelete') || 'Potwierdź usunięcie')) {
      deleteGoal(goal.id)
    }
  }

  const handleComplete = (goal: Goal) => {
    if (window.confirm(t('goals.confirmComplete') || 'Potwierdź ukończenie celu')) {
      completeGoal(goal.id)
    }
  }

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  const calculateMonthlyNeeded = (goal: Goal) => {
    const targetDate = new Date(goal.target_date)
    const today = new Date()
    const monthsRemaining = Math.max(
      1,
      (targetDate.getFullYear() - today.getFullYear()) * 12 + 
      (targetDate.getMonth() - today.getMonth())
    )
    return (goal.target_amount - goal.current_amount) / monthsRemaining
  }

  const calculateDaysRemaining = (goal: Goal) => {
    const targetDate = new Date(goal.target_date)
    const today = new Date()
    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">{t('goals.title') || 'Cele oszczędzania'}</Typography>
        <Button variant="contained" onClick={handleOpenNew}>
          {t('goals.add') || 'Dodaj cel'}
        </Button>
      </Stack>

      {goalsLoading && <LinearProgress />}
      {goalsError && <Typography color="error">{String(goalsError)}</Typography>}

      {goals.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          {t('goals.noGoals') || 'Brak celów'}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {goals.map((goal) => {
            const progress = calculateProgress(goal)
            const monthlyNeeded = calculateMonthlyNeeded(goal)
            const daysRemaining = calculateDaysRemaining(goal)
            const account = accounts.find((a) => a.id === goal.asset_id)
            const user = users.find((u) => u.id === goal.user_id)

            return (
              <Grid item xs={12} key={goal.id}>
                <Paper sx={{ p: 2, backgroundColor: goal.is_completed ? '#f5f5f5' : 'white' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <div>
                        <Typography variant="h6">{goal.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user?.full_name} • {account?.name}
                        </Typography>
                      </div>
                      <Stack direction="row" spacing={1}>
                        {!goal.is_completed && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(goal)}
                              title={t('common.edit') || 'Edytuj'}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleComplete(goal)}
                              title={t('goals.markComplete') || 'Oznacz jako ukończone'}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(goal)}
                          title={t('common.delete') || 'Usuń'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {t('goals.progress') || 'Postęp'}: {goal.current_amount.toFixed(2)} / {goal.target_amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          {progress.toFixed(0)}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={progress} />
                    </Box>

                    <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                      <div>
                        <Typography variant="caption" color="textSecondary">
                          {t('goals.targetDate') || 'Data celu'}
                        </Typography>
                        <Typography variant="body2">{formatDate(goal.target_date)}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color="textSecondary">
                          {t('goals.daysRemaining') || 'Dni do celu'}
                        </Typography>
                        <Typography variant="body2">{daysRemaining} dni</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color="textSecondary">
                          {t('goals.monthlyNeeded') || 'Potrzebnie na miesiąc'}
                        </Typography>
                        <Typography variant="body2">{monthlyNeeded.toFixed(2)}</Typography>
                      </div>
                      {goal.is_completed && (
                        <div>
                          <Typography variant="caption" color="textSecondary">
                            {t('goals.completedOn') || 'Ukończone'}
                          </Typography>
                          <Typography variant="body2">
                            {goal.completed_date ? formatDate(goal.completed_date) : 'N/A'}
                          </Typography>
                        </div>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Dialog for create/edit */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? t('goals.editGoal') || 'Edytuj cel' : t('goals.addGoal') || 'Dodaj cel'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label={t('goals.name') || 'Nazwa'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>{t('goals.user') || 'Użytkownik'}</InputLabel>
              <Select
                value={userId}
                onChange={(e) => setUserId(e.target.value as number)}
                label={t('goals.user') || 'Użytkownik'}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('goals.account') || 'Konto'}</InputLabel>
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value as number)}
                label={t('goals.account') || 'Konto'}
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('goals.targetAmount') || 'Kwota docelowa'}
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label={t('goals.targetDate') || 'Data celu'}
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel') || 'Anuluj'}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('common.save') || 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Goals
