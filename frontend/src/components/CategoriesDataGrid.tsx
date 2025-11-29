import React from 'react'
import { useTranslation } from 'react-i18next'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { IconButton, Box } from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Category } from '../lib/api'

interface CategoriesDataGridProps {
  categories: Category[]
  visibleRows: Array<{ id: number; name: string; parent_id: number | null; level: number }>
  expanded: Record<number, boolean>
  onToggleExpand: (id: number) => void
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  canDelete: (id: number) => boolean
}

const CategoriesDataGrid: React.FC<CategoriesDataGridProps> = ({
  categories,
  visibleRows,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const { t } = useTranslation()

  const parentsWithChildren = React.useMemo(() => {
    const s = new Set<number>()
    for (const r of visibleRows) if (r.parent_id != null) s.add(r.parent_id)
    return s
  }, [visibleRows])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('categories.table.name') || 'Name',
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => {
        const id = params.row.id as number
        const hasChildren = parentsWithChildren.has(id)
        const isExpanded = !!expanded[id]
        return (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
            {hasChildren ? (
              <IconButton size="small" onClick={() => onToggleExpand(id)}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            ) : <span style={{ display: 'inline-block', width: 40 }} />}
            <div style={{ marginLeft: (params.row.level ?? 0) * 12 }}>{params.value}</div>
          </div>
        )
      }
    },
    {
      field: 'type',
      headerName: t('categories.table.type') || 'Type',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<any>) => {
        const categoryType = params.row.type
        return categoryType === 'income' ? t('operations.fields.type_income') : t('operations.fields.type_expense')
      }
    },
    {
      field: 'parent',
      headerName: t('categories.table.mainCategory') || 'Main Category',
      flex: 1,
      renderCell: (params: GridRenderCellParams<any>) => {
        const parentId = params.row.parent_id
        if (parentId === null || parentId === undefined) {
          return '(główna)'
        }
        const parent = categories.find(c => c.id === parentId)
        return parent ? parent.name : ''
      }
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params: GridRenderCellParams<any>) => {
        const id = params.row.id as number
        const rowCat = categories.find(c => c.id === id)
        return (
          <div>
            <IconButton size="small" onClick={() => rowCat && onEdit(rowCat)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(id)} disabled={!canDelete(id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        )
      }
    }
  ]

  return (
    <Box sx={{ mt: 2, height: 500 }}>
      <DataGrid
        rows={visibleRows}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        disableRowSelectionOnClick
        autoHeight={false}
        getRowId={(r) => r.id}
      />
    </Box>
  )
}

export default CategoriesDataGrid
