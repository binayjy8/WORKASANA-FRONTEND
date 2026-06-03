const express = require('express')

const router = express.Router()

const tasks = [
  {
    id: 1,
    title: 'Design login page',
    project: 'Create Moodboard',
    status: 'Completed',
    priority: 'High',
    dueDate: '2026-05-12',
    assignee: 'Mohan',
  },
  {
    id: 2,
    title: 'Create sidebar navigation',
    project: 'Build Dashboard UI',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-05-16',
    assignee: 'Priya',
  },
]

const findTaskIndex = (id) => {
  return tasks.findIndex((item) => item.id === Number(id))
}

router.get('/', (req, res) => {
  res.json(tasks)
})

router.get('/:id', (req, res) => {
  const task = tasks.find((item) => item.id === Number(req.params.id))

  if (!task) {
    return res.status(404).json({ message: 'Task not found' })
  }

  res.json(task)
})

router.post('/', (req, res) => {
  const title = String(req.body.title || '').trim()

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' })
  }

  const task = {
    id: tasks.length
      ? Math.max(...tasks.map((item) => item.id)) + 1
      : 1,
    title,
    project: req.body.project || 'Unassigned Project',
    status: req.body.status || 'Pending',
    priority: req.body.priority || 'Medium',
    dueDate: req.body.dueDate || '',
    assignee: req.body.assignee || '',
  }

  tasks.push(task)

  res.status(201).json(task)
})

router.put('/:id', (req, res) => {
  const taskIndex = findTaskIndex(req.params.id)

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' })
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...req.body,
    id: tasks[taskIndex].id,
  }

  res.json(tasks[taskIndex])
})

router.delete('/:id', (req, res) => {
  const taskIndex = findTaskIndex(req.params.id)

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' })
  }

  const [deletedTask] = tasks.splice(taskIndex, 1)

  res.json(deletedTask)
})

module.exports = router
