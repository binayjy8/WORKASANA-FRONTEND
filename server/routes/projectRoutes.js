const express = require('express')

const router = express.Router()

const projects = [
  {
    id: 1,
    title: 'Create Moodboard',
    description: 'Collect visual references and layout ideas.',
    status: 'Completed',
    priority: 'High',
    deadline: '2026-05-15',
    team: ['Mohan', 'Aarav'],
  },
  {
    id: 2,
    title: 'Build Dashboard UI',
    description: 'Create dashboard, sidebar, navbar, and cards.',
    status: 'In Progress',
    priority: 'High',
    deadline: '2026-05-22',
    team: ['Mohan', 'Priya'],
  },
]

router.get('/', (req, res) => {
  res.json(projects)
})

router.get('/:id', (req, res) => {
  const project = projects.find((item) => item.id === Number(req.params.id))

  if (!project) {
    return res.status(404).json({ message: 'Project not found' })
  }

  res.json(project)
})

module.exports = router
