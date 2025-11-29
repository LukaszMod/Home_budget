import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccounts, createAccount, updateAccount, deleteAccount, toggleAccountClosed, getUsers, createUser, deleteUser, getOperations } from '../lib/api'
import type { Account as APIAccount, AccountPayload, User as APIUser, Operation as APIOperation } from '../lib/api'
import { useNotifier } from '../components/Notifier'

export const useAccountsData = () => {
  const qc = useQueryClient()
  const notifier = useNotifier()

  // Queries
  const accountsQuery = useQuery<APIAccount[], Error>({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  })

  const usersQuery = useQuery<APIUser[], Error>({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const operationsQuery = useQuery<APIOperation[], Error>({
    queryKey: ['operations'],
    queryFn: getOperations,
  })

  // Account mutations
  const createAccountMut = useMutation<APIAccount, Error, AccountPayload>({
    mutationFn: (payload: AccountPayload) => createAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      notifier.notify('Account created', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error'),
  })

  const updateAccountMut = useMutation<APIAccount, Error, { id: number; payload: AccountPayload }>({
    mutationFn: ({ id, payload }: { id: number; payload: AccountPayload }) =>
      updateAccount({ id, payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      notifier.notify('Account updated', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error'),
  })

  const deleteAccountMut = useMutation<void, Error, number>({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      notifier.notify('Account deleted', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error'),
  })

  const toggleAccountClosedMut = useMutation<APIAccount, Error, number>({
    mutationFn: (id: number) => toggleAccountClosed(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      notifier.notify('Account updated', 'success')
    },
    onError: (err: any) => notifier.notify(String(err), 'error'),
  })

  // User mutations
  const createUserMut = useMutation<APIUser, Error, { full_name: string; nick: string }>({
    mutationFn: (payload) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const deleteUserMut = useMutation<void, Error, number>({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  return {
    accountsQuery,
    usersQuery,
    operationsQuery,
    createAccountMut,
    updateAccountMut,
    deleteAccountMut,
    toggleAccountClosedMut,
    createUserMut,
    deleteUserMut,
  }
}
