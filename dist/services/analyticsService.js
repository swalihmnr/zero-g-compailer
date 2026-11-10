"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
// ============================================================================
// ANALYTICS SERVICE
// ============================================================================
class AnalyticsService {
    logPath;
    /** In-memory set of visitorIds seen since server start (for returning-visitor flag) */
    seenVisitors = new Set();
    constructor() {
        const dataDir = (0, path_1.join)(process.cwd(), 'data');
        if (!(0, fs_1.existsSync)(dataDir))
            (0, fs_1.mkdirSync)(dataDir, { recursive: true });
        this.logPath = (0, path_1.join)(dataDir, 'analytics.jsonl');
        // Pre-load seen visitors from disk so returning-visitor flag survives restart
        this.loadSeenVisitors();
    }
    // -------------------------------------------------------------------------
    // Public API — called by controller / middleware
    // -------------------------------------------------------------------------
    /** Record a page visit. Safe to call multiple times; deduplication is best-effort. */
    trackVisit(params) {
        this.safeAppend({
            type: 'visit',
            timestamp: new Date().toISOString(),
            visitorId: params.visitorId,
            ip: this.anonymizeIP(params.ip),
            browser: this.detectBrowser(params.userAgent),
            device: this.detectDevice(params.userAgent),
            os: this.detectOS(params.userAgent),
            isReturning: this.seenVisitors.has(params.visitorId),
        });
        this.seenVisitors.add(params.visitorId);
    }
    /** Record a code execution. Never throws. */
    trackExecution(params) {
        this.safeAppend({
            type: 'execution',
            timestamp: new Date().toISOString(),
            visitorId: params.visitorId,
            ip: this.anonymizeIP(params.ip),
            language: params.language || 'unknown',
            success: params.success,
            codeLength: params.codeLength,
            browser: this.detectBrowser(params.userAgent),
            device: this.detectDevice(params.userAgent),
            os: this.detectOS(params.userAgent),
        });
    }
    /** Build the full dashboard summary. Injected activeNow comes from ActiveUserService. */
    getSummary(activeNow = 0) {
        const events = this.loadEvents();
        const visits = events.filter((e) => e.type === 'visit');
        const execs = events.filter((e) => e.type === 'execution');
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const monthAgo = new Date(now.getTime() - 30 * 86400000);
        // Unique visitors (by visitorId)
        const allVisitorIds = new Set(visits.map(v => v.visitorId));
        const todayVisitorSet = new Set();
        const weekVisitorSet = new Set();
        const monthVisitorSet = new Set();
        const dailyVisitors = {};
        const dailyVisitorSets = {};
        const dailyRuns = {};
        const languageBreakdown = {};
        const deviceBreakdown = {};
        const osBreakdown = {};
        const browserBreakdown = {};
        for (const v of visits) {
            const d = v.timestamp.slice(0, 10);
            if (!dailyVisitorSets[d])
                dailyVisitorSets[d] = new Set();
            dailyVisitorSets[d].add(v.visitorId);
            const vDate = new Date(v.timestamp);
            if (d === todayStr)
                todayVisitorSet.add(v.visitorId);
            if (vDate >= weekAgo)
                weekVisitorSet.add(v.visitorId);
            if (vDate >= monthAgo)
                monthVisitorSet.add(v.visitorId);
            deviceBreakdown[v.device] = (deviceBreakdown[v.device] || 0) + 1;
            osBreakdown[v.os] = (osBreakdown[v.os] || 0) + 1;
            browserBreakdown[v.browser] = (browserBreakdown[v.browser] || 0) + 1;
        }
        // Flatten daily unique visitor counts
        for (const [day, set] of Object.entries(dailyVisitorSets)) {
            dailyVisitors[day] = set.size;
        }
        for (const e of execs) {
            const d = e.timestamp.slice(0, 10);
            dailyRuns[d] = (dailyRuns[d] || 0) + 1;
            languageBreakdown[e.language] = (languageBreakdown[e.language] || 0) + 1;
        }
        const successCount = execs.filter(e => e.success).length;
        return {
            totalVisits: visits.length,
            uniqueVisitors: allVisitorIds.size,
            returningVisitors: visits.filter(v => v.isReturning).length,
            todayVisitors: todayVisitorSet.size,
            weekVisitors: weekVisitorSet.size,
            monthVisitors: monthVisitorSet.size,
            dailyVisitors,
            totalRuns: execs.length,
            successfulRuns: successCount,
            failedRuns: execs.length - successCount,
            successRate: execs.length > 0
                ? ((successCount / execs.length) * 100).toFixed(1) + '%'
                : 'N/A',
            dailyRuns,
            languageBreakdown,
            deviceBreakdown,
            osBreakdown,
            browserBreakdown,
            activeNow,
            recentExecutions: execs.slice(-15).reverse(),
            recentVisits: visits.slice(-10).reverse(),
        };
    }
    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------
    safeAppend(event) {
        try {
            (0, fs_1.appendFileSync)(this.logPath, JSON.stringify(event) + '\n', 'utf8');
        }
        catch (_) { /* Analytics must never crash the main app */ }
    }
    loadEvents() {
        try {
            if (!(0, fs_1.existsSync)(this.logPath))
                return [];
            return (0, fs_1.readFileSync)(this.logPath, 'utf8')
                .split('\n')
                .filter(l => l.trim())
                .map(l => { try {
                return JSON.parse(l);
            }
            catch {
                return null;
            } })
                .filter(Boolean);
        }
        catch {
            return [];
        }
    }
    /** Pre-populate seenVisitors from existing log so returning flag is accurate after restart */
    loadSeenVisitors() {
        try {
            const events = this.loadEvents();
            for (const e of events) {
                if (e.visitorId)
                    this.seenVisitors.add(e.visitorId);
            }
        }
        catch (_) { }
    }
    // ── UA parsing helpers ────────────────────────────────────────────────────
    anonymizeIP(ip) {
        if (!ip || ip === '::1' || ip === '127.0.0.1')
            return 'localhost';
        const parts = ip.split('.');
        if (parts.length === 4)
            return parts.slice(0, 3).join('.') + '.*';
        return ip.split(':').slice(0, 2).join(':') + ':...';
    }
    detectBrowser(ua) {
        if (!ua)
            return 'Unknown';
        if (ua.includes('Firefox/'))
            return 'Firefox';
        if (ua.includes('Edg/'))
            return 'Edge';
        if (ua.includes('OPR/') || ua.includes('Opera'))
            return 'Opera';
        if (ua.includes('Chrome/'))
            return 'Chrome';
        if (ua.includes('Safari/') && !ua.includes('Chrome'))
            return 'Safari';
        if (ua.includes('curl/'))
            return 'curl';
        return 'Other';
    }
    detectDevice(ua) {
        if (!ua)
            return 'Unknown';
        if (ua.includes('iPhone'))
            return 'iPhone';
        if (ua.includes('iPad'))
            return 'iPad';
        if (ua.includes('Android') && ua.includes('Mobile'))
            return 'Android Phone';
        if (ua.includes('Android'))
            return 'Android Tablet';
        if (ua.includes('Macintosh'))
            return 'Mac';
        if (ua.includes('Windows NT'))
            return 'Windows PC';
        if (ua.includes('CrOS'))
            return 'Chromebook';
        if (ua.includes('Linux'))
            return 'Linux PC';
        return 'Unknown';
    }
    detectOS(ua) {
        if (!ua)
            return 'Unknown';
        const iosM = ua.match(/OS ([\d_]+) like Mac OS X/);
        if (iosM)
            return `iOS ${iosM[1].replace(/_/g, '.')}`;
        const macM = ua.match(/Mac OS X ([\d_]+)/);
        if (macM)
            return `macOS ${macM[1].replace(/_/g, '.')}`;
        if (ua.includes('Windows NT 10.0'))
            return 'Windows 10/11';
        if (ua.includes('Windows NT 6.3'))
            return 'Windows 8.1';
        if (ua.includes('Windows NT 6.1'))
            return 'Windows 7';
        if (ua.includes('Windows'))
            return 'Windows';
        const andM = ua.match(/Android ([\d.]+)/);
        if (andM)
            return `Android ${andM[1]}`;
        if (ua.includes('CrOS'))
            return 'ChromeOS';
        if (ua.includes('Linux'))
            return 'Linux';
        return 'Unknown';
    }
}
exports.AnalyticsService = AnalyticsService;
