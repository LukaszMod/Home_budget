import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      app: {
        title: 'Home Budget',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
      },
      nav: {
        budget: 'Budget',
        users: 'Users',
        assets: 'Assets',
        operations: 'Operations',
        categories: 'Categories',
        goals: 'Goals',
        hashtags: 'Hashtags',
        recurring: 'Recurring',
        statistics: 'Statistics',
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        confirmDelete: 'Confirm delete?',
        loading: 'Loading...',
        actions: 'Actions',
        close: 'Close'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        dateFormat: 'Date Format',
        currency: 'Default Currency',
        hint: 'Settings are saved in your browser'
      },
      Budget: 'Budget',
      Assets: 'Assets',
      users: {
        title: 'Users',
        add: 'Add user',
        validation: {
          fillRequired: 'Fill in all required fields'
        },
        messages: {
          created: 'User created'
        }
      },
      assets: {
        title: 'Assets',
        showInactive: 'Show inactive',
        categories: {
          liquid: 'Liquid',
          investment: 'Investments',
          property: 'Real Estate',
          vehicle: 'Vehicles',
          valuable: 'Valuables',
          liability: 'Liabilities'
        },
        table: {
          type: 'Type',
          name: 'Name',
          user: 'User',
          accountNumber: 'Account Number',
          quantity: 'Quantity',
          avgPurchasePrice: 'Avg. Purchase Price',
          valuation: 'Valuation',
          currentValue: 'Current Value',
          currency: 'Currency',
          status: 'Status',
          actions: 'Actions',
          noAssets: 'No assets'
        },
        status: {
          active: 'Active',
          inactive: 'Inactive'
        },
        actions: {
          addAsset: 'Add Asset',
          transactions: 'Transactions',
          valuationHistory: 'Valuation History',
          activate: 'Activate',
          deactivate: 'Deactivate',
          edit: 'Edit',
          delete: 'Delete'
        },
        summary: {
          title: 'Summary',
          period: 'Period',
          periods: {
            thisMonth: 'This Month',
            lastMonth: 'Last Month',
            lastQuarter: 'Last Quarter',
            thisYear: 'This Year',
            lastYear: 'Last Year',
            all: 'All Time'
          },
          selectedAssets: 'Selected Assets',
          startValue: 'Start Value',
          difference: 'Difference',
          currentValue: 'Current Value',
          clearSelection: 'Clear Selection'
        },
        deleteModal: {
          title: 'Delete Asset',
          confirmMessage: 'Are you sure you want to delete asset',
          warning: 'This operation is irreversible and will delete all related transactions.'
        },
        errors: {
          loadingError: 'Error loading assets'
        },
        validation: {
          fillRequired: 'Fill in required fields: Type, Name, User'
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
        tabs: {
          user: 'User Categories',
          system: 'System Categories'
        },
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
          parent: 'Parent'
        },
        messages: {
          created: 'Category created',
          updated: 'Category updated',
          deleted: 'Category deleted',
          cannotDelete: 'Cannot delete category, there are operations assigned',
          cannotEditSystem: 'Cannot edit system categories'
        },
        validation: {
          nameRequired: 'Name field is required'
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
        noData: 'No operations to display',
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
        splitOperation: 'Split Operation',
        originalOperation: 'Original operation',
        totalAmount: 'Total amount',
        addItem: 'Add item',
        allocated: 'Allocated',
        remaining: 'Remaining',
        sumMustMatch: 'Sum of items must match the total amount',
        fillAllFields: 'Fill all required fields',
        split: 'Split',
        unsplit: 'Unsplit',
        partOf: 'Part of',
        enableSplit: 'Split operation',
        splitItems: 'Split items',
        splitCategory: 'Split',
        transfer: 'Transfer',
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
      import: {
        title: 'Import Operations from CSV',
        steps: {
          upload: 'Upload CSV',
          mapColumns: 'Map Columns',
          preview: 'Preview & Edit'
        },
        uploadDescription: 'Select a CSV file with operation data. The file should contain headers in the first row.',
        columnMapping: 'Column Mapping',
        selectFile: 'Select CSV File',
        dragDrop: 'or drag and drop file here',
        csvFormat: 'CSV Format:',
        csvTip1: 'First row should contain column headers',
        csvTip2: 'Separator: semicolon (;) - auto-detected',
        csvTip3: 'Encoding: UTF-8 (recommended) or Windows-1250',
        csvTip4: 'Numbers: both dot (100.50) and comma (100,50) accepted',
        encodingWarning: 'Problems with Polish characters?',
        encodingTip: 'If you see strange characters (e.g. £ instead of Ł), convert file to UTF-8. In Excel: File → Save As → CSV UTF-8 (comma delimited).',
        mapDescription: 'Match CSV columns to application fields',
        saveTemplate: 'Save Template',
        savedTemplates: 'Saved templates:',
        saveTemplateTitle: 'Save Template',
        templateName: 'Template Name',
        preview: 'Preview (first 3 rows)',
        previewDescription: 'Review and edit data before import',
        operations: 'operations',
        noData: 'No data to display',
        import: 'Import',
        importing: 'Importing...',
        fields: {
          date: 'Date',
          description: 'Description',
          amount: 'Amount',
          operationType: 'Type',
          sourceAccount: 'Account',
          category: 'Category',
          dateFormat: 'Date Format'
        },
        errors: {
          invalidFile: 'Invalid file format. Select a CSV file.',
          emptyFile: 'CSV file is empty',
          noData: 'No data to import',
          readError: 'Error reading file: ',
          noValidOperations: 'No valid operations to import. Make sure amount, date and account columns are correctly mapped.'
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
        requiredFields: 'Fill in all required fields',
        validation: {
          fillRequired: 'Fill in all required fields'
        },
        messages: {
          created: 'Goal created',
          updated: 'Goal updated'
        }
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
      app: {
        title: 'Budżet Domowy',
        darkMode: 'Ciemny motyw',
        lightMode: 'Jasny motyw',
      },
      nav: {
        budget: 'Budżet',
        users: 'Użytkownicy',
        assets: 'Majątek',
        operations: 'Operacje',
        categories: 'Kategorie',
        goals: 'Cele',
        hashtags: 'Hashtagi',
        recurring: 'Cykliczne',
        statistics: 'Statystyki',
      },
      common: {
        save: 'Zapisz',
        cancel: 'Anuluj',
        delete: 'Usuń',
        edit: 'Edytuj',
        back: 'Wstecz',
        next: 'Dalej',
        confirmDelete: 'Potwierdź usunięcie?',
        loading: 'Ładowanie...',
        actions: 'Akcje',
        close: 'Zamknij'
      },
      settings: {
        title: 'Ustawienia',
        language: 'Język',
        dateFormat: 'Format daty',
        currency: 'Waluta domyślna',
        hint: 'Ustawienia są zapisywane w przeglądarce'
      },
      Budget: 'Budżet',
      Assets: 'Majątek',
      users: {
        title: 'Użytkownicy',
        add: 'Dodaj użytkownika',
        validation: {
          fillRequired: 'Wypełnij wszystkie pola'
        },
        messages: {
          created: 'Użytkownik utworzony'
        }
      },
      assets: {
        title: 'Majątek',
        showInactive: 'Pokaż nieaktywne',
        categories: {
          liquid: 'Płynne',
          investment: 'Inwestycje',
          property: 'Nieruchomości',
          vehicle: 'Pojazdy',
          valuable: 'Wartościowe',
          liability: 'Zobowiązania'
        },
        table: {
          type: 'Typ',
          name: 'Nazwa',
          user: 'Użytkownik',
          accountNumber: 'Numer konta',
          quantity: 'Ilość',
          avgPurchasePrice: 'Śr. cena zakupu',
          valuation: 'Wycena',
          currentValue: 'Obecna wartość',
          currency: 'Waluta',
          status: 'Status',
          actions: 'Akcje',
          noAssets: 'Brak aktywów'
        },
        status: {
          active: 'Aktywne',
          inactive: 'Nieaktywne'
        },
        actions: {
          addAsset: 'Dodaj aktywo',
          transactions: 'Transakcje',
          valuationHistory: 'Historia wycen',
          activate: 'Aktywuj',
          deactivate: 'Dezaktywuj',
          edit: 'Edytuj',
          delete: 'Usuń'
        },
        summary: {
          title: 'Podsumowanie',
          period: 'Okres',
          periods: {
            thisMonth: 'Bieżący miesiąc',
            lastMonth: 'Ostatni miesiąc',
            lastQuarter: 'Ostatni kwartał',
            thisYear: 'Bieżący rok',
            lastYear: 'Ostatni rok',
            all: 'Cały czas'
          },
          selectedAssets: 'Zaznaczone aktywa',
          startValue: 'Wartość początkowa',
          difference: 'Różnica',
          currentValue: 'Obecna wartość',
          clearSelection: 'Wyczyść zaznaczenie'
        },
        deleteModal: {
          title: 'Usuń aktywo',
          confirmMessage: 'Czy na pewno chcesz usunąć aktywo',
          warning: 'Ta operacja jest nieodwracalna i usunie wszystkie powiązane transakcje.'
        },
        errors: {
          loadingError: 'Błąd ładowania aktywów'
        },
        validation: {
          fillRequired: 'Wypełnij wymagane pola: Typ, Nazwa, Użytkownik'
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
        tabs: {
          user: 'Kategorie użytkownika',
          system: 'Kategorie systemowe'
        },
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
          parent: 'Rodzic'
        },
        messages: {
          created: 'Kategoria utworzona',
          updated: 'Kategoria zaktualizowana',
          deleted: 'Kategoria usunięta',
          cannotDelete: 'Nie można usunąć kategorii, są do niej przypisane operacje',
          cannotEditSystem: 'Nie można edytować kategorii systemowych'
        },
        validation: {
          nameRequired: 'Pole Nazwa jest wymagane'
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
        noData: 'Brak operacji do wyświetlenia',
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
        splitOperation: 'Podziel operację',
        originalOperation: 'Oryginalna operacja',
        totalAmount: 'Kwota całkowita',
        addItem: 'Dodaj pozycję',
        allocated: 'Przydzielono',
        remaining: 'Pozostało',
        sumMustMatch: 'Suma pozycji musi się zgadzać z kwotą całkowitą',
        fillAllFields: 'Wypełnij wszystkie wymagane pola',
        split: 'Podziel',
        unsplit: 'Cofnij podział',
        partOf: 'Część z',
        enableSplit: 'Podziel operację',
        splitItems: 'Pozycje podziału',
        splitCategory: 'Dzielona',
        transfer: 'Przelew',
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
      },      import: {
        title: 'Import operacji z CSV',
        steps: {
          upload: 'Wczytaj CSV',
          mapColumns: 'Mapuj kolumny',
          preview: 'Podgląd i edycja'
        },
        uploadDescription: 'Wybierz plik CSV z danymi operacji. Plik powinien zawierać nagłówki w pierwszym wierszu.',
        columnMapping: 'Mapowanie kolumn',
        selectFile: 'Wybierz plik CSV',
        dragDrop: 'lub przeciągnij i upuść plik tutaj',
        csvFormat: 'Format CSV:',
        csvTip1: 'Pierwszy wiersz powinien zawierać nagłówki kolumn',
        csvTip2: 'Separator: średnik (;) - automatycznie wykrywany',
        csvTip3: 'Kodowanie: UTF-8 (polecane) lub Windows-1250',
        csvTip4: 'Liczby: akceptowane zarówno z kropką (100.50) jak i przecinkiem (100,50)',
        encodingWarning: 'Problem z polskimi znakami?',
        encodingTip: 'Jeśli widzisz dziwne znaki (np. £ zamiast Ł), przekonwertuj plik do UTF-8. W Excel: Plik → Zapisz jako → CSV UTF-8 (rozdzielany przecinkami).',
        mapDescription: 'Dopasuj kolumny z CSV do pól w aplikacji',
        saveTemplate: 'Zapisz szablon',
        savedTemplates: 'Zapisane szablony:',
        saveTemplateTitle: 'Zapisz szablon',
        templateName: 'Nazwa szablonu',
        preview: 'Podgląd (pierwsze 3 wiersze)',
        previewDescription: 'Sprawdź i edytuj dane przed importem',
        operations: 'operacji',
        noData: 'Brak danych do wyświetlenia',
        import: 'Importuj',
        importing: 'Importowanie...',
        fields: {
          date: 'Data',
          description: 'Opis',
          amount: 'Kwota',
          operationType: 'Typ',
          sourceAccount: 'Konto',
          category: 'Kategoria',
          dateFormat: 'Format daty'
        },
        errors: {
          invalidFile: 'Nieprawidłowy format pliku. Wybierz plik CSV.',
          emptyFile: 'Plik CSV jest pusty',
          noData: 'Brak danych do zaimportowania',
          readError: 'Błąd podczas odczytu pliku: ',
          noValidOperations: 'Brak poprawnych operacji do zaimportowania. Upewnij się, że kolumny kwota, data i konto są poprawnie zmapowane.'
        }
      },      Operations: 'Operacje',
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
        requiredFields: 'Uzupełnij wszystkie pola',
        validation: {
          fillRequired: 'Uzupełnij wszystkie pola'
        },
        messages: {
          created: 'Cel utworzony',
          updated: 'Cel zaktualizowany'
        }
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

