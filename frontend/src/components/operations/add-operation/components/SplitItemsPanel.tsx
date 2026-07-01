import { Paper, Stack, Typography, Button, Divider, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SplitItemRow from './SplitItemRow';
import SplitSummary from './SplitSummary';
import type { SplitItem, Category } from '../../../../lib/api';

interface SplitItemsPanelProps {
  splitItems: SplitItem[];
  totalAmount: string;
  allocatedAmount: number;
  remainingAmount: number;
  subcategoriesForAutocomplete: Array<Category & { group: string }>;
  loadingChildren: boolean;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof SplitItem, value: any) => void;
}

const SplitItemsPanel = ({
  splitItems,
  totalAmount,
  allocatedAmount,
  remainingAmount,
  subcategoriesForAutocomplete,
  loadingChildren,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: SplitItemsPanelProps) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: '100%',
        maxHeight: '600px',
        overflow: 'auto',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        {t('operations.splitItems') ?? 'Pozycje podziału'}
        {loadingChildren && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Typography>

      <Stack spacing={2}>
        {splitItems.map((item, index) => (
          <SplitItemRow
            key={index}
            item={item}
            index={index}
            subcategoriesForAutocomplete={subcategoriesForAutocomplete}
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
            canRemove={splitItems.length > 1}
          />
        ))}

        <Button startIcon={<AddIcon />} onClick={onAddItem} variant="outlined" size="small">
          {t('operations.addItem') ?? 'Dodaj pozycję'}
        </Button>

        <Divider />

        <SplitSummary
          totalAmount={totalAmount}
          allocatedAmount={allocatedAmount}
          remainingAmount={remainingAmount}
        />
      </Stack>
    </Paper>
  );
};

export default SplitItemsPanel;
