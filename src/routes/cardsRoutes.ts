
import express from 'express';
import { getStallCards } from '../controllers/cardsController';

const router = express.Router();

router.get('/', getStallCards);

export default router;
