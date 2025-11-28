import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      Budget: 'Budget',
      Accounts: 'Accounts',
      accounts: {
        title: 'Accounts',
        addButton: 'Add account',
        confirmDelete: 'Delete account?',
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
      }
      },
      actions: {
        cancel: 'Cancel',
        save: 'Save'
      },
      Operations: 'Operations',
      Categories: 'Categories',
      'Home Budget': 'Home Budget'
    }
  },
  pl: {
    translation: {
      Budget: 'Budżet',
      Accounts: 'Konta',
      accounts: {
        title: 'Konta',
        addButton: 'Dodaj konto',
        confirmDelete: 'Usuń konto?',
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
      }
      },
      actions: {
        cancel: 'Anuluj',
        save: 'Zapisz'
      },
      Operations: 'Operacje',
      Categories: 'Kategorie',
      'Home Budget': 'Domowy budżet'
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
