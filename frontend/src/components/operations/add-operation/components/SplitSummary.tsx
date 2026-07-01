import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SplitSummaryProps {
  totalAmount: string;
  allocatedAmount: number;
  remainingAmount: number;
}

const SplitSummary = ({ totalAmount, allocatedAmount, remainingAmount }: SplitSummaryProps) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">{t('operations.totalAmount') ?? 'Kwota całkowita'}:</Typography>
        <Typography variant="body2" fontWeight={600}>
          {Number(totalAmount || 0).toFixed(2)}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">{t('operations.allocated') ?? 'Przydzielono'}:</Typography>
        <Typography variant="body2" fontWeight={600}>
          {allocatedAmount.toFixed(2)}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color={Math.abs(remainingAmount) > 0.01 ? 'error' : 'success'}>
          {t('operations.remaining') ?? 'Pozostało'}:
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          color={Math.abs(remainingAmount) > 0.01 ? 'error' : 'success'}
        >
          {remainingAmount.toFixed(2)}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default SplitSummary;
