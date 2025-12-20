import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Asset, AssetType } from '../../lib/api'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Stack,
  Checkbox,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import HistoryIcon from '@mui/icons-material/History'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'

interface AssetsTableProps {
  assets: Asset[]
  assetTypes: AssetType[]
  category: string
  selectedAssetIds: Set<number>
  onToggleSelection: (assetId: number) => void
  onToggleActive: (asset: Asset) => void
  onEdit: (asset: Asset) => void
  onDelete: (asset: Asset) => void
  onOpenTransactions?: (asset: Asset) => void
  onOpenValuations?: (asset: Asset) => void
  onCorrectBalance?: (asset: Asset) => void
  getUserNick: (userId: number) => string
  formatValue: (value: number | string | null | undefined, currency: string) => string
  formatQuantity: (value: number | string | null | undefined, decimals: number) => string
  getCurrentValue: (asset: Asset) => number | string | null | undefined
}

const AssetsTable: React.FC<AssetsTableProps> = ({
  assets,
  assetTypes,
  category,
  selectedAssetIds,
  onToggleSelection,
  onToggleActive,
  onEdit,
  onDelete,
  onOpenTransactions,
  onOpenValuations,
  onCorrectBalance,
  getUserNick,
  formatValue,
  formatQuantity,
  getCurrentValue,
}) => {
  const { t } = useTranslation()

  const getAssetType = (assetTypeId: number): AssetType | undefined => {
    return assetTypes.find(type => type.id === assetTypeId)
  }

  const renderTableHeaders = () => {
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox disabled />
          </TableCell>
          <TableCell>{t('assets.table.type') ?? 'Typ'}</TableCell>
          <TableCell>{t('assets.table.name') ?? 'Nazwa'}</TableCell>
          <TableCell>{t('assets.table.owner') ?? 'Właściciel'}</TableCell>
          
          {(category === 'liquid' || category === 'liability') && (
            <TableCell>{t('assets.table.accountNumber') ?? 'Nr konta'}</TableCell>
          )}
          
          {category === 'investment' && (
            <>
              <TableCell align="right">{t('assets.table.quantity') ?? 'Ilość'}</TableCell>
              <TableCell align="right">{t('assets.table.avgPrice') ?? 'Śr. cena'}</TableCell>
            </>
          )}
          
          {(category === 'property' || category === 'vehicle' || category === 'valuable') && (
            <TableCell align="right">{t('assets.table.valuation') ?? 'Wycena'}</TableCell>
          )}
          
          <TableCell align="right">{t('assets.table.currentValue') ?? 'Wartość'}</TableCell>
          <TableCell>{t('assets.table.currency') ?? 'Waluta'}</TableCell>
          <TableCell>{t('assets.table.status') ?? 'Status'}</TableCell>
          <TableCell align="right">{t('assets.table.actions') ?? 'Akcje'}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return (
    <Table size="small">
      {renderTableHeaders()}
      <TableBody>
        {assets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} align="center">
              <Typography variant="body2" color="textSecondary">
                {t('assets.table.noAssets') ?? 'Brak aktywów'}
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          assets.map((asset) => {
            const assetType = getAssetType(asset.asset_type_id)
            const currentValue = getCurrentValue(asset)

            return (
              <TableRow key={asset.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAssetIds.has(asset.id)}
                    onChange={() => onToggleSelection(asset.id)}
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
                
                {(category === 'liquid' || category === 'liability') && (
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {asset.account_number || '-'}
                    </Typography>
                  </TableCell>
                )}
                
                {category === 'investment' && (
                  <>
                    <TableCell align="right">
                      {formatQuantity(asset.quantity, 4)}
                    </TableCell>
                    <TableCell align="right">
                      {formatValue(asset.average_purchase_price, asset.currency)}
                    </TableCell>
                  </>
                )}
                
                {(category === 'property' || category === 'vehicle' || category === 'valuable') && (
                  <TableCell align="right">
                    {formatValue(asset.current_valuation, asset.currency)}
                  </TableCell>
                )}
                
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
                    {assetType?.category === 'investment' && onOpenTransactions && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onOpenTransactions(asset)}
                        title={t('assets.actions.transactions') ?? 'Transakcje'}
                      >
                        <ShowChartIcon />
                      </IconButton>
                    )}
                    
                    {assetType?.category === 'liquid' && onCorrectBalance && (
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => onCorrectBalance(asset)}
                        title={t('assets.actions.correctBalance') ?? 'Wyrównaj saldo'}
                      >
                        <AccountBalanceIcon />
                      </IconButton>
                    )}
                    
                    {(assetType?.category === 'property' || 
                      assetType?.category === 'vehicle' || 
                      assetType?.category === 'valuable') && onOpenValuations && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onOpenValuations(asset)}
                        title={t('assets.actions.valuationHistory') ?? 'Historia wycen'}
                      >
                        <HistoryIcon />
                      </IconButton>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => onToggleActive(asset)}
                      title={asset.is_active ? (t('assets.actions.deactivate') ?? 'Dezaktywuj') : (t('assets.actions.activate') ?? 'Aktywuj')}
                    >
                      {asset.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(asset)}
                      title={t('assets.actions.edit') ?? 'Edytuj'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(asset)}
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
  )
}

export default AssetsTable
