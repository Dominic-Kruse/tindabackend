import { Router } from 'express'
import { verifyToken, AuthenticatedRequest } from '../middleware/authMiddleware'

const router = Router()

router.get('/profile', verifyToken, (req: AuthenticatedRequest, res) => {
  res.json({ message: `Welcome, ${req.user?.email}!` })
})

export default router
