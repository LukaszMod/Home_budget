// Exchange rates service using exchangerate-api.com (free tier)
// Free tier allows 1500 requests per month

interface ExchangeRates {
  [currency: string]: number
}

interface CachedRates {
  rates: ExchangeRates
  timestamp: number
  baseCurrency: string
}

const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours
const CACHE_KEY = 'exchange_rates_cache'

// Free API endpoint - no API key required for basic usage
const API_URL = 'https://open.er-api.com/v6/latest'

// Fallback static rates (approximate, updated manually)
const FALLBACK_RATES: ExchangeRates = {
  PLN: 1,
  EUR: 0.23,
  USD: 0.25,
  GBP: 0.20,
  CHF: 0.22
}

async function fetchExchangeRates(baseCurrency: string = 'PLN'): Promise<ExchangeRates> {
  try {
    const response = await fetch(`${API_URL}/${baseCurrency}`)
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }
    const data = await response.json()
    return data.rates as ExchangeRates
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback', error)
    // Return fallback rates converted to base currency
    if (baseCurrency === 'PLN') {
      return FALLBACK_RATES
    }
    // Convert fallback rates to requested base
    const plnRate = FALLBACK_RATES[baseCurrency] || 1
    const converted: ExchangeRates = {}
    Object.entries(FALLBACK_RATES).forEach(([curr, rate]) => {
      converted[curr] = rate / plnRate
    })
    return converted
  }
}

export async function getExchangeRates(baseCurrency: string = 'PLN'): Promise<ExchangeRates> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const cachedData: CachedRates = JSON.parse(cached)
      const now = Date.now()
      if (now - cachedData.timestamp < CACHE_DURATION && cachedData.baseCurrency === baseCurrency) {
        return cachedData.rates
      }
    }
  } catch (e) {
    console.warn('Failed to load cached rates', e)
  }

  // Fetch new rates
  const rates = await fetchExchangeRates(baseCurrency)
  
  // Cache the rates
  try {
    const cacheData: CachedRates = {
      rates,
      timestamp: Date.now(),
      baseCurrency
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (e) {
    console.warn('Failed to cache rates', e)
  }

  return rates
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await getExchangeRates(fromCurrency)
  const rate = rates[toCurrency]
  
  if (!rate) {
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`)
    return amount
  }

  return amount * rate
}

export function clearExchangeRatesCache(): void {
  localStorage.removeItem(CACHE_KEY)
}
