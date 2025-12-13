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
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import StyledModal from '../common/StyledModal'
import CalcTextField from '../common/CalcTextField'
import { useAssets } from '../../hooks/useAssets'
import { useAssetTypes } from '../../hooks/useAssetTypes'
import { useAccountsData } from '../../hooks/useAccountsData'
import { useTranslation } from 'react-i18next'
import type { AssetType } from '../../lib/api'

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  onTransfer: (data: TransferData) => void
  preselectedAssetId?: number
}

export interface TransferData {
  from_asset_id: number
  to_asset_id?: number
  amount: number
  transfer_type: string
  description?: string
  operation_date: string
  new_asset?: {
    asset_type_id: number
    name: string
    description?: string
    account_number?: string
    currency?: string
  }
  investment_quantity?: number
  investment_price_per_unit?: number
}

type TransferType = 
  | 'liquid_to_liquid'
  | 'liquid_to_investment'
  | 'liquid_to_property'
  | 'liquid_to_vehicle'
  | 'liquid_to_valuable'
  | 'liquid_to_liability'

const TransferDialog: React.FC<TransferDialogProps> = ({
  open,
  onClose,
  onTransfer,
  preselectedAssetId,
}) => {
  const { t } = useTranslation()
  const { assets } = useAssets()
  const { assetTypes } = useAssetTypes()
  const { usersQuery } = useAccountsData()
  const users = usersQuery.data ?? []

  // Helper function to format amounts
  const formatAmount = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0.00'
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  // Form state
  const [fromAssetId, setFromAssetId] = useState<number | ''>(preselectedAssetId || '')
  const [toAssetId, setToAssetId] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [transferType, setTransferType] = useState<TransferType>('liquid_to_liquid')
  const [description, setDescription] = useState('')
  const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0])

  // New asset state
  const [createNewAsset, setCreateNewAsset] = useState(false)
  const [newAssetTypeId, setNewAssetTypeId] = useState<number | ''>('')
  const [newAssetName, setNewAssetName] = useState('')
  const [newAssetDescription, setNewAssetDescription] = useState('')
  const [newAssetAccountNumber, setNewAssetAccountNumber] = useState('')
  const [newAssetCurrency, setNewAssetCurrency] = useState('PLN')
  const [newAssetUserId, setNewAssetUserId] = useState<number | ''>(1)

  // Investment state
  const [investmentQuantity, setInvestmentQuantity] = useState('')
  const [investmentPricePerUnit, setInvestmentPricePerUnit] = useState('')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFromAssetId(preselectedAssetId || '')
      setToAssetId('')
      setAmount('')
      setTransferType('liquid_to_liquid')
      setDescription('')
      setOperationDate(new Date().toISOString().split('T')[0])
      setCreateNewAsset(false)
      setNewAssetTypeId('')
      setNewAssetName('')
      setNewAssetDescription('')
      setNewAssetAccountNumber('')
      setNewAssetCurrency('PLN')
      setNewAssetUserId(1)
      setInvestmentQuantity('')
      setInvestmentPricePerUnit('')
    }
  }, [open, preselectedAssetId])

  // Filter assets by type
  const liquidAssets = assets.filter(a => {
    const assetType = assetTypes.find((t: AssetType) => t.id === a.asset_type_id)
    return assetType?.category === 'liquid'
  })

  const investmentAssets = assets.filter(a => {
    const assetType = assetTypes.find((t: AssetType) => t.id === a.asset_type_id)
    return assetType?.category === 'investment'
  })

  const liabilityAssets = assets.filter(a => {
    const assetType = assetTypes.find((t: AssetType) => t.id === a.asset_type_id)
    return assetType?.category === 'liability'
  })

  // Get available asset types for new asset creation
  const getNewAssetTypes = () => {
    switch (transferType) {
      case 'liquid_to_property':
        return assetTypes.filter((t: AssetType) => t.category === 'property')
      case 'liquid_to_vehicle':
        return assetTypes.filter((t: AssetType) => t.category === 'vehicle')
      case 'liquid_to_valuable':
        return assetTypes.filter((t: AssetType) => t.category === 'valuable')
      default:
        return []
    }
  }

  // Get balance of selected from asset
  const getAssetBalance = (assetId: number): number => {
    const asset = assets.find(a => a.id === assetId)
    if (!asset || !asset.current_valuation) return 0
    const val = typeof asset.current_valuation === 'string' ? parseFloat(asset.current_valuation) : asset.current_valuation
    return isNaN(val) ? 0 : val
  }

  const handleSubmit = () => {
    // Validation
    if (!fromAssetId) {
      alert(t('transfer.error.selectFromAsset', 'Wybierz konto źródłowe'))
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      alert(t('transfer.error.invalidAmount', 'Podaj prawidłową kwotę'))
      return
    }

    // Check balance
    const balance = getAssetBalance(fromAssetId as number)
    if (amountNum > balance) {
      alert(t('transfer.error.insufficientFunds', 'Niewystarczające środki'))
      return
    }

    // Type-specific validation
    if (transferType === 'liquid_to_liquid' && !toAssetId) {
      alert(t('transfer.error.selectToAsset', 'Wybierz konto docelowe'))
      return
    }

    if (transferType === 'liquid_to_investment') {
      if (createNewAsset) {
        if (!newAssetTypeId || !newAssetName) {
          alert(t('transfer.error.newAssetRequired', 'Wypełnij dane nowego aktywa'))
          return
        }
      } else {
        if (!toAssetId) {
          alert(t('transfer.error.selectInvestment', 'Wybierz inwestycję'))
          return
        }
      }
      const qty = parseFloat(investmentQuantity)
      const price = parseFloat(investmentPricePerUnit)
      if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
        alert(t('transfer.error.investmentDetails', 'Podaj ilość i cenę jednostkową'))
        return
      }
    }

    if (['liquid_to_property', 'liquid_to_vehicle', 'liquid_to_valuable'].includes(transferType)) {
      if (!newAssetTypeId || !newAssetName) {
        alert(t('transfer.error.newAssetRequired', 'Wypełnij dane nowego aktywa'))
        return
      }
    }

    if (transferType === 'liquid_to_liability' && !toAssetId) {
      alert(t('transfer.error.selectLiability', 'Wybierz zobowiązanie'))
      return
    }

    // Build transfer data
    const transferData: TransferData = {
      from_asset_id: fromAssetId as number,
      amount: amountNum,
      transfer_type: transferType,
      description: description || undefined,
      operation_date: operationDate,
    }

    // Add type-specific data
    if (transferType === 'liquid_to_liquid' || transferType === 'liquid_to_liability') {
      transferData.to_asset_id = toAssetId as number
    }

    if (transferType === 'liquid_to_investment') {
      if (createNewAsset) {
        transferData.new_asset = {
          asset_type_id: newAssetTypeId as number,
          name: newAssetName,
          description: newAssetDescription || undefined,
          account_number: newAssetAccountNumber || undefined,
          currency: newAssetCurrency,
        }
      } else {
        transferData.to_asset_id = toAssetId as number
      }
      transferData.investment_quantity = parseFloat(investmentQuantity)
      transferData.investment_price_per_unit = parseFloat(investmentPricePerUnit)
    }

    if (['liquid_to_property', 'liquid_to_vehicle', 'liquid_to_valuable'].includes(transferType)) {
      transferData.new_asset = {
        asset_type_id: newAssetTypeId as number,
        name: newAssetName,
        description: newAssetDescription || undefined,
        account_number: newAssetAccountNumber || undefined,
        currency: newAssetCurrency,
      }
    }

    onTransfer(transferData)
  }

  const renderDestinationFields = () => {
    switch (transferType) {
      case 'liquid_to_liquid':
        return (
          <FormControl fullWidth>
            <InputLabel>{t('transfer.toAccount', 'Konto docelowe')}</InputLabel>
            <Select
              value={toAssetId}
              onChange={(e) => setToAssetId(e.target.value as number)}
              label={t('transfer.toAccount', 'Konto docelowe')}
            >
              {liquidAssets
                .filter(a => a.id !== fromAssetId)
                .map((asset) => {
                  const user = users.find(u => u.id === asset.user_id)
                  return (
                    <MenuItem key={asset.id} value={asset.id}>
                      {asset.name} ({formatAmount(asset.current_valuation)} {asset.currency})
                      {user && ` - @${user.nick}`}
                    </MenuItem>
                  )
                })}
            </Select>
          </FormControl>
        )

      case 'liquid_to_investment':
        return (
          <Stack spacing={2}>
            <RadioGroup
              value={createNewAsset ? 'new' : 'existing'}
              onChange={(e) => setCreateNewAsset(e.target.value === 'new')}
            >
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label={t('transfer.existingInvestment', 'Istniejąca inwestycja')}
              />
              <FormControlLabel
                value="new"
                control={<Radio />}
                label={t('transfer.newInvestment', 'Nowa inwestycja')}
              />
            </RadioGroup>

            {!createNewAsset ? (
              <FormControl fullWidth>
                <InputLabel>{t('transfer.investment', 'Inwestycja')}</InputLabel>
                <Select
                  value={toAssetId}
                  onChange={(e) => setToAssetId(e.target.value as number)}
                  label={t('transfer.investment', 'Inwestycja')}
                >
                  {investmentAssets.map((asset) => {
                    const user = users.find(u => u.id === asset.user_id)
                    return (
                      <MenuItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.quantity || 0} szt.)
                        {user && ` - @${user.nick}`}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            ) : (
              renderNewAssetFields()
            )}

            <CalcTextField
              label={t('transfer.quantity', 'Ilość jednostek')}
              value={investmentQuantity}
              onChange={(val) => setInvestmentQuantity(String(val))}
              fullWidth
            />
            <CalcTextField
              label={t('transfer.pricePerUnit', 'Cena jednostkowa')}
              value={investmentPricePerUnit}
              onChange={(val) => setInvestmentPricePerUnit(String(val))}
              fullWidth
            />
          </Stack>
        )

      case 'liquid_to_property':
      case 'liquid_to_vehicle':
      case 'liquid_to_valuable':
        return renderNewAssetFields()

      case 'liquid_to_liability':
        return (
          <FormControl fullWidth>
            <InputLabel>{t('transfer.liability', 'Zobowiązanie')}</InputLabel>
            <Select
              value={toAssetId}
              onChange={(e) => setToAssetId(e.target.value as number)}
              label={t('transfer.liability', 'Zobowiązanie')}
            >
              {liabilityAssets.map((asset) => {
                const user = users.find(u => u.id === asset.user_id)
                return (
                  <MenuItem key={asset.id} value={asset.id}>
                    {asset.name} ({formatAmount(asset.current_valuation)} {asset.currency})
                    {user && ` - @${user.nick}`}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        )

      default:
        return null
    }
  }

  const renderNewAssetFields = () => {
    const availableTypes = getNewAssetTypes()

    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">
          {t('transfer.newAssetDetails', 'Dane nowego aktywa')}
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel>{t('transfer.assetType', 'Typ aktywa')}</InputLabel>
          <Select
            value={newAssetTypeId}
            onChange={(e) => setNewAssetTypeId(e.target.value as number)}
            label={t('transfer.assetType', 'Typ aktywa')}
          >
            {availableTypes.map((type: AssetType) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{t('transfer.owner', 'Właściciel')}</InputLabel>
          <Select
            value={newAssetUserId}
            onChange={(e) => setNewAssetUserId(e.target.value as number)}
            label={t('transfer.owner', 'Właściciel')}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                @{user.nick}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label={t('transfer.assetName', 'Nazwa aktywa')}
          value={newAssetName}
          onChange={(e) => setNewAssetName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label={t('transfer.assetDescription', 'Opis')}
          value={newAssetDescription}
          onChange={(e) => setNewAssetDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        <TextField
          label={t('transfer.accountNumber', 'Numer konta/rachunku')}
          value={newAssetAccountNumber}
          onChange={(e) => setNewAssetAccountNumber(e.target.value)}
          fullWidth
        />

        <TextField
          label={t('transfer.currency', 'Waluta')}
          value={newAssetCurrency}
          onChange={(e) => setNewAssetCurrency(e.target.value)}
          fullWidth
        />
      </Stack>
    )
  }

  return (
    <StyledModal open={open} onClose={onClose}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('transfer.title', 'Przelew / Transfer')}
      </Typography>

      <Stack spacing={3}>
        {/* Transfer Type */}
        <FormControl fullWidth>
          <InputLabel>{t('transfer.type', 'Typ transferu')}</InputLabel>
          <Select
            value={transferType}
            onChange={(e) => setTransferType(e.target.value as TransferType)}
            label={t('transfer.type', 'Typ transferu')}
          >
            <MenuItem value="liquid_to_liquid">
              {t('transfer.type.liquidToLiquid', 'Przelew między kontami')}
            </MenuItem>
            <MenuItem value="liquid_to_investment">
              {t('transfer.type.liquidToInvestment', 'Zakup inwestycji')}
            </MenuItem>
            <MenuItem value="liquid_to_property">
              {t('transfer.type.liquidToProperty', 'Zakup nieruchomości')}
            </MenuItem>
            <MenuItem value="liquid_to_vehicle">
              {t('transfer.type.liquidToVehicle', 'Zakup pojazdu')}
            </MenuItem>
            <MenuItem value="liquid_to_valuable">
              {t('transfer.type.liquidToValuable', 'Zakup wartościowego przedmiotu')}
            </MenuItem>
            <MenuItem value="liquid_to_liability">
              {t('transfer.type.liquidToLiability', 'Spłata zobowiązania')}
            </MenuItem>
          </Select>
        </FormControl>

        {/* From Account */}
        <FormControl fullWidth>
          <InputLabel>{t('transfer.fromAccount', 'Konto źródłowe')}</InputLabel>
          <Select
            value={fromAssetId}
            onChange={(e) => setFromAssetId(e.target.value as number)}
            label={t('transfer.fromAccount', 'Konto źródłowe')}
          >
            {liquidAssets.map((asset) => {
              const user = users.find(u => u.id === asset.user_id)
              return (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.name} ({formatAmount(asset.current_valuation)} {asset.currency})
                  {user && ` - @${user.nick}`}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>

        {/* Amount */}
        <CalcTextField
          label={t('transfer.amount', 'Kwota')}
          value={amount}
          onChange={(val) => setAmount(String(val))}
          fullWidth
          required
        />

        {/* Destination fields (dynamic based on transfer type) */}
        {renderDestinationFields()}

        {/* Description */}
        <TextField
          label={t('transfer.description', 'Opis (opcjonalnie)')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        {/* Operation Date */}
        <TextField
          label={t('transfer.date', 'Data operacji')}
          type="date"
          value={operationDate}
          onChange={(e) => setOperationDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button onClick={onClose} variant="outlined">
            {t('common.cancel', 'Anuluj')}
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {t('transfer.execute', 'Wykonaj transfer')}
          </Button>
        </Box>
      </Stack>
    </StyledModal>
  )
}

export default TransferDialog
