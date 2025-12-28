import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type ControlledTextFieldProps = TextFieldProps & {
  fieldName: string;
  fieldLabel: string;
  validationRules?: object;
};

const ControlledTextField = ({
  fieldName,
  fieldLabel,
  validationRules,
  ...rest
}: ControlledTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={validationRules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          required={validationRules?.hasOwnProperty('required')}
          label={fieldLabel}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          {...rest}
        />
      )}
    />
  );
};

export default ControlledTextField;
