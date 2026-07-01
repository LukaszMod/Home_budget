import { Stack, Paper, Autocomplete, TextField, IconButton, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import CalcTextField from '../../../common/ui/CalcTextField';
import type { SplitItem, Category } from '../../../../lib/api';

interface SplitItemRowProps {
  item: SplitItem;
  index: number;
  subcategoriesForAutocomplete: Array<Category & { group: string }>;
  onUpdate: (index: number, field: keyof SplitItem, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const SplitItemRow = ({
  item,
  index,
  subcategoriesForAutocomplete,
  onUpdate,
  onRemove,
  canRemove,
}: SplitItemRowProps) => {
  const { t } = useTranslation();

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: (theme) => theme.palette.background.paper,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ minWidth: 30 }}>
            #{index + 1}
          </Typography>
          <Autocomplete
            sx={{ flex: 1 }}
            options={subcategoriesForAutocomplete}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.name}
            value={subcategoriesForAutocomplete.find((c) => c.id === item.category_id) || null}
            onChange={(_, newValue) => {
              onUpdate(index, 'category_id', newValue ? newValue.id : 0);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('operations.fields.category') ?? 'Kategoria'}
                size="small"
                required
              />
            )}
            noOptionsText={t('operations.filters.none') ?? 'Brak'}
          />
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>

        <CalcTextField
          value={String(item.amount || '')}
          onChange={(val) => onUpdate(index, 'amount', Number(val) || 0)}
          label={t('operations.fields.amount') ?? 'Kwota'}
          size="small"
          fullWidth
          required
        />

        <TextField
          value={item.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          label={t('operations.fields.description') ?? 'Opis'}
          size="small"
          fullWidth
          multiline
          rows={2}
        />
      </Stack>
    </Paper>
  );
};

export default SplitItemRow;
