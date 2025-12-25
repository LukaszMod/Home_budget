import React from 'react'
import type { Category as APICategory, CreateCategoryPayload } from '../lib/api'
import { useCategories } from '../hooks/useCategories'
import StyledModal from '../components/common/StyledModal'
import CategoriesTable from '../components/categories/CategoriesTable'
import StyledIncomeSwitch from '../components/common/ui/StyledIncomeSwitch'
import { Typography, Paper, Stack, Button, Box, TextField, Tabs, Tab } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { useNotifier } from '../components/common/Notifier'
import ConfirmDialog from '../components/common/ConfirmDialog'
import NewEditCategory from '../components/categories/NewEditCategory'

const Categories: React.FC = () => {
  const { t } = useTranslation()
  const { categoriesQuery, operationsQuery, deleteMut, reorderMut, toggleHiddenMut } = useCategories()
  const notifier = useNotifier()

  const categories = categoriesQuery.data ?? []
  const operations = operationsQuery.data ?? []

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<APICategory | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<number | null>(null)
  const [activeTab, setActiveTab] = React.useState(0)

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
    <NewEditCategory modalOpen={modalOpen} setModalOpen={setModalOpen} editing={editing} />
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