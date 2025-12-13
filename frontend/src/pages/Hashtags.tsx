import React from 'react'
import { Paper, Stack, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TableSortLabel } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'
import { useHashtags } from '../hooks/useHashtags'

const Hashtags: React.FC = () => {
  const { t } = useTranslation()
  const { hashtags, createHashtagMut, deleteHashtagMut } = useHashtags()
  const [newHashtagName, setNewHashtagName] = React.useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [hashtagToDelete, setHashtagToDelete] = React.useState<number | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortField, setSortField] = React.useState<'name' | 'created_date'>('name')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  // Validation: alphanumeric and underscore only
  const isValidHashtagName = (name: string): boolean => {
    return name.length > 0 && name.length <= 50 && /^[a-zA-Z0-9_]+$/.test(name)
  }

  const handleAddHashtag = async () => {
    if (!isValidHashtagName(newHashtagName)) {
      return
    }
    await createHashtagMut.mutateAsync(newHashtagName)
    setNewHashtagName('')
  }

  const handleDeleteClick = (id: number) => {
    setHashtagToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (hashtagToDelete !== null) {
      try {
        await deleteHashtagMut.mutateAsync(hashtagToDelete)
        setDeleteConfirmOpen(false)
        setHashtagToDelete(null)
      } catch (error) {
        // Error handled by hook
      }
    }
  }

  const handleSortChange = (field: 'name' | 'created_date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filter and sort hashtags
  const filteredAndSortedHashtags = React.useMemo(() => {
    let filtered = hashtags.filter(h => 
      h.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any
      
      if (sortField === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else {
        aVal = a.created_date ? new Date(a.created_date).getTime() : 0
        bVal = b.created_date ? new Date(b.created_date).getTime() : 0
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [hashtags, searchTerm, sortField, sortOrder])

  return (
    <Stack spacing={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4">
          {t('hashtags.title') ?? 'Hashtags'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {/* Add new hashtag section */}
        <Stack direction="row" spacing={1} sx={{ 
          p: 2, 
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9',
          borderRadius: 1 
        }}>
          <TextField
            value={newHashtagName}
            onChange={(e) => setNewHashtagName(e.target.value)}
            placeholder={t('hashtags.addPlaceholder') ?? 'Enter hashtag name (letters, numbers, underscore only)'}
            size="small"
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddHashtag()
              }
            }}
            error={newHashtagName.length > 0 && !isValidHashtagName(newHashtagName)}
            helperText={newHashtagName.length > 0 && !isValidHashtagName(newHashtagName) 
              ? t('hashtags.invalidFormat') ?? 'Only alphanumeric characters and underscore allowed' 
              : ''}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddHashtag}
            disabled={!isValidHashtagName(newHashtagName) || createHashtagMut.isPending}
          >
            {t('hashtags.addButton') ?? 'Add'}
          </Button>
        </Stack>

        {/* Search field */}
        {hashtags.length > 0 && (
          <TextField
            placeholder={t('hashtags.searchPlaceholder') ?? 'Search hashtags...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
          />
        )}
      </Paper>

      {/* Hashtags list */}
      {hashtags.length > 0 ? (
        <Paper sx={{ flexGrow: 1, overflow: 'auto' }}>
          {filteredAndSortedHashtags.length > 0 ? (
            <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'name'}
                        direction={sortField === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSortChange('name')}
                      >
                        {t('hashtags.table.name') ?? 'Name'}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'created_date'}
                        direction={sortField === 'created_date' ? sortOrder : 'asc'}
                        onClick={() => handleSortChange('created_date')}
                      >
                        {t('hashtags.table.created') ?? 'Created'}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">{t('hashtags.table.actions') ?? 'Actions'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedHashtags.map((hashtag) => {
                    const isUsed = hashtag.usage_count > 0
                    return (
                      <TableRow 
                        key={hashtag.id}
                        sx={{ 
                          opacity: isUsed ? 0.6 : 1,
                          backgroundColor: isUsed ? (theme) => theme.palette.action.hover : 'transparent'
                        }}
                      >
                        <TableCell>#{hashtag.name}</TableCell>
                        <TableCell>
                          {hashtag.created_date ? new Date(hashtag.created_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(hashtag.id)}
                            title={isUsed ? (t('hashtags.cannotDelete') ?? 'Cannot delete hashtag that is used') : (t('hashtags.deleteButton') ?? 'Delete hashtag')}
                            disabled={isUsed}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" sx={{ color: '#999', p: 2, textAlign: 'center' }}>
                {t('hashtags.noResults') ?? 'No hashtags found matching your search.'}
              </Typography>
            )}
          </Paper>
        ) : (
          <Paper sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: '#999', p: 2, textAlign: 'center' }}>
              {t('hashtags.empty') ?? 'No hashtags yet. Create your first one!'}
            </Typography>
          </Paper>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>{t('hashtags.deleteTitle') ?? 'Delete Hashtag'}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('hashtags.deleteConfirm') ?? 'Are you sure? You can only delete hashtags that are not used in any operations.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              {t('common.cancel') ?? 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              disabled={deleteHashtagMut.isPending}
            >
              {t('common.delete') ?? 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
    </Stack>
  )
}

export default Hashtags
