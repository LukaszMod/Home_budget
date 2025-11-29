import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Category } from '../lib/api'

interface CategoriesTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  canDelete: (id: number) => boolean
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({})

  // Build tree structure - only main categories are parents
  const tree = React.useMemo(() => {
    const mainCategories = categories.filter(c => c.parent_id === null || c.parent_id === undefined)
    return mainCategories.map(main => ({
      category: main,
      children: categories.filter(c => c.parent_id === main.id)
    }))
  }, [categories])

  const toggleExpand = (id: number) => {
    setExpanded(s => ({ ...s, [id]: !s[id] }))
  }

  const renderTypeChip = (type: string) => {
    const isIncome = type === 'income'
    return (
      <Chip
        label={isIncome ? t('operations.fields.type_income') : t('operations.fields.type_expense')}
        variant="outlined"
        size="small"
        color={isIncome ? 'success' : 'error'}
      />
    )
  }

  return (
    <TableContainer sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell width="5%"></TableCell>
            <TableCell width="40%"><strong>{t('categories.table.name')}</strong></TableCell>
            <TableCell width="20%"><strong>{t('categories.table.type')}</strong></TableCell>
            <TableCell width="25%"><strong>{t('categories.table.mainCategory')}</strong></TableCell>
            <TableCell width="10%" align="right"><strong>Akcje</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tree.map(({ category: main, children }) => (
            <React.Fragment key={main.id}>
              {/* Main category row */}
              <TableRow sx={{ backgroundColor: '#fafafa', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                <TableCell>
                  {children.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(main.id)}
                    >
                      {expanded[main.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  <strong>{main.name}</strong>
                </TableCell>
                <TableCell>{renderTypeChip(main.type)}</TableCell>
                <TableCell>
                  <span style={{ color: '#999', fontSize: '0.9em' }}>({t('categories.table.mainCategory')})</span>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(main)}
                    title={t('common.edit')}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(main.id)}
                    disabled={!canDelete(main.id)}
                    title={t('common.delete')}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Subcategories - collapsible */}
              {children.length > 0 && expanded[main.id] && children.map(child => (
                <TableRow key={child.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell></TableCell>
                  <TableCell sx={{ pl: 5 }}>
                    <span style={{ marginLeft: 12 }}>↳ {child.name}</span>
                  </TableCell>
                  <TableCell>{renderTypeChip(child.type)}</TableCell>
                  <TableCell>{main.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(child)}
                      title={t('common.edit')}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(child.id)}
                      disabled={!canDelete(child.id)}
                      title={t('common.delete')}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CategoriesTable
