import { FormControl, InputLabel, Select, MenuItem, type SelectProps } from '@mui/material';

type SingleSelectProps <T extends string | number> = SelectProps<T> & {
  label: string;
  options: { key: T; label: string }[];
  value: string;
  setValue: React.Dispatch<React.SetStateAction<T>>;
};

const SingleSelect = <T extends string | number>({ label, options, value, setValue, sx }: SingleSelectProps<T>) => {
  return (
    <FormControl sx={{ minWidth: 200, ...sx }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={(e) => setValue(e.target.value as T)} label={label}>
        {options.map((p) => (
          <MenuItem key={p.key} value={p.key}>
            {p.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SingleSelect;
