import { formatDate } from '../lib/dates.js'
import SubtaskForm from './SubtaskForm.jsx'

function doneCount(goal) {
  return goal.subtasks.filter((subtask) => subtask.done).length
}

function SubtaskItem({ subtask, onToggle, onDelete }) {
  const inputId = subtask.id + '-done'
  return (
    <li className={subtask.done ? 'subtask is-done' : 'subtask'}>
      <input
        type="checkbox"
        id={inputId}
        className="subtask-check"
        checked={subtask.done}
        onChange={onToggle}
      />
      <label htmlFor={inputId} className="subtask-title">{subtask.title}</label>
      <span className={subtask.dueDate ? 'subtask-due' : 'subtask-due is-unset'}>
        {formatDate(subtask.dueDate)}
      </span>
      <button
        type="button"
        className="icon-button"
        aria-label={'Удалить подзадачу «' + subtask.title + '»'}
        title="Удалить подзадачу"
        onClick={onDelete}
      >
        ×
      </button>
    </li>
  )
}

function GoalDetails({ goal, period, actions }) {
  return (
    <div className="goal-details" id={goal.id + '-details'}>
      {goal.jira && (
        <p className="goal-jira">
          Jira: <a href={goal.jira.url} target="_blank" rel="noreferrer">{goal.jira.key}</a>
          {' · '}{goal.jira.status}
        </p>
      )}
      {goal.description
        ? <p className="goal-description">{goal.description}</p>
        : <p className="goal-description is-muted">Без описания</p>}

      <h4 className="subtasks-title">Подзадачи</h4>
      {goal.subtasks.length === 0
        ? <p className="subtasks-empty">Подзадач пока нет</p>
        : (
          <ul className="subtask-list">
            {goal.subtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggle={() => actions.toggleSubtask(goal.id, subtask.id)}
                onDelete={() => actions.deleteSubtask(goal.id, subtask.id)}
              />
            ))}
          </ul>
        )}

      <SubtaskForm period={period} onAdd={(values) => actions.addSubtask(goal.id, values)} />

      <div className="goal-details-footer">
        <button
          type="button"
          className="button button-danger"
          onClick={() => actions.deleteGoal(goal.id)}
        >
          Удалить цель
        </button>
      </div>
    </div>
  )
}

export default function GoalList({ goals, period, expandedId, onToggle, actions }) {
  if (goals.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">На {period} 2026 целей нет</p>
        <p className="empty-hint">Добавьте цель кнопкой ниже или переключитесь на другой период.</p>
      </div>
    )
  }

  return (
    <ul className="goal-list">
      {goals.map((goal) => {
        const expanded = goal.id === expandedId
        return (
          <li key={goal.id} className={expanded ? 'goal-card is-expanded' : 'goal-card'}>
            <button
              type="button"
              className="goal-header"
              aria-expanded={expanded}
              aria-controls={goal.id + '-details'}
              onClick={() => onToggle(goal.id)}
            >
              <span className="goal-chevron" aria-hidden="true">▸</span>
              <span className="goal-header-text">
                <span className="goal-title">{goal.title}</span>
                <span className="goal-meta">
                  <span className="goal-due">Срок: {formatDate(goal.dueDate)}</span>
                  <span className="goal-progress">
                    Подзадачи: {doneCount(goal)} из {goal.subtasks.length}
                  </span>
                </span>
              </span>
            </button>

            {expanded && <GoalDetails goal={goal} period={period} actions={actions} />}
          </li>
        )
      })}
    </ul>
  )
}
