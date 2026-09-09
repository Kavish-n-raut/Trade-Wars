// Vercel serverless entry point.
//
// backend/server.js builds an Express app and exports it as the default export
// (it only calls app.listen() when NODE_ENV !== 'production'). The Vercel Node
// runtime treats that exported (req, res) handler as the function. vercel.json
// rewrites every /api/* request onto this file; Express then matches the
// original /api/... path.
export { default } from '../backend/server.js';
