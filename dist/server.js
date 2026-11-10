"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_js_1 = __importDefault(require("./routes.js"));
const analyticsService_js_1 = require("./services/analyticsService.js");
const activeUserService_js_1 = require("./services/activeUserService.js");
const compilerController_js_1 = require("./controllers/compilerController.js");
const app = (0, express_1.default)();
const PORT = 3001;
const HOST = '127.0.0.1';
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Use routes
app.use('/', routes_js_1.default);
// Create HTTP server for Express and Socket.IO
const httpServer = http_1.default.createServer(app);
// Initialize analytics and active user tracking
const analyticsService = new analyticsService_js_1.AnalyticsService();
const activeUserService = new activeUserService_js_1.ActiveUserService(httpServer);
(0, compilerController_js_1.initServices)(analyticsService, activeUserService);
const server = httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying to continue...`);
    }
    else {
        console.error('Server error:', err);
    }
});
