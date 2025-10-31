// server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Types
interface UserPayload {
  id: number;
  email: string;
  role: 'buyer' | 'vendor';
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  role: 'buyer' | 'vendor';
  phoneNumber?: string;
  address?: string;
  barangay?: string;
}

interface LoginBody {
  email: string;
  password: string;
  role: 'buyer' | 'vendor';
}

interface UpdateProfileBody {
  name?: string;
  phoneNumber?: string;
  address?: string;
  barangay?: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = decoded as UserPayload;
    next();
  });
};

// ============= AUTH ROUTES =============

// Register new user
app.post('/api/auth/register', async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
  const { email, password, name, role, phoneNumber, address, barangay } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, phone_number, address, barangay, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, email, name, role, phone_number, address, barangay, created_at`,
      [email, hashedPassword, name, role, phoneNumber || null, address || null, barangay || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        barangay: user.barangay,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Find user by email and role
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, role]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        barangay: user.barangay,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (verify token)
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, phone_number, address, barangay, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        barangay: user.barangay,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= USER PROFILE ROUTES =============

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req: AuthRequest<{}, {}, UpdateProfileBody>, res: Response): Promise<void> => {
  const { name, phoneNumber, address, barangay } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone_number = COALESCE($2, phone_number),
           address = COALESCE($3, address),
           barangay = COALESCE($4, barangay),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, name, role, phone_number, address, barangay`,
      [name, phoneNumber, address, barangay, req.user!.id]
    );

    const user = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        barangay: user.barangay
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
app.put('/api/users/password', authenticateToken, async (req: AuthRequest<{}, {}, ChangePasswordBody>, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get current user with password
    const result = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user!.id]
    );

    const user = result.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user!.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= VENDOR ROUTES =============

// Get all vendors
app.get('/api/vendors', async (req: Request, res: Response): Promise<void> => {
  const { barangay } = req.query;

  try {
    let query = `
      SELECT id, email, name, phone_number, address, barangay, created_at
      FROM users 
      WHERE role = 'vendor'
    `;
    const params: string[] = [];

    if (barangay) {
      query += ' AND barangay = $1';
      params.push(barangay as string);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      vendors: result.rows.map(vendor => ({
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        phoneNumber: vendor.phone_number,
        address: vendor.address,
        barangay: vendor.barangay,
        createdAt: vendor.created_at
      }))
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor by ID
app.get('/api/vendors/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, phone_number, address, barangay, created_at
       FROM users 
       WHERE id = $1 AND role = 'vendor'`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    const vendor = result.rows[0];

    res.json({
      vendor: {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        phoneNumber: vendor.phone_number,
        address: vendor.address,
        barangay: vendor.barangay,
        createdAt: vendor.created_at
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});