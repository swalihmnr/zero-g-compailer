"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_js_1 = __importDefault(require("./routes.js"));
const app = (0, express_1.default)();
const PORT = 3001;
const HOST = '127.0.0.1';
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Use routes
app.use('/', routes_js_1.default);
const server = app.listen(PORT, HOST, () => {
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
