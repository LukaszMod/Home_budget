import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface {{ComponentName}}Props {
  // Add props here
  data?: any[];
  onClose?: () => void;
}

const {{ComponentName}} = ({ data, onClose }: {{ComponentName}}Props) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h6">{t('key:label')}</Typography>
      {/* Component content */}
    </Box>
  );
};

export default {{ComponentName}};
