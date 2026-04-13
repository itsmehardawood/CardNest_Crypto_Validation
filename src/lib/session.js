const SESSION_TTL = 15 * 60 * 1000;
const sessions = new Map();

function encodeBase64Url(value) {
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(value, 'utf8').toString('base64')
      : btoa(unescape(encodeURIComponent(value)));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value) {
  const padded = value + '==='.slice((value.length + 3) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  return decodeURIComponent(escape(atob(base64)));
}

function parseSessionToken(sessionId) {
  if (!sessionId) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(String(sessionId));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function generateSessionId() {
  return encodeBase64Url(crypto.randomUUID());
}

function pruneExpiredSessions() {
  // Stateless token flow has nothing to prune in-process.
}

function createSession(merchantId) {
  const payload = {
    v: 1,
    nonce: generateSessionId(),
    merchantId,
    createdAt: Date.now(),
  };

  return encodeBase64Url(JSON.stringify(payload));
}

function getSession(sessionId) {
  const payload = parseSessionToken(sessionId);

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const createdAt = Number(payload.createdAt);
  if (!Number.isFinite(createdAt)) {
    return null;
  }

  if (Date.now() - createdAt > SESSION_TTL) {
    return null;
  }

  if (!payload.merchantId) {
    return null;
  }

  return {
    merchantId: String(payload.merchantId),
    createdAt,
  };
}

function deleteSession(sessionId) {
  // No-op for stateless demo sessions.
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
