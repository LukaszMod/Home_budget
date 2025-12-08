import React, { useState, useEffect } from 'react'
import { 
  Button, 
  TextField, 
  Stack, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Typography,
  Box
} from '@mui/material'
import StyledModal from './StyledModal'
import CalcTextField from './CalcTextField'
import type { Asset, AssetType, CreateAssetPayload } from '../lib/api'
import { useAssetTypes } from '../hooks/useAssetTypes'
import { useAccountsData } from '../hooks/useAccountsData'

interface AddAssetModalProps {
  open: boolean
  onClose: () => void
  editing: Asset | null
  onSave: (payload: CreateAssetPayload) => void
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({
  open,
  onClose,
  editing,
  onSave,
}) => {
  const { assetTypes } = useAssetTypes()
  const { usersQuery } = useAccountsData()
  const users = usersQuery.data ?? []

  const [assetTypeId, setAssetTypeId] = useState<number | ''>('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [userId, setUserId] = useState<number | ''>(1) // Default user
  const [accountNumber, setAccountNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [averagePurchasePrice, setAveragePurchasePrice] = useState('')
  const [currentValuation, setCurrentValuation] = useState('')
  const [currency, setCurrency] = useState('PLN')

  // Get selected asset type
  const selectedAssetType = assetTypes.find(t => t.id === assetTypeId)

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (editing) {
      setAssetTypeId(editing.asset_type_id)
      setName(editing.name)
      setDescription(editing.description || '')
      setUserId(editing.user_id)
      setAccountNumber(editing.account_number || '')
      setQuantity(editing.quantity?.toString() || '')
      setAveragePurchasePrice(editing.average_purchase_price?.toString() || '')
      setCurrentValuation(editing.current_valuation?.toString() || '')
      setCurrency(editing.currency)
    } else {
      setAssetTypeId('')
      setName('')
      setDescription('')
      setUserId(1)
      setAccountNumber('')
      setQuantity('')
      setAveragePurchasePrice('')
      setCurrentValuation('')
      setCurrency('PLN')
    }
  }, [editing, open])

  const handleSave = () => {
    if (!assetTypeId || !name || !userId) {
      alert('Wypełnij wymagane pola: Typ, Nazwa, Użytkownik')
      return
    }

    const payload: CreateAssetPayload = {
      user_id: Number(userId),
      asset_type_id: Number(assetTypeId),
      name,
      description: description || null,
      account_number: accountNumber || null,
      quantity: quantity ? Number(quantity) : null,
      average_purchase_price: averagePurchasePrice ? Number(averagePurchasePrice) : null,
      current_valuation: currentValuation ? Number(currentValuation) : null,
      currency,
    }

    onSave(payload)
  }

  // Group asset types by category
  const assetTypesByCategory = assetTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = []
    }
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, AssetType[]>)

  const categoryLabels: Record<string, string> = {
    liquid: 'Płynne',
    investment: 'Inwestycje',
    property: 'Nieruchomości',
    vehicle: 'Pojazdy',
    valuable: 'Wartościowe',
    liability: 'Zobowiązania'
  }

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={editing ? 'Edytuj aktywo' : 'Dodaj aktywo'}
      footer={
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained">
            Zapisz
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {/* Asset Type Selection */}
        <FormControl fullWidth required>
          <InputLabel>Typ aktywa</InputLabel>
          <Select
            value={assetTypeId}
            onChange={(e) => setAssetTypeId(Number(e.target.value))}
            label="Typ aktywa"
          >
            {Object.entries(assetTypesByCategory).map(([category, types]) => [
              <MenuItem key={`category-${category}`} disabled>
                <Typography variant="subtitle2" color="primary">
                  {categoryLabels[category]}
                </Typography>
              </MenuItem>,
              ...types.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{type.icon}</span>
                    <span>{type.name}</span>
                  </Box>
                </MenuItem>
              ))
            ])}
          </Select>
        </FormControl>

        {/* Basic Fields */}
        <TextField
          label="Nazwa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        <FormControl fullWidth required>
          <InputLabel>Użytkownik</InputLabel>
          <Select
            value={userId}
            onChange={(e) => setUserId(e.target.value as number)}
            label="Użytkownik"
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                @{user.nick} ({user.full_name})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Conditional Fields Based on Asset Type */}
        {selectedAssetType?.category === 'liquid' || selectedAssetType?.category === 'liability' ? (
          <TextField
            label="Numer konta / identyfikator"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            fullWidth
            placeholder="np. PL61109010140000071219812870"
          />
        ) : null}

        {selectedAssetType?.category === 'investment' ? (
          <>
            <Typography variant="caption" color="textSecondary">
              Ilość i średnia cena zakupu będą automatycznie wyliczane na podstawie transakcji
            </Typography>
            <CalcTextField
              label="Ilość (opcjonalnie)"
              value={quantity}
              onChange={(val) => setQuantity(String(val))}
              fullWidth
              helperText="Zostanie zaktualizowane przy dodawaniu transakcji"
            />
            <CalcTextField
              label="Średnia cena zakupu (opcjonalnie)"
              value={averagePurchasePrice}
              onChange={(val) => setAveragePurchasePrice(String(val))}
              fullWidth
              helperText="Zostanie zaktualizowane przy dodawaniu transakcji"
            />
          </>
        ) : null}

        {selectedAssetType?.category === 'property' || 
         selectedAssetType?.category === 'vehicle' || 
         selectedAssetType?.category === 'valuable' ? (
          <CalcTextField
            label="Aktualna wycena"
            value={currentValuation}
            onChange={(val) => setCurrentValuation(String(val))}
            fullWidth
            helperText="Możesz później dodać historię wycen"
          />
        ) : null}

        <TextField
          label="Waluta"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          fullWidth
          select
        >
          <MenuItem value="PLN">PLN</MenuItem>
          <MenuItem value="EUR">EUR</MenuItem>
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="GBP">GBP</MenuItem>
          <MenuItem value="CHF">CHF</MenuItem>
        </TextField>
      </Stack>
    </StyledModal>
  )
}

export default AddAssetModal
