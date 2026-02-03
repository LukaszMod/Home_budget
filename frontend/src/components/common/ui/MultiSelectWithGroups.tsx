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
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MultiSelctWithGroupsProps<T extends string | number> {
  label: string;
  options: { key: T; label: string; group: T | null | undefined }[];
  selectedValues: T[];
  setSelectedValues: React.Dispatch<React.SetStateAction<T[]>>;
}

const MultiSelctWithGroups = <T extends string | number>({
  label,
  options,
  selectedValues,
  setSelectedValues,
}: MultiSelctWithGroupsProps<T>) => {
  const { t } = useTranslation();

  const groups = React.useMemo(() => options.filter((g) => g.group === null), [options]);

  const getGroupItems = React.useCallback(
    (group: T) => options.filter((c) => c.group === group),
    [options]
  );

  const handleGroupChange = (group: T) => {
    const groupKeys = [group, ...getGroupItems(group).map((i) => i.key)];
    const isSelected = groupKeys.every((k) => selectedValues.includes(k));
    setSelectedValues(
      isSelected
        ? selectedValues.filter((v) => !groupKeys.includes(v))
        : [...new Set([...selectedValues, ...groupKeys])]
    );
  };

  const handleValuesChange = (value: T) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const getSelectedCount = (group: T) =>
    getGroupItems(group).filter((i) => selectedValues.includes(i.key)).length;

  return (
    <FormControl sx={{ width: 200, flex: '0 0 auto' }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        MenuProps={{ PaperProps: { style: { maxHeight: 600 } } }}
        value={selectedValues}
        label={label}
        endAdornment={
          selectedValues.length > 0 && (
            <IconButton
              size="small"
              sx={{ marginRight: 1.25 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedValues([]);
              }}
            >
              {' '}
              <ClearIcon fontSize="small" />{' '}
            </IconButton>
          )
        }
        renderValue={(selected) => {
          if (selected.length === 0) return <em>{t('common.all')}</em>;
          if (selected.length <= 2) {
            return (
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflow: 'hidden' }}>
                {selected.map((key) => (
                  <Chip key={key} label={options.find((o) => o.key === key)?.label} size="small" />
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
        {groups.map((group) => {
          const items = getGroupItems(group.key);
          const selectedCount = getSelectedCount(group.key);

          return (
            <React.Fragment key={group.key}>
              <MenuItem
                key={group.key}
                value={group.key}
                onClick={() => {
                  handleGroupChange(group.key);
                }}
              >
                <Checkbox
                  checked={selectedValues.includes(group.key)}
                  indeterminate={selectedCount > 0 && selectedCount < items.length}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGroupChange(group.key);
                  }}
                />
                <ListItemText primary={<strong>{group.label}</strong>} />
              </MenuItem>

              {items.map((item) => (
                <MenuItem
                  key={item.key}
                  value={item.key}
                  sx={{ pl: 4 }}
                  onClick={() => {
                    handleValuesChange(item.key);
                  }}
                >
                  <Checkbox
                    checked={selectedValues.includes(item.key)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleValuesChange(item.key);
                    }}
                  />
                  <ListItemText primary={item.label} />
                </MenuItem>
              ))}
            </React.Fragment>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default MultiSelctWithGroups;
