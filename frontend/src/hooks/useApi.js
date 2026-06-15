import { useState } from 'react'

export function useApi(apiFunc) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunc(...args)
      setData(result.data)
      return result.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, execute }
}
