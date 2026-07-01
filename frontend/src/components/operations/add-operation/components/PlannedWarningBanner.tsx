import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PlannedWarningBanner = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500 }}>
        ⏰ {t('operations.plannedWarning') ?? 'Operacja zaplanowana na przyszłą datę'}
      </Typography>
    </Box>
  );
};

export default PlannedWarningBanner;
