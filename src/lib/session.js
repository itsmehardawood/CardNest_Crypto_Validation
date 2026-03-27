const SESSION_TTL = 15 * 60 * 1000;

// Use Redis or database in production.
const globalStore = globalThis;
if (!globalStore.__cardNestSessions) {
  globalStore.__cardNestSessions = new Map();
}

const sessions = globalStore.__cardNestSessions;

function generateSessionId() {
  return crypto.randomUUID();
}

function pruneExpiredSessions() {
  const now = Date.now();

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(sessionId);
    }
  }
}

function createSession(merchantId, authToken) {
  pruneExpiredSessions();

  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    merchantId,
    authToken,
    createdAt: Date.now(),
  });

  return sessionId;
}

function getSession(sessionId) {
  pruneExpiredSessions();
  return sessions.get(sessionId) || null;
}

function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

export {
  sessions,
  SESSION_TTL,
  generateSessionId,
  pruneExpiredSessions,
  createSession,
  getSession,
  deleteSession,
};
