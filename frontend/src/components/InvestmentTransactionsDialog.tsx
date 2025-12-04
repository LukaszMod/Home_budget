import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
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
import type { InvestmentTransaction, InvestmentTransactionType } from '../lib/api'
import { useInvestmentTransactions } from '../hooks/useInvestmentTransactions'

interface InvestmentTransactionsDialogProps {
  open: boolean
  onClose: () => void
  assetId: number
  assetName: string
}

const InvestmentTransactionsDialog: React.FC<InvestmentTransactionsDialogProps> = ({
  open,
  onClose,
  assetId,
  assetName,
}) => {
  const { transactions, createTransaction, deleteTransaction, isLoading } = useInvestmentTransactions(assetId)
  
  const [transactionType, setTransactionType] = useState<InvestmentTransactionType>('buy')
  const [quantity, setQuantity] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleAddTransaction = () => {
    if (!quantity || !pricePerUnit) {
      alert('Wypełnij ilość i cenę')
      return
    }

    const totalValue = Number(quantity) * Number(pricePerUnit)

    createTransaction({
      asset_id: assetId,
      transaction_type: transactionType,
      quantity: Number(quantity),
      price_per_unit: Number(pricePerUnit),
      total_value: totalValue,
      transaction_date: transactionDate,
      notes: notes || null,
    })

    // Reset form
    setQuantity('')
    setPricePerUnit('')
    setNotes('')
    setTransactionDate(new Date().toISOString().split('T')[0])
  }

  const handleDelete = (transactionId: number) => {
    if (confirm('Czy na pewno chcesz usunąć tę transakcję?')) {
      deleteTransaction(transactionId)
    }
  }

  const totalValue = (transaction: InvestmentTransaction) => {
    return transaction.total_value
  }

  const transactionTypeLabels: Record<InvestmentTransactionType, string> = {
    buy: '💰 Zakup',
    sell: '💸 Sprzedaż',
    value_increase: '📈 Wzrost wartości',
    value_decrease: '📉 Spadek wartości',
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Transakcje inwestycyjne - {assetName}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Add New Transaction Form */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Dodaj transakcję
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Typ transakcji"
                select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as InvestmentTransactionType)}
                fullWidth
              >
                <MenuItem value="buy">💰 Zakup</MenuItem>
                <MenuItem value="sell">💸 Sprzedaż</MenuItem>
                <MenuItem value="value_increase">📈 Wzrost wartości</MenuItem>
                <MenuItem value="value_decrease">📉 Spadek wartości</MenuItem>
              </TextField>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Ilość"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  fullWidth
                  inputProps={{ step: '0.0001' }}
                />
                <TextField
                  label="Cena za jednostkę"
                  type="number"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  fullWidth
                  inputProps={{ step: '0.01' }}
                />
              </Stack>

              <TextField
                label="Data transakcji"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
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
              />

              <Button
                variant="contained"
                onClick={handleAddTransaction}
                fullWidth
              >
                Dodaj transakcję
              </Button>
            </Stack>
          </Box>

          {/* Transactions History */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Historia transakcji
            </Typography>
            {isLoading ? (
              <Typography>Ładowanie...</Typography>
            ) : transactions.length === 0 ? (
              <Typography color="textSecondary">Brak transakcji</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell align="right">Ilość</TableCell>
                    <TableCell align="right">Cena jedn.</TableCell>
                    <TableCell align="right">Wartość</TableCell>
                    <TableCell>Notatki</TableCell>
                    <TableCell align="right">Akcje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString('pl-PL')}
                      </TableCell>
                      <TableCell>{transactionTypeLabels[transaction.transaction_type]}</TableCell>
                      <TableCell align="right">{transaction.quantity?.toFixed(4) || '-'}</TableCell>
                      <TableCell align="right">
                        {transaction.price_per_unit?.toLocaleString('pl-PL', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '-'}
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {totalValue(transaction).toLocaleString('pl-PL', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{transaction.notes || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(transaction.id)}
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

export default InvestmentTransactionsDialog
