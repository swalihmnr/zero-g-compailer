import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

// ============================================================================
// TYPES
// ============================================================================

interface ActiveUser {
    visitorId: string;
    socketId: string;
    connectedAt: number;
    lastHeartbeat: number;
}

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
export class ActiveUserService {
    private io: SocketIOServer;

    /** socketId → ActiveUser */
    private sessions: Map<string, ActiveUser> = new Map();

    /** visitorId → Set of socketIds (multi-tab support) */
    private visitorSockets: Map<string, Set<string>> = new Map();

    private static readonly TIMEOUT_MS        = 5 * 60 * 1000;  // 5 min inactivity
    private static readonly SWEEP_INTERVAL_MS = 60 * 1000;       // sweep every 1 min
    private sweepTimer: ReturnType<typeof setInterval>;

    constructor(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
            path: '/socket.io',
        });

        this.io.on('connection', (socket: Socket) => {
            // Distinguish compiler users from admin dashboard views
            const isAdmin = socket.handshake.query.admin === 'true';
            if (isAdmin) {
                // Admin-only namespace: periodically push active count
                socket.join('admin');
                socket.emit('stats', { activeNow: this.getActiveCount() });
                return;
            }

            const visitorId = this.sanitize(socket.handshake.query.visitorId as string);
            if (!visitorId) { socket.disconnect(true); return; }

            this.addSession(socket.id, visitorId);
            this.broadcastToAdmin();

            // Client sends heartbeat every ~30 s
            socket.on('heartbeat', () => {
                const session = this.sessions.get(socket.id);
                if (session) session.lastHeartbeat = Date.now();
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

    getActiveCount(): number {
        return this.visitorSockets.size;
    }

    destroy(): void {
        clearInterval(this.sweepTimer);
        this.io.close();
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    private addSession(socketId: string, visitorId: string): void {
        const now = Date.now();
        this.sessions.set(socketId, { visitorId, socketId, connectedAt: now, lastHeartbeat: now });
        if (!this.visitorSockets.has(visitorId)) this.visitorSockets.set(visitorId, new Set());
        this.visitorSockets.get(visitorId)!.add(socketId);
    }

    private removeSession(socketId: string): void {
        const session = this.sessions.get(socketId);
        if (!session) return;
        this.sessions.delete(socketId);
        const sockets = this.visitorSockets.get(session.visitorId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0) this.visitorSockets.delete(session.visitorId);
        }
    }

    private sweep(): void {
        const cutoff = Date.now() - ActiveUserService.TIMEOUT_MS;
        let changed = false;
        for (const [socketId, session] of this.sessions) {
            if (session.lastHeartbeat < cutoff) {
                this.removeSession(socketId);
                changed = true;
            }
        }
        if (changed) this.broadcastToAdmin();
    }

    private broadcastToAdmin(): void {
        this.io.to('admin').emit('stats', { activeNow: this.getActiveCount() });
    }

    private sanitize(val: unknown): string {
        if (typeof val !== 'string') return '';
        // Allow only UUID-like strings: hex chars and hyphens, 8–64 chars
        return /^[a-f0-9\-]{8,64}$/.test(val) ? val : '';
    }
}

