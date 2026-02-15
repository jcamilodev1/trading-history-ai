import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Account } from '@/features/accounts/types'

interface AccountState {
  selectedAccountId: string | null
  accounts: Account[]
  setSelectedAccountId: (id: string | null) => void
  setAccounts: (accounts: Account[]) => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      selectedAccountId: null,
      accounts: [],
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
      setAccounts: (accounts) => {
        set((state) => {
          // If no account selected, select the first one or default
          let newSelectedId = state.selectedAccountId

          if (!newSelectedId && accounts.length > 0) {
            const defaultAccount = accounts.find(a => a.is_default)
            newSelectedId = defaultAccount ? defaultAccount.id : accounts[0].id
          }

          // Verify selected account still exists
          if (newSelectedId && !accounts.find(a => a.id === newSelectedId)) {
            newSelectedId = accounts.length > 0 ? accounts[0].id : null
          }

          return { accounts, selectedAccountId: newSelectedId }
        })
      },
    }),
    {
      name: 'trading-account-storage',
    }
  )
)
