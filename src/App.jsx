import { useEffect, useState } from 'react'

const STORAGE_KEY = 'todo-tasks'
const DEFAULT_TASKS = [
  { id: 1, text: 'Learn useState', completed: true },
  { id: 2, text: 'Handle events', completed: false },
  { id: 3, text: 'Render a list with map()', completed: false },
]

// Read saved tasks; fall back to the sample tasks if nothing valid is saved
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : DEFAULT_TASKS
  } catch {
    return DEFAULT_TASKS
  }
}

const FILTERS = ['All', 'Pending', 'Completed']
const RING_LENGTH = 2 * Math.PI * 22

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export default function App() {
  // useState: each piece of data that changes over time lives in state
  // Passing a function to useState makes it run only once, on the first render
  const [tasks, setTasks] = useState(loadTasks)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('All')

  // useEffect: runs after render, whenever `tasks` has changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Storage can be full or blocked (private mode); the app still works without it
    }
  }, [tasks])

  // Event handler: runs when the form is submitted (button click or Enter)
  function handleAdd(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    // Never mutate state directly; create a new array instead
    setTasks([...tasks, { id: Date.now(), text: trimmed, completed: false }])
    setText('')
  }

  function handleDelete(id) {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  function handleToggle(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function handleClearCompleted() {
    setTasks(tasks.filter((task) => !task.completed))
  }

  // Derived data: computed from state on every render, no extra state needed
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'Pending') return !task.completed
    if (filter === 'Completed') return task.completed
    return true
  })
  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount
  const counts = { All: tasks.length, Pending: pendingCount, Completed: completedCount }
  const progress = tasks.length === 0 ? 0 : completedCount / tasks.length

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="date">{today}</p>
          <h1>My Tasks</h1>
          <p className="summary">
            {tasks.length === 0
              ? 'Nothing on your list yet'
              : pendingCount === 0
                ? 'All done. Nice work!'
                : `${pendingCount} ${pendingCount === 1 ? 'task' : 'tasks'} left to do`}
          </p>
        </div>
        <div
          className="ring"
          role="img"
          aria-label={`${completedCount} of ${tasks.length} tasks completed`}
        >
          <svg viewBox="0 0 52 52">
            <circle className="ring-track" cx="26" cy="26" r="22" />
            <circle
              className="ring-fill"
              cx="26"
              cy="26"
              r="22"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
            />
          </svg>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          aria-label="New task"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Add task">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </form>

      <div className="filters">
        {FILTERS.map((name) => (
          <button
            key={name}
            className={filter === name ? 'active' : ''}
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {name}
            <span className="count">{counts[name]}</span>
          </button>
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <div className="empty">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path d="M8.5 12.5l2.5 2.5 4.5-5" />
          </svg>
          <p>
            {filter === 'All'
              ? 'No tasks yet. Add your first one above.'
              : `No ${filter.toLowerCase()} tasks.`}
          </p>
        </div>
      ) : (
        <ul className="task-list">
          {/* Lists: map() each task to an element, with a unique key */}
          {visibleTasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                />
                <span className="check" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 12.5l4 4 8-9" />
                  </svg>
                </span>
                <span className="task-text">{task.text}</span>
              </label>
              <button
                className="delete"
                onClick={() => handleDelete(task.id)}
                aria-label={`Delete ${task.text}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {completedCount > 0 && (
        <footer className="footer">
          <span>
            {completedCount} completed
          </span>
          <button onClick={handleClearCompleted}>Clear completed</button>
        </footer>
      )}
    </main>
  )
}
