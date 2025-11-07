import express from 'express';
import { getStalls } from '../controllers/stallsController';

const router = express.Router();

router.get('/', getStalls);

export default router;
