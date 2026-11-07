import { Router } from 'express';
import { CompilerController } from './controllers/compilerController.js';

const router = Router();
const compilerController = new CompilerController();

router.post('/run', (req, res) => compilerController.run(req, res));

export default router;
