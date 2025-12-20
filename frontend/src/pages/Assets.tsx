import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Asset, AssetType, AssetCategory, CreateAssetPayload } from '../lib/api'
import { useAssets } from '../hooks/useAssets'
import { useAssetTypes } from '../hooks/useAssetTypes'
import { useAccountsData } from '../hooks/useAccountsData'
import {
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AddAssetModal from '../components/assets/AddAssetModal'
import InvestmentTransactionsDialog from '../components/assets/InvestmentTransactionsDialog'
import AssetValuationsDialog from '../components/assets/AssetValuationsDialog'
import AssetsTable from '../components/assets/AssetsTable'
import CorrectBalanceDialog from '../components/assets/CorrectBalanceDialog'
import DeleteAssetDialog from '../components/assets/DeleteAssetDialog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  sx?: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
      style={{ display: value === index ? 'flex' : 'none', flexGrow: 1, overflow: 'auto' }}
    >
      {value === index && <Box sx={{ width: '100%', ...sx }}>{children}</Box>}
    </div>
  )
}

const Assets: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [selectedTab, setSelectedTab] = useState(0)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false)
  const [valuationsDialogOpen, setValuationsDialogOpen] = useState(false)
  const [correctBalanceDialogOpen, setCorrectBalanceDialogOpen] = useState(false)
  const [targetBalance, setTargetBalance] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<number>>(new Set())
  const [summaryPeriod, setSummaryPeriod] = useState<string>('thisMonth')

  const { assets, isLoading, isError, deleteAsset, toggleAssetActive, createAsset, updateAsset, correctBalance } = useAssets()
  const { assetTypes } = useAssetTypes()
  const { usersQuery } = useAccountsData()
  const users = usersQuery.data ?? []

  // Define category order
  const categories: AssetCategory[] = [
    'liquid',
    'investment',
    'property',
    'vehicle',
    'valuable',
    'liability'
  ]

  const categoryLabels: Record<AssetCategory, string> = {
    liquid: t('assets.categories.liquid') ?? 'Płynne',
    investment: t('assets.categories.investment') ?? 'Inwestycje',
    property: t('assets.categories.property') ?? 'Nieruchomości',
    vehicle: t('assets.categories.vehicle') ?? 'Pojazdy',
    valuable: t('assets.categories.valuable') ?? 'Wartościowe',
    liability: t('assets.categories.liability') ?? 'Zobowiązania'
  }

  // Group assets by category
  const assetsByCategory = (category: AssetCategory) => {
    const typeIdsInCategory = assetTypes
      .filter(type => type.category === category)
      .map(type => type.id)
    
    return assets.filter(asset => typeIdsInCategory.includes(asset.asset_type_id))
  }

  // Get asset type info
  const getAssetType = (assetTypeId: number): AssetType | undefined => {
    return assetTypes.find(type => type.id === assetTypeId)
  }

  const handleDeleteAsset = () => {
    if (selectedAsset) {
      deleteAsset(selectedAsset.id)
      setDeleteModalOpen(false)
      setSelectedAsset(null)
    }
  }

  const handleToggleActive = (asset: Asset) => {
    toggleAssetActive(asset.id)
  }

  const handleSaveAsset = (payload: CreateAssetPayload) => {
    if (selectedAsset) {
      // Update existing asset
      updateAsset({ id: selectedAsset.id, payload })
    } else {
      // Create new asset
      createAsset(payload)
    }
    setAddModalOpen(false)
    setEditModalOpen(false)
    setSelectedAsset(null)
  }

  const handleCorrectBalance = () => {
    if (selectedAsset && targetBalance) {
      correctBalance({ id: selectedAsset.id, target_balance: parseFloat(targetBalance) })
      setCorrectBalanceDialogOpen(false)
      setSelectedAsset(null)
      setTargetBalance('')
    }
  }

  const formatValue = (value: number | string | null | undefined, currency: string = 'PLN'): string => {
    if (value === null || value === undefined) return '-'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return '-'
    const locale = i18n.language === 'pl' ? 'pl-PL' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(numValue)
  }

  const formatQuantity = (quantity: number | string | null | undefined, decimals: number = 4): string => {
    if (quantity === null || quantity === undefined) return '-'
    const numValue = typeof quantity === 'string' ? parseFloat(quantity) : quantity
    if (isNaN(numValue)) return '-'
    return numValue.toFixed(decimals)
  }

  const getUserNick = (userId: number): string => {
    const user = users.find(u => u.id === userId)
    return user ? user.nick : `#${userId}`
  }

  const getCurrentValue = (asset: Asset): number | null => {
    const assetType = getAssetType(asset.asset_type_id)
    
    if (!assetType) return null
    
    // For liquid and liability assets, use current_valuation from database (auto-calculated by trigger)
    if (assetType.category === 'liquid' || assetType.category === 'liability') {
      if (asset.current_valuation !== null && asset.current_valuation !== undefined) {
        const val = typeof asset.current_valuation === 'string' ? parseFloat(asset.current_valuation) : asset.current_valuation
        return isNaN(val) ? 0 : val
      }
      return 0
    }
    
    // For investments, calculate current value from quantity and last price
    if (assetType.category === 'investment') {
      if (asset.quantity && asset.average_purchase_price) {
        const qty = typeof asset.quantity === 'string' ? parseFloat(asset.quantity) : asset.quantity
        const price = typeof asset.average_purchase_price === 'string' ? parseFloat(asset.average_purchase_price) : asset.average_purchase_price
        if (!isNaN(qty) && !isNaN(price)) {
          return qty * price
        }
      }
      return null
    }
    
    // For property/vehicle/valuable, use current_valuation
    if (assetType.category === 'property' || assetType.category === 'vehicle' || assetType.category === 'valuable') {
      if (asset.current_valuation) {
        const val = typeof asset.current_valuation === 'string' ? parseFloat(asset.current_valuation) : asset.current_valuation
        return isNaN(val) ? null : val
      }
      return null
    }
    
    return null
  }

  const handleToggleAssetSelection = (assetId: number) => {
    const newSelected = new Set(selectedAssetIds)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedAssetIds(newSelected)
  }

  const calculateSummary = () => {
    const selectedAssets = assets.filter(a => selectedAssetIds.has(a.id))
    const totalValue = selectedAssets.reduce((sum, asset) => {
      const value = getCurrentValue(asset)
      return sum + (value || 0)
    }, 0)
    
    return {
      count: selectedAssets.length,
      totalValue,
      // TODO: Implementacja zmiany wartości według okresu wymaga dodatkowych danych historycznych
      startValue: totalValue, // Placeholder
      difference: 0 // Placeholder
    }
  }

  const summary = calculateSummary()

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t('common.loading') ?? 'Ładowanie...'}</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t('assets.errors.loadingError') ?? 'Błąd ładowania aktywów'}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{t('assets.title') ?? 'Majątek'}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
          >
            {t('assets.actions.addAsset') ?? 'Dodaj aktywo'}
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid item xs={12} md={selectedAssetIds.size > 0 ? 9 : 12} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {categories.map((category, index) => (
                <Tab
                  key={category}
                  label={categoryLabels[category]}
                  id={`asset-tab-${index}`}
                  aria-controls={`asset-tabpanel-${index}`}
                />
              ))}
            </Tabs>

            {categories.map((category, index) => (
              <TabPanel key={category} value={selectedTab} index={index} sx={{ flexGrow: 1, overflow: 'auto' }}>
                <AssetsTable
                  assets={assetsByCategory(category)}
                  assetTypes={assetTypes}
                  category={category}
                  selectedAssetIds={selectedAssetIds}
                  onToggleSelection={handleToggleAssetSelection}
                  onOpenTransactions={(asset: Asset) => {
                    setSelectedAsset(asset)
                    setTransactionsDialogOpen(true)
                  }}
                  onCorrectBalance={(asset: Asset) => {
                    setSelectedAsset(asset)
                    setTargetBalance('')
                    setCorrectBalanceDialogOpen(true)
                  }}
                  onOpenValuations={(asset: Asset) => {
                    setSelectedAsset(asset)
                    setValuationsDialogOpen(true)
                  }}
                  onToggleActive={handleToggleActive}
                  onEdit={(asset: Asset) => {
                    setSelectedAsset(asset)
                    setEditModalOpen(true)
                  }}
                  onDelete={(asset: Asset) => {
                    setSelectedAsset(asset)
                    setDeleteModalOpen(true)
                  }}
                  formatValue={formatValue}
                  formatQuantity={formatQuantity}
                  getCurrentValue={getCurrentValue}
                  getUserNick={getUserNick}
                />
              </TabPanel>
            ))}
          </Paper>
        </Grid>

        {/* Summary Panel */}
        {selectedAssetIds.size > 0 && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('assets.summary.title') ?? 'Podsumowanie'}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('assets.summary.period') ?? 'Okres'}</InputLabel>
                <Select
                  value={summaryPeriod}
                  onChange={(e) => setSummaryPeriod(e.target.value)}
                  label={t('assets.summary.period') ?? 'Okres'}
                  size="small"
                >
                  <MenuItem value="thisMonth">{t('assets.summary.periods.thisMonth') ?? 'Bieżący miesiąc'}</MenuItem>
                  <MenuItem value="lastMonth">{t('assets.summary.periods.lastMonth') ?? 'Ostatni miesiąc'}</MenuItem>
                  <MenuItem value="lastQuarter">{t('assets.summary.periods.lastQuarter') ?? 'Ostatni kwartał'}</MenuItem>
                  <MenuItem value="thisYear">{t('assets.summary.periods.thisYear') ?? 'Bieżący rok'}</MenuItem>
                  <MenuItem value="lastYear">{t('assets.summary.periods.lastYear') ?? 'Ostatni rok'}</MenuItem>
                  <MenuItem value="all">{t('assets.summary.periods.all') ?? 'Cały czas'}</MenuItem>
                </Select>
              </FormControl>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('assets.summary.selectedAssets') ?? 'Zaznaczone aktywa'}
                  </Typography>
                  <Typography variant="h6">
                    {summary.count}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('assets.summary.startValue') ?? 'Wartość początkowa'}
                  </Typography>
                  <Typography variant="h6">
                    {summary.startValue.toLocaleString(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
                      style: 'currency',
                      currency: 'PLN'
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('assets.summary.difference') ?? 'Różnica'}
                  </Typography>
                  <Typography 
                    variant="h6"
                    color={summary.difference >= 0 ? 'success.main' : 'error.main'}
                  >
                    {summary.difference >= 0 ? '+' : ''}{summary.difference.toLocaleString(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
                      style: 'currency',
                      currency: 'PLN'
                    })}
                  </Typography>
                </Box>

                <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="textSecondary">
                    {t('assets.summary.currentValue') ?? 'Obecna wartość'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {summary.totalValue.toLocaleString(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
                      style: 'currency',
                      currency: 'PLN'
                    })}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedAssetIds(new Set())}
                  fullWidth
                >
                  {t('assets.summary.clearSelection') ?? 'Wyczyść zaznaczenie'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Modal */}
      <DeleteAssetDialog
        open={deleteModalOpen}
        asset={selectedAsset}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedAsset(null)
        }}
        onConfirm={handleDeleteAsset}
      />

      {/* Add/Edit Asset Modal */}
      <AddAssetModal
        open={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false)
          setEditModalOpen(false)
          setSelectedAsset(null)
        }}
        editing={selectedAsset}
        onSave={handleSaveAsset}
      />

      {/* Investment Transactions Dialog */}
      {selectedAsset && (
        <InvestmentTransactionsDialog
          open={transactionsDialogOpen}
          onClose={() => {
            setTransactionsDialogOpen(false)
            setSelectedAsset(null)
          }}
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
        />
      )}

      {/* Asset Valuations Dialog */}
      {selectedAsset && (
        <AssetValuationsDialog
          open={valuationsDialogOpen}
          onClose={() => {
            setValuationsDialogOpen(false)
            setSelectedAsset(null)
          }}
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          currency={selectedAsset.currency}
        />
      )}

      {/* Correct Balance Dialog */}
      <CorrectBalanceDialog
        open={correctBalanceDialogOpen}
        asset={selectedAsset}
        targetBalance={targetBalance}
        onTargetBalanceChange={setTargetBalance}
        onClose={() => {
          setCorrectBalanceDialogOpen(false)
          setSelectedAsset(null)
          setTargetBalance('')
        }}
        onConfirm={handleCorrectBalance}
        formatValue={formatValue}
      />
    </Box>
  )
}

export default Assets
