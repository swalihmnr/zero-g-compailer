import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import router from './routes.js';

const app: Express = express();
const PORT = 3001;
const HOST = '127.0.0.1';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Use routes
app.use('/', router);

const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying to continue...`);
    } else {
        console.error('Server error:', err);
    }
});
