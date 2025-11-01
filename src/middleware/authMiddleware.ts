import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: number 
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '') as JwtPayload
    req.user = decoded // attach user info to request
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
