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
  Stack,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import type { Category } from '../../lib/api'

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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CategoriesTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  canDelete: (id: number) => boolean
  onAddSubcategory: (parentId: number) => void
  onReorder: (items: { id: number; sort_order: number }[]) => void
  onToggleHidden: (id: number) => void
  showActions?: boolean
}

interface SortableRowProps {
  category: Category
  isMain: boolean
  parentName?: string
  hasChildren?: boolean
  expanded?: boolean
  onToggleExpand?: () => void
  onEdit: (c: Category) => void
  onDelete: (id: number) => void
  canDelete: (id: number) => boolean
  onAddSubcategory?: (id: number) => void
  onToggleHidden: (id: number) => void
  childrenRows?: React.ReactNode
  showActions?: boolean
}

const SortableRow = ({
  category,
  isMain,
  parentName,
  hasChildren,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  canDelete,
  onAddSubcategory,
  onToggleHidden,
  childrenRows,
  showActions = true,
}: SortableRowProps) => {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : category.is_hidden ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.05)' : undefined,
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
    <React.Fragment>
      <TableRow
        ref={setNodeRef}
        style={style}
        sx={{
          backgroundColor: (theme) =>
            isMain
              ? theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : '#fafafa'
              : undefined,
          '&:hover': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : '#f0f0f0',
          },
        }}
      >
        <TableCell>
          <Stack direction="row" alignItems="center">
            <IconButton size="small" {...attributes} {...listeners} style={{ cursor: 'grab' }}>
              <DragIndicatorIcon fontSize="small" color="action" />
            </IconButton>
            {isMain && hasChildren && (
              <IconButton size="small" onClick={onToggleExpand}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Stack>
        </TableCell>
        <TableCell sx={{ pl: isMain ? 2 : 6 }}>
          {isMain ? <strong>{category.name}</strong> : <span>{category.name}</span>}
        </TableCell>
        <TableCell>{renderTypeChip(category.type)}</TableCell>
        <TableCell>
          {isMain ? (
            <span style={{ color: '#999', fontSize: '0.9em' }}>
              ({t('categories.table.mainCategory')})
            </span>
          ) : (
            parentName || ''
          )}
        </TableCell>
        {showActions && (
          <TableCell align="right">
            <Stack direction="row" justifyContent="flex-end" spacing={0}>
              {isMain && onAddSubcategory && (
                <IconButton
                  size="small"
                  onClick={() => onAddSubcategory(category.id)}
                  title={t('categories.addSubcategory', 'Dodaj podkategorię')}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
              {!category.is_system && (
                <IconButton
                  size="small"
                  onClick={() => onToggleHidden(category.id)}
                  title={category.is_hidden ? t('categories.show', 'Pokaż') : t('categories.hide', 'Ukryj')}
                >
                  {category.is_hidden ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              )}
              <IconButton size="small" onClick={() => onEdit(category)} title={t('common.edit')}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(category.id)}
                disabled={!canDelete(category.id)}
                title={t('common.delete')}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </TableCell>
        )}
      </TableRow>
      {expanded && childrenRows}
    </React.Fragment>
  )
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  onEdit,
  onDelete,
  canDelete,
  onAddSubcategory,
  onReorder,
  onToggleHidden,
  showActions = true,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tree = React.useMemo(() => {
    const mainCategories = categories.filter(
      (c) => c.parent_id === null || c.parent_id === undefined
    )
    mainCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    return mainCategories.map((main) => {
      const children = categories.filter((c) => c.parent_id === main.id)
      children.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      return {
        category: main,
        children,
      }
    })
  }, [categories])

  const toggleExpand = (id: number) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as number
    const overId = over.id as number

    // Find if active is main or sub
    const activeCategory = categories.find((c) => c.id === activeId)
    const overCategory = categories.find((c) => c.id === overId)

    if (!activeCategory || !overCategory) return

    // Reordering Main Categories
    if (!activeCategory.parent_id && !overCategory.parent_id) {
      const mainCategories = tree.map((n) => n.category)
      const oldIndex = mainCategories.findIndex((c) => c.id === activeId)
      const newIndex = mainCategories.findIndex((c) => c.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(mainCategories, oldIndex, newIndex)
        const updates = newOrder.map((c, index) => ({
          id: c.id,
          sort_order: index + 1,
        }))
        onReorder(updates)
      }
    }
    // Reordering Subcategories (same parent)
    else if (
      activeCategory.parent_id &&
      overCategory.parent_id &&
      activeCategory.parent_id === overCategory.parent_id
    ) {
      const parentId = activeCategory.parent_id
      const siblings = categories
        .filter((c) => c.parent_id === parentId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      
      const oldIndex = siblings.findIndex((c) => c.id === activeId)
      const newIndex = siblings.findIndex((c) => c.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(siblings, oldIndex, newIndex)
        const updates = newOrder.map((c, index) => ({
          id: c.id,
          sort_order: index + 1,
        }))
        onReorder(updates)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <TableContainer sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : '#f5f5f5',
              }}
            >
              <TableCell width="10%"></TableCell>
              <TableCell width="30%">
                <strong>{t('categories.table.name')}</strong>
              </TableCell>
              <TableCell width="15%">
                <strong>{t('categories.table.type')}</strong>
              </TableCell>
              <TableCell width="20%">
                <strong>{t('categories.table.mainCategory')}</strong>
              </TableCell>
              {showActions && (
                <TableCell width="25%" align="right">
                  <strong>{t('common.actions', 'Akcje')}</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <SortableContext
              items={tree.map((n) => n.category.id)}
              strategy={verticalListSortingStrategy}
            >
              {tree.map(({ category: main, children }) => (
                <SortableRow
                  key={main.id}
                  category={main}
                  isMain={true}
                  hasChildren={children.length > 0}
                  expanded={expanded[main.id]}
                  onToggleExpand={() => toggleExpand(main.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  canDelete={canDelete}
                  onAddSubcategory={onAddSubcategory}
                  onToggleHidden={onToggleHidden}
                  showActions={showActions}
                  childrenRows={
                    children.length > 0 ? (
                      <SortableContext
                        items={children.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {children.map((child) => (
                          <SortableRow
                            key={child.id}
                            category={child}
                            isMain={false}
                            parentName={main.name}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            canDelete={canDelete}
                            onToggleHidden={onToggleHidden}
                            showActions={showActions}
                          />
                        ))}
                      </SortableContext>
                    ) : null
                  }
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </TableContainer>
    </DndContext>
  )
}

export default CategoriesTable
