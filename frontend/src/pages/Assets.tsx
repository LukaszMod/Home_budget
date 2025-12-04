import React, { useState } from 'react'
import type { Asset, AssetType, AssetCategory } from '../lib/api'
import { useAssets } from '../hooks/useAssets'
import { useAssetTypes } from '../hooks/useAssetTypes'
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
  Stack
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
  const [selectedTab, setSelectedTab] = useState(0)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false)
  const [valuationsDialogOpen, setValuationsDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const { assets, isLoading, isError, deleteAsset, toggleAssetActive, createAsset, updateAsset } = useAssets()
  const { assetTypes } = useAssetTypes()

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
    liquid: 'Płynne',
    investment: 'Inwestycje',
    property: 'Nieruchomości',
    vehicle: 'Pojazdy',
    valuable: 'Wartościowe',
    liability: 'Zobowiązania'
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

  const formatValue = (value: number | null | undefined, currency: string = 'PLN'): string => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Ładowanie...</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Błąd ładowania aktywów</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Majątek</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          Dodaj aktywo
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
                  <TableCell>Typ</TableCell>
                  <TableCell>Nazwa</TableCell>
                  {category === 'liquid' || category === 'liability' ? (
                    <TableCell>Numer konta</TableCell>
                  ) : null}
                  {category === 'investment' ? (
                    <>
                      <TableCell align="right">Ilość</TableCell>
                      <TableCell align="right">Śr. cena zakupu</TableCell>
                    </>
                  ) : null}
                  {category === 'property' || category === 'vehicle' || category === 'valuable' ? (
                    <TableCell align="right">Wycena</TableCell>
                  ) : null}
                  <TableCell>Waluta</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsByCategory(category).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="textSecondary">
                        Brak aktywów w tej kategorii
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assetsByCategory(category).map((asset) => {
                    const assetType = getAssetType(asset.asset_type_id)
                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <span>{assetType?.icon}</span>
                            <Typography variant="body2">{assetType?.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{asset.name}</TableCell>
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
                              {asset.quantity?.toFixed(4) || '-'}
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
                        <TableCell>{asset.currency}</TableCell>
                        <TableCell>
                          <Chip
                            label={asset.is_active ? 'Aktywne' : 'Nieaktywne'}
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
                                title="Transakcje"
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
                                title="Historia wycen"
                              >
                                <HistoryIcon />
                              </IconButton>
                            )}
                            
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(asset)}
                              title={asset.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                            >
                              {asset.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAsset(asset)
                                setEditModalOpen(true)
                              }}
                              title="Edytuj"
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
                              title="Usuń"
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

      {/* Delete Confirmation Modal */}
      <StyledModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedAsset(null)
        }}
        title="Usuń aktywo"
      >
        <Box>
          <Typography sx={{ mb: 2 }}>
            Czy na pewno chcesz usunąć aktywo <strong>{selectedAsset?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mb: 3 }}>
            Ta operacja jest nieodwracalna i usunie wszystkie powiązane transakcje.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setDeleteModalOpen(false)
                setSelectedAsset(null)
              }}
            >
              Anuluj
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAsset}
            >
              Usuń
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
