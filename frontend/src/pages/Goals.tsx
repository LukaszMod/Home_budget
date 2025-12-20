import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Goal as APIGoal, CreateGoalPayload } from '../lib/api'
import { useGoals } from '../hooks/useGoals'
import CalcTextField from '../components/common/ui/CalcTextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { DatePickerProvider, useDateFormat, useFormatDate } from '../components/common/DatePickerProvider'
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
import { useNotifier } from '../components/common/Notifier'
import ConfirmDialog from '../components/common/ConfirmDialog'

type Goal = APIGoal

const Goals: React.FC = () => {
  const { t } = useTranslation()
  const dateFormat = useDateFormat()
  const formatDate = useFormatDate()
  const notifier = useNotifier()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [goalToDelete, setGoalToDelete] = React.useState<number | null>(null)
  const [completeConfirmOpen, setCompleteConfirmOpen] = React.useState(false)
  const [goalToComplete, setGoalToComplete] = React.useState<number | null>(null)
  
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
      notifier.notify(
        t('goals.validation.fillRequired') ?? 'Uzupełnij wszystkie pola',
        'error'
      )
      return
    }

    const payload: CreateGoalPayload = {
      user_id: Number(userId),
      asset_id: Number(accountId),
      name,
      target_amount: parseFloat(targetAmount),
      target_date: targetDate,
    }

    try {
      if (editing) {
        await updateGoal({ id: editing.id, payload })
        notifier.notify(
          t('goals.messages.updated') ?? 'Cel zaktualizowany',
          'success'
        )
      } else {
        await createGoal(payload)
        notifier.notify(
          t('goals.messages.created') ?? 'Cel utworzony',
          'success'
        )
      }
      handleClose()
    } catch (e: any) {
      notifier.notify(String(e), 'error')
    }
  }

  const handleDelete = (goal: Goal) => {
    setGoalToDelete(goal.id)
    setDeleteConfirmOpen(true)
  }

  const handleComplete = (goal: Goal) => {
    setGoalToComplete(goal.id)
    setCompleteConfirmOpen(true)
  }

  const parseAmount = (amount: number | string | undefined): number => {
    if (amount === undefined || amount === null) return 0
    return typeof amount === 'string' ? parseFloat(amount) : amount
  }

  const formatAmount = (amount: number | string | undefined): string => {
    const num = parseAmount(amount)
    return num.toFixed(2)
  }

  const calculateProgress = (goal: Goal) => {
    const current = parseAmount(goal.current_amount)
    const target = parseAmount(goal.target_amount)
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  const calculateMonthlyNeeded = (goal: Goal) => {
    const targetDate = new Date(goal.target_date)
    const today = new Date()
    const monthsRemaining = Math.max(
      1,
      (targetDate.getFullYear() - today.getFullYear()) * 12 + 
      (targetDate.getMonth() - today.getMonth())
    )
    const target = parseAmount(goal.target_amount)
    const current = parseAmount(goal.current_amount)
    return (target - current) / monthsRemaining
  }

  const calculateDaysRemaining = (dateString: string) => {
    const targetDate = new Date(dateString)
    const today = new Date()
    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{t('goals.title') || 'Cele oszczędzania'}</Typography>
          <Button variant="contained" onClick={handleOpenNew}>
            {t('goals.add') || 'Dodaj cel'}
          </Button>
        </Stack>
      </Paper>

      {goalsLoading && <LinearProgress />}
      {goalsError && <Typography color="error" sx={{ px: 2 }}>{String(goalsError)}</Typography>}

      <Paper sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {goals.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            {t('goals.noGoals') || 'Brak celów'}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {goals.map((goal) => {
            const progress = calculateProgress(goal)
            const monthlyNeeded = calculateMonthlyNeeded(goal)
            const daysRemaining = calculateDaysRemaining(goal.target_date)
            const account = accounts.find((a) => a.id === goal.asset_id)
            const user = users.find((u) => u.id === goal.user_id)

            return (
              <Grid item xs={12} key={goal.id}>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => goal.is_completed 
                    ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5')
                    : theme.palette.background.paper
                }}>
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
                          {t('goals.progress') || 'Postęp'}: {formatAmount(goal.current_amount)} / {formatAmount(goal.target_amount)}
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
                        <Typography variant="body2">{formatAmount(monthlyNeeded)}</Typography>
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
      </Paper>

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
            <CalcTextField
              label={t('goals.targetAmount') || 'Kwota docelowa'}
              value={targetAmount}
              onChange={(val: number) => setTargetAmount(String(val))}
              fullWidth
            />
            <DatePickerProvider>
              <DatePicker
                label={t('goals.targetDate') || 'Data celu'}
                value={targetDate ? dayjs(targetDate) : null}
                onChange={(date) => setTargetDate(date ? date.format('YYYY-MM-DD') : '')}
                format={dateFormat}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </DatePickerProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel') || 'Anuluj'}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('common.save') || 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        message={t('common.confirmDelete') || 'Potwierdź usunięcie'}
        onConfirm={() => {
          if (goalToDelete !== null) {
            deleteGoal(goalToDelete)
          }
          setDeleteConfirmOpen(false)
          setGoalToDelete(null)
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setGoalToDelete(null)
        }}
      />

      <ConfirmDialog
        open={completeConfirmOpen}
        message={t('goals.confirmComplete') || 'Potwierdź ukończenie celu'}
        confirmText={t('goals.markComplete') || 'Ukończ'}
        confirmColor="success"
        onConfirm={() => {
          if (goalToComplete !== null) {
            completeGoal(goalToComplete)
          }
          setCompleteConfirmOpen(false)
          setGoalToComplete(null)
        }}
        onCancel={() => {
          setCompleteConfirmOpen(false)
          setGoalToComplete(null)
        }}
      />
    </Box>
  )
}

export default Goals
