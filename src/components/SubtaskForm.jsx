import { useState } from 'react'
import { periodRange } from '../lib/dates.js'

export default function SubtaskForm({ period, onAdd }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const range = periodRange(period)

  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    onAdd({ title, dueDate })
    setTitle('')
    setDueDate('')
  }

  return (
    <form className="subtask-form" onSubmit={submit}>
      <input
        type="text"
        className="input"
        placeholder="Новая подзадача"
        aria-label="Название новой подзадачи"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={300}
      />
      <input
        type="date"
        className="input input-date"
        aria-label="Срок новой подзадачи"
        value={dueDate}
        min={range.min}
        max={range.max}
        onChange={(event) => setDueDate(event.target.value)}
      />
      <button type="submit" className="button" disabled={!title.trim()}>Добавить</button>
    </form>
  )
}
