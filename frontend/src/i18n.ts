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
      Assets: 'Assets',
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
          planned: 'Planned operations',
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
        },
        plannedWarning: 'Planned operation - scheduled for a future date'
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
      },
      Hashtags: 'Hashtags',
      hashtags: {
        title: 'Hashtags',
        addButton: 'Add hashtag',
        addPlaceholder: 'Enter hashtag name (letters, numbers, underscore only)',
        invalidFormat: 'Hashtag can only contain letters, numbers and underscores, max 50 characters',
        deleteTitle: 'Delete Hashtag',
        deleteConfirm: 'Delete this hashtag?',
        deleteConfirmMessage: 'Can only delete if not used in operations',
        deleteButton: 'Delete hashtag',
        cannotDelete: 'Cannot delete hashtag that is used in operations',
        searchPlaceholder: 'Search hashtags...',
        noResults: 'No hashtags found matching your search.',
        table: {
          name: 'Hashtag',
          created: 'Created',
          actions: 'Actions'
        },
        empty: 'No hashtags yet. Create your first one!',
        emptyState: 'No hashtags yet. Create one to organize your operations!',
        suggestionHint: 'Tip: Use #hashtags in operation descriptions for quick tagging'
      },
      RecurringOperations: 'Recurring Operations',
      recurringOperations: {
        title: 'Recurring Operations',
        add: 'Add Recurring',
        edit: 'Edit Recurring',
        addButton: 'Add Recurring Operation',
        description: 'Create automatic recurring transactions',
        confirmDelete: 'Delete recurring operation?',
        table: {
          description: 'Description',
          account: 'Account',
          amount: 'Amount',
          type: 'Type',
          frequency: 'Frequency',
          startDate: 'Start Date',
          endDate: 'End Date',
          status: 'Status',
          actions: 'Actions'
        },
        fields: {
          account: 'Account',
          amount: 'Amount',
          description: 'Description',
          category: 'Category',
          type: 'Type',
          frequency: 'Frequency',
          startDate: 'Start Date',
          endDate: 'End Date (optional)',
          active: 'Active'
        },
        frequency: {
          daily: 'Daily',
          weekly: 'Weekly',
          biweekly: 'Bi-weekly',
          monthly: 'Monthly',
          quarterly: 'Quarterly',
          yearly: 'Yearly'
        },
        empty: 'No recurring operations yet',
        messages: {
          created: 'Recurring operation created',
          updated: 'Recurring operation updated',
          deleted: 'Recurring operation deleted',
          fillRequired: 'Please fill in all required fields'
        }
      },
      Statistics: 'Statistics',
      statistics: {
        thisMonth: 'This Month',
        futureOperations: 'Future operations',
        coverage: 'Coverage',
        activeRecurring: 'Active',
        monthlyRecurringIncome: 'Monthly Income',
        monthlyRecurringExpense: 'Monthly Expense',
        monthlyRecurringBalance: 'Balance',
        expensesByCategory: 'Expenses by Category',
        accountsBalance: 'Accounts Balance',
        accountDetails: 'Account Details',
        transactions: 'Transactions',
        topExpenseCategories: 'Top Expense Categories',
        filters: 'Filters',
        period: 'Period',
        period_currentMonth: 'Current Month',
        period_lastMonth: 'Last Month',
        period_lastQuarter: 'Last Quarter',
        period_lastYear: 'Last Year',
        selectAccounts: 'Select accounts...',
        selectCategories: 'Select categories...',
        resetFilters: 'Reset',
        activeAccounts: 'Active',
        noData: 'No data to display for selected filters',
        activeFilters: 'Active Filters',
        editFilters: 'Edit Filters',
        comparison: 'Compare',
        hashtags: 'Hashtags',
        noHashtags: 'No hashtags available'
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
      Assets: 'Majątek',
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
          descriptionHint: 'Wpisz #hashtagi aby kategoryzować operację',
          category: 'Kategoria',
          user: 'Użytkownik',
          type: 'Typ',
          type_income: 'Przychód',
          type_expense: 'Wydatek',
          hashtags: 'Hashtagi',
          hashtagsPlaceholder: 'Filtruj po hashtagach'
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
          planned: 'Operacje zaplanowane',
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
        },
        plannedWarning: 'Operacja zaplanowana - przeznaczona na przyszłą datę'
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
      },
      Hashtags: 'Hashtagi',
      hashtags: {
        title: 'Hashtagi',
        addButton: 'Dodaj hashtag',
        addPlaceholder: 'Wpisz nazwa hashtaga (tylko litery, cyfry i podkreślenie)',
        invalidFormat: 'Hashtag może zawierać tylko litery, cyfry i podkreślenia, max 50 znaków',
        deleteTitle: 'Usuń Hashtag',
        deleteConfirm: 'Usunąć ten hashtag?',
        deleteConfirmMessage: 'Można usunąć tylko jeśli nie jest używany w operacjach',
        deleteButton: 'Usuń hashtag',
        cannotDelete: 'Nie można usunąć hashtaga który jest używany w operacjach',
        searchPlaceholder: 'Szukaj hashtagów...',
        noResults: 'Nie znaleziono hashtagów pasujących do wyszukiwania.',
        table: {
          name: 'Hashtag',
          created: 'Utworzony',
          actions: 'Akcje'
        },
        empty: 'Brak hashtagów. Stwórz jeden aby organizować operacje!',
        emptyState: 'Brak hashtagów. Stwórz jeden aby organizować operacje!',
        suggestionHint: 'Wskazówka: Używaj #hashtagów w opisach operacji do szybkiej kategoryzacji'
      },
      RecurringOperations: 'Operacje cykliczne',
      recurringOperations: {
        title: 'Operacje cykliczne',
        add: 'Dodaj cykliczną',
        edit: 'Edytuj cykliczną',
        addButton: 'Dodaj operację cykliczną',
        description: 'Utwórz automatyczne powtarzające się transakcje',
        confirmDelete: 'Usunąć operację cykliczną?',
        table: {
          description: 'Opis',
          account: 'Konto',
          amount: 'Kwota',
          type: 'Typ',
          frequency: 'Częstotliwość',
          startDate: 'Data rozpoczęcia',
          endDate: 'Data zakończenia',
          status: 'Status',
          actions: 'Akcje'
        },
        fields: {
          account: 'Konto',
          amount: 'Kwota',
          description: 'Opis',
          category: 'Kategoria',
          type: 'Typ',
          frequency: 'Częstotliwość',
          startDate: 'Data rozpoczęcia',
          endDate: 'Data zakończenia (opcjonalna)',
          active: 'Aktywna'
        },
        frequency: {
          daily: 'Codziennie',
          weekly: 'Co tydzień',
          biweekly: 'Co dwa tygodnie',
          monthly: 'Co miesiąc',
          quarterly: 'Co kwartał',
          yearly: 'Rocznie'
        },
        empty: 'Brak operacji cyklicznych',
        messages: {
          created: 'Operacja cykliczna utworzona',
          updated: 'Operacja cykliczna zaktualizowana',
          deleted: 'Operacja cykliczna usunięta',
          fillRequired: 'Uzupełnij wszystkie wymagane pola'
        }
      },
      Statistics: 'Statystyki',
      statistics: {
        thisMonth: 'Bieżący miesiąc',
        futureOperations: 'Operacje przyszłe',
        coverage: 'Pokrycie',
        activeRecurring: 'Aktywne',
        monthlyRecurringIncome: 'Przychody co miesiąc',
        monthlyRecurringExpense: 'Wydatki co miesiąc',
        monthlyRecurringBalance: 'Saldo',
        expensesByCategory: 'Wydatki po kategoriach',
        accountsBalance: 'Saldo kont',
        accountDetails: 'Szczegóły kont',
        transactions: 'Transakcje',
        topExpenseCategories: 'Top kategorie wydatków',
        filters: 'Filtry',
        period: 'Okres',
        period_currentMonth: 'Bieżący miesiąc',
        period_lastMonth: 'Ostatni miesiąc',
        period_lastQuarter: 'Ostatni kwartał',
        period_lastYear: 'Ostatni rok',
        selectAccounts: 'Wybierz konta...',
        selectCategories: 'Wybierz kategorie...',
        resetFilters: 'Resetuj',
        activeAccounts: 'Aktywne',
        noData: 'Brak danych do wyświetlenia dla wybranych filtrów',
        activeFilters: 'Aktywne filtry',
        editFilters: 'Edytuj filtry',
        comparison: 'Porównaj',
        hashtags: 'Hashtagi',
        noHashtags: 'Brak dostępnych hashtagów'
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

