import 'dotenv/config';
import express, { Express } from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import router from './routes.js';
import { AnalyticsService } from './services/analyticsService.js';
import { ActiveUserService } from './services/activeUserService.js';
import { initServices } from './controllers/compilerController.js';

const app: Express = express();
const PORT = 3001;
const HOST = '127.0.0.1';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Use routes
app.use('/', router);

// Create HTTP server for Express and Socket.IO
const httpServer = http.createServer(app);

// Initialize analytics and active user tracking
const analyticsService = new AnalyticsService();
const activeUserService = new ActiveUserService(httpServer);
initServices(analyticsService, activeUserService);

const server = httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying to continue...`);
    } else {
        console.error('Server error:', err);
    }
});
