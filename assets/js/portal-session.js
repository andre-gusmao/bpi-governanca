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
      { id: 'cli-001', cnpj: '12.345.678/0001-90', email: 'contato@xyz.com.br', empresa: 'Empresa XYZ Inc' },
      { id: 'cli-002', cnpj: '98.765.432/0001-10', email: 'admin@techsolutions.com.br', empresa: 'Tech Solutions' },
      { id: 'cli-003', cnpj: '55.555.555/0001-55', email: 'financeiro@holding.com.br', empresa: 'Holding Internacional' }
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
    if (!session) return false;
    const trusted = TRUSTED_ACCOUNTS[role];
    if (!trusted || trusted.length === 0) return true;

    if (role === 'cliente') {
      const sessionId = (session.id || session.clientId || '').toString().toLowerCase();
      if (!sessionId) return false;
      return trusted.some((item) => {
        const emailValido = session.email ? item.email === session.email : true;
        const cnpjValido = session.cnpj ? item.cnpj === session.cnpj : true;
        return item.id === sessionId && emailValido && cnpjValido;
      });
    }

    if (role === 'colaborador') {
      return trusted.some((item) => item.id === session.id && item.email === session.email && item.role === session.role);
    }

    return false;
  }

  function clearOtherSessions(currentRole) {
    if (currentRole === 'cliente') {
      localStorage.removeItem(KEYS.portalLegado);
    }
  }

  function clearSession(role) {
    const key = getKey(role);
    if (key) {
      localStorage.removeItem(key);
    }
    if (role === 'cliente') {
      localStorage.removeItem(KEYS.portalLegado);
    }
  }

  function setSession(role, data) {
    const key = getKey(role);
    if (!key) return;
    clearOtherSessions(role);
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(KEYS.timestamp, new Date().toISOString());
  }

  function migrateLegacyClientSession() {
    const legacy = parseSession(localStorage.getItem(KEYS.portalLegado));
    if (!legacy) return null;
    const normalizedId = (legacy.clientId || legacy.id || '').toString().toLowerCase();
    const normalizedEmail = (legacy.email || '').toString().toLowerCase();
    const normalizedCnpj = (legacy.cnpj || '').toString();
    if (!normalizedId || !normalizedEmail) return null;

    const trustedCliente = TRUSTED_ACCOUNTS.cliente.find((item) => {
      const cnpjValido = normalizedCnpj ? item.cnpj === normalizedCnpj : true;
      return item.id === normalizedId && item.email === normalizedEmail && cnpjValido;
    });

    if (!trustedCliente) return null;

    const migratedSession = {
      id: normalizedId,
      empresa: legacy.clientName || legacy.name || 'Cliente',
      cnpj: normalizedCnpj,
      email: normalizedEmail,
      avatar: legacy.avatar || 'CL',
      name: legacy.name || legacy.clientName || 'Cliente',
      clientId: normalizedId.toUpperCase(),
      clientName: legacy.clientName || legacy.name || 'Cliente',
      role: 'client'
    };

    setSession('cliente', migratedSession);
    return migratedSession;
  }

  function requireSession(role, redirectTo) {
    const key = getKey(role);
    const rawSession = localStorage.getItem(key);
    let session = parseSession(rawSession);

    if (role === 'cliente' && rawSession === null) {
      session = migrateLegacyClientSession();
    }

    if (!session || !isTrustedSession(role, session)) {
      clearSession(role);
      const destino = String(redirectTo || '');
      const pathname = window.location.pathname || '';
      const arquivoAtual = pathname.split('/').pop() || '';
      let retornoBase = `./${arquivoAtual}`;
      if (pathname.includes('/portal/')) {
        retornoBase = `../portal/${arquivoAtual}`;
      } else if (pathname.includes('/cliente/')) {
        retornoBase = `../cliente/${arquivoAtual}`;
      } else if (pathname.includes('/colaborador/')) {
        retornoBase = `../colaborador/${arquivoAtual}`;
      }
      const retornoAtual = retornoBase;
      const [semHash, hash = ''] = destino.split('#');
      const [path = '', query = ''] = semHash.split('?');
      const params = new URLSearchParams(query);
      params.set('return', retornoAtual);
      const queryString = params.toString();
      const destinoComRetorno = `${path}${queryString ? `?${queryString}` : ''}${hash ? `#${hash}` : ''}`;
      window.location.href = destinoComRetorno;
      return null;
    }
    return session;
  }

  function logout(role, redirectTo) {
    clearSession(role);
    window.location.href = redirectTo;
  }

  window.BPIPortalSession = {
    KEYS,
    setSession,
    requireSession,
    logout
  };
})(window);
