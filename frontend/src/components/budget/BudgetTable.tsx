import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, useTheme } from '@mui/material'
import CalcTextField from '../common/ui/CalcTextField'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

export interface BudgetRow {
  id: string
  category_id?: number
  category_name: string
  plan: number
  spending: number
  remaining: number
  isParent?: boolean
  parentId?: string
}

interface BudgetTableProps {
  rows: BudgetRow[]
  expanded: Set<string>
  onToggleExpanded: (parentId: string) => void
  editedRows: Map<string, Partial<BudgetRow>>
  onEditPlan: (rowId: string, newValue: number) => void
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  rows,
  expanded,
  onToggleExpanded,
  editedRows,
  onEditPlan,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  // Helper to format numeric values
  const formatAmount = (amount: number): string => {
    return isNaN(amount) ? '0.00' : amount.toFixed(2)
  }

  const headerBgColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
  const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]
  const parentRowBg = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
  const editedRowBg = theme.palette.mode === 'dark' ? theme.palette.warning.dark : '#fffde7'

  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'auto', height: 'calc(100vh - 300px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: headerBgColor, fontWeight: 'bold' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${borderColor}` }}>
              {t('budget.fields.category')}
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, width: '120px' }}>
              {t('budget.fields.plan')}
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, width: '120px' }}>
              {t('budget.fields.spending')}
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, width: '120px' }}>
              {t('budget.fields.remaining')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (!row.isParent && row.parentId && !expanded.has(row.parentId)) {
              return null
            }

            const isEdited = editedRows.has(row.id)
            const displayRow = isEdited ? { ...row, ...editedRows.get(row.id) } : row
            const isExpanded = row.isParent && expanded.has(row.id)

            return (
              <tr
                key={row.id}
                style={{
                  backgroundColor: row.isParent ? parentRowBg : isEdited ? editedRowBg : 'transparent',
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <td
                  style={{
                    padding: '12px',
                    paddingLeft: `${row.isParent ? 12 : 48}px`,
                    fontWeight: row.isParent ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {row.isParent && (
                    <IconButton
                      size="small"
                      onClick={() => onToggleExpanded(row.id)}
                      sx={{ padding: '4px' }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                  {row.category_name}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {row.isParent ? (
                    <Box sx={{ fontWeight: 'bold' }}>{formatAmount(displayRow.plan)}</Box>
                  ) : (
                    <CalcTextField
                      size="small"
                      value={displayRow.plan}
                      onChange={(val) => onEditPlan(row.id, val)}
                      sx={{
                        width: '100px',
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          padding: '4px',
                        },
                        '& input': {
                          textAlign: 'center'
                        }
                      }}
                    />
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: row.isParent ? 'bold' : 'normal' }}>
                  {formatAmount(displayRow.spending)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: row.isParent ? 'bold' : 'normal' }}>
                  {formatAmount(displayRow.remaining)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}

export default BudgetTable
