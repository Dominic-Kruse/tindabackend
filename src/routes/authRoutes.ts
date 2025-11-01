import { Router } from 'express'
import { verifyToken, AuthenticatedRequest } from '../middleware/authMiddleware'

const router = Router()

// Example protected route (test JWT)
router.get('/profile', verifyToken, (req: AuthenticatedRequest, res) => {
  res.json({
    message: `Welcome, ${req.user?.email}!`,
    user: req.user
  })
})

export default router
