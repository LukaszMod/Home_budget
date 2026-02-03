import { Paper, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { DatePickerProvider, useDateFormat } from '../common/DatePickerProvider';
import MultiSelect from '../common/ui/MultiSelect';
import MultiSelctWithGroups from '../common/ui/MultiSelectWithGroups';
import SingleSelect from '../common/ui/SingleSelect';
import React from 'react';
import type { OperationType } from '../../lib/api';
import { useAccountsData, useCategories, useHashtags } from '../../hooks';
import type { OperationFiltersState } from './hooks/useOperationFilters';

type OperationFiltersProps = {
  filters: OperationFiltersState;
  setFilters: (patch: Partial<OperationFiltersState>) => void;
};

const OperationFilters = ({ filters, setFilters }: OperationFiltersProps) => {
  const { accountsQuery } = useAccountsData();
  const { categoriesQuery } = useCategories();
  const { hashtags } = useHashtags();

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const dateFormat = useDateFormat();

  const datePresets = React.useMemo(
    () => [
      { key: 'all', label: t('operations.dateFilter.all') },
      { key: 'last7', label: t('operations.dateFilter.last7') },
      { key: 'last30', label: t('operations.dateFilter.last30') },
      { key: 'thisMonth', label: t('operations.dateFilter.thisMonth') },
      { key: 'thisQuarter', label: t('operations.dateFilter.thisQuarter') },
      { key: 'thisYear', label: t('operations.dateFilter.thisYear') },
      { key: 'prevYear', label: t('operations.dateFilter.prevYear') },
      { key: 'planned', label: t('operations.dateFilter.planned') },
      { key: 'custom', label: t('operations.dateFilter.custom') },
    ],
    [t]
  );

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ flexWrap: 'wrap', gap: 2 }}>
          {/* Date preset */}
          <SingleSelect
            label={t('operations.dateFilter.label')}
            options={datePresets}
            value={filters.datePreset}
            setValue={(valueOrUpdater) =>
              setFilters({
                datePreset:
                  typeof valueOrUpdater === 'function'
                    ? valueOrUpdater(filters.datePreset)
                    : valueOrUpdater,
              })
            }
          />

          {/* Custom date range */}
          {filters.datePreset === 'custom' && (
            <DatePickerProvider>
              <DatePicker
                label={t('operations.dateFilter.from')}
                value={filters.customDateFrom ? dayjs(filters.customDateFrom) : null}
                onChange={(d) => setFilters({ customDateFrom: d ? d.format('YYYY-MM-DD') : '' })}
                format={dateFormat}
                slotProps={{
                  textField: { InputLabelProps: { shrink: true }, sx: { minWidth: 150 } },
                }}
              />

              <DatePicker
                label={t('operations.dateFilter.to')}
                value={filters.customDateTo ? dayjs(filters.customDateTo) : null}
                onChange={(d) => setFilters({ customDateTo: d ? d.format('YYYY-MM-DD') : '' })}
                format={dateFormat}
                slotProps={{
                  textField: { InputLabelProps: { shrink: true }, sx: { minWidth: 150 } },
                }}
              />
            </DatePickerProvider>
          )}

          {/* Accounts */}
          <MultiSelect<number>
            label={t('operations.fields.account')}
            options={accounts
              .filter((a) => !a.is_closed)
              .map((a) => ({ key: a.id, label: a.name }))}
            selectedValues={filters.filterAccountIds}
            setSelectedValues={(valueOrUpdater) =>
              setFilters({
                filterAccountIds:
                  typeof valueOrUpdater === 'function'
                    ? valueOrUpdater(filters.filterAccountIds)
                    : valueOrUpdater,
              })
            }
          />

          {/* Categories with groups */}
          <MultiSelctWithGroups<number>
            label={t('operations.fields.category')}
            options={categories.map((c) => ({
              key: c.id,
              label: c.name,
              group: c.parent_id,
            }))}
            selectedValues={filters.filterCategoryIds}
            setSelectedValues={(valueOrUpdater) =>
              setFilters({
                filterCategoryIds:
                  typeof valueOrUpdater === 'function'
                    ? valueOrUpdater(filters.filterCategoryIds)
                    : valueOrUpdater,
              })
            }
          />

          {/* Operation type */}
          <SingleSelect
            label={t('operations.fields.type') ?? 'Type'}
            options={[
              { key: '', label: t('operations.filters.all') },
              { key: 'income', label: t('operations.type.income') },
              { key: 'expense', label: t('operations.type.expense') },
            ]}
            value={filters.filterOperationType}
            setValue={(v) => setFilters({ filterOperationType: v as OperationType | '' })}
            sx={{ minWidth: 150 }}
          />

          {/* Hashtags */}
          <MultiSelect<number>
            label={t('operations.fields.hashtags')}
            options={hashtags.map((h) => ({ key: h.id, label: h.name }))}
            selectedValues={filters.filterHashtagIds}
            setSelectedValues={(valueOrUpdater) =>
              setFilters({
                filterHashtagIds:
                  typeof valueOrUpdater === 'function'
                    ? valueOrUpdater(filters.filterHashtagIds)
                    : valueOrUpdater,
              })
            }
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default OperationFilters;
