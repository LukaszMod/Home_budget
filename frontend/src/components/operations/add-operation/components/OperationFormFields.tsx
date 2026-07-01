import { Controller } from 'react-hook-form';
import { Stack, FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CalcTextField from '../../../common/ui/CalcTextField';
import StyledIncomeSwitch from '../../../common/ui/StyledIncomeSwitch';
import CategoryAutocomplete from '../../../common/ui/CategoryAutocomplete';
import TextFieldWithHashtagSuggestions from '../../TextFieldWithHashtagSuggestions';
import ControlledSingleSelect from '../../../common/ui/ControlledSingleSelect';
import { DatePickerProvider, useDateFormat } from '../../../common/DatePickerProvider';
import PlannedWarningBanner from './PlannedWarningBanner';
import type { Account, Category } from '../../../../lib/api';

interface OperationFormFieldsProps {
  control: any;
  setValue: any;
  isSplit: boolean;
  isPlanned: boolean;
  accounts: Account[];
  categories: Category[];
  hashtags: Array<{ name: string }>;
}

const OperationFormFields = ({
  control,
  setValue,
  isSplit,
  isPlanned,
  accounts,
  categories,
  hashtags,
}: OperationFormFieldsProps) => {
  const { t } = useTranslation();
  const dateFormat = useDateFormat();

  return (
    <Stack spacing={2}>
      {isPlanned && <PlannedWarningBanner />}

      <Controller
        name="operationDate"
        control={control}
        render={({ field }) => (
          <DatePickerProvider>
            <DatePicker
              label={t('operations.fields.date') ?? 'Data'}
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
              format={dateFormat}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </DatePickerProvider>
        )}
      />
      <ControlledSingleSelect
        fieldName="accountId"
        fieldLabel={t('operations.fields.account')}
        options={accounts
          .filter((a) => !a.is_closed)
          .map((a) => ({ id: a.id, value: a.id, label: a.name }))}
        validationRules={{ required: true }}
      />

      <Controller
        name="amount"
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <CalcTextField
            {...field}
            value={value || ''}
            onChange={(val) => onChange(val)}
            label={t('operations.fields.amount') ?? 'Kwota'}
            fullWidth
            required
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextFieldWithHashtagSuggestions
            value={field.value || ''}
            onChange={(newValue) => field.onChange(newValue)}
            allHashtags={hashtags.map((h) => h.name)}
            label={t('operations.fields.description') ?? 'Opis'}
            placeholder={t('operations.fields.description') ?? 'Opis'}
            fullWidth
            multiline
            rows={2}
          />
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <CategoryAutocomplete
            categories={categories}
            value={field.value || ''}
            onChange={field.onChange}
            disabled={isSplit}
          />
        )}
      />

      {/* Split Operations Toggle */}
      <Controller
        name="isSplit"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  if (e.target.checked) {
                    // Clear category when enabling split
                    setValue('categoryId', '');
                  }
                }}
              />
            }
            label={t('operations.enableSplit') ?? 'Podziel operację'}
          />
        )}
      />

      <StyledIncomeSwitch name="operationType" />
    </Stack>
  );
};

export default OperationFormFields;
