import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
  Switch,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { DatePickerProvider, useDateFormat } from '../common/DatePickerProvider'
import StyledModal from '../common/StyledModal'
import CalcTextField from '../common/ui/CalcTextField'
import AccountSelect from '../common/ui/AccountSelect'
import { useAssets } from '../../hooks/useAssets'
import { useAssetTypes } from '../../hooks/useAssetTypes'
import { useAccountsData } from '../../hooks/useAccountsData'
import { useTranslation } from 'react-i18next'
import { useNotifier } from '../common/Notifier'
import type { AssetType } from '../../lib/api'
import { useSettings } from '../../contexts/SettingsContext'

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  onTransfer: (data: TransferData) => void
  preselectedAssetId?: number
  onSwitchToOperation?: () => void
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
  interest_amount?: number
  investment_price_per_unit?: number
  commission?: number
  transaction_type?: 'buy' | 'sell'
}



const TransferDialog: React.FC<TransferDialogProps> = ({
  open,
  onClose,
  onTransfer,
  preselectedAssetId,
  onSwitchToOperation,
}) => {
  const { t } = useTranslation()
  const notifier = useNotifier()
  const { assets } = useAssets()
  const { assetTypes } = useAssetTypes()
  const { usersQuery } = useAccountsData()
  const users = usersQuery.data ?? []
  const dateFormat = useDateFormat()
  const { settings } = useSettings()



  const transferSchema = z.object({
    fromAssetId: z.union([z.number(), z.string()]).refine(val => val !== '' && val !== undefined, 'Wybierz konto źródłowe'),
    toAssetId: z.union([z.number(), z.string()]).optional(),
    amount: z.string().min(1, 'Podaj kwotę').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Podaj prawidłową kwotę'),
    transferType: z.string(),
    description: z.string().optional(),
    operationDate: z.string(),
    createNewAsset: z.boolean().optional(),
    newAssetTypeId: z.union([z.number(), z.string()]).optional(),
    newAssetName: z.string().optional(),
    newAssetDescription: z.string().optional(),
    newAssetAccountNumber: z.string().optional(),
    newAssetCurrency: z.string().optional(),
    newAssetUserId: z.union([z.number(), z.string()]).optional(),
    transactionType: z.string().optional(),
    investmentQuantity: z.string().optional(),
    investmentPricePerUnit: z.string().optional(),
    commission: z.string().optional(),
    interestAmount: z.string().optional(),
  })

  const defaultValues = {
    fromAssetId: preselectedAssetId || '',
    toAssetId: '',
    amount: '',
    transferType: 'liquid_to_liquid',
    description: '',
    operationDate: new Date().toISOString().split('T')[0],
    createNewAsset: false,
    newAssetTypeId: '',
    newAssetName: '',
    newAssetDescription: '',
    newAssetAccountNumber: '',
    newAssetCurrency: settings.currency,
    newAssetUserId: 1,
    transactionType: 'buy',
    investmentQuantity: '',
    investmentPricePerUnit: '',
    commission: '',
    interestAmount: '',
  }


  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(transferSchema),
    mode: 'onBlur',
  })
  const data = watch()

  // Helper to safely get string value for form fields
  const safe = (val: any) => val === undefined || val === null ? '' : val

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, fromAssetId: preselectedAssetId || '' })
    }
  }, [open, preselectedAssetId, reset])

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
    switch (data.transferType) {
      case 'liquid_to_investment':
        return assetTypes.filter((t: AssetType) => t.category === 'investment')
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

  // Helper function to calculate and provide hints for investment fields
  // Formula for buy: Amount = Quantity * PricePerUnit + Commission
  // Formula for sell: Amount = Quantity * PricePerUnit - Commission
  const getInvestmentFieldHint = (field: 'amount' | 'quantity' | 'price' | 'commission'): string => {
    const amt = parseFloat(safe(data.amount)) || 0
    const qty = parseFloat(safe(data.investmentQuantity)) || 0
    const price = parseFloat(safe(data.investmentPricePerUnit)) || 0
    const comm = parseFloat(safe(data.commission)) || 0
    const isBuy = safe(data.transactionType) === 'buy'

    // Dla sprzedaży podpowiedzi bazują na wybranym aktywie inwestycyjnym
    let asset: any = null
    if (safe(data.transactionType) === 'sell' && safe(data.fromAssetId)) {
      asset = assets.find(a => a.id === Number(data.fromAssetId))
    }

    // Count filled fields
    const filledFields = [
      safe(data.amount) && !isNaN(parseFloat(safe(data.amount))),
      safe(data.investmentQuantity) && !isNaN(parseFloat(safe(data.investmentQuantity))),
      safe(data.investmentPricePerUnit) && !isNaN(parseFloat(safe(data.investmentPricePerUnit))),
      safe(data.commission) && !isNaN(parseFloat(safe(data.commission)))
    ].filter(Boolean).length

    // Podpowiedzi dla sprzedaży
    if (safe(data.transactionType) === 'sell') {
      if (field === 'amount') {
        // Podpowiedź: aktualna wartość inwestycji
        if (asset && asset.current_valuation) {
          return `Aktualna wartość inwestycji: ${parseFloat(asset.current_valuation).toFixed(2)} ${asset.currency}`
        }
      }
      if (field === 'quantity') {
        // Podpowiedź: ile jednostek jest na inwestycji
        if (asset && asset.quantity) {
          return `Dostępnych jednostek: ${parseFloat(asset.quantity).toFixed(4)}`
        }
      }
      // Walidacja: kwota sprzedaży = ilość jednostek * cena jednostkowa
      if (filledFields >= 2 && qty > 0 && price > 0) {
        const saleAmount = qty * price
        return `Kwota sprzedaży: ${saleAmount.toFixed(2)}`
      }
      // Podpowiedź dla prowizji
      if (field === 'commission' && asset) {
        return 'Prowizja zostanie dodana do kwoty wynikowej'
      }
    }

    // Standardowe podpowiedzi dla zakupu
    if (filledFields === 3) {
      if (field === 'amount' && !safe(data.amount)) {
        const calculated = isBuy ? (qty * price + comm) : (qty * price - comm)
        return `Sugerowana kwota: ${calculated.toFixed(2)}`
      }
      if (field === 'quantity' && !safe(data.investmentQuantity)) {
        if (price > 0) {
          const calculated = isBuy ? ((amt - comm) / price) : ((amt + comm) / price)
          return `Sugerowana ilość: ${calculated.toFixed(4)}`
        }
      }
      if (field === 'price' && !safe(data.investmentPricePerUnit)) {
        if (qty > 0) {
          const calculated = isBuy ? ((amt - comm) / qty) : ((amt + comm) / qty)
          return `Sugerowana cena: ${calculated.toFixed(2)}`
        }
      }
      if (field === 'commission' && !safe(data.commission)) {
        const calculated = isBuy ? (amt - qty * price) : (qty * price - amt)
        return `Sugerowana prowizja: ${calculated.toFixed(2)}`
      }
    }

    return ''
  }

  const onFormSubmit = (formData: any) => {
    // Additional custom validation (e.g., balance, equations)
    const amountNum = parseFloat(formData.amount)
    const balance = getAssetBalance(Number(formData.fromAssetId))
    if (amountNum > balance) {
      notifier.notify(
        t('transfer.error.insufficientFunds', 'Niewystarczające środki'),
        'error'
      )
      return
    }
    // ...existing type-specific validation logic can be added here if needed...
    // Build transferData as before
    const transferData: TransferData = {
      from_asset_id: Number(formData.fromAssetId),
      amount: amountNum,
      transfer_type: formData.transferType,
      description: formData.description || undefined,
      operation_date: formData.operationDate,
    }
    if (["liquid_to_liquid", "liquid_to_liability"].includes(formData.transferType)) {
      transferData.to_asset_id = Number(formData.toAssetId)
    }
    if (formData.transferType === "liquid_to_liability" && formData.interestAmount) {
      const interestNum = parseFloat(formData.interestAmount)
      if (!isNaN(interestNum) && interestNum > 0) {
        transferData.interest_amount = interestNum
      }
    }
    if (formData.transferType === "liquid_to_investment") {
      transferData.transaction_type = formData.transactionType
      if (formData.transactionType === "buy") {
        if (formData.createNewAsset) {
          transferData.new_asset = {
            asset_type_id: Number(formData.newAssetTypeId),
            name: formData.newAssetName,
            description: formData.newAssetDescription || undefined,
            account_number: formData.newAssetAccountNumber || undefined,
            currency: formData.newAssetCurrency,
          }
        } else {
          transferData.to_asset_id = Number(formData.toAssetId)
        }
        transferData.investment_quantity = parseFloat(formData.investmentQuantity)
        transferData.investment_price_per_unit = parseFloat(formData.investmentPricePerUnit)
        if (formData.commission) {
          transferData.commission = parseFloat(formData.commission)
        }
      } else if (formData.transactionType === "sell") {
        transferData.to_asset_id = Number(formData.toAssetId)
        transferData.investment_quantity = parseFloat(formData.investmentQuantity)
        transferData.investment_price_per_unit = parseFloat(formData.investmentPricePerUnit)
        if (formData.commission) {
          transferData.commission = parseFloat(formData.commission)
        }
      }
    }
    if (["liquid_to_property", "liquid_to_vehicle", "liquid_to_valuable"].includes(formData.transferType)) {
      transferData.new_asset = {
        asset_type_id: Number(formData.newAssetTypeId),
        name: formData.newAssetName,
        description: formData.newAssetDescription || undefined,
        account_number: formData.newAssetAccountNumber || undefined,
        currency: formData.newAssetCurrency,
      }
    }
    onTransfer(transferData)
  }

  const renderDestinationFields = () => {
    switch (safe(data.transferType)) {
      case 'liquid_to_liquid':
        return (
          <Controller
            name="toAssetId"
            control={control}
            render={({ field }) => (
              <AccountSelect
                label={t('transfer.toAccount', 'Konto docelowe')}
                value={safe(field.value)}
                onChange={field.onChange}
                assets={liquidAssets.filter(a => a.id !== Number(safe(data.fromAssetId)))}
                required
              />
            )}
          />
        )

      case 'liquid_to_investment':
        return (
          <Stack spacing={2}>
            {/* Transaction Type Switch */}
            <Controller
              name="transactionType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t('transfer.transactionType', 'Typ transakcji')}</InputLabel>
                  <Select
                    {...field}
                    label={t('transfer.transactionType', 'Transaction type')}
                  >
                    <MenuItem value="buy">{t('transfer.buy', 'Zakup')}</MenuItem>
                    <MenuItem value="sell">{t('transfer.sell', 'Sprzedaż')}</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {watch('transactionType') === 'buy' && (
              <>
                {/* Existing/New Investment Radio */}
                <Controller
                  name="createNewAsset"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ? 'new' : 'existing'}
                      onChange={e => field.onChange(e.target.value === 'new')}
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
                  )}
                />

                {!watch('createNewAsset') ? (
                  <Controller
                    name="toAssetId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>{t('transfer.investment', 'Inwestycja')}</InputLabel>
                        <Select
                          {...field}
                          label={t('transfer.investment', 'Inwestycja')}
                        >
                          {investmentAssets.map((asset) => {
                            const user = users.find(u => u.id === asset.user_id)
                            return (
                              <MenuItem key={asset.id} value={asset.id}>
                                {asset.name} ({asset.quantity || 0} szt.)
                                {user && ` - ${user.nick}`}
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    )}
                  />
                ) : (
                  renderNewAssetFields()
                )}

                {/* Investment calculation fields with hints */}
                <Controller
                  name="amount"
                  control={control}
                  shouldUnregister={false}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.amount', 'Kwota')}
                      value={safe(field.value)}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      required
                      helperText={getInvestmentFieldHint('amount')}
                    />
                  )}
                />
                <Controller
                  name="investmentQuantity"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.quantity', 'Ilość jednostek')}
                      value={safe(field.value)}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      helperText={getInvestmentFieldHint('quantity')}
                    />
                  )}
                />
                <Controller
                  name="investmentPricePerUnit"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.pricePerUnit', 'Cena jednostkowa')}
                      value={safe(field.value) || ''}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      helperText={getInvestmentFieldHint('price')}
                    />
                  )}
                />
                <Controller
                  name="commission"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.commission', 'Prowizja (opcjonalnie)')}
                      value={safe(field.value) || ''}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      helperText={getInvestmentFieldHint('commission')}
                    />
                  )}
                />
              </>
            )}

            {watch('transactionType') === 'sell' && (
              <>
                {/* Target liquid account for sell */}
                <Controller
                  name="toAssetId"
                  control={control}
                  render={({ field }) => (
                    <AccountSelect
                      label={t('transfer.toAccount', 'Konto docelowe')}
                      value={safe(field.value) || ''}
                      onChange={field.onChange}
                      assets={liquidAssets}
                      required
                    />
                  )}
                />

                {/* Investment calculation fields with hints */}
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.amount', 'Kwota otrzymana')}
                      value={safe(field.value) || ''}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      required
                      helperText={getInvestmentFieldHint('amount')}
                    />
                  )}
                />
                <Controller
                  name="investmentQuantity"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.quantity', 'Ilość jednostek')}
                      value={safe(field.value) || ''}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      helperText={getInvestmentFieldHint('quantity')}
                    />
                  )}
                />
                <Controller
                  name="investmentPricePerUnit"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.pricePerUnit', 'Cena jednostkowa')}
                      value={safe(field.value) || ''}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      helperText={getInvestmentFieldHint('price')}
                    />
                  )}
                />
                <Controller
                  name="commission"
                  control={control}
                  render={({ field }) => (
                    <CalcTextField
                      label={t('transfer.commission', 'Prowizja (opcjonalnie)')}
                      value={safe(field.value) || ''}
                      onChange={val => field.onChange(String(val))}
                      fullWidth
                      helperText={getInvestmentFieldHint('commission')}
                    />
                  )}
                />
              </>
            )}
          </Stack>
        )

      case 'liquid_to_property':
      case 'liquid_to_vehicle':
      case 'liquid_to_valuable':
        return renderNewAssetFields()

      case 'liquid_to_liability':
        return (
          <Stack spacing={2}>
            <Controller
              name="toAssetId"
              control={control}
              render={({ field }) => (
                <AccountSelect
                  label={t('transfer.liability', 'Zobowiązanie')}
                  value={safe(field.value)}
                  onChange={field.onChange}
                  assets={liabilityAssets}
                  required
                />
              )}
            />
            <Controller
              name="interestAmount"
              control={control}
              render={({ field }) => (
                <CalcTextField
                  label={t('transfer.interest', 'Odsetki (opcjonalnie)')}
                  value={safe(field.value) || ''}
                  onChange={val => field.onChange(String(val))}
                  fullWidth
                />
              )}
            />
          </Stack>
        )

      default:
        return null
    }
  }

  const renderNewAssetFields = () => {
    const availableTypes = getNewAssetTypes()
    const isInvestment = safe(data.transferType) === 'liquid_to_investment'

    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">
          {t('transfer.newAssetDetails', 'Dane nowego aktywa')}
        </Typography>
        <Controller
          name="newAssetTypeId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>{t('transfer.assetType', 'Typ aktywa')}</InputLabel>
              <Select
                {...field}
                value={safe(field.value)}
                label={t('transfer.assetType', 'Typ aktywa')}
              >
                {availableTypes.map((type: AssetType) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="newAssetUserId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>{t('transfer.owner', 'Właściciel')}</InputLabel>
              <Select
                {...field}
                value={safe(field.value)}
                label={t('transfer.owner', 'Właściciel')}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.nick}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="newAssetName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={safe(field.value)}
              label={t('transfer.assetName', 'Nazwa aktywa')}
              fullWidth
              required
            />
          )}
        />
        <Controller
          name="newAssetDescription"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={safe(field.value)}
              label={isInvestment ? t('transfer.investmentDescription', 'Opis inwestycji') : t('transfer.assetDescription', 'Opis')}
              fullWidth
              multiline
              rows={2}
            />
          )}
        />
        <Controller
          name="newAssetAccountNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={safe(field.value)}
              label={t('transfer.accountNumber', 'Numer konta/rachunku')}
              fullWidth
            />
          )}
        />
        <Controller
          name="newAssetCurrency"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={safe(field.value)}
              label={t('transfer.currency', 'Waluta')}
              fullWidth
              select
            >
              <MenuItem value="PLN">PLN</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="CHF">CHF</MenuItem>
            </TextField>
          )}
        />
      </Stack>
    )
  }

  return (
    <StyledModal open={open} onClose={onClose}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('transfer.title', 'Przelew / Transfer')}
      </Typography>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack spacing={3}>
          {/* Switch to Operation */}
          {onSwitchToOperation && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onClose()
                        onSwitchToOperation()
                      }
                    }}
                  />
                }
                label={t('operations.switchToOperation') ?? 'Przełącz na operację'}
                labelPlacement="start"
              />
            </Box>
          )}

          {/* Transfer Type */}
          <Controller
            name="transferType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('transfer.type', 'Typ transferu')}</InputLabel>
                <Select
                  {...field}
                  label={t('transfer.type', 'Typ transferu')}
                >
                  <MenuItem value="liquid_to_liquid">
                    {t('transfer.type.liquidToLiquid', 'Przelew między kontami')}
                  </MenuItem>
                  <MenuItem value="liquid_to_investment">
                    {t('transfer.type.liquidToInvestment', 'Zakup/sprzedaż inwestycji')}
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
            )}
          />

          {/* From Account */}
          {!(data.transferType === 'liquid_to_investment' && data.transactionType === 'sell') && (
            <Controller
              name="fromAssetId"
              control={control}
              render={({ field }) => (
                <AccountSelect
                  label={t('transfer.fromAccount', 'Konto źródłowe')}
                  value={safe(field.value)}
                  onChange={field.onChange}
                  assets={liquidAssets}
                  required
                />
              )}
            />
          )}

          {/* From Investment (for sell transactions) */}
          {data.transferType === 'liquid_to_investment' && data.transactionType === 'sell' && (
            <Controller
              name="fromAssetId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required>
                  <InputLabel>{t('transfer.fromInvestment', 'Inwestycja źródłowa')}</InputLabel>
                  <Select
                    {...field}
                    label={t('transfer.fromInvestment', 'Inwestycja źródłowa')}
                  >
                    {investmentAssets.map((asset) => {
                      const user = users.find(u => u.id === asset.user_id)
                      return (
                        <MenuItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.quantity || 0} szt.)
                          {user && ` - ${user.nick}`}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              )}
            />
          )}

          {/* Amount (not for investment purchases with calculation) */}
          {!(data.transferType === 'liquid_to_investment' && data.transactionType === 'buy') && (
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CalcTextField
                  label={t('transfer.amount', 'Kwota')}
                  value={safe(field.value)}
                  onChange={val => field.onChange(String(val))}
                  fullWidth
                  required
                  error={!!errors.amount}
                  helperText={errors.amount?.message as string}
                />
              )}
            />
          )}

          {/* Destination fields (dynamic based on transfer type) */}
          {renderDestinationFields()}

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transfer.description', 'Opis (opcjonalnie)')}
                fullWidth
                multiline
                rows={2}
              />
            )}
          />

          {/* Operation Date */}
          <Controller
            name="operationDate"
            control={control}
            render={({ field }) => (
              <DatePickerProvider>
                <DatePicker
                  label={t('transfer.date', 'Data operacji')}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : '')}
                  format={dateFormat}
                  slotProps={{ textField: { fullWidth: true, InputLabelProps: { shrink: true } } }}
                />
              </DatePickerProvider>
            )}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={onClose} variant="outlined">
              {t('common.cancel', 'Anuluj')}
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {t('transfer.execute', 'Wykonaj transfer')}
            </Button>
          </Box>
        </Stack>
      </form>
    </StyledModal>
  )
}

export default TransferDialog
