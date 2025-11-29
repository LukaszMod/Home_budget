import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        confirmDelete: 'Confirm delete?'
      },
      Budget: 'Budget',
      Accounts: 'Accounts',
      accounts: {
        title: 'Accounts',
        addButton: 'Add account',
        confirmDelete: 'Delete account?',
        activeAccounts: 'Active Accounts',
        closedAccounts: 'Closed Accounts',
        closeAccount: 'Close account',
        reopenAccount: 'Reopen account',
        table: {
          id: 'ID',
          name: 'Name',
          owner: 'Owner (user id)',
          accountNumber: 'Account number'
        },
        dialog: {
          edit: 'Edit account',
          new: 'New account'
        },
        fields: {
          name: 'Name',
          owner: 'Owner (user id)',
          accountNumber: 'Account number'
        }
      ,
      messages: {
        created: 'Account created',
        updated: 'Account updated',
        deleted: 'Account deleted'
      },
      users: {
        title: 'Users',
        add: 'Add user'
      }
      },
      actions: {
        cancel: 'Cancel',
        save: 'Save'
      },
      categories: {
        title: 'Categories',
        addButton: 'Add category',
        confirmDelete: 'Delete category?',
        table: {
          name: 'Name',
          type: 'Type',
          mainCategory: 'Main category'
        },
        dialog: {
          edit: 'Edit category',
          new: 'New category'
        },
        fields: {
          name: 'Name',
          type: 'Type',
          parent: 'Parent (optional)'
        },
        messages: {
          created: 'Category created',
          updated: 'Category updated',
          deleted: 'Category deleted',
          cannotDelete: 'Cannot delete category, there are operations assigned'
        }
      },
      operations: {
        title: 'Operations',
        add: 'Add operation',
        edit: 'Edit operation',
        addButton: 'Add operation',
        deleteButton: 'Delete operation',
        confirmDelete: 'Delete selected operation(s)?',
        confirmSingle: 'Delete operation?',
        dialog: {
          edit: 'Edit operation',
          new: 'New operation'
        },
        addAnother: 'Add another',
        actions: {
          addAnother: 'Add another'
        },
        fields: {
          date: 'Date',
          account: 'Account',
          amount: 'Amount',
          description: 'Description',
          category: 'Category',
          user: 'User',
          type: 'Type',
          type_income: 'Income',
          type_expense: 'Expense'
        },
        dateFilter: {
          label: 'Time range',
          all: 'All',
          last7: 'Last 7 days',
          last30: 'Last 30 days',
          thisMonth: 'This month',
          thisQuarter: 'This quarter',
          thisYear: 'This year',
          prevYear: 'Previous year',
          custom: 'Custom range',
          from: 'From',
          to: 'To'
        },
        type: {
          income: 'Income',
          expense: 'Expense'
        },
        filters: {
          all: 'All',
          none: 'None',
          selected: 'selected'
        },
        summary: {
          totalIncome: 'Total Income',
          totalExpense: 'Total Expense',
          net: 'Net Balance'
        },
        messages: {
          saved: 'Operation saved',
          deleted: 'Operation(s) deleted',
          fillRequired: 'Please fill required fields'
        }
      },
      Operations: 'Operations',
      Categories: 'Categories',
      'Home Budget': 'Home Budget',
      budget: {
        title: 'Budget',
        planButton: 'Plan',
        saveButton: 'Save',
        copyPlan: 'Copy Plan',
        copySpending: 'Copy Spending',
        confirmDelete: 'Delete selected budget(s)?',
        confirmSingle: 'Delete budget?',
        fields: {
          month: 'Month',
          category: 'Category',
          plan: 'Budget plan',
          user: 'User',
          spending: 'Spending',
          remaining: 'Remaining'
        },
        statistics: {
          title: 'Statistics',
          plannedIncome: 'Planned Income',
          realIncome: 'Real Income',
          plannedExpense: 'Planned Expense',
          realExpense: 'Real Expense',
          plannedCashFlow: 'Planned Cash Flow',
          realCashFlow: 'Real Cash Flow',
          income: 'Income',
          expenses: 'Expenses',
          cashFlow: 'Cash Flow'
        },
        messages: {
          created: 'Budget created',
          updated: 'Budget updated',
          deleted: 'Budget(s) deleted',
          fillRequired: 'Please fill required fields'
        }
      },
      Goals: 'Goals',
      goals: {
        title: 'Savings Goals',
        add: 'Add Goal',
        addGoal: 'Add Goal',
        editGoal: 'Edit Goal',
        name: 'Goal name',
        user: 'User',
        account: 'Account',
        targetAmount: 'Target Amount',
        targetDate: 'Target Date',
        progress: 'Progress',
        daysRemaining: 'Days Remaining',
        monthlyNeeded: 'Monthly Needed',
        completedOn: 'Completed On',
        markComplete: 'Mark as Complete',
        confirmComplete: 'Mark goal as completed?',
        noGoals: 'No savings goals yet',
        requiredFields: 'Fill in all required fields'
      }
    }
  },
  pl: {
    translation: {
      common: {
        save: 'Zapisz',
        cancel: 'Anuluj',
        delete: 'Usuń',
        edit: 'Edytuj',
        confirmDelete: 'Potwierdź usunięcie?'
      },
      Budget: 'Budżet',
      Accounts: 'Konta',
      accounts: {
        title: 'Konta',
        addButton: 'Dodaj konto',
        confirmDelete: 'Usuń konto?',
        activeAccounts: 'Aktywne konta',
        closedAccounts: 'Zamknięte konta',
        closeAccount: 'Zamknij konto',
        reopenAccount: 'Otwórz konto',
        table: {
          id: 'ID',
          name: 'Nazwa',
          owner: 'Właściciel (id użytkownika)',
          accountNumber: 'Nr konta'
        },
        dialog: {
          edit: 'Edytuj konto',
          new: 'Nowe konto'
        },
        fields: {
          name: 'Nazwa',
          owner: 'Właściciel (id użytkownika)',
          accountNumber: 'Nr konta'
        }
      ,
      messages: {
        created: 'Konto utworzone',
        updated: 'Konto zaktualizowane',
        deleted: 'Konto usunięte'
      },
      users: {
        title: 'Użytkownicy',
        add: 'Dodaj użytkownika'
      }
      },
      actions: {
        cancel: 'Anuluj',
        save: 'Zapisz'
      },
      categories: {
        title: 'Kategorie',
        addButton: 'Dodaj kategorię',
        confirmDelete: 'Usuń kategorię?',
        table: {
          name: 'Nazwa',
          type: 'Typ',
          mainCategory: 'Główna kategoria'
        },
        dialog: {
          edit: 'Edytuj kategorię',
          new: 'Nowa kategoria'
        },
        fields: {
          name: 'Nazwa',
          type: 'Typ',
          parent: 'Rodzic (opcjonalnie)'
        },
        messages: {
          created: 'Kategoria utworzona',
          updated: 'Kategoria zaktualizowana',
          deleted: 'Kategoria usunięta',
          cannotDelete: 'Nie można usunąć kategorii, są do niej przypisane operacje'
        }
      },
      operations: {
        title: 'Operacje',
        add: 'Dodaj operację',
        edit: 'Edytuj operację',
        addButton: 'Dodaj operację',
        deleteButton: 'Usuń operację',
        confirmDelete: 'Usunąć zaznaczone operacje?',
        confirmSingle: 'Usuń operację?',
        dialog: {
          edit: 'Edytuj operację',
          new: 'Nowa operacja'
        },
        addAnother: 'Dodaj kolejną',
        actions: {
          addAnother: 'Dodaj kolejną'
        },
        fields: {
          date: 'Data',
          account: 'Konto',
          amount: 'Kwota',
          description: 'Opis',
          category: 'Kategoria',
          user: 'Użytkownik',
          type: 'Typ',
          type_income: 'Przychód',
          type_expense: 'Wydatek'
        },
        dateFilter: {
          label: 'Zakres czasu',
          all: 'Wszystko',
          last7: 'Ostatnie 7 dni',
          last30: 'Ostatnie 30 dni',
          thisMonth: 'Bieżący miesiąc',
          thisQuarter: 'Bieżący kwartał',
          thisYear: 'Bieżący rok',
          prevYear: 'Poprzedni rok',
          custom: 'Zakres niestandardowy',
          from: 'Od',
          to: 'Do'
        },
        type: {
          income: 'Przychód',
          expense: 'Wydatek'
        },
        filters: {
          all: 'Wszystkie',
          none: 'Brak',
          selected: 'wybrane'
        },
        summary: {
          totalIncome: 'Przychody',
          totalExpense: 'Wydatki',
          net: 'Saldo'
        },
        messages: {
          saved: 'Operacja zapisana',
          deleted: 'Operacja/operacje usunięte',
          fillRequired: 'Uzupełnij wymagane pola'
        }
      },
      Operations: 'Operacje',
      Categories: 'Kategorie',
      'Home Budget': 'Domowy budżet',
      budget: {
        title: 'Budżet',
        planButton: 'Plan',
        saveButton: 'Zapisz',
        copyPlan: 'Kopiuj Plan',
        copySpending: 'Kopiuj Wydatki',
        confirmDelete: 'Usunąć zaznaczone budżety?',
        confirmSingle: 'Usuń budżet?',
        fields: {
          month: 'Miesiąc',
          category: 'Kategoria',
          plan: 'Plan budżetu',
          user: 'Użytkownik',
          spending: 'Wydatki',
          remaining: 'Pozostało'
        },
        statistics: {
          title: 'Statystyki',
          plannedIncome: 'Planowany Przychód',
          realIncome: 'Rzeczywisty Przychód',
          plannedExpense: 'Planowane Wydatki',
          realExpense: 'Rzeczywiste Wydatki',
          plannedCashFlow: 'Planowany Cash Flow',
          realCashFlow: 'Rzeczywisty Cash Flow',
          income: 'Przychody',
          expenses: 'Wydatki',
          cashFlow: 'Cash Flow'
        },
        messages: {
          created: 'Budżet utworzony',
          updated: 'Budżet zaktualizowany',
          deleted: 'Budżet/budżety usunięte',
          fillRequired: 'Uzupełnij wymagane pola'
        }
      },
      Goals: 'Cele',
      goals: {
        title: 'Cele oszczędzania',
        add: 'Dodaj cel',
        addGoal: 'Dodaj cel',
        editGoal: 'Edytuj cel',
        name: 'Nazwa celu',
        user: 'Użytkownik',
        account: 'Konto',
        targetAmount: 'Kwota docelowa',
        targetDate: 'Data celu',
        progress: 'Postęp',
        daysRemaining: 'Dni do celu',
        monthlyNeeded: 'Potrzebne na miesiąc',
        completedOn: 'Ukończone',
        markComplete: 'Oznacz jako ukończone',
        confirmComplete: 'Potwierdź ukończenie celu',
        noGoals: 'Brak celów oszczędzania',
        requiredFields: 'Uzupełnij wszystkie pola'
      }
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'pl',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
