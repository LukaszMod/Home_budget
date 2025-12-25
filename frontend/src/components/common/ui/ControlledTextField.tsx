import { TextField } from "@mui/material"
import { Controller, useFormContext } from "react-hook-form"


type ControlledTextFieldProps = {
  fieldName: string;
  fieldLabel: string;
  validationRules?: object;
  [key: string]: any;
};


const ControlledTextField: React.FC<ControlledTextFieldProps> = ({
  fieldName,
  formControl,
  fieldLabel,
  validationRules,
  ...rest
}) => {
  const { control } = useFormContext();
  
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={validationRules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
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


export default ControlledTextField