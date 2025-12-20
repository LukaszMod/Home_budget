import React from 'react'
import type { Category as APICategory, CreateCategoryPayload } from '../lib/api'
import { useCategories } from '../hooks/useCategories'
import StyledModal from '../components/common/StyledModal'
import CategoriesTable from '../components/categories/CategoriesTable'
import StyledIncomeSwitch from '../components/common/ui/StyledIncomeSwitch'
import { Typography, Paper, Stack, Button, Box, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { useNotifier } from '../components/common/Notifier'
import ConfirmDialog from '../components/common/ConfirmDialog'

const Categories: React.FC = () => {
  const { t } = useTranslation()
  const { categoriesQuery, operationsQuery, createMut, updateMut, deleteMut, reorderMut, toggleHiddenMut } = useCategories()
  const notifier = useNotifier()

  const categories = categoriesQuery.data ?? []
  const operations = operationsQuery.data ?? []

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<APICategory | null>(null)
  const [name, setName] = React.useState('')
  const [parentId, setParentId] = React.useState<number | null>(null)
  const [type, setType] = React.useState<'income' | 'expense'>('expense')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!modalOpen) {
      setEditing(null)
      setName('')
      setParentId(null)
      setType('expense')
    }
  }, [modalOpen])

  // descendant calculation was removed -- not needed anymore

  const openNew = () => {
    setEditing(null)
    setName('')
    setParentId(null)
    setModalOpen(true)
  }

  const openEdit = (c: APICategory) => {
    if (c.is_system) {
      notifier.notify(
        t('categories.messages.cannotEditSystem') ?? 'Nie można edytować kategorii systemowych',
        'error'
      )
      return
    }
    setEditing(c)
    setName(c.name)
    setParentId(c.parent_id ?? null)
    setType(c.type)
    setModalOpen(true)
  }

  const handleAddSubcategory = (parentId: number) => {
    setEditing(null)
    setName('')
    setParentId(parentId)
    setModalOpen(true)
  }

  const handleReorder = async (items: { id: number; sort_order: number }[]) => {
    await reorderMut.mutateAsync(items)
  }

  const canDelete = (id: number) => {
    const category = categories.find(c => c.id === id)
    if (category?.is_system) return false
    return !operations.some(op => op.category_id === id)
  }

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
    setCategoryToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleToggleHidden = async (id: number) => {
    await toggleHiddenMut.mutateAsync(id)
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
          onAddSubcategory={handleAddSubcategory}
          onReorder={handleReorder}
          onToggleHidden={handleToggleHidden}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setName(e.target.value)} 
          sx={{ mb: 2 }} 
          required
        />
        <StyledIncomeSwitch value={type} onChange={setType} />
        <TextField 
          select 
          SelectProps={{ native: true }} 
          label={t('categories.fields.parent')} 
          value={parentId ?? ''} 
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setParentId(e.target.value === '' ? null : Number(e.target.value))} 
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="">(Brak)</option>
          {categories.filter(c => c.parent_id === null).map(c => (<option key={c.id} value={c.id} disabled={!!editing && editing.id === c.id}>{c.name}</option>))}
        </TextField>
      </StyledModal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        message={t('categories.confirmDelete') || 'Czy na pewno chcesz usunąć tę kategorię?'}
        onConfirm={async () => {
          if (categoryToDelete !== null) {
            await deleteMut.mutateAsync(categoryToDelete)
          }
          setDeleteConfirmOpen(false)
          setCategoryToDelete(null)
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setCategoryToDelete(null)
        }}
      />
    </Box>
  )
}

export default Categories