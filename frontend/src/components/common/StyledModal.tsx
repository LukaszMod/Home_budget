import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'

type Props = {
  open: boolean
  onClose: (event?: object, reason?: string) => void
  title?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  disableEscapeKeyDown?: boolean
}

const StyledModal: React.FC<Props> = ({ open, onClose, title, children, footer, disableEscapeKeyDown }) => {
  const handleClose = (event: object, reason?: string) => {
    // prevent backdrop closing
    if (reason === 'backdropClick') return
    onClose(event, reason)
  }

  return (
    <Dialog open={open} onClose={handleClose} disableEscapeKeyDown={disableEscapeKeyDown} aria-labelledby="styled-modal-title">
      {title && <DialogTitle id="styled-modal-title">{title}</DialogTitle>}
      <DialogContent dividers sx={{ display: 'grid', gap: 2, minWidth: 360 }}>{children}</DialogContent>
      {footer && <DialogActions>{footer}</DialogActions>}
    </Dialog>
  )
}

export default StyledModal
