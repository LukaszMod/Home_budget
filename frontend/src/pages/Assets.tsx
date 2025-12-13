import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Asset, AssetType, AssetCategory } from '../lib/api'
import { useAssets } from '../hooks/useAssets'
import { useAssetTypes } from '../hooks/useAssetTypes'
import { useAccountsData } from '../hooks/useAccountsData'
import {
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Chip,
  Stack,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import HistoryIcon from '@mui/icons-material/History'
import StyledModal from '../components/StyledModal'
import AddAssetModal from '../components/AddAssetModal'
import InvestmentTransactionsDialog from '../components/InvestmentTransactionsDialog'
import AssetValuationsDialog from '../components/AssetValuationsDialog'
import type { CreateAssetPayload } from '../lib/api'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const Assets: React.FC = () => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState(0)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false)
  const [valuationsDialogOpen, setValuationsDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<number>>(new Set())
  const [summaryPeriod, setSummaryPeriod] = useState<string>('thisMonth')

  const { assets, isLoading, isError, deleteAsset, toggleAssetActive, createAsset, updateAsset } = useAssets()
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

  const formatValue = (value: number | string | null | undefined, currency: string = 'PLN'): string => {
    if (value === null || value === undefined) return '-'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return '-'
    return new Intl.NumberFormat('pl-PL', {
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
    return user ? `@${user.nick}` : `#${userId}`
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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedAssetIds.size > 0 ? 9 : 12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4">{t('assets.title') ?? 'Majątek'}</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
            >
              {t('assets.actions.addAsset') ?? 'Dodaj aktywo'}
            </Button>
          </Stack>

      <Paper sx={{ width: '100%' }}>
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
          <TabPanel key={category} value={selectedTab} index={index}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>{t('assets.table.type') ?? 'Typ'}</TableCell>
                  <TableCell>{t('assets.table.name') ?? 'Nazwa'}</TableCell>
                  <TableCell>{t('assets.table.user') ?? 'Użytkownik'}</TableCell>
                  {category === 'liquid' || category === 'liability' ? (
                    <TableCell>{t('assets.table.accountNumber') ?? 'Numer konta'}</TableCell>
                  ) : null}
                  {category === 'investment' ? (
                    <>
                      <TableCell align="right">{t('assets.table.quantity') ?? 'Ilość'}</TableCell>
                      <TableCell align="right">{t('assets.table.avgPurchasePrice') ?? 'Śr. cena zakupu'}</TableCell>
                    </>
                  ) : null}
                  {category === 'property' || category === 'vehicle' || category === 'valuable' ? (
                    <TableCell align="right">{t('assets.table.valuation') ?? 'Wycena'}</TableCell>
                  ) : null}
                  <TableCell align="right">{t('assets.table.currentValue') ?? 'Obecna wartość'}</TableCell>
                  <TableCell>{t('assets.table.currency') ?? 'Waluta'}</TableCell>
                  <TableCell>{t('assets.table.status') ?? 'Status'}</TableCell>
                  <TableCell align="right">{t('assets.table.actions') ?? 'Akcje'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsByCategory(category).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <Typography color="textSecondary">
                        Brak aktywów w tej kategorii
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assetsByCategory(category).map((asset) => {
                    const assetType = getAssetType(asset.asset_type_id)
                    const currentValue = getCurrentValue(asset)
                    return (
                      <TableRow key={asset.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedAssetIds.has(asset.id)}
                            onChange={() => handleToggleAssetSelection(asset.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <span>{assetType?.icon}</span>
                            <Typography variant="body2">{assetType?.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>
                          <Chip label={getUserNick(asset.user_id)} size="small" variant="outlined" />
                        </TableCell>
                        {category === 'liquid' || category === 'liability' ? (
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {asset.account_number || '-'}
                            </Typography>
                          </TableCell>
                        ) : null}
                        {category === 'investment' ? (
                          <>
                            <TableCell align="right">
                              {formatQuantity(asset.quantity, 4)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(asset.average_purchase_price, asset.currency)}
                            </TableCell>
                          </>
                        ) : null}
                        {category === 'property' || category === 'vehicle' || category === 'valuable' ? (
                          <TableCell align="right">
                            {formatValue(asset.current_valuation, asset.currency)}
                          </TableCell>
                        ) : null}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatValue(currentValue, asset.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>{asset.currency}</TableCell>
                        <TableCell>
                          <Chip
                            label={asset.is_active ? (t('assets.status.active') ?? 'Aktywne') : (t('assets.status.inactive') ?? 'Nieaktywne')}
                            color={asset.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {/* Investment transactions button */}
                            {assetType?.category === 'investment' && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedAsset(asset)
                                  setTransactionsDialogOpen(true)
                                }}
                                title={t('assets.actions.transactions') ?? 'Transakcje'}
                              >
                                <ShowChartIcon />
                              </IconButton>
                            )}
                            
                            {/* Valuations button */}
                            {(assetType?.category === 'property' || 
                              assetType?.category === 'vehicle' || 
                              assetType?.category === 'valuable') && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedAsset(asset)
                                  setValuationsDialogOpen(true)
                                }}
                                title={t('assets.actions.valuationHistory') ?? 'Historia wycen'}
                              >
                                <HistoryIcon />
                              </IconButton>
                            )}
                            
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(asset)}
                              title={asset.is_active ? (t('assets.actions.deactivate') ?? 'Dezaktywuj') : (t('assets.actions.activate') ?? 'Aktywuj')}
                            >
                              {asset.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAsset(asset)
                                setEditModalOpen(true)
                              }}
                              title={t('assets.actions.edit') ?? 'Edytuj'}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedAsset(asset)
                                setDeleteModalOpen(true)
                              }}
                              title={t('assets.actions.delete') ?? 'Usuń'}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
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
                    {summary.startValue.toLocaleString('pl-PL', {
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
                    {summary.difference >= 0 ? '+' : ''}{summary.difference.toLocaleString('pl-PL', {
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
                    {summary.totalValue.toLocaleString('pl-PL', {
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
      <StyledModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedAsset(null)
        }}
        title={t('assets.deleteModal.title') ?? 'Usuń aktywo'}
      >
        <Box>
          <Typography sx={{ mb: 2 }}>
            {t('assets.deleteModal.confirmMessage') ?? 'Czy na pewno chcesz usunąć aktywo'} <strong>{selectedAsset?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mb: 3 }}>
            {t('assets.deleteModal.warning') ?? 'Ta operacja jest nieodwracalna i usunie wszystkie powiązane transakcje.'}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setDeleteModalOpen(false)
                setSelectedAsset(null)
              }}
            >
              {t('common.cancel') ?? 'Anuluj'}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAsset}
            >
              {t('common.delete') ?? 'Usuń'}
            </Button>
          </Stack>
        </Box>
      </StyledModal>

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
    </Box>
  )
}

export default Assets
