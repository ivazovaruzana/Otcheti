import { useState } from 'react'
import { periodRange } from '../lib/dates.js'

export default function GoalForm({ period, onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const range = periodRange(period)

  const reset = () => {
    setTitle('')
    setDescription('')
    setDueDate('')
    setOpen(false)
  }

  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    onAdd({ title, description, dueDate })
    reset()
  }

  if (!open) {
    return (
      <button type="button" className="button button-secondary goal-form-open" onClick={() => setOpen(true)}>
        + Новая цель на {period} 2026
      </button>
    )
  }

  return (
    <form className="goal-form" onSubmit={submit}>
      <label className="field">
        <span className="field-label">Название</span>
        <input
          type="text"
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          autoFocus
        />
      </label>
      <label className="field">
        <span className="field-label">Описание</span>
        <textarea
          className="input"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
        />
      </label>
      <label className="field field-inline">
        <span className="field-label">Срок</span>
        <input
          type="date"
          className="input input-date"
          value={dueDate}
          min={range.min}
          max={range.max}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="button" disabled={!title.trim()}>Добавить цель</button>
        <button type="button" className="button button-secondary" onClick={reset}>Отмена</button>
      </div>
    </form>
  )
}
