import { STORAGE_KEYS } from '../types'
import { getTodayISODate } from './date'

const BACKUP_VERSION = 1
const STORAGE_KEY_LIST: string[] = Object.values(STORAGE_KEYS)

// Keys whose stored value must be an array — guards against importing a file
// that would crash the app on load.
const ARRAY_KEYS: string[] = [
  STORAGE_KEYS.sessions,
  STORAGE_KEYS.races,
  STORAGE_KEYS.templates,
  STORAGE_KEYS.planExclusions,
]

export type BackupFile = {
  app: 'stackt'
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

export function createBackup(): BackupFile {
  const data: Record<string, unknown> = {}
  for (const key of STORAGE_KEY_LIST) {
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    try {
      data[key] = JSON.parse(raw)
    } catch {
      // Unreadable value — skip it rather than export garbage.
    }
  }
  return {
    app: 'stackt',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function downloadBackup(): void {
  const blob = new Blob([JSON.stringify(createBackup(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `stackt-backup-${getTodayISODate()}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function parseBackup(text: string): BackupFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("That file isn't valid JSON.")
  }

  const file = parsed as Partial<BackupFile> | null
  if (!file || file.app !== 'stackt' || typeof file.data !== 'object' || !file.data) {
    throw new Error("That doesn't look like a Stackt backup file.")
  }
  if (typeof file.version !== 'number' || file.version > BACKUP_VERSION) {
    throw new Error(
      'That backup was made by a newer version of Stackt and cannot be imported.',
    )
  }

  const data: Record<string, unknown> = {}
  for (const key of STORAGE_KEY_LIST) {
    if (!(key in file.data)) continue
    const value = (file.data as Record<string, unknown>)[key]
    if (ARRAY_KEYS.includes(key) && !Array.isArray(value)) {
      throw new Error('The backup file is damaged and cannot be imported.')
    }
    data[key] = value
  }
  if (Object.keys(data).length === 0) {
    throw new Error('That backup file contains no Stackt data.')
  }

  return { app: 'stackt', version: file.version, exportedAt: file.exportedAt ?? '', data }
}

/** Replaces all current Stackt data with the backup's contents. */
export function restoreBackup(backup: BackupFile): void {
  for (const key of STORAGE_KEY_LIST) {
    localStorage.removeItem(key)
  }
  for (const [key, value] of Object.entries(backup.data)) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
