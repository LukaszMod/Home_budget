import { useState, useEffect } from 'react'
import { getExchangeRates } from '../lib/forex'

interface ExchangeRates {
  [currency: string]: number
}

export function useExchangeRates(baseCurrency: string = 'PLN') {
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadRates() {
      setLoading(true)
      setError(null)
      try {
        const fetchedRates = await getExchangeRates(baseCurrency)
        if (mounted) {
          setRates(fetchedRates)
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadRates()

    return () => {
      mounted = false
    }
  }, [baseCurrency])

  const convert = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (!rates || fromCurrency === toCurrency) {
      return amount
    }

    // If converting from base currency
    if (fromCurrency === baseCurrency) {
      return amount * (rates[toCurrency] || 1)
    }

    // If converting to base currency
    if (toCurrency === baseCurrency) {
      return amount / (rates[fromCurrency] || 1)
    }

    // Converting between two non-base currencies
    const toBase = amount / (rates[fromCurrency] || 1)
    return toBase * (rates[toCurrency] || 1)
  }

  return { rates, loading, error, convert }
}
