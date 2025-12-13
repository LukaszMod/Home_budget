import React, { useState, useEffect } from 'react'
import { TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material'

type CalcTextFieldProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string | number
  onChange: (value: number) => void
}

const CalcTextField: React.FC<CalcTextFieldProps> = ({ value, onChange, ...props }) => {
  const [displayValue, setDisplayValue] = useState(String(value || ''))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(String(value || ''))
    }
  }, [value, isFocused])

  const evaluateExpression = (expr: string): number | null => {
    try {
      // Remove all whitespace
      expr = expr.trim().replace(/\s/g, '')
      
      if (expr === '') return null
      
      // Allow only numbers, +, -, *, /, (, ), and decimal point
      if (!/^[0-9+\-*/().,]+$/.test(expr)) {
        return null
      }
      
      // Replace comma with dot for decimal separator
      expr = expr.replace(/,/g, '.')
      
      // Evaluate the expression safely
      const result = Function('"use strict"; return (' + expr + ')')()
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.round(result * 100) / 100 // Round to 2 decimal places
      }
      
      return null
    } catch (e) {
      return null
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    
    const result = evaluateExpression(displayValue)
    
    if (result !== null) {
      onChange(result)
      setDisplayValue(String(result))
    } else {
      // If invalid expression, revert to original value
      setDisplayValue(String(value || ''))
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder="np. 100 lub 50+25"
    />
  )
}

export default CalcTextField
