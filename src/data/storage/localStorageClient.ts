const NAMESPACE = 'lts:'

function namespaced(key: string): string {
  return `${NAMESPACE}${key}`
}

export function readItem<T>(key: string): T | undefined {
  const raw = localStorage.getItem(namespaced(key))
  if (raw === null) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function writeItem<T>(key: string, value: T): void {
  localStorage.setItem(namespaced(key), JSON.stringify(value))
}

export function removeItem(key: string): void {
  localStorage.removeItem(namespaced(key))
}
