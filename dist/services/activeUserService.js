"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveUserService = void 0;
const socket_io_1 = require("socket.io");
// ============================================================================
// ACTIVE USER SERVICE
// ============================================================================
/**
 * Tracks currently-active compiler users via Socket.IO.
 *
 * Rules:
 *  - Admin /stats page connections are explicitly excluded.
 *  - Multiple tabs from the same visitorId count as ONE active user.
 *  - A user is considered active if they sent a heartbeat within TIMEOUT_MS.
 *  - Stale sessions are swept every SWEEP_INTERVAL_MS.
 */
class ActiveUserService {
    io;
    /** socketId → ActiveUser */
    sessions = new Map();
    /** visitorId → Set of socketIds (multi-tab support) */
    visitorSockets = new Map();
    static TIMEOUT_MS = 5 * 60 * 1000; // 5 min inactivity
    static SWEEP_INTERVAL_MS = 60 * 1000; // sweep every 1 min
    sweepTimer;
    constructor(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
            path: '/socket.io',
        });
        this.io.on('connection', (socket) => {
            // Distinguish compiler users from admin dashboard views
            const isAdmin = socket.handshake.query.admin === 'true';
            if (isAdmin) {
                // Admin-only namespace: periodically push active count
                socket.join('admin');
                socket.emit('stats', { activeNow: this.getActiveCount() });
                return;
            }
            const visitorId = this.sanitize(socket.handshake.query.visitorId);
            if (!visitorId) {
                socket.disconnect(true);
                return;
            }
            this.addSession(socket.id, visitorId);
            this.broadcastToAdmin();
            // Client sends heartbeat every ~30 s
            socket.on('heartbeat', () => {
                const session = this.sessions.get(socket.id);
                if (session)
                    session.lastHeartbeat = Date.now();
            });
            socket.on('disconnect', () => {
                this.removeSession(socket.id);
                this.broadcastToAdmin();
            });
        });
        // Periodic sweep of stale sessions
        this.sweepTimer = setInterval(() => this.sweep(), ActiveUserService.SWEEP_INTERVAL_MS);
        this.sweepTimer.unref(); // don't prevent clean exit
    }
    getActiveCount() {
        return this.visitorSockets.size;
    }
    destroy() {
        clearInterval(this.sweepTimer);
        this.io.close();
    }
    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------
    addSession(socketId, visitorId) {
        const now = Date.now();
        this.sessions.set(socketId, { visitorId, socketId, connectedAt: now, lastHeartbeat: now });
        if (!this.visitorSockets.has(visitorId))
            this.visitorSockets.set(visitorId, new Set());
        this.visitorSockets.get(visitorId).add(socketId);
    }
    removeSession(socketId) {
        const session = this.sessions.get(socketId);
        if (!session)
            return;
        this.sessions.delete(socketId);
        const sockets = this.visitorSockets.get(session.visitorId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0)
                this.visitorSockets.delete(session.visitorId);
        }
    }
    sweep() {
        const cutoff = Date.now() - ActiveUserService.TIMEOUT_MS;
        let changed = false;
        for (const [socketId, session] of this.sessions) {
            if (session.lastHeartbeat < cutoff) {
                this.removeSession(socketId);
                changed = true;
            }
        }
        if (changed)
            this.broadcastToAdmin();
    }
    broadcastToAdmin() {
        this.io.to('admin').emit('stats', { activeNow: this.getActiveCount() });
    }
    sanitize(val) {
        if (typeof val !== 'string')
            return '';
        // Allow only UUID-like strings: hex chars and hyphens, 8–64 chars
        return /^[a-f0-9\-]{8,64}$/.test(val) ? val : '';
    }
}
exports.ActiveUserService = ActiveUserService;
