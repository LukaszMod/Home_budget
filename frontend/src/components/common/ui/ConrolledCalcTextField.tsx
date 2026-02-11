import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type ControlledCalcTextFieldProps  = TextFieldProps & {
  fieldName: string;
  fieldLabel?: string;
  validationRules?: object;
};

const ControlledCalcTextField: React.FC<ControlledCalcTextFieldProps> = ({
  fieldName,
  fieldLabel,
  validationRules,
  ...rest
}) => {
  const { control, setValue, setError, clearErrors } = useFormContext();

  const evaluateExpression = (expr: string): number | null => {
    try {
      expr = expr.trim().replace(/\s/g, '');
      if (expr === '') return null;
      if (!/^[0-9+\-*/().,]+$/.test(expr)) return null;
      expr = expr.replace(/,/g, '.');
      const result = Function('"use strict"; return (' + expr + ')')();
      return typeof result === 'number' && isFinite(result) ? Math.round(result * 100) / 100 : null;
    } catch {
      return null;
    }
  };

  const handleBlur = (value: string) => {
    const result = evaluateExpression(value);

    if (result !== null) {
      setValue(fieldName, result, { shouldValidate: true });
      clearErrors(fieldName);
    } else {
      setValue(fieldName, value);
      setError(fieldName, { message: 'Invalid expression' });
    }
  };

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={validationRules}
      render={({ field: { onBlur, ...field }, fieldState }) => (
        <TextField
          {...field}
          type="text"
          label={fieldLabel}
          required={validationRules?.hasOwnProperty('required')}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          placeholder="100, 1+2"
          onBlur={(e) => handleBlur(e.target.value)}
          {...rest}
        />
      )}
    />
  );
};

export default ControlledCalcTextField;
