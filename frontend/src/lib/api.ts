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

export type AccountPayload = { name: string; owner: number; account_number?: string | null }
export type Account = { id: number; name: string; owner: number; account_number?: string | null }

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

export default { getAccounts, createAccount, updateAccount, deleteAccount }
