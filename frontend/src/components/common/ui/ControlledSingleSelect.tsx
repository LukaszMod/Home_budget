import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  type SelectProps,
} from '@mui/material';
import { Controller, useFormContext, type RegisterOptions } from 'react-hook-form';

type ControlledSingleSelectProps = SelectProps & {
  fieldName: string;
  fieldLabel: string;
  options: { id: number; value: number | string | undefined; label: string }[];
  validationRules?: RegisterOptions;
};

const ControlledSingleSelect = ({
  fieldName,
  fieldLabel,
  options,
  validationRules,
  ...rest
}: ControlledSingleSelectProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={validationRules}
      render={({ field, fieldState }) => (
        <FormControl fullWidth error={!!fieldState.error}>
          <InputLabel>{fieldLabel}{ validationRules?.required && ' *'}</InputLabel>

          <Select {...field} label={fieldLabel} {...rest}>
            {options.map(({ id, value, label }) => (
              <MenuItem key={id} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>

          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default ControlledSingleSelect;
