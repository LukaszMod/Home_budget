import React from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import type { Asset } from '../../../lib/api'

interface AccountSelectProps {
  label: string
  value: number | ''
  onChange: (value: number) => void
  assets: Asset[]
  required?: boolean
  disabled?: boolean
}

const AccountSelect: React.FC<AccountSelectProps> = ({
  label,
  value,
  onChange,
  assets,
  required = false,
  disabled = false,
}) => {
  const formatAmount = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return '0.00'
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  return (
    <FormControl fullWidth required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as number)}
        label={label}
      >
        {assets.map((asset) => (
          <MenuItem key={asset.id} value={asset.id}>
            {asset.name} ({formatAmount(asset.current_valuation)} {asset.currency})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default AccountSelect
