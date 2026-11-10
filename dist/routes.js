"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compilerController_js_1 = require("./controllers/compilerController.js");
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const compilerController = new compilerController_js_1.CompilerController();
// Rate limiters for security
const runLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 executions per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many execution requests. Please wait a moment.' }
});
const visitLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120, // 120 visit events per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many visit requests.' }
});
const statsAuthLimiter = (0, express_rate_limit_1.default)({
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
    res.sendFile(path_1.default.join(__dirname, '../public/stats.html'));
});
router.post('/stats/auth', statsAuthLimiter, (req, res) => compilerController.authStats(req, res));
router.get('/stats/data', (req, res) => compilerController.getStats(req, res));
exports.default = router;
