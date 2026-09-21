import { monthsOfPeriod, monthName, monthGrid, toISO, WEEKDAYS, YEAR } from '../lib/dates.js'

/**
 * Карта «дата → список сроков» на эту дату.
 * Срок цели — kind 'goal', срок подзадачи — kind 'subtask'.
 */
function deadlinesByDate(goals) {
  const map = new Map()
  const add = (date, goalId, label, kind) => {
    if (!date) return
    const list = map.get(date) || []
    list.push({ goalId, label, kind })
    map.set(date, list)
  }
  goals.forEach((goal) => {
    add(goal.dueDate, goal.id, goal.title, 'goal')
    goal.subtasks.forEach((subtask) => {
      add(subtask.dueDate, goal.id, goal.title + ' → ' + subtask.title, 'subtask')
    })
  })
  return map
}

function dayClass(marks, expandedId) {
  if (!marks) return 'calendar-day'
  const classes = ['calendar-day']
  classes.push(marks.some((m) => m.kind === 'goal') ? 'has-deadline' : 'has-subtask-deadline')
  if (expandedId && marks.some((m) => m.goalId === expandedId)) classes.push('is-focus')
  return classes.join(' ')
}

export default function DeadlineCalendar({ goals, period, expandedId }) {
  const marks = deadlinesByDate(goals)
  const months = monthsOfPeriod(period)

  return (
    <div className="calendar">
      {marks.size === 0 && (
        <p className="calendar-empty">Сроков на {period} 2026 нет</p>
      )}

      <div className="calendar-months">
        {months.map((month) => (
          <section key={month} className="calendar-month">
            <h3 className="calendar-month-title">{monthName(month)}</h3>
            <div className="calendar-weekdays">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} className="calendar-weekday">{weekday}</span>
              ))}
            </div>
            {monthGrid(YEAR, month).map((week, weekIndex) => (
              <div key={weekIndex} className="calendar-week">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <span key={dayIndex} className="calendar-day is-empty" />
                  }
                  const dayMarks = marks.get(toISO(YEAR, month, day))
                  return (
                    <span
                      key={dayIndex}
                      className={dayClass(dayMarks, expandedId)}
                      title={dayMarks ? dayMarks.map((m) => m.label).join('\n') : undefined}
                    >
                      {day}
                    </span>
                  )
                })}
              </div>
            ))}
          </section>
        ))}
      </div>

      <div className="calendar-legend">
        <span><span className="calendar-day has-deadline legend-dot">15</span> срок цели</span>
        <span><span className="calendar-day has-subtask-deadline legend-dot">15</span> срок подзадачи</span>
        <span><span className="calendar-day has-deadline is-focus legend-dot">15</span> раскрытая цель</span>
      </div>
    </div>
  )
}
