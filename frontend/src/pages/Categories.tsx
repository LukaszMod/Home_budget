import React from 'react'
import type { Category as APICategory, Category } from '../lib/api'
import { useCategories } from '../hooks/useCategories'
import CategoriesTable from '../components/categories/CategoriesTable'
import { Typography, Paper, Stack, Button, Box, Tabs, Tab } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { useNotifier } from '../components/common/Notifier'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EditCategory from '../components/categories/EditCategory'

const Categories: React.FC = () => {
  const { t } = useTranslation()
  const { categoriesQuery, deleteMut, reorderMut, toggleHiddenMut, categoryInUseQuery } = useCategories()
  const notifier = useNotifier()

  const categories = categoriesQuery.data ?? []
  const categoryInUse = categoryInUseQuery.data ?? []

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<APICategory | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<number | null>(null)
  const [activeTab, setActiveTab] = React.useState(0)

  // descendant calculation was removed -- not needed anymore

  const openNew = () => {
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
    setModalOpen(true)
  }

  const handleAddSubcategory = (parentCategory: Category) => {
    setEditing({ id: -1, name: '', type: parentCategory.type, parent_id: parentCategory.id } as Category)
    setModalOpen(true)
  }

  const handleReorder = async (items: { id: number; sort_order: number }[]) => {
    await reorderMut.mutateAsync(items)
  }

  const canDelete = (id: number) => {
    const category = categories.find(c => c.id === id)
    if (category?.is_system) return false
    console.log(id, !categoryInUse.find(op => op.id === id), !categories.some(c => c.parent_id === id))
    return !categoryInUse.find(op => op.id === id) && !categories.some(c => c.parent_id === id)
  }


  const handleDelete = async (id: number) => {
    if (!canDelete(id)) return
    setCategoryToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleToggleHidden = async (id: number) => {
    await toggleHiddenMut.mutateAsync(id)
  }

  // Filter categories based on active tab
  const userCategories = categories.filter(c => !c.is_system)
  const systemCategories = categories.filter(c => c.is_system)
  const displayedCategories = activeTab === 0 ? userCategories : systemCategories

  return (
    <>
    <EditCategory modalOpen={modalOpen} setModalOpen={setModalOpen} editing={editing} />
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">{t('categories.title')}</Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openNew}>{t('categories.addButton')}</Button>
        </Stack>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={t('categories.tabs.user')} />
          <Tab label={t('categories.tabs.system')} />
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <CategoriesTable
          categories={displayedCategories}
          onEdit={openEdit}
          onDelete={handleDelete}
          canDelete={canDelete}
          onAddSubcategory={handleAddSubcategory}
          onReorder={handleReorder}
          onToggleHidden={handleToggleHidden}
          showActions={activeTab === 0} />
      </Box>



      <ConfirmDialog
        open={deleteConfirmOpen}
        message={t('categories.confirmDelete')}
        onConfirm={async () => {
          if (categoryToDelete !== null) {
            await deleteMut.mutateAsync(categoryToDelete)
          }
          setDeleteConfirmOpen(false)
          setCategoryToDelete(null)
        } }
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setCategoryToDelete(null)
        } } />
    </Box>
    </>
  )
}

export default Categories