import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ControlledSingleSelectProps {
    fieldName: string;
    fieldLabel: string;
    options: {id: number, value: number, label: string}[];
}

const ControlledSingleSelect: FC<ControlledSingleSelectProps> = ({
    fieldName,
    fieldLabel: formLabel,
    options,
}) => {
    const { control } = useFormContext();

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field: ControllerRenderProps }) => (
                <FormControl fullWidth required>
                    <InputLabel>{formLabel}</InputLabel>
                    <Select {...ControllerRenderProps} label={formLabel}>
                        {options.map(({ id, value, label }) => (
                            <MenuItem key={id} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        />
    );
}

export default ControlledSingleSelect;