import { useEffect, useMemo, useState } from 'react'

// Helper to safely parse JSON from localStorage
function readJson<T>(value: string | null): T | undefined {
  if (!value) return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}


// Custom hook for persisting state to localStorage (Data Persistence Requirement)
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return initialValue

    const storage = window.localStorage
    const existing = readJson<T>(storage.getItem(key))
    if (existing !== undefined) return existing

    // Migration helper: if the current key has been versioned previously (e.g. `${key}.<old>`),
    // reuse the first parsable value we find without hardcoding any version string.
    const prefix = `${key}.`
    for (let i = 0; i < storage.length; i++) {
      const candidateKey = storage.key(i)
      if (!candidateKey || !candidateKey.startsWith(prefix)) continue

      const migrated = readJson<T>(storage.getItem(candidateKey))
      if (migrated !== undefined) return migrated
    }

    return initialValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const [value, setValue] = useState<T>(initial)

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore errors if localStorage is disabled or full
    }
  }, [key, value])

  return [value, setValue] as const
}

