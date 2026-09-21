import { newId } from './ids.js'

/** Чистые функции над списком целей: каждая возвращает новый массив. */

export function toggleSubtask(goals, goalId, subtaskId) {
  return goals.map((goal) => goal.id !== goalId ? goal : {
    ...goal,
    subtasks: goal.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask),
  })
}

export function addSubtask(goals, goalId, { title, dueDate }) {
  const subtask = { id: newId('sub'), title: title.trim(), dueDate: dueDate || '', done: false }
  return goals.map((goal) => goal.id !== goalId ? goal : {
    ...goal,
    subtasks: [...goal.subtasks, subtask],
  })
}

export function deleteSubtask(goals, goalId, subtaskId) {
  return goals.map((goal) => goal.id !== goalId ? goal : {
    ...goal,
    subtasks: goal.subtasks.filter((subtask) => subtask.id !== subtaskId),
  })
}

export function addGoal(goals, { title, description, dueDate, period }) {
  const goal = {
    id: newId('goal'),
    title: title.trim(),
    period,
    description: (description || '').trim(),
    dueDate: dueDate || '',
    subtasks: [],
  }
  return [...goals, goal]
}

export function deleteGoal(goals, goalId) {
  return goals.filter((goal) => goal.id !== goalId)
}
