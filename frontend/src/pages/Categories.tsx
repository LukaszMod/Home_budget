import React from 'react'
import type { Category as APICategory, CreateCategoryPayload } from '../lib/api'
import { useCategories } from '../hooks/useCategories'
import StyledModal from '../components/common/StyledModal'
import CategoriesTable from '../components/categories/CategoriesTable'
import StyledIncomeSwitch from '../components/common/ui/StyledIncomeSwitch'
import { Typography, Paper, Stack, Button, TextField, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { useNotifier } from '../components/common/Notifier'

const Categories: React.FC = () => {
  const { t } = useTranslation()
  const { categoriesQuery, operationsQuery, createMut, updateMut, deleteMut } = useCategories()
  const notifier = useNotifier()

  const categories = categoriesQuery.data ?? []
  const operations = operationsQuery.data ?? []

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<APICategory | null>(null)
  const [name, setName] = React.useState('')
  const [parentId, setParentId] = React.useState<number | null>(null)
  const [type, setType] = React.useState<'income' | 'expense'>('expense')

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
    if (!name.trim()) {
      return notifier.notify(
        t('categories.validation.nameRequired') ?? 'Pole Nazwa jest wymagane',
        'error'
      )
    }
    const payload: CreateCategoryPayload = { name: name.trim(), parent_id: parentId ?? null, type }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload })
        notifier.notify(
          t('categories.messages.updated') ?? 'Kategoria zaktualizowana',
          'success'
        )
      } else {
        await createMut.mutateAsync(payload)
        notifier.notify(
          t('categories.messages.created') ?? 'Kategoria utworzona',
          'success'
        )
      }
      setModalOpen(false)
    } catch (e: any) {
      notifier.notify(String(e), 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!canDelete(id)) return
    if (!confirm('Delete?')) return
    await deleteMut.mutateAsync(id)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{t('categories.title')}</Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openNew}>{t('categories.addButton')}</Button>
        </Stack>
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <CategoriesTable
          categories={categories}
          onEdit={openEdit}
          onDelete={handleDelete}
          canDelete={canDelete}
        />
      </Box>

      <StyledModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('categories.dialog.edit') : t('categories.dialog.new')}
        footer={(<><Button onClick={() => setModalOpen(false)}>{t('actions.cancel')}</Button><Button variant="contained" onClick={handleSave}>{t('actions.save')}</Button></>)}
      >
        <TextField 
          fullWidth 
          label={t('categories.fields.name')} 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          sx={{ mb: 2 }} 
          required
        />
        <StyledIncomeSwitch value={type} onChange={setType} />
        <TextField 
          select 
          SelectProps={{ native: true }} 
          label={t('categories.fields.parent')} 
          value={parentId ?? ''} 
          onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))} 
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="">(Brak)</option>
          {categories.filter(c => c.parent_id === null).map(c => (<option key={c.id} value={c.id} disabled={!!editing && editing.id === c.id}>{c.name}</option>))}
        </TextField>
      </StyledModal>
    </Box>
  )
}

export default Categories