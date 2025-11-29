import React from 'react'
import { Box, Button, Grid, IconButton, Popover, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

interface BudgetCalendarProps {
  open: boolean
  anchorEl: HTMLButtonElement | null
  onClose: () => void
  selectedMonth: string
  onMonthChange: (month: string) => void
}

const BudgetCalendar: React.FC<BudgetCalendarProps> = ({
  open,
  anchorEl,
  onClose,
  selectedMonth,
  onMonthChange,
}) => {
  const [year, month] = selectedMonth.split('-')
  const currentYear = parseInt(year)
  const currentMonth = parseInt(month)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 2, minWidth: '300px' }}>
        {/* Year selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton
            size="small"
            onClick={() => {
              const newYear = currentYear - 1
              const newMonth = String(currentMonth).padStart(2, '0')
              onMonthChange(`${newYear}-${newMonth}`)
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 'bold', minWidth: '100px', textAlign: 'center' }}>
            {currentYear}
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              const newYear = currentYear + 1
              const newMonth = String(currentMonth).padStart(2, '0')
              onMonthChange(`${newYear}-${newMonth}`)
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Month grid */}
        <Grid container spacing={1}>
          {monthNames.map((monthName, index) => (
            <Grid item xs={4} key={index}>
              <Button
                fullWidth
                size="small"
                variant={currentMonth === index + 1 ? 'contained' : 'outlined'}
                onClick={() => {
                  const newMonth = String(index + 1).padStart(2, '0')
                  onMonthChange(`${currentYear}-${newMonth}`)
                  onClose()
                }}
                sx={{ fontSize: '12px', py: 1 }}
              >
                {monthName.slice(0, 3)}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Popover>
  )
}

export default BudgetCalendar
