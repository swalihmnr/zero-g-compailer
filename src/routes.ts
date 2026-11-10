import { Router } from 'express';
import { CompilerController } from './controllers/compilerController.js';
import path from 'path';
import rateLimit from 'express-rate-limit';

const router = Router();
const compilerController = new CompilerController();

// Rate limiters for security
const runLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 executions per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many execution requests. Please wait a moment.' }
});

const visitLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120, // 120 visit events per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many visit requests.' }
});

const statsAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // max 15 login attempts per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again later.' }
});

// Code execution
router.post('/run', runLimiter, (req, res) => compilerController.run(req, res));

// Visitor beacon
router.post('/api/visit', visitLimiter, (req, res) => compilerController.visit(req, res));

// Analytics dashboard
router.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/stats.html'));
});
router.post('/stats/auth', statsAuthLimiter, (req, res) => compilerController.authStats(req, res));
router.get('/stats/data', (req, res) => compilerController.getStats(req, res));

export default router;
