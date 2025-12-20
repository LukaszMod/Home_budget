import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning'
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolver: ((value: boolean) => void) | null
}

export const useConfirm = () => {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    message: '',
    resolver: null,
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        resolver: resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolver?.(true)
    setState({ open: false, message: '', resolver: null })
  }, [state.resolver])

  const handleCancel = useCallback(() => {
    state.resolver?.(false)
    setState({ open: false, message: '', resolver: null })
  }, [state.resolver])

  return {
    confirm,
    confirmState: state,
    handleConfirm,
    handleCancel,
  }
}
