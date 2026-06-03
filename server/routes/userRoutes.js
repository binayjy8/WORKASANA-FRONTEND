const express = require('express')

const router = express.Router()

const users = [
  {
    id: 1,
    name: 'Mohan',
    email: 'mohan@example.com',
    role: 'Frontend Developer',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'UI Designer',
  },
]

router.get('/', (req, res) => {
  res.json(users)
})

router.get('/:id', (req, res) => {
  const user = users.find((item) => item.id === Number(req.params.id))

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  res.json(user)
})

module.exports = router
