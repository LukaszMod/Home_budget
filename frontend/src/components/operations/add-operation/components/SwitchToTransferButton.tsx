import { FormControlLabel, Switch, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SwitchToTransferButtonProps {
  onSwitch: () => void;
}

const SwitchToTransferButton = ({ onSwitch }: SwitchToTransferButtonProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <FormControlLabel
        control={
          <Switch
            checked={false}
            onChange={(e) => {
              if (e.target.checked) {
                onSwitch();
              }
            }}
          />
        }
        label={t('operations.switchToTransfer') ?? 'Przełącz na przelew'}
        labelPlacement="start"
      />
    </Box>
  );
};

export default SwitchToTransferButton;
