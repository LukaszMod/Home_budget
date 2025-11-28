import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

const Operations: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">Operations</Typography>
      <Box sx={{ mt: 2 }}>Tu będą operacje.</Box>
    </Paper>
  )
}

export default Operations
