import React from 'react'
import { Typography, Paper, Box } from '@mui/material'

const Categories: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">Categories</Typography>
      <Box sx={{ mt: 2 }}>Tu będą kategorie.</Box>
    </Paper>
  )
}

export default Categories
