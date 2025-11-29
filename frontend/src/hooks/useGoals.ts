import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/api'

export function useGoals() {
  const queryClient = useQueryClient()

  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: api.getGoals,
  })

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: api.getAccounts,
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  })

  const createGoalMutation = useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: api.CreateGoalPayload }) =>
      api.updateGoal({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: api.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const completeGoalMutation = useMutation({
    mutationFn: api.completeGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  return {
    // Queries
    goals: goalsQuery.data ?? [],
    goalsLoading: goalsQuery.isLoading,
    goalsError: goalsQuery.error,
    accounts: accountsQuery.data ?? [],
    users: usersQuery.data ?? [],

    // Mutations
    createGoal: createGoalMutation.mutate,
    createGoalLoading: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutate,
    updateGoalLoading: updateGoalMutation.isPending,
    deleteGoal: deleteGoalMutation.mutate,
    deleteGoalLoading: deleteGoalMutation.isPending,
    completeGoal: completeGoalMutation.mutate,
    completeGoalLoading: completeGoalMutation.isPending,
  }
}
