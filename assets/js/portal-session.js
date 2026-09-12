(function (window) {
  const KEYS = {
    cliente: 'cliente_session',
    colaborador: 'colaborador_session',
    admin: 'adminSession',
    portalLegado: 'userSession',
    timestamp: 'session_timestamp'
  };

  function getKey(role) {
    return KEYS[role];
  }

  function parseSession(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearOtherSessions(currentRole) {
    const currentKey = getKey(currentRole);
    [KEYS.cliente, KEYS.colaborador, KEYS.admin, KEYS.portalLegado].forEach((key) => {
      if (key !== currentKey) {
        localStorage.removeItem(key);
      }
    });
  }

  function setSession(role, data) {
    const key = getKey(role);
    if (!key) return;
    clearOtherSessions(role);
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(KEYS.timestamp, new Date().toISOString());
  }

  function requireSession(role, redirectTo) {
    const key = getKey(role);
    const session = parseSession(localStorage.getItem(key));
    if (!session) {
      window.location.href = redirectTo;
      return null;
    }
    return session;
  }

  function logout(role, redirectTo) {
    const key = getKey(role);
    if (key) localStorage.removeItem(key);
    localStorage.removeItem(KEYS.timestamp);
    window.location.href = redirectTo;
  }

  window.BPIPortalSession = {
    KEYS,
    setSession,
    requireSession,
    logout
  };
})(window);
