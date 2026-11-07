import { Request, Response } from 'express';
import { CodeExecutionService } from '../services/codeExecutionService.js';

const executionService = new CodeExecutionService();

export class CompilerController {

    /**
     * Executes the provided code and returns the output.
     * @param req Express request object containing 'code' and 'language' in body.
     * @param res Express response object.
     */
    async run(req: Request, res: Response) {
        try {
            const { code, language } = req.body;

            if (!code || code.trim() === '') {
                return res.json({ output: '' });
            }

            // Execute the code using the service
            const result = await executionService.runCode(code, language);

            res.json(result);
        } catch (error: any) {
            console.error('Controller Error:', error);
            res.status(500).json({ error: 'Internal Server Error: ' + error.message });
        }
    }
}
