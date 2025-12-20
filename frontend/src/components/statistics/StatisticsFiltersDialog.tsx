import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Checkbox,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DatePickerProvider, useDateFormat } from '../common/DatePickerProvider'
import dayjs from 'dayjs'
import type { Account, Category, Hashtag } from '../../lib/api'

export interface FilterState {
  period: 'currentMonth' | 'lastMonth' | 'lastQuarter' | 'lastYear' | 'custom'
  customDateFrom: string
  customDateTo: string
  selectedAccounts: number[]
  selectedCategories: number[]
  selectedHashtags: number[]
}

interface StatisticsFiltersDialogProps {
  open: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  accounts: Account[]
  categories: Category[]
  hashtags: Hashtag[]
  activeAccountIds: number[]
}

const StatisticsFiltersDialog: React.FC<StatisticsFiltersDialogProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  accounts,
  categories,
  hashtags,
  activeAccountIds,
}) => {
  const { t } = useTranslation()
  const dateFormat = useDateFormat()

  const subcategories = categories.filter(c => c.parent_id !== null).sort((a, b) => a.name.localeCompare(b.name))

  const handleReset = () => {
    onFiltersChange({
      period: 'currentMonth',
      customDateFrom: '',
      customDateTo: '',
      selectedAccounts: activeAccountIds,
      selectedCategories: [],
      selectedHashtags: [],
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {t('statistics.editFilters') ?? 'Edit Filters'}
      </DialogTitle>
      <DialogContent dividers sx={{ overflow: 'visible' }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Okres */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('operations.dateFilter.label') ?? 'Period'}
            </Typography>
            <FormControl fullWidth>
              <Select
                value={filters.period}
                onChange={e => onFiltersChange({ ...filters, period: e.target.value as any })}
              >
                <MenuItem value="currentMonth">{t('statistics.period.currentMonth') ?? 'Current Month'}</MenuItem>
                <MenuItem value="lastMonth">{t('statistics.period.lastMonth') ?? 'Last Month'}</MenuItem>
                <MenuItem value="lastQuarter">{t('statistics.period.lastQuarter') ?? 'Last Quarter'}</MenuItem>
                <MenuItem value="lastYear">{t('statistics.period.lastYear') ?? 'Last Year'}</MenuItem>
                <MenuItem value="custom">{t('operations.dateFilter.custom') ?? 'Custom'}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Custom dates */}
          {filters.period === 'custom' && (
            <DatePickerProvider>
              <Stack direction="row" spacing={1}>
                <DatePicker
                  label={t('operations.dateFilter.from') ?? 'From'}
                  value={filters.customDateFrom ? dayjs(filters.customDateFrom) : null}
                  onChange={(d) => onFiltersChange({ ...filters, customDateFrom: d ? d.format('YYYY-MM-DD') : '' })}
                  format={dateFormat}
                  slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                />
                <DatePicker
                  label={t('operations.dateFilter.to') ?? 'To'}
                  value={filters.customDateTo ? dayjs(filters.customDateTo) : null}
                  onChange={(d) => onFiltersChange({ ...filters, customDateTo: d ? d.format('YYYY-MM-DD') : '' })}
                  format={dateFormat}
                  slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                />
              </Stack>
            </DatePickerProvider>
          )}

          {/* Konta */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('operations.fields.account') ?? 'Accounts'}
            </Typography>
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', bgcolor: '#fafafa' }}>
              {accounts.filter(a => !a.is_closed).map(account => (
                <ListItem key={account.id} dense disablePadding>
                  <ListItemButton
                    onClick={() => {
                      const isSelected = filters.selectedAccounts.includes(account.id)
                      onFiltersChange({
                        ...filters,
                        selectedAccounts: isSelected
                          ? filters.selectedAccounts.filter(id => id !== account.id)
                          : [...filters.selectedAccounts, account.id],
                      })
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox checked={filters.selectedAccounts.includes(account.id)} size="small" />
                    </ListItemIcon>
                    <ListItemText primary={account.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Kategorie */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('operations.fields.category') ?? 'Categories'}
            </Typography>
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', bgcolor: '#fafafa' }}>
              {subcategories.map(cat => {
                const parent = categories.find(c => c.id === cat.parent_id)
                const label = parent ? `${parent.name} → ${cat.name}` : cat.name
                return (
                  <ListItem key={cat.id} dense disablePadding>
                    <ListItemButton
                      onClick={() => {
                        const isSelected = filters.selectedCategories.includes(cat.id)
                        onFiltersChange({
                          ...filters,
                          selectedCategories: isSelected
                            ? filters.selectedCategories.filter(id => id !== cat.id)
                            : [...filters.selectedCategories, cat.id],
                        })
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox checked={filters.selectedCategories.includes(cat.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>

          {/* Hashtagi */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('statistics.hashtags') ?? 'Hashtags'}
            </Typography>
            {hashtags.length > 0 ? (
              <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', bgcolor: '#fafafa' }}>
                {hashtags.map(tag => (
                  <ListItem key={tag.id} dense disablePadding>
                    <ListItemButton
                      onClick={() => {
                        const isSelected = filters.selectedHashtags.includes(tag.id)
                        onFiltersChange({
                          ...filters,
                          selectedHashtags: isSelected
                            ? filters.selectedHashtags.filter(id => id !== tag.id)
                            : [...filters.selectedHashtags, tag.id],
                        })
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox checked={filters.selectedHashtags.includes(tag.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={`#${tag.name}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                {t('statistics.noHashtags') ?? 'No hashtags available'}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel') ?? 'Cancel'}
        </Button>
        <Button onClick={handleReset} variant="outlined">
          {t('statistics.resetFilters') ?? 'Reset'}
        </Button>
        <Button onClick={onClose} variant="contained">
          {t('common.save') ?? 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StatisticsFiltersDialog
