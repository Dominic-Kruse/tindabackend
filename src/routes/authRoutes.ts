import { Router } from 'express'
import { verifyToken, AuthenticatedRequest } from '../middleware/authMiddleware'
import { registerUser, loginUser } from '../controllers/usersController'

const router = Router()


router.post('/register', registerUser)
router.post('/login', loginUser)

// Example protected route (test JWT)
router.get('/profile', verifyToken, (req: AuthenticatedRequest, res) => {
  res.json({
    message: `Welcome, ${req.user?.email}!`,
    user: req.user
  })
})

export default router

