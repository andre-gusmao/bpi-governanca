(function (window) {
  const KEYS = {
    cliente: 'cliente_session',
    colaborador: 'colaborador_session',
    admin: 'adminSession',
    portalLegado: 'userSession',
    timestamp: 'session_timestamp'
  };

  const TRUSTED_ACCOUNTS = {
    cliente: [
      { id: 'cli-001', cnpj: '12.345.678/0001-90', email: 'contato@xyz.com.br' },
      { id: 'cli-002', cnpj: '98.765.432/0001-10', email: 'admin@techsolutions.com.br' },
      { id: 'cli-003', cnpj: '55.555.555/0001-55', email: 'financeiro@holding.com.br' }
    ],
    colaborador: [
      { id: 'col-001', email: 'andre@bpi.com.br', role: 'PMO_Comercial' },
      { id: 'col-002', email: 'maria@bpi.com.br', role: 'PMO' },
      { id: 'col-003', email: 'joao@bpi.com.br', role: 'Comercial' }
    ]
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

  function isTrustedSession(role, session) {
    if (!session || !session.id) return false;
    const trusted = TRUSTED_ACCOUNTS[role];
    if (!trusted || trusted.length === 0) return true;

    if (role === 'cliente') {
      return trusted.some((item) => item.id === session.id && item.email === session.email && item.cnpj === session.cnpj);
    }

    if (role === 'colaborador') {
      return trusted.some((item) => item.id === session.id && item.email === session.email && item.role === session.role);
    }

    return false;
  }

  function clearOtherSessions(currentRole) {
    const currentKey = getKey(currentRole);
    [KEYS.cliente, KEYS.colaborador, KEYS.admin, KEYS.portalLegado].forEach((key) => {
      if (key !== currentKey) {
        localStorage.removeItem(key);
      }
    });
  }

  function clearAllSessions() {
    [KEYS.cliente, KEYS.colaborador, KEYS.admin, KEYS.portalLegado, KEYS.timestamp].forEach((key) => {
      localStorage.removeItem(key);
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
    if (!session || !isTrustedSession(role, session)) {
      clearAllSessions();
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
