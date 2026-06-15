const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 1.08,
  INR: 0.012,
  GBP: 1.27,
}

export function convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'USD') {
  const from = (fromCurrency || 'USD').toUpperCase()
  const to = (toCurrency || 'USD').toUpperCase()
  const fromRate = EXCHANGE_RATES[from] || 1.0
  const toRate = EXCHANGE_RATES[to] || 1.0
  
  // Convert from source currency to USD, then from USD to target currency
  const amountInUSD = amount * fromRate
  return amountInUSD / toRate
}

export function formatCurrency(amount, currencyCode) {
  const defaultCurrency = localStorage.getItem('default_currency') || 'USD'
  const currency = (currencyCode || defaultCurrency).toUpperCase()
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  } catch (e) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`
}
