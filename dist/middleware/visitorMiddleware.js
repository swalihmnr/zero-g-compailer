"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorMiddleware = visitorMiddleware;
/**
 * Middleware that records a visit event for GET requests to the main app.
 * Skips: stats dashboard, API routes, static assets.
 * Requires client to send X-Visitor-Id header (set by front-end JS).
 */
function visitorMiddleware(analytics) {
    return (req, _res, next) => {
        try {
            // Only track page load (the React SPA sends a beacon on first load)
            if (req.method !== 'POST' || req.path !== '/api/visit') {
                next();
                return;
            }
            const visitorId = sanitizeVisitorId(req.body?.visitorId);
            if (!visitorId) {
                next();
                return;
            }
            const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                || req.socket?.remoteAddress
                || 'unknown';
            const ua = req.headers['user-agent'] || '';
            analytics.trackVisit({ visitorId, ip, userAgent: ua });
        }
        catch (_) { /* never block the request */ }
        next();
    };
}
function sanitizeVisitorId(val) {
    if (typeof val !== 'string')
        return '';
    return /^[a-f0-9\-]{8,64}$/.test(val) ? val : '';
}
