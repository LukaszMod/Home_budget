import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

const Budget: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">Budget</Typography>
      <Box sx={{ mt: 2 }}>Tu będzie widok budżetu.</Box>
    </Paper>
  )
}

export default Budget
