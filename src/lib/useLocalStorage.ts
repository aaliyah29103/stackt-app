import { useState } from 'react'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue
    return readStorage(key, fallback)
  })

  const update = (next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved =
        typeof next === 'function'
          ? (next as (current: T) => T)(current)
          : next
      writeStorage(key, resolved)
      return resolved
    })
  }

  return [value, update] as const
}
