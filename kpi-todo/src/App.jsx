import { useEffect, useRef, useState } from 'react'
import seedData from '../data/kpi_h2_2026.json'
import * as edit from './lib/goals.js'
import { formatDate } from './lib/dates.js'
import { loadGoals, saveGoals, subscribeToGoals } from './lib/storage.js'
import PeriodSwitch from './components/PeriodSwitch.jsx'
import GoalList from './components/GoalList.jsx'
import GoalForm from './components/GoalForm.jsx'
import DeadlineCalendar from './components/DeadlineCalendar.jsx'

export default function App() {
  const [goals, setGoals] = useState(() => loadGoals(seedData.goals))
  const [period, setPeriod] = useState('H2')
  const [expandedId, setExpandedId] = useState(null)
  const [saveFailed, setSaveFailed] = useState(false)

  // Не пересохраняем то, что только что загрузили: пишем в хранилище только правки.
  const loaded = useRef(goals)
  useEffect(() => {
    if (goals === loaded.current) return
    setSaveFailed(!saveGoals(goals))
  }, [goals])

  // Правки из другой вкладки подтягиваем сразу, иначе эта вкладка затёрла бы их своей копией.
  useEffect(() => subscribeToGoals(() => {
    const fresh = loadGoals(seedData.goals)
    loaded.current = fresh
    setGoals(fresh)
  }), [])

  const visibleGoals = goals.filter((goal) => goal.period === period)

  const toggleGoal = (id) => setExpandedId((current) => (current === id ? null : id))

  const actions = {
    toggleSubtask: (goalId, subtaskId) =>
      setGoals((current) => edit.toggleSubtask(current, goalId, subtaskId)),
    addSubtask: (goalId, values) =>
      setGoals((current) => edit.addSubtask(current, goalId, values)),
    deleteSubtask: (goalId, subtaskId) =>
      setGoals((current) => edit.deleteSubtask(current, goalId, subtaskId)),
    deleteGoal: (goalId) => {
      const goal = goals.find((item) => item.id === goalId)
      if (!goal) return
      const question = goal.subtasks.length > 0
        ? `Удалить цель «${goal.title}» вместе с подзадачами (${goal.subtasks.length})?`
        : `Удалить цель «${goal.title}»?`
      if (!window.confirm(question)) return
      setGoals((current) => edit.deleteGoal(current, goalId))
      setExpandedId((current) => (current === goalId ? null : current))
    },
  }

  const addGoal = (values) => {
    const next = edit.addGoal(goals, { ...values, period })
    setGoals(next)
    setExpandedId(next[next.length - 1].id)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>KPI To-Do</h1>
          <span className="demo-badge" title={'Стартовый набор: ' + seedData.source.system + ' ' + seedData.source.container + ' («' + seedData.source.containerTitle + '»). Правки живут только в этом браузере.'}>
            снимок Jira от {formatDate(seedData.source.fetchedAt)}
          </span>
        </div>
        <PeriodSwitch value={period} onChange={setPeriod} />
      </header>

      {saveFailed && (
        <p className="notice notice-warning" role="alert">
          Не удалось сохранить изменения в браузере — после перезагрузки страницы они пропадут.
        </p>
      )}

      <main className="panes">
        <section className="pane pane-goals">
          <h2 className="pane-title">Цели — {period} 2026</h2>
          <GoalList
            goals={visibleGoals}
            period={period}
            expandedId={expandedId}
            onToggle={toggleGoal}
            actions={actions}
          />
          <GoalForm key={period} period={period} onAdd={addGoal} />
        </section>

        <section className="pane pane-calendar">
          <h2 className="pane-title">Календарь сроков</h2>
          <DeadlineCalendar goals={visibleGoals} period={period} expandedId={expandedId} />
        </section>
      </main>
    </div>
  )
}
