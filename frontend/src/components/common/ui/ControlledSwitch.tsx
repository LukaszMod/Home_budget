import { FormControlLabel, Switch } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

type ControlledSwitchProps = {
  fieldName: string;
  fieldLabel?: string;
  disabled?: boolean;
}

const ControlledSwitch = ({ fieldName, fieldLabel, disabled = false }: ControlledSwitchProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={fieldLabel}
        />
      )}
    />
  );
};

export default ControlledSwitch;
