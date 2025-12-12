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

// --- Asset Types
export type AssetCategory = 'liquid' | 'investment' | 'property' | 'vehicle' | 'valuable' | 'liability'

export type AssetType = {
  id: number
  name: string
  category: AssetCategory
  icon?: string | null
  allows_operations: boolean
  created_date?: string | null
}

export const getAssetTypes = async (): Promise<AssetType[]> => {
  return fetchJson(`${API}/asset-types`)
}

// --- Assets
export type Asset = {
  id: number
  user_id: number
  asset_type_id: number
  name: string
  description?: string | null
  account_number?: string | null
  quantity?: number | string | null
  average_purchase_price?: number | string | null
  current_valuation?: number | string | null
  currency: string
  is_active: boolean
  created_date?: string | null
}

export type CreateAssetPayload = {
  user_id: number
  asset_type_id: number
  name: string
  description?: string | null
  account_number?: string | null
  quantity?: number | null
  average_purchase_price?: number | null
  current_valuation?: number | null
  currency?: string
}

export const getAssets = async (): Promise<Asset[]> => {
  return fetchJson(`${API}/assets`)
}

export const createAsset = async (payload: CreateAssetPayload): Promise<Asset> => {
  return fetchJson(`${API}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const updateAsset = async ({ id, payload }: { id: number; payload: CreateAssetPayload }): Promise<Asset> => {
  return fetchJson(`${API}/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const deleteAsset = async (id: number): Promise<void> => {
  await fetchJson(`${API}/assets/${id}`, { method: 'DELETE' })
}

export const toggleAssetActive = async (id: number): Promise<Asset> => {
  return fetchJson(`${API}/assets/${id}/toggle-active`, { method: 'POST' })
}

// --- Investment Transactions
export type InvestmentTransactionType = 'buy' | 'sell' | 'value_increase' | 'value_decrease'

export type InvestmentTransaction = {
  id: number
  asset_id: number
  transaction_type: InvestmentTransactionType
  quantity?: number | string | null
  price_per_unit?: number | string | null
  total_value: number | string
  transaction_date: string
  notes?: string | null
  created_date?: string | null
}

export type CreateInvestmentTransactionPayload = {
  asset_id: number
  transaction_type: InvestmentTransactionType
  quantity?: number | null
  price_per_unit?: number | null
  total_value: number
  transaction_date: string
  notes?: string | null
}

export const createInvestmentTransaction = async (payload: CreateInvestmentTransactionPayload): Promise<InvestmentTransaction> => {
  return fetchJson(`${API}/investment-transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const getInvestmentTransactions = async (assetId: number): Promise<InvestmentTransaction[]> => {
  return fetchJson(`${API}/assets/${assetId}/investment-transactions`)
}

export const deleteInvestmentTransaction = async (id: number): Promise<void> => {
  await fetchJson(`${API}/investment-transactions/${id}`, { method: 'DELETE' })
}

// --- Asset Valuations
export type AssetValuation = {
  id: number
  asset_id: number
  valuation_date: string
  value: number | string
  notes?: string | null
  created_date?: string | null
}

export type CreateAssetValuationPayload = {
  asset_id: number
  valuation_date: string
  value: number
  notes?: string | null
}

export const createAssetValuation = async (payload: CreateAssetValuationPayload): Promise<AssetValuation> => {
  return fetchJson(`${API}/asset-valuations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const getAssetValuations = async (assetId: number): Promise<AssetValuation[]> => {
  return fetchJson(`${API}/assets/${assetId}/valuations`)
}

export const deleteAssetValuation = async (id: number): Promise<void> => {
  await fetchJson(`${API}/asset-valuations/${id}`, { method: 'DELETE' })
}

// --- Legacy Accounts (backward compatibility)
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
  category_name?: string | null  // JOINed from backend
  parent_category_name?: string | null  // JOINed from backend (parent category)
  description?: string | null
  asset_id: number
  asset_name?: string | null      // JOINed from backend
  amount: number | string
  operation_type: OperationType
  operation_date: string
  hashtags?: Hashtag[]
}

export const getOperations = async (): Promise<Operation[]> => {
  return fetchJson(`${API}/operations`)
}

export type CreateOperationPayload = {
  creation_date?: string | null
  category_id?: number | null
  description?: string | null
  asset_id: number
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

// --- Transfers
export type TransferRequest = {
  from_asset_id: number
  to_asset_id?: number
  amount: number
  transfer_type: string
  description?: string
  operation_date: string
  new_asset?: {
    asset_type_id: number
    name: string
    description?: string
    account_number?: string
    currency?: string
  }
  investment_quantity?: number
  investment_price_per_unit?: number
}

export type TransferResponse = {
  success: boolean
  from_operation_id?: number
  to_operation_id?: number
  new_asset_id?: number
  investment_transaction_id?: number
}

export const createTransfer = async (payload: TransferRequest): Promise<TransferResponse> => {
  return fetchJson(`${API}/operations/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
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
  asset_id: number
  category_id: number
  month: string // YYYY-MM-DD
  planned_amount: number | string
}

export type CreateBudgetPayload = {
  asset_id: number
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

// Budget data with JOINed categories and aggregated spending
export type BudgetWithCategory = {
  id: number
  asset_id: number
  category_id: number
  category_name: string
  category_type: string
  parent_id: number | null
  month: string // YYYY-MM-DD
  planned_amount: number | string
}

export type CategorySpending = {
  category_id: number
  amount: number | string
}

export type BudgetDataResponse = {
  budgets: BudgetWithCategory[]
  spending: CategorySpending[]
}

export const getBudgetData = async (month: string): Promise<BudgetDataResponse> => {
  return fetchJson(`${API}/budgets/data/${month}`)
}

// --- Goals
export type Goal = {
  id: number
  user_id: number
  asset_id: number
  name: string
  target_amount: number | string
  current_amount: number | string
  target_date: string // YYYY-MM-DD
  created_date: string // ISO datetime
  completed_date: string | null // ISO datetime
  is_completed: boolean
}

export type CreateGoalPayload = {
  user_id: number
  asset_id: number
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

// --- Hashtags
export type Hashtag = { id: number; name: string; created_date?: string }

export const getHashtags = async (): Promise<Hashtag[]> => {
  return fetchJson(`${API}/hashtags`)
}

export const createHashtag = async (name: string): Promise<Hashtag> => {
  return fetchJson(`${API}/hashtags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export const deleteHashtag = async (id: number): Promise<void> => {
  await fetchJson(`${API}/hashtags/${id}`, { method: 'DELETE' })
}

export const extractHashtagsFromText = async (text: string): Promise<string[]> => {
  return fetchJson(`${API}/hashtags/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

export default { getAccounts, createAccount, updateAccount, deleteAccount, getUsers, createUser, deleteUser, getOperations, getCategories, createCategory, updateCategory, deleteCategory, getBudgets, createBudget, updateBudget, deleteBudget, getGoals, createGoal, updateGoal, deleteGoal, completeGoal, getHashtags, createHashtag, deleteHashtag, extractHashtagsFromText }
