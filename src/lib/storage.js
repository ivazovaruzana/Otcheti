/** Хранение целей в localStorage. Формат записи: { version: 1, goals: [...] }. */

export const STORAGE_KEY = 'kpi-todo.goals.v2'
const CORRUPTED_KEY = STORAGE_KEY + '.corrupted'
const VERSION = 2

// Ключи прошлых версий: v1 хранил демо-набор, при первом запуске v2 он удаляется.
const LEGACY_KEYS = ['kpi-todo.goals.v1', 'kpi-todo.goals.v1.corrupted']

function isSubtask(value) {
  return Boolean(value) && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.dueDate === 'string'
    && typeof value.done === 'boolean'
}

function isGoal(value) {
  return Boolean(value) && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && (value.period === 'H1' || value.period === 'H2')
    && typeof value.description === 'string'
    && typeof value.dueDate === 'string'
    && Array.isArray(value.subtasks)
    && value.subtasks.every(isSubtask)
}

/** Возвращает сохранённые цели или fallback, если записи нет, она повреждена или хранилище недоступно. */
export function loadGoals(fallback) {
  let raw = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.warn('KPI To-Do: localStorage недоступен, загружен демо-набор.', error)
    return fallback
  }
  if (raw === null) {
    dropLegacy()
    return fallback
  }

  try {
    const parsed = JSON.parse(raw)
    const goals = parsed && parsed.version === VERSION ? parsed.goals : null
    if (Array.isArray(goals) && goals.every(isGoal)) return goals
  } catch {
    // Невалидный JSON — обрабатываем ниже как повреждённую запись.
  }

  let copied = false
  try {
    localStorage.setItem(CORRUPTED_KEY, raw)
    copied = true
  } catch {
    // Не удалось отложить копию — всё равно продолжаем с демо-набором.
  }
  console.warn('KPI To-Do: сохранённые данные повреждены, загружен демо-набор. '
    + (copied ? 'Копия отложена под ключом ' + CORRUPTED_KEY + '.' : 'Отложить копию не удалось.'))
  return fallback
}

function dropLegacy() {
  try {
    const stale = LEGACY_KEYS.filter((key) => localStorage.getItem(key) !== null)
    stale.forEach((key) => localStorage.removeItem(key))
    if (stale.length) console.info('KPI To-Do: удалены данные старой версии: ' + stale.join(', '))
  } catch {
    // Хранилище недоступно — нечего удалять.
  }
}

/** Сохраняет цели. Возвращает false, если записать не удалось. */
export function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, goals }))
    return true
  } catch (error) {
    console.warn('KPI To-Do: не удалось сохранить изменения в localStorage.', error)
    return false
  }
}

/**
 * Подписка на изменения ключа из других вкладок. Событие storage не приходит
 * во вкладку, которая писала сама, и не приходит при записи того же значения.
 */
export function subscribeToGoals(onChange) {
  const handler = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
