import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, TextField } from '@mui/material'
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

  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'auto', height: 'calc(100vh - 300px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              {t('budget.fields.category')}
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '120px' }}>
              {t('budget.fields.plan')}
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '120px' }}>
              {t('budget.fields.spending')}
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '120px' }}>
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
                  backgroundColor: row.isParent ? '#f5f5f5' : isEdited ? '#fffde7' : 'transparent',
                  borderBottom: '1px solid #eee',
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
                    <Box sx={{ fontWeight: 'bold' }}>{displayRow.plan.toFixed(2)}</Box>
                  ) : (
                    <TextField
                      type="number"
                      size="small"
                      value={displayRow.plan}
                      onChange={(e) => onEditPlan(row.id, parseFloat(e.target.value) || 0)}
                      inputProps={{ step: '0.01', style: { textAlign: 'center' } }}
                      sx={{
                        width: '100px',
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          padding: '4px',
                        },
                      }}
                    />
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: row.isParent ? 'bold' : 'normal' }}>
                  {displayRow.spending.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: row.isParent ? 'bold' : 'normal' }}>
                  {displayRow.remaining.toFixed(2)}
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
