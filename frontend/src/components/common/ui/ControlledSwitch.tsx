import { FormControlLabel, Switch } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";

interface ControlledSwitchProps {
  fieldName: string;
  fieldLabel: string;
}



const ControlledSwitch: React.FC<ControlledSwitchProps> = ({
  fieldName,
  fieldLabel,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch checked={field.value} onChange={field.onChange} />}
          label={fieldLabel}
        />
      )}
    />
  );
};

export default ControlledSwitch;