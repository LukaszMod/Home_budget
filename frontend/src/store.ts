import create from 'zustand'
import { persist } from 'zustand/middleware'

type TabName = 'budget' | 'accounts' | 'assets' | 'operations' | 'categories' | 'goals' | 'hashtags' | 'recurring' | 'statistics'
type ThemeMode = 'light' | 'dark'

interface Store {
  tab: TabName
  setTab: (t: TabName) => void

  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (m: ThemeMode) => void

  lang: string
  setLang: (l: string) => void
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      tab: 'budget',
      setTab: (t) => set({ tab: t }),

      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (m) => set({ theme: m }),

      lang: 'pl',
      setLang: (l) => set({ lang: l }),
    }),
    {
      name: 'home_budget_store',
      // persist only theme and lang
      partialize: (state) => ({ theme: state.theme, lang: state.lang }),
    }
  )
)

export default useStore
