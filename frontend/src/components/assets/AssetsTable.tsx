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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  onReorder: (assets: Asset[]) => void
  getUserNick: (userId: number) => string
  formatValue: (value: number | string | null | undefined, currency: string) => string
  formatQuantity: (value: number | string | null | undefined, decimals: number) => string
  getCurrentValue: (asset: Asset) => number | string | null | undefined
}

interface SortableRowProps {
  asset: Asset
  assetType: AssetType | undefined
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
  t: any
}

const SortableRow: React.FC<SortableRowProps> = ({
  asset,
  assetType,
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
  t,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const currentValue = getCurrentValue(asset)

  return (
    <TableRow ref={setNodeRef} style={style} key={asset.id}>
      <TableCell padding="checkbox" {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
        <DragIndicatorIcon fontSize="small" />
      </TableCell>
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
  onReorder,
  getUserNick,
  formatValue,
  formatQuantity,
  getCurrentValue,
}) => {
  const { t } = useTranslation()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex(a => a.id === active.id)
      const newIndex = assets.findIndex(a => a.id === over.id)
      
      const newAssets = arrayMove(assets, oldIndex, newIndex)
      onReorder(newAssets)
    }
  }

  const getAssetType = (assetTypeId: number): AssetType | undefined => {
    return assetTypes.find(type => type.id === assetTypeId)
  }

  const renderTableHeaders = () => {
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          <TableCell padding="checkbox">
            <Checkbox disabled />
          </TableCell>
          <TableCell>{t('assets.table.type') ?? 'Typ'}</TableCell>
          <TableCell>{t('assets.table.name') ?? 'Nazwa'}</TableCell>
          <TableCell>{t('assets.table.user') ?? 'Użytkownik'}</TableCell>
          
          {(category === 'liquid' || category === 'liability') && (
            <TableCell>{t('assets.table.accountNumber') ?? 'Nr konta'}</TableCell>
          )}
          
          {category === 'investment' && (
            <>
              <TableCell align="right">{t('assets.table.quantity') ?? 'Ilość'}</TableCell>
              <TableCell align="right">{t('assets.table.avgPurchasePrice') ?? 'Śr. cena zakupu'}</TableCell>
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table size="small">
        {renderTableHeaders()}
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} align="center">
                <Typography variant="body2" color="textSecondary">
                  {t('assets.table.noAssets') ?? 'Brak aktywów'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            <SortableContext
              items={assets.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              {assets.map((asset) => (
                <SortableRow
                  key={asset.id}
                  asset={asset}
                  assetType={getAssetType(asset.asset_type_id)}
                  category={category}
                  selectedAssetIds={selectedAssetIds}
                  onToggleSelection={onToggleSelection}
                  onToggleActive={onToggleActive}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOpenTransactions={onOpenTransactions}
                  onOpenValuations={onOpenValuations}
                  onCorrectBalance={onCorrectBalance}
                  getUserNick={getUserNick}
                  formatValue={formatValue}
                  formatQuantity={formatQuantity}
                  getCurrentValue={getCurrentValue}
                  t={t}
                />
              ))}
            </SortableContext>
          )}
        </TableBody>
      </Table>
    </DndContext>
  )
}

export default AssetsTable
