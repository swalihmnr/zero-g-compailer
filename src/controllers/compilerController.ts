import { Request, Response } from 'express';
import { CodeExecutionService } from '../services/codeExecutionService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { ActiveUserService } from '../services/activeUserService.js';

const executionService = new CodeExecutionService();

// Singleton analytics and active-user services — set by server.ts after HTTP server is created
let _analytics: AnalyticsService | null = null;
let _activeUsers: ActiveUserService | null = null;

export function initServices(analytics: AnalyticsService, activeUsers: ActiveUserService): void {
    _analytics  = analytics;
    _activeUsers = activeUsers;
}

export class CompilerController {

    // ── Code Execution ──────────────────────────────────────────────────────

    async run(req: Request, res: Response): Promise<void> {
        try {
            const { code, language, visitorId } = req.body;

            if (!code || code.trim() === '') {
                res.json({ output: '' }); return;
            }

            const result = await executionService.runCode(code, language);

            // Track — non-blocking, never throws into request handling
            if (_analytics) {
                const ip = extractIP(req);
                const ua = req.headers['user-agent'] || '';
                _analytics.trackExecution({
                    visitorId: sanitizeVisitorId(visitorId),
                    ip,
                    language: language || 'javascript',
                    success: !result.error,
                    codeLength: code.length,
                    userAgent: ua,
                });
            }

            res.json(result);
        } catch (error: any) {
            console.error('Controller Error:', error);
            res.status(500).json({ error: 'Internal Server Error: ' + error.message });
        }
    }

    // ── Visit Tracking ──────────────────────────────────────────────────────

    visit(req: Request, res: Response): void {
        try {
            const visitorId = sanitizeVisitorId(req.body?.visitorId);
            if (!visitorId || !_analytics) { res.json({ ok: false }); return; }

            _analytics.trackVisit({
                visitorId,
                ip: extractIP(req),
                userAgent: req.headers['user-agent'] || '',
            });
            res.json({ ok: true });
        } catch (_) {
            res.json({ ok: false });
        }
    }

    // ── Stats Auth ──────────────────────────────────────────────────────────

    authStats(req: Request, res: Response): void {
        const { password } = req.body;
        const correctPwd = process.env.STATS_PASSWORD || 'zerog2024';
        res.json({ ok: password === correctPwd });
    }

    // ── Stats Data ──────────────────────────────────────────────────────────

    getStats(req: Request, res: Response): void {
        const pwd = req.headers['x-stats-password'] as string;
        const correctPwd = process.env.STATS_PASSWORD || 'zerog2024';
        if (pwd !== correctPwd) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const activeNow = _activeUsers?.getActiveCount() ?? 0;
        const summary = _analytics?.getSummary(activeNow) ?? emptyDashboard(activeNow);
        res.json(summary);
    }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function extractIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || 'unknown';
}

function sanitizeVisitorId(val: unknown): string {
    if (typeof val !== 'string') return 'unknown';
    return /^[a-f0-9\-]{8,64}$/.test(val) ? val : 'unknown';
}

function emptyDashboard(activeNow: number) {
    return {
        totalVisits: 0, uniqueVisitors: 0, returningVisitors: 0,
        todayVisitors: 0, weekVisitors: 0, monthVisitors: 0,
        dailyVisitors: {}, totalRuns: 0, successfulRuns: 0, failedRuns: 0,
        successRate: 'N/A', dailyRuns: {}, languageBreakdown: {},
        deviceBreakdown: {}, osBreakdown: {}, browserBreakdown: {},
        activeNow, recentExecutions: [], recentVisits: [],
    };
}
