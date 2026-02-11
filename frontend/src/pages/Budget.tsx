import React, { useState } from 'react';
import { Box, Button, Paper, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';
import BudgetStatisticsBar from '../components/budget/BudgetStatisticsBar';
import BudgetTable from '../components/budget/BudgetTable';
import BudgetCalendar from '../components/budget/BudgetCalendar';
import PageHeader from '../components/common/ui/PageHeader';
import useBudget from '../components/budget/hooks/useBudget';
import { FormProvider } from 'react-hook-form';

const Budget: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split('T')[0].slice(0, 7)
  );
  const [showStats, setShowStats] = React.useState(true);
  const { methods, categories, handleSave } = useBudget(selectedMonth);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLButtonElement | null>(null);

  const {formState: { dirtyFields}} = methods

    const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getPreviousMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    let y = parseInt(year),
      m = parseInt(month) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return `${y}-${String(m).padStart(2, '0')}`;
  };

  const getNextMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    let y = parseInt(year),
      m = parseInt(month) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    return `${y}-${String(m).padStart(2, '0')}`;
  };

  return (
    <FormProvider {...methods}>
      <Paper sx={{ p: 2 }}>
        <PageHeader
          title={t('budget.title')}
          center={<Box
                    sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, justifyContent: 'center' }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <Button
                      variant="outlined"
                      onClick={(e) => setCalendarAnchor(e.currentTarget)}
                      sx={{ minWidth: '200px' }}
                    >
                      {getMonthName(selectedMonth)}
                    </Button>
                    <IconButton size="small" onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}>
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FileCopyIcon />}
                onClick={() => {}}
                title={t('budget.copyPlan')}
              >
                {t('budget.copyPlan')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileCopyIcon />}
                onClick={() => {}}
                title={t('budget.copySpending')}
              >
                {t('budget.copySpending')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={Object.keys(dirtyFields).length === 0 }
              >
                {t('budget.saveButton')}
              </Button>
              <IconButton onClick={() => setShowStats((s) => !s)}>
                {showStats ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Box>
          }
        />

        <Box sx={{ display: 'flex', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <Box
            sx={{
              flexGrow: 1,
              transition: 'margin-right 0.3s ease',
              marginRight: showStats ? '300px' : 0,
            }}
          >
            <BudgetTable categories={categories} />
          </Box>
          <Box
            sx={{
              width: 300,
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              transform: showStats ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s ease',
              bgcolor: 'background.paper',
              borderLeft: '1px solid',
              borderColor: 'divider',
              overflowY: 'auto',
            }}
          >
            <BudgetStatisticsBar />
          </Box>
        </Box>

        <BudgetCalendar
          open={Boolean(calendarAnchor)}
          anchorEl={calendarAnchor}
          onClose={() => setCalendarAnchor(null)}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </Paper>
    </FormProvider>
  );
};

export default Budget;
