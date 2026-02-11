import { Paper, Box, Typography, Button } from '@mui/material';

const PageHeader = ({
  title,
  center,
  actions,
}: {
  title: string;
  center?: React.ReactNode;
  actions?: React.ReactNode;
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{title}</Typography>
        {!!center && <Box sx={{ display: 'flex', gap: 2 }}>{center}</Box>}
        {!!actions && <Box sx={{ display: 'flex', gap: 2 }}>{actions}</Box>}
      </Box>
    </Paper>
  );
};

export default PageHeader;
