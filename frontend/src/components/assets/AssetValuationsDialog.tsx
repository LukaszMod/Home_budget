import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Box
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CalcTextField from '../common/ui/CalcTextField'
import { useAssetValuations } from '../../hooks/useAssetValuations'

interface AssetValuationsDialogProps {
  open: boolean
  onClose: () => void
  assetId: number
  assetName: string
  currency: string
}

const AssetValuationsDialog: React.FC<AssetValuationsDialogProps> = ({
  open,
  onClose,
  assetId,
  assetName,
  currency,
}) => {
  const { valuations, createValuation, deleteValuation, isLoading } = useAssetValuations(assetId)
  
  const [valuation, setValuation] = useState('')
  const [valuationDate, setValuationDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleAddValuation = () => {
    if (!valuation) {
      alert('Wypełnij wycenę')
      return
    }

    createValuation({
      asset_id: assetId,
      value: Number(valuation),
      valuation_date: valuationDate,
      notes: notes || null,
    })

    // Reset form
    setValuation('')
    setNotes('')
    setValuationDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = (valuationId: number) => {
    if (confirm('Czy na pewno chcesz usunąć tę wycenę?')) {
      deleteValuation(valuationId)
    }
  }

  const formatValue = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency,
    }).format(numValue)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Historia wycen - {assetName}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Add New Valuation Form */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Dodaj wycenę
            </Typography>
            <Stack spacing={2}>
              <CalcTextField
                label={`Wycena (${currency})`}
                value={valuation}
                onChange={(val) => setValuation(String(val))}
                fullWidth
              />

              <TextField
                label="Data wyceny"
                type="date"
                value={valuationDate}
                onChange={(e) => setValuationDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Notatki"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="np. wycena rzeczoznawcy, oszacowanie rynkowe"
              />

              <Button
                variant="contained"
                onClick={handleAddValuation}
                fullWidth
              >
                Dodaj wycenę
              </Button>
            </Stack>
          </Box>

          {/* Valuations History */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Historia wycen
            </Typography>
            {isLoading ? (
              <Typography>Ładowanie...</Typography>
            ) : valuations.length === 0 ? (
              <Typography color="textSecondary">Brak wycen</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data wyceny</TableCell>
                    <TableCell align="right">Wartość</TableCell>
                    <TableCell>Notatki</TableCell>
                    <TableCell align="right">Akcje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {valuations
                    .sort((a, b) => new Date(b.valuation_date).getTime() - new Date(a.valuation_date).getTime())
                    .map((val) => (
                      <TableRow key={val.id}>
                        <TableCell>
                          {new Date(val.valuation_date).toLocaleDateString('pl-PL')}
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatValue(val.value)}</strong>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{val.notes || '-'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(val.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssetValuationsDialog
