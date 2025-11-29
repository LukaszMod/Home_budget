import React from 'react'
import type { Category as APICategory, CreateCategoryPayload } from '../lib/api'
import { useCategories } from '../hooks/useCategories'
import StyledModal from '../components/StyledModal'
import CategoriesDataGrid from '../components/CategoriesDataGrid'
import { Typography, Paper, Stack, Button, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'

const Categories: React.FC = () => {
  const { t } = useTranslation()
  const { categoriesQuery, operationsQuery, createMut, updateMut, deleteMut } = useCategories()

  const categories = categoriesQuery.data ?? []
  const operations = operationsQuery.data ?? []

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<APICategory | null>(null)
  const [name, setName] = React.useState('')
  const [parentId, setParentId] = React.useState<number | null>(null)
  const [type, setType] = React.useState<'income' | 'expense'>('expense')
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({})

  React.useEffect(() => {
    if (!modalOpen) {
      setEditing(null)
      setName('')
      setParentId(null)
      setType('expense')
    }
  }, [modalOpen])

  const descendantsOfEditing = React.useMemo(() => {
    if (!editing) return new Set<number>()
    const childrenMap = new Map<number, number[]>()
    for (const c of categories) childrenMap.set(c.id, [])
    for (const c of categories) if (c.parent_id != null) {
      const arr = childrenMap.get(c.parent_id) ?? []
      arr.push(c.id)
      childrenMap.set(c.parent_id, arr)
    }
    const res = new Set<number>()
    const stack = [editing.id]
    while (stack.length) {
      const id = stack.pop() as number
      const childs = childrenMap.get(id) ?? []
      for (const ch of childs) {
        if (!res.has(ch)) {
          res.add(ch)
          stack.push(ch)
        }
      }
    }
    return res
  }, [categories, editing])

  const tree = React.useMemo(() => {
    const map = new Map<number, APICategory & { children: APICategory[] }>()
    for (const c of categories) map.set(c.id, { ...c, children: [] })
    const roots: (APICategory & { children: APICategory[] })[] = []
    for (const node of map.values()) {
      if (node.parent_id == null) roots.push(node)
      else {
        const parent = map.get(node.parent_id)
        if (parent) parent.children.push(node)
        else roots.push(node)
      }
    }
    return roots
  }, [categories])

  const rows = React.useMemo(() => {
    const result: Array<{ id: number; name: string; parent_id: number | null; type: string; level: number }> = []
    const walk = (nodes: any[], level = 0) => {
      for (const n of nodes) {
        result.push({ id: n.id, name: n.name, parent_id: n.parent_id ?? null, type: n.type, level })
        if (Array.isArray(n.children) && n.children.length > 0) walk(n.children, level + 1)
      }
    }
    walk(tree as any[])
    return result
  }, [tree])

  const visibleRows = React.useMemo(() => {
    const parentMap = new Map<number, number | null>(rows.map(r => [r.id, r.parent_id ?? null]))
    return rows.filter(row => {
      let p = row.parent_id ?? null
      while (p != null) {
        if (!expanded[p]) return false
        p = parentMap.get(p) ?? null
      }
      return true
    })
  }, [rows, expanded])

  const openNew = () => {
    setEditing(null)
    setName('')
    setParentId(null)
    setModalOpen(true)
  }

  const openEdit = (c: APICategory) => {
    setEditing(c)
    setName(c.name)
    setParentId(c.parent_id ?? null)
    setType(c.type)
    setModalOpen(true)
  }

  const canDelete = (id: number) => !operations.some(op => op.category_id === id)

  const handleSave = async () => {
    if (!name.trim()) return
    const payload: CreateCategoryPayload = { name: name.trim(), parent_id: parentId ?? null, type }
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload })
    } else {
      await createMut.mutateAsync(payload)
    }
    setModalOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!canDelete(id)) return
    if (!confirm('Delete?')) return
    await deleteMut.mutateAsync(id)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{t('categories.title')}</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openNew}>{t('categories.addButton')}</Button>
      </Stack>

      <CategoriesDataGrid
        categories={categories}
        visibleRows={visibleRows}
        expanded={expanded}
        onToggleExpand={(id) => setExpanded(s => ({ ...s, [id]: !s[id] }))}
        onEdit={openEdit}
        onDelete={handleDelete}
        canDelete={canDelete}
      />

      <StyledModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('categories.dialog.edit') : t('categories.dialog.new')}
        footer={(<><Button onClick={() => setModalOpen(false)}>{t('actions.cancel')}</Button><Button variant="contained" onClick={handleSave}>{t('actions.save')}</Button></>)}
      >
        <TextField fullWidth label={t('categories.fields.name')} value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 1 }} />
        <TextField select SelectProps={{ native: true }} label={t('categories.fields.type')} value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')} sx={{ mb: 1, width: '100%' }} >
          <option value="expense">{t('operations.fields.type_expense')}</option>
          <option value="income">{t('operations.fields.type_income')}</option>
        </TextField>
        <TextField select SelectProps={{ native: true }} label={t('categories.fields.parent')} value={parentId ?? ''} onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))} >
          <option value="">(brak)</option>
          {categories.map(c => (<option key={c.id} value={c.id} disabled={!!editing && (editing.id === c.id || descendantsOfEditing.has(c.id))}>{c.name}</option>))}
        </TextField>
      </StyledModal>
    </Paper>
  )
}

export default Categories