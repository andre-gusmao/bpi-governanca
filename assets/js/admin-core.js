(function (window) {
  const KEYS = {
    session: 'adminSession',
    clientes: 'helpdesk_clientes',
    usuarios: 'helpdesk_usuarios',
    catalogo: 'helpdesk_catalogo'
  };

  const seeds = {
    clientes: [
      { id: 'CLI-001', nome: 'Empresa Demo', email: 'demo@empresa.com', telefone: '(11) 98765-4321', endereco: 'São Paulo, SP', ativo: true }
    ],
    usuarios: [
      { id: 'USR-001', nome: 'João Silva', email: 'joao@bpi.com.br', tipo: 'atendente', ativo: true, chamadosAtribuidos: 8, dataCriacao: new Date().toISOString() },
      { id: 'USR-002', nome: 'Maria Santos', email: 'maria@bpi.com.br', tipo: 'atendente', ativo: true, chamadosAtribuidos: 12, dataCriacao: new Date().toISOString() },
      { id: 'USR-003', nome: 'Admin BPI', email: 'admin@bpi.com.br', tipo: 'admin', ativo: true, chamadosAtribuidos: 0, dataCriacao: new Date().toISOString() },
      { id: 'USR-004', nome: 'Atendente BPI', email: 'atendente@bpi.com.br', tipo: 'atendente', ativo: true, chamadosAtribuidos: 6, dataCriacao: new Date().toISOString() }
    ],
    catalogo: [
      { id: 'CAT-001', nome: 'Implantação ERP', categoria: 'Implementação', tipo: 'setup', valor: 30000, prazoDias: 30, ativo: true },
      { id: 'CAT-002', nome: 'Suporte Premium', categoria: 'Suporte', tipo: 'recorrente', valor: 2500, prazoDias: 30, ativo: true },
      { id: 'CAT-003', nome: 'Treinamento In Company', categoria: 'Treinamento', tipo: 'setup', valor: 8000, prazoDias: 5, ativo: true }
    ]
  };

  function parseJson(text, fallback) {
    if (!text) return fallback;
    try {
      return JSON.parse(text);
    } catch (e) {
      return fallback;
    }
  }

  function getArray(key, seedName) {
    const raw = localStorage.getItem(key);
    if (raw === null && seedName && seeds[seedName]) {
      const seeded = JSON.parse(JSON.stringify(seeds[seedName]));
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }

    const data = parseJson(raw, []);
    if (Array.isArray(data)) return data;

    if (seedName && seeds[seedName]) {
      const seeded = JSON.parse(JSON.stringify(seeds[seedName]));
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }

    return [];
  }

  function saveArray(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  function nextId(prefix) {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return prefix + '-' + Date.now() + '-' + randomPart;
  }

  const auth = {
    getSession() {
      return parseJson(localStorage.getItem(KEYS.session), null);
    },

    isTrustedSession(session) {
      if (!session || !session.id || !session.email || !session.type) return false;
      const usuario = data.usuarios().find((item) => item.id === session.id && item.ativo);
      if (!usuario) return false;
      return usuario.email === session.email && usuario.tipo === session.type;
    },

    requireSession(options = {}) {
      const session = this.getSession();
      if (!session) {
        window.location.href = options.redirectTo || 'login-admin.html';
        return null;
      }

      if (!this.isTrustedSession(session)) {
        localStorage.removeItem(KEYS.session);
        localStorage.removeItem('userSession');
        localStorage.removeItem('cliente_session');
        localStorage.removeItem('colaborador_session');
        window.location.href = options.redirectTo || 'login-admin.html';
        return null;
      }

      if (options.allowTypes && !options.allowTypes.includes(session.type)) {
        alert('Acesso não autorizado para este perfil.');
        window.location.href = options.fallbackTo || 'dashboard-admin.html';
        return null;
      }

      return session;
    },

    login(userData) {
      localStorage.removeItem('userSession');
      localStorage.removeItem('cliente_session');
      localStorage.removeItem('colaborador_session');
      localStorage.removeItem('session_timestamp');
      localStorage.setItem(KEYS.session, JSON.stringify(userData));
    },

    logout() {
      if (window.confirm('Deseja realmente sair?')) {
        localStorage.removeItem(KEYS.session);
        localStorage.removeItem('userSession');
        localStorage.removeItem('cliente_session');
        localStorage.removeItem('colaborador_session');
        localStorage.removeItem('session_timestamp');
        window.location.href = 'login-admin.html';
      }
    }
  };

  const data = {
    clientes() {
      return getArray(KEYS.clientes, 'clientes');
    },

    salvarCliente(cliente) {
      const clientes = this.clientes();
      clientes.push({
        id: nextId('CLI'),
        dataCriacao: new Date().toISOString(),
        ativo: true,
        ...cliente
      });
      saveArray(KEYS.clientes, clientes);
      return clientes;
    },

    atualizarStatusCliente(id) {
      const clientes = this.clientes().map((cliente) => {
        if (cliente.id === id) {
          return { ...cliente, ativo: !cliente.ativo };
        }
        return cliente;
      });
      saveArray(KEYS.clientes, clientes);
      return clientes;
    },

    usuarios() {
      return getArray(KEYS.usuarios, 'usuarios');
    },

    salvarUsuario(usuario) {
      const usuarios = this.usuarios();
      usuarios.push({
        id: nextId('USR'),
        dataCriacao: new Date().toISOString(),
        ativo: true,
        chamadosAtribuidos: 0,
        ...usuario
      });
      saveArray(KEYS.usuarios, usuarios);
      return usuarios;
    },

    atualizarStatusUsuario(id) {
      const usuarios = this.usuarios().map((usuario) => {
        if (usuario.id === id) {
          return { ...usuario, ativo: !usuario.ativo };
        }
        return usuario;
      });
      saveArray(KEYS.usuarios, usuarios);
      return usuarios;
    },

    catalogo() {
      return getArray(KEYS.catalogo, 'catalogo');
    },

    salvarServico(servico) {
      const catalogo = this.catalogo();
      catalogo.push({
        id: nextId('CAT'),
        dataCriacao: new Date().toISOString(),
        ativo: true,
        ...servico
      });
      saveArray(KEYS.catalogo, catalogo);
      return catalogo;
    },

    atualizarStatusServico(id) {
      const catalogo = this.catalogo().map((servico) => {
        if (servico.id === id) {
          return { ...servico, ativo: !servico.ativo };
        }
        return servico;
      });
      saveArray(KEYS.catalogo, catalogo);
      return catalogo;
    }
  };

  function renderAdminMenu(activePage, role) {
    const menu = document.querySelector('.sidebar-menu');
    if (!menu) return;

    const userRole = role || (auth.getSession() ? auth.getSession().type : 'admin');
    const links = userRole === 'atendente'
      ? [
      { key: 'meus_chamados', href: 'dashboard-atendente.html', label: '📊 Meus Chamados' },
      { key: 'chamados', href: 'chamados-admin.html', label: '🎫 Todos os Chamados' }
    ]
      : [
      { key: 'dashboard', href: 'dashboard-admin.html', label: '📊 Dashboard' },
      { key: 'chamados', href: 'chamados-admin.html', label: '🎫 Chamados' },
      { key: 'clientes', href: 'clientes.html', label: '👥 Clientes' },
      { key: 'usuarios', href: 'usuarios.html', label: '👤 Colaboradores' },
      { key: 'catalogo', href: 'catalogo-servicos.html', label: '🧩 Catálogo de Serviços' },
      { key: 'configuracoes', href: 'sla-config.html', label: '⚙️ Configurações' }
    ];

    menu.innerHTML = '';
    links.forEach((link) => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.setAttribute('href', link.href);
      if (link.key === activePage) anchor.classList.add('active');
      anchor.textContent = link.label;
      li.appendChild(anchor);
      menu.appendChild(li);
    });
  }

  window.BPIAdminCore = {
    KEYS,
    auth,
    data,
    renderAdminMenu
  };
})(window);
