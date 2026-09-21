export const YEAR = 2026

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/** Номера месяцев (0–11) для выбранного полугодия. */
export function monthsOfPeriod(period) {
  return period === 'H1' ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11]
}

export function monthName(month) {
  return MONTH_NAMES[month]
}

/** Дата YYYY-MM-DD → «12 августа 2026». Пустая строка → «срок не задан». */
export function formatDate(value) {
  if (!value) return 'срок не задан'
  const [year, month, day] = value.split('-')
  const genitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${Number(day)} ${genitive[Number(month) - 1]} ${year}`
}

/**
 * Сетка месяца: массив недель по 7 ячеек, неделя начинается с понедельника.
 * Пустые ячейки — null.
 */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const shift = (first.getDay() + 6) % 7

  const cells = Array(shift).fill(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function toISO(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/** Границы полугодия для полей выбора даты. */
export function periodRange(period) {
  return period === 'H1'
    ? { min: `${YEAR}-01-01`, max: `${YEAR}-06-30` }
    : { min: `${YEAR}-07-01`, max: `${YEAR}-12-31` }
}
