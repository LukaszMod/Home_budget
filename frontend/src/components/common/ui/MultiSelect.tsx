import {
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

type MultiSelectProps<T extends string | number> = {
  label: string;
  options: { key: T; label: string }[];
  selectedValues: T[];
  setSelectedValues: React.Dispatch<React.SetStateAction<T[]>>;
};
const MultiSelect = <T extends string | number>({
  label,
  options,
  selectedValues,
  setSelectedValues,
}: MultiSelectProps<T>) => {
  const { t } = useTranslation();

  const clearAll = () => setSelectedValues([]);

  return (
    <FormControl sx={{ width: 200, flex: '0 0 auto' }}>
      <InputLabel>{label}</InputLabel>

      <Select
        multiple
        MenuProps={{ PaperProps: { style: { maxHeight: 600 } } }}
        value={selectedValues}
        onChange={(e) => {
          const value = typeof e.target.value === 'string' ? [] : e.target.value;
          setSelectedValues(value);
        }}
        label={label}
        endAdornment={
          selectedValues.length > 0 && (
            <InputAdornment position="end" sx={{ marginRight: 1.25 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // żeby nie otwierało selecta
                  clearAll();
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }
        renderValue={(selected) => {
          if (selected.length === 0) return <em>{t('common.all')}</em>;

          if (selected.length <= 2) {
            return (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
                {selected.map((key: string | number) => (
                  <Chip key={key} label={options.find((a) => a.key === key)?.label} size="small" />
                ))}
              </Box>
            );
          }

          return (
            <Chip
              label={`${selected.length} ${t('common.selected').toLowerCase()} ...`}
              size="small"
            />
          );
        }}
      >
        {options.map((value) => (
          <MenuItem key={value.key} value={value.key}>
            <Checkbox checked={selectedValues.includes(value.key)} />
            <ListItemText primary={value.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiSelect;
