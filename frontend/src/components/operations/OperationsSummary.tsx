import  { Paper, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Operation } from "../../lib/api";
import { useLocale } from "../common/DatePickerProvider";

const OperationsSummary = ({operations}: {operations:Operation[]}) => {
  const locale = useLocale();
    const { t } = useTranslation();
      const parseAmount = (amount: number | string | undefined | null): number => {
        if (amount === undefined || amount === null) return 0;
        return typeof amount === 'string' ? parseFloat(amount) : amount;
      };

    return (
<Paper
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('operations.summary.totalIncome') ?? 'Przychody'}
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>
            {operations
              .filter((r) => r.operation_type === 'income')
              .reduce((sum, r) => sum + parseAmount(r.amount), 0)
              .toLocaleString(locale, { style: 'currency', currency: 'PLN' })}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('operations.summary.totalExpense') ?? 'Wydatki'}
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'error.main' }}>
            {operations
              .filter((r) => r.operation_type === 'expense')
              .reduce((sum, r) => sum + parseAmount(r.amount), 0)
              .toLocaleString(locale, { style: 'currency', currency: 'PLN' })}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('operations.summary.net') ?? 'Saldo'}
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color:
                operations.reduce(
                  (sum, r) =>
                    sum + parseAmount(r.operation_type === 'income' ? r.amount : -r.amount),
                  0
                ) >= 0
                  ? 'success.main'
                  : 'error.main',
            }}
          >
            {operations
              .reduce(
                (sum, r) => sum + parseAmount(r.operation_type === 'income' ? r.amount : -r.amount),
                0
              )
              .toLocaleString(locale, { style: 'currency', currency: 'PLN' })}
          </Typography>
        </Box>
      </Paper>
    );
};

export default OperationsSummary;