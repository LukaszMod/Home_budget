const API = import.meta.env.VITE_BACKEND_URL

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init)
  const text = await res.text()
  if (!res.ok) {
    let err = text
    try { err = JSON.parse(text) } catch {}
    throw new Error(typeof err === 'string' ? err : JSON.stringify(err))
  }
  try { return JSON.parse(text) } catch { return text }
}

export type AccountPayload = { name: string; user_id: number; account_number?: string | null }
export type Account = { id: number; name: string; user_id: number; account_number?: string | null; is_closed: boolean }

export const getAccounts = async (): Promise<Account[]> => {
  return fetchJson(`${API}/accounts`)
}

export const createAccount = async (payload: AccountPayload): Promise<Account> => {
  return fetchJson(`${API}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const updateAccount = async ({ id, payload }: { id: number; payload: AccountPayload }): Promise<Account> => {
  return fetchJson(`${API}/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteAccount = async (id: number): Promise<void> => {
  await fetchJson(`${API}/accounts/${id}`, { method: 'DELETE' })
}

export const toggleAccountClosed = async (id: number): Promise<Account> => {
  return fetchJson(`${API}/accounts/${id}/toggle-closed`, { method: 'POST' })
}

// (named exports below; single default exported at the bottom)

// --- Users
export type User = { id: number; full_name: string; nick: string; creation_date?: string | null }
export type CreateUserPayload = { full_name: string; nick: string }

export const getUsers = async (): Promise<User[]> => {
  return fetchJson(`${API}/users`)
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  return fetchJson(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteUser = async (id: number): Promise<void> => {
  await fetchJson(`${API}/users/${id}`, { method: 'DELETE' })
}

// --- Operations
export type OperationType = 'income' | 'expense'

export type Operation = {
  id: number
  creation_date?: string | null
  category_id?: number | null
  description?: string | null
  account_id: number
  amount: number
  operation_type: OperationType
  operation_date: string
}

export const getOperations = async (): Promise<Operation[]> => {
  return fetchJson(`${API}/operations`)
}

export type CreateOperationPayload = {
  creation_date?: string | null
  category_id?: number | null
  description?: string | null
  account_id: number
  amount: number
  operation_type: OperationType
  operation_date: string
}

export const createOperation = async (payload: CreateOperationPayload): Promise<Operation> => {
  return fetchJson(`${API}/operations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteOperation = async (id: number): Promise<void> => {
  await fetchJson(`${API}/operations/${id}`, { method: 'DELETE' })
}

// --- Categories
export type Category = { id: number; name: string; parent_id?: number | null; type: 'income' | 'expense' }
export type CreateCategoryPayload = { name: string; parent_id?: number | null; type: 'income' | 'expense' }

export const getCategories = async (): Promise<Category[]> => {
  return fetchJson(`${API}/categories`)
}

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  return fetchJson(`${API}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const updateCategory = async ({ id, payload }: { id: number; payload: CreateCategoryPayload }): Promise<Category> => {
  return fetchJson(`${API}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteCategory = async (id: number): Promise<void> => {
  await fetchJson(`${API}/categories/${id}`, { method: 'DELETE' })
}

// --- Budgets
export type Budget = {
  id: number
  account_id: number
  category_id: number
  month: string // YYYY-MM-DD
  planned_amount: number
}

export type CreateBudgetPayload = {
  account_id: number
  category_id: number
  month: string // YYYY-MM-DD
  planned_amount: number
}

export const getBudgets = async (): Promise<Budget[]> => {
  return fetchJson(`${API}/budgets`)
}

export const createBudget = async (payload: CreateBudgetPayload): Promise<Budget> => {
  return fetchJson(`${API}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const updateBudget = async ({ id, payload }: { id: number; payload: CreateBudgetPayload }): Promise<Budget> => {
  return fetchJson(`${API}/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteBudget = async (id: number): Promise<void> => {
  await fetchJson(`${API}/budgets/${id}`, { method: 'DELETE' })
}

// --- Goals
export type Goal = {
  id: number
  user_id: number
  account_id: number
  name: string
  target_amount: number
  current_amount: number
  target_date: string // YYYY-MM-DD
  created_date: string // ISO datetime
  completed_date: string | null // ISO datetime
  is_completed: boolean
}

export type CreateGoalPayload = {
  user_id: number
  account_id: number
  name: string
  target_amount: number
  target_date: string // YYYY-MM-DD
}

export const getGoals = async (): Promise<Goal[]> => {
  return fetchJson(`${API}/goals`)
}

export const createGoal = async (payload: CreateGoalPayload): Promise<Goal> => {
  return fetchJson(`${API}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const updateGoal = async ({ id, payload }: { id: number; payload: CreateGoalPayload }): Promise<Goal> => {
  return fetchJson(`${API}/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteGoal = async (id: number): Promise<void> => {
  await fetchJson(`${API}/goals/${id}`, { method: 'DELETE' })
}

export const completeGoal = async (id: number): Promise<Goal> => {
  return fetchJson(`${API}/goals/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

export default { getAccounts, createAccount, updateAccount, deleteAccount, getUsers, createUser, deleteUser, getOperations, getCategories, createCategory, updateCategory, deleteCategory, getBudgets, createBudget, updateBudget, deleteBudget, getGoals, createGoal, updateGoal, deleteGoal, completeGoal }
