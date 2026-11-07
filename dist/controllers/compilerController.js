"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerController = void 0;
const codeExecutionService_js_1 = require("../services/codeExecutionService.js");
const executionService = new codeExecutionService_js_1.CodeExecutionService();
class CompilerController {
    /**
     * Executes the provided code and returns the output.
     * @param req Express request object containing 'code' and 'language' in body.
     * @param res Express response object.
     */
    async run(req, res) {
        try {
            const { code, language } = req.body;
            if (!code || code.trim() === '') {
                return res.json({ output: '' });
            }
            // Execute the code using the service
            const result = await executionService.runCode(code, language);
            res.json(result);
        }
        catch (error) {
            console.error('Controller Error:', error);
            res.status(500).json({ error: 'Internal Server Error: ' + error.message });
        }
    }
}
exports.CompilerController = CompilerController;
