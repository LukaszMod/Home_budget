import { Paper, Box, Typography, Button } from "@mui/material"
import type { t } from "i18next"

const PageHeader = ({ title, actions }: { title: string, actions?: React.ReactNode }) => {
    
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{title}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {actions}
          </Box>
        </Box>
      </Paper>
    )
}

export default PageHeader