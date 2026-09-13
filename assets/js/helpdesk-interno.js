(function () {
  'use strict';

  const STORAGE = {
    session: 'helpdesk_session',
    chamados: 'helpdesk_chamados',
    artigos: 'helpdesk_artigos',
    templates: 'helpdesk_templates',
    configSla: 'helpdesk_config_sla',
    configFilas: 'helpdesk_config_filas'
  };

  const MODALIDADES = [
    'Cloud', 'Treinamento', 'Gestão de Acessos', 'Implementações', 'Hub de Notas',
    'BI', 'Dashboard', 'BPO Financeiro', 'BPO Contábil', 'BPO Fiscal',
    'BPO Folha', 'Integrações', 'Dúvidas'
  ];

  const TRUSTED_ACCOUNTS = {
    colaborador: {
      'andre@bpi.com.br': { senhaHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' },
      'maria@bpi.com.br': { senhaHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' },
      'admin.helpdesk@bpi.com.br': { senhaHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' }
    }
  };

  const COLABORADORES = [
    { colaboradorId: 'col-001', email: 'andre@bpi.com.br', nome: 'André Gusmão', role: 'Consultor' },
    { colaboradorId: 'col-002', email: 'maria@bpi.com.br', nome: 'Maria Silva', role: 'Suporte' },
    { colaboradorId: 'col-003', email: 'admin.helpdesk@bpi.com.br', nome: 'Admin Help Desk', role: 'Admin' }
  ];
  const REPORT_RATING = { min: 2, max: 5, baselineHours: 24 };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function nowISO() {
    return new Date().toISOString();
  }

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function formatDate(dateISO) {
    if (!dateISO) return '-';
    const d = new Date(dateISO);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('pt-BR');
  }

  function hoursBetween(a, b) {
    return Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 36e5);
  }

  function hoursUntil(dateISO) {
    return Math.max(0, (new Date(dateISO).getTime() - Date.now()) / 36e5);
  }

  function getSlaConfig() {
    const existing = readJSON(STORAGE.configSla, null);
    if (existing) return existing;
    const config = Object.fromEntries(MODALIDADES.map((modalidade) => [modalidade, 24]));
    writeJSON(STORAGE.configSla, config);
    return config;
  }

  function getFilasConfig() {
    const existing = readJSON(STORAGE.configFilas, null);
    if (existing) return existing;
    const config = {
      filaPadrao: true,
      especializacoes: {},
      prioridadeAutomatica: true,
      integracoes: { slack: false, email: true, crm: false }
    };
    writeJSON(STORAGE.configFilas, config);
    return config;
  }

  function generateSeedChamados() {
    const sla = getSlaConfig();
    const priorities = ['alta', 'media', 'baixa', 'crítica'];
    const statuses = ['aberto', 'em_atendimento', 'fechado', 'pendente_cliente'];
    const names = ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'];
    const chamados = [];

    for (let i = 1; i <= 24; i += 1) {
      const criacao = new Date(Date.now() - (i * 7) * 36e5);
      const modalidade = MODALIDADES[i % MODALIDADES.length];
      const prioridade = priorities[i % priorities.length];
      const status = statuses[i % statuses.length];
      const slaHoras = sla[modalidade] || 24;
      const dataAtribuicao = new Date(criacao.getTime() + 2 * 36e5);
      const fechado = status === 'fechado' ? new Date(criacao.getTime() + (8 + (i % 16)) * 36e5) : null;
      chamados.push({
        id: `chamado-2026-${String(i).padStart(3, '0')}`,
        clientId: `cli-${String((i % 5) + 1).padStart(3, '0')}`,
        nomeCliente: names[i % names.length],
        emailCliente: `contato${i}@cliente.com.br`,
        telefoneCliente: `(11) 3000-00${String(i).padStart(2, '0')}`,
        titulo: `Solicitação ${i} - ${modalidade}`,
        modalidade,
        descricao: `Descrição do chamado ${i} para ${modalidade}.`,
        prioridade,
        status,
        dataCriacao: criacao.toISOString(),
        atribuidoPara: i % 2 === 0 ? 'andre@bpi.com.br' : 'maria@bpi.com.br',
        dataAtribuicao: dataAtribuicao.toISOString(),
        dataFechamento: fechado ? fechado.toISOString() : null,
        comentarios: [
          {
            tipo: 'cliente',
            autor: names[i % names.length],
            email: `contato${i}@cliente.com.br`,
            texto: `Abertura do chamado ${i}.`,
            data: criacao.toISOString()
          }
        ],
        slaHoras,
        slaVencimento: new Date(criacao.getTime() + slaHoras * 36e5).toISOString(),
        tags: i % 3 === 0 ? ['urgente'] : []
      });
    }

    // Força alguns casos críticos
    chamados[0].status = 'aberto';
    chamados[0].prioridade = 'crítica';
    chamados[0].dataCriacao = new Date(Date.now() - 16 * 36e5).toISOString();

    return chamados;
  }

  function ensureData() {
    if (!readJSON(STORAGE.chamados, null)) {
      writeJSON(STORAGE.chamados, generateSeedChamados());
    }
    if (!readJSON(STORAGE.artigos, null)) {
      writeJSON(STORAGE.artigos, [
        {
          id: 'artigo-2026-001',
          titulo: 'Como desbloquear usuário no primeiro acesso',
          modalidade: 'Gestão de Acessos',
          conteudo: '<p>Valide o perfil, redefina senha temporária e solicite novo login.</p>',
          autor: 'André Gusmão',
          autorEmail: 'andre@bpi.com.br',
          dataCriacao: nowISO(),
          dataAtualizacao: nowISO(),
          visualizacoes: 45,
          tags: ['acesso', 'login']
        },
        {
          id: 'artigo-2026-002',
          titulo: 'Checklist de diagnóstico para falha em integração',
          modalidade: 'Integrações',
          conteudo: '<p>Validar token, endpoint, timeout e payload.</p>',
          autor: 'Maria Silva',
          autorEmail: 'maria@bpi.com.br',
          dataCriacao: nowISO(),
          dataAtualizacao: nowISO(),
          visualizacoes: 23,
          tags: ['api', 'erro']
        }
      ]);
    }
    if (!readJSON(STORAGE.templates, null)) {
      writeJSON(STORAGE.templates, [
        {
          id: 'template-001',
          titulo: 'Resposta Padrão - Em análise',
          conteudo: 'Obrigado pelo contato. Seu chamado está em análise e retornaremos em breve.'
        }
      ]);
    }
    getSlaConfig();
    getFilasConfig();
  }

  function getSession() {
    return readJSON(STORAGE.session, null);
  }

  function isSessionValid(session) {
    if (!session || !session.email || !session.loginEm) return false;
    const trusted = COLABORADORES.some((item) => item.email === session.email && item.colaboradorId === session.colaboradorId);
    if (!trusted) return false;
    const loginTime = new Date(session.loginEm).getTime();
    if (!loginTime || Number.isNaN(loginTime)) return false;
    return (Date.now() - loginTime) <= 12 * 36e5;
  }

  function requireAuth() {
    const session = getSession();
    if (!isSessionValid(session)) {
      localStorage.removeItem(STORAGE.session);
      window.location.href = './login.html';
      return null;
    }
    const els = document.querySelectorAll('[data-session-name]');
    els.forEach((el) => {
      el.textContent = session.nome;
    });
    return session;
  }

  function logout() {
    localStorage.removeItem(STORAGE.session);
    window.location.href = './login.html';
  }

  async function login(email, senha) {
    const trusted = TRUSTED_ACCOUNTS.colaborador[email];
    if (!trusted) return null;
    const providedHash = await sha256Hex(senha);
    if (providedHash !== trusted.senhaHash) return null;
    const profile = COLABORADORES.find((acc) => acc.email === email);
    if (!profile) return null;
    const session = {
      colaboradorId: profile.colaboradorId,
      email: profile.email,
      nome: profile.nome,
      role: profile.role,
      loginEm: nowISO()
    };
    writeJSON(STORAGE.session, session);
    return session;
  }

  function getChamados() {
    return readJSON(STORAGE.chamados, []);
  }

  function saveChamados(chamados) {
    writeJSON(STORAGE.chamados, chamados);
  }

  function getChamadoById(id) {
    return getChamados().find((c) => c.id === id);
  }

  function normalizePriority(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'crítica' || p === 'critica') return 4;
    if (p === 'alta') return 3;
    if (p === 'media' || p === 'média') return 2;
    return 1;
  }

  function canonicalPriority(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'média') return 'media';
    if (p === 'critica') return 'crítica';
    return p;
  }

  function getRiskIndicator(chamado) {
    if (['alta', 'crítica'].includes(chamado.prioridade) && hoursBetween(chamado.dataCriacao, nowISO()) > 12 && chamado.status !== 'fechado') {
      return '🔴';
    }
    if (new Date(chamado.slaVencimento) < new Date() && chamado.status !== 'fechado') {
      return '🟡';
    }
    return '🟢';
  }

  function addComentario(chamadoId, texto, session, statusAlvo) {
    const chamados = getChamados();
    const chamado = chamados.find((c) => c.id === chamadoId);
    if (!chamado) return;

    chamado.comentarios = chamado.comentarios || [];
    chamado.comentarios.push({
      tipo: 'colaborador',
      autor: session.nome,
      email: session.email,
      texto,
      data: nowISO()
    });

    if (statusAlvo === 'fechado') {
      chamado.status = 'fechado';
      chamado.dataFechamento = nowISO();
    } else if (statusAlvo === 'pendente_cliente') {
      chamado.status = 'pendente_cliente';
      chamado.dataFechamento = null;
    } else if (statusAlvo && statusAlvo !== 'fechado') {
      chamado.status = statusAlvo;
      chamado.dataFechamento = null;
    }

    saveChamados(chamados);
  }

  function updateChamado(chamadoId, updates, session) {
    const chamados = getChamados();
    const chamado = chamados.find((c) => c.id === chamadoId);
    if (!chamado) return;

    const previousStatus = chamado.status;
    if (updates.prioridade) {
      updates.prioridade = canonicalPriority(updates.prioridade);
    }
    Object.assign(chamado, updates);

    if (updates.status === 'fechado' && previousStatus !== 'fechado') {
      chamado.dataFechamento = nowISO();
    } else if (updates.status && updates.status !== 'fechado') {
      chamado.dataFechamento = null;
    }

    if (updates.atribuidoPara && !chamado.dataAtribuicao) {
      chamado.dataAtribuicao = nowISO();
    }

    if (updates.novaTag) {
      chamado.tags = Array.isArray(chamado.tags) ? chamado.tags : [];
      const tag = String(updates.novaTag).trim();
      if (tag && !chamado.tags.includes(tag)) chamado.tags.push(tag);
      delete chamado.novaTag;
    }

    chamado.comentarios = chamado.comentarios || [];
    chamado.comentarios.push({
      tipo: 'sistema',
      autor: 'Sistema',
      email: 'sistema@bpi.com.br',
      texto: `Chamado atualizado por ${session.nome}`,
      data: nowISO()
    });

    saveChamados(chamados);
  }

  function assignToMe(chamadoId, session) {
    updateChamado(chamadoId, { status: 'em_atendimento', atribuidoPara: session.email, dataAtribuicao: nowISO() }, session);
  }

  function getArtigos() {
    return readJSON(STORAGE.artigos, []);
  }

  function saveArtigos(artigos) {
    writeJSON(STORAGE.artigos, artigos);
  }

  function saveArtigo(data, session) {
    const artigos = getArtigos();
    const now = nowISO();
    if (data.id) {
      const artigo = artigos.find((a) => a.id === data.id);
      if (!artigo) return { ok: false, error: 'Artigo não encontrado.' };
      if (artigo.autorEmail !== session.email && session.role !== 'Admin') return { ok: false, error: 'Sem permissão.' };
      artigo.titulo = data.titulo;
      artigo.modalidade = data.modalidade;
      artigo.conteudo = data.conteudo;
      artigo.dataAtualizacao = now;
    } else {
      artigos.push({
        id: `artigo-2026-${String(Date.now()).slice(-6)}`,
        titulo: data.titulo,
        modalidade: data.modalidade,
        conteudo: data.conteudo,
        autor: session.nome,
        autorEmail: session.email,
        dataCriacao: now,
        dataAtualizacao: now,
        visualizacoes: 0,
        tags: []
      });
    }
    saveArtigos(artigos);
    return { ok: true };
  }

  function deleteArtigo(id, session) {
    const artigos = getArtigos();
    const artigo = artigos.find((a) => a.id === id);
    if (!artigo) return { ok: false, error: 'Artigo não encontrado.' };
    if (artigo.autorEmail !== session.email && session.role !== 'Admin') return { ok: false, error: 'Sem permissão.' };
    saveArtigos(artigos.filter((a) => a.id !== id));
    return { ok: true };
  }

  function trackArtigoView(id) {
    const artigos = getArtigos();
    const artigo = artigos.find((a) => a.id === id);
    if (artigo) {
      artigo.visualizacoes += 1;
      saveArtigos(artigos);
    }
  }

  function getFilteredChamados(filters) {
    return getChamados().filter((c) => {
      const statusOk = !filters.status || filters.status === 'todos' || c.status === filters.status;
      const modOk = !filters.modalidade || filters.modalidade === 'todos' || c.modalidade === filters.modalidade;
      const prioOk = !filters.prioridade || filters.prioridade === 'todos' || canonicalPriority(c.prioridade) === canonicalPriority(filters.prioridade);
      const dateOk = (() => {
        if (!filters.periodo || filters.periodo === 'todos') return true;
        const created = new Date(c.dataCriacao).getTime();
        const now = Date.now();
        if (filters.periodo === '7') return now - created <= 7 * 24 * 36e5;
        if (filters.periodo === '30') return now - created <= 30 * 24 * 36e5;
        return true;
      })();
      return statusOk && modOk && prioOk && dateOk;
    });
  }

  function sortChamados(chamados, sortBy) {
    const arr = [...chamados];
    arr.sort((a, b) => {
      if (sortBy === 'prioridade') return normalizePriority(b.prioridade) - normalizePriority(a.prioridade);
      if (sortBy === 'data') return new Date(b.dataCriacao) - new Date(a.dataCriacao);
      if (sortBy === 'fila') return hoursBetween(b.dataCriacao, nowISO()) - hoursBetween(a.dataCriacao, nowISO());
      if (sortBy === 'cliente') return a.nomeCliente.localeCompare(b.nomeCliente, 'pt-BR');
      if (sortBy === 'prioridade_tempo') {
        const pDiff = normalizePriority(b.prioridade) - normalizePriority(a.prioridade);
        if (pDiff) return pDiff;
        return hoursBetween(b.dataCriacao, nowISO()) - hoursBetween(a.dataCriacao, nowISO());
      }
      return 0;
    });
    return arr;
  }

  function calcDashboard(session) {
    const chamados = getChamados();
    const today = new Date().toISOString().slice(0, 10);
    const fechados = chamados.filter((c) => c.status === 'fechado');
    const fechadosHoje = fechados.filter((c) => (c.dataFechamento || '').slice(0, 10) === today).length;
    const slaCumprido = fechados.length
      ? Math.round((fechados.filter((c) => new Date(c.dataFechamento) <= new Date(c.slaVencimento)).length / fechados.length) * 100)
      : 0;

    return {
      aberto: chamados.filter((c) => c.status === 'aberto').length,
      meus: chamados.filter((c) => c.status === 'em_atendimento' && c.atribuidoPara === session.email).length,
      fechadosHoje,
      slaCumprido,
      meusChamados: chamados
        .filter((c) => c.atribuidoPara === session.email)
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
        .slice(0, 10),
      criticos: chamados.filter((c) => ['alta', 'crítica'].includes(c.prioridade) && c.status !== 'fechado' && hoursBetween(c.dataCriacao, nowISO()) > 12)
    };
  }

  function pieSegmentsByModalidade(chamados) {
    const cutoff = Date.now() - 30 * 24 * 36e5;
    const base = chamados.filter((c) => new Date(c.dataCriacao).getTime() >= cutoff);
    const total = base.length || 1;
    const counts = MODALIDADES.map((m) => ({ modalidade: m, count: base.filter((c) => c.modalidade === m).length }));
    return counts.filter((x) => x.count > 0).map((item) => ({
      ...item,
      percent: Math.round((item.count / total) * 100)
    }));
  }

  function ageBuckets(chamados) {
    const buckets = { '0-24h': 0, '1-3 dias': 0, '3-7 dias': 0, '>7 dias': 0 };
    chamados.forEach((c) => {
      const h = hoursBetween(c.dataCriacao, nowISO());
      if (h <= 24) buckets['0-24h'] += 1;
      else if (h <= 72) buckets['1-3 dias'] += 1;
      else if (h <= 168) buckets['3-7 dias'] += 1;
      else buckets['>7 dias'] += 1;
    });
    return buckets;
  }

  function avgResolutionTrend(chamados, days) {
    const points = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const day = new Date(Date.now() - i * 24 * 36e5).toISOString().slice(0, 10);
      const closed = chamados.filter((c) => c.status === 'fechado' && (c.dataFechamento || '').slice(0, 10) === day);
      const avg = closed.length
        ? Math.round(closed.reduce((sum, c) => sum + hoursBetween(c.dataCriacao, c.dataFechamento), 0) / closed.length)
        : 0;
      points.push({ day: day.slice(5), avg });
    }
    return points;
  }

  function getSlaVisual(chamado) {
    const now = Date.now();
    const start = new Date(chamado.dataCriacao).getTime();
    const end = new Date(chamado.slaVencimento).getTime();
    const total = Math.max(1, end - start);
    const remainingMs = end - now;
    const progress = Math.min(100, Math.max(0, ((now - start) / total) * 100));
    const color = progress < 60 ? 'sla-green' : progress < 85 ? 'sla-yellow' : 'sla-red';

    const remaining = remainingMs <= 0
      ? 'SLA vencido'
      : `${Math.floor(remainingMs / 36e5)}h ${Math.floor((remainingMs % 36e5) / 6e4)}min restantes`;

    return { progress: Math.round(progress), color, remaining };
  }

  function sanitizeRichContent(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'A', 'CODE', 'PRE']);

    (function walk(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(node.tagName)) {
          const textNode = document.createTextNode(node.textContent || '');
          node.replaceWith(textNode);
          return;
        }

        Array.from(node.attributes).forEach((attr) => {
          const isHref = node.tagName === 'A' && attr.name === 'href';
          if (!isHref) {
            node.removeAttribute(attr.name);
          }
          if (isHref) {
            const href = node.getAttribute('href') || '';
            if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
              node.removeAttribute('href');
            }
          }
        });
      }
      Array.from(node.childNodes).forEach(walk);
    }(template.content));

    return template.innerHTML;
  }

  function sanitizeTemplateHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    (function walk(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = attr.value || '';
          if (name.startsWith('on') || name === 'srcdoc') {
            node.removeAttribute(attr.name);
            return;
          }
          if ((name === 'href' || name === 'src') && /^javascript:/i.test(value.trim())) {
            node.removeAttribute(attr.name);
            return;
          }
          if (name === 'style' && !/^\\s*width\\s*:\\s*\\d{1,3}%\\s*;?\\s*$/i.test(value)) {
            node.removeAttribute(attr.name);
          }
        });
      }
      Array.from(node.childNodes).forEach(walk);
    }(template.content));

    return template.innerHTML;
  }

  // Use apenas com templates internos já escapados/sanitizados.
  function setTrustedHTML(container, html) {
    container.innerHTML = sanitizeTemplateHTML(html);
  }

  function renderDashboard() {
    const session = requireAuth();
    if (!session) return;
    const data = calcDashboard(session);
    const chamados = getChamados();

    document.getElementById('kpiAbertos').textContent = data.aberto;
    document.getElementById('kpiMeus').textContent = data.meus;
    document.getElementById('kpiResolvidos').textContent = data.fechadosHoje;
    document.getElementById('kpiSla').textContent = `${data.slaCumprido}%`;

    const meusRows = data.meusChamados.map((c) => `
      <tr>
        <td>${escapeHtml(c.id)}</td>
        <td>${escapeHtml(c.nomeCliente)}</td>
        <td><span class="badge ${escapeHtml(c.status)}">${escapeHtml(c.status)}</span></td>
        <td>${escapeHtml(c.prioridade)}</td>
        <td>${Math.round(hoursUntil(c.slaVencimento))}h</td>
      </tr>
    `).join('') || '<tr><td colspan="5">Sem chamados atribuídos.</td></tr>';
    setTrustedHTML(document.getElementById('meusChamadosBody'), meusRows);

    const criticosRows = data.criticos.map((c) => `
      <tr>
        <td>🔴 ${escapeHtml(c.id)}</td>
        <td>${escapeHtml(c.nomeCliente)}</td>
        <td>${escapeHtml(c.prioridade)}</td>
        <td>${Math.round(hoursBetween(c.dataCriacao, nowISO()))}h</td>
      </tr>
    `).join('') || '<tr><td colspan="4">Sem chamados críticos.</td></tr>';
    setTrustedHTML(document.getElementById('criticosBody'), criticosRows);

    const pie = pieSegmentsByModalidade(chamados).map((x) => `<div class="chart-row"><span>${escapeHtml(x.modalidade)}</span><div class="bar"><div style="width:${x.percent}%"></div></div><strong>${x.percent}%</strong></div>`).join('') || '<p>Sem dados.</p>';
    setTrustedHTML(document.getElementById('chartPizza'), pie);

    const age = ageBuckets(chamados);
    const maxAge = Math.max(...Object.values(age), 1);
    const ageHtml = Object.entries(age).map(([k, v]) => `<div class="chart-row"><span>${k}</span><div class="bar"><div style="width:${Math.round((v / maxAge) * 100)}%"></div></div><strong>${v}</strong></div>`).join('');
    setTrustedHTML(document.getElementById('chartAge'), ageHtml);

    const trend = avgResolutionTrend(chamados, 7);
    const maxTrend = Math.max(...trend.map((x) => x.avg), 1);
    const trendHtml = trend.map((x) => `<div class="chart-row"><span>${x.day}</span><div class="bar"><div style="width:${Math.round((x.avg / maxTrend) * 100)}%"></div></div><strong>${x.avg}h</strong></div>`).join('');
    setTrustedHTML(document.getElementById('chartTempo'), trendHtml);
  }

  function renderFila() {
    const session = requireAuth();
    if (!session) return;

    const modalSelect = document.getElementById('filtroModalidade');
    modalSelect.innerHTML = '<option value="todos">Todas</option>' + MODALIDADES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

    function draw() {
      const chamados = sortChamados(getFilteredChamados({
        status: document.getElementById('filtroStatus').value,
        modalidade: document.getElementById('filtroModalidade').value,
        prioridade: document.getElementById('filtroPrioridade').value,
        periodo: document.getElementById('filtroPeriodo').value
      }), document.getElementById('ordenacao').value);

      const rows = chamados.map((c) => `
        <tr>
          <td>${getRiskIndicator(c)} ${escapeHtml(c.id)}</td>
          <td>${escapeHtml(c.nomeCliente)}</td>
          <td>${escapeHtml(c.titulo)}</td>
          <td>${escapeHtml(c.modalidade)}</td>
          <td>${escapeHtml(c.prioridade)}</td>
          <td><span class="badge ${escapeHtml(c.status)}">${escapeHtml(c.status)}</span></td>
          <td>${Math.round(hoursBetween(c.dataCriacao, nowISO()))}h</td>
          <td>${Math.round(hoursUntil(c.slaVencimento))}h</td>
          <td>
            <button data-assign="${escapeHtml(c.id)}" class="btn small">Atribuir a mim</button>
            <a class="btn small secondary" href="./chamado.html?id=${encodeURIComponent(c.id)}">Ver Detalhes</a>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="9">Nenhum chamado encontrado.</td></tr>';

      setTrustedHTML(document.getElementById('filaBody'), rows);

      document.querySelectorAll('[data-assign]').forEach((btn) => {
        btn.addEventListener('click', () => {
          assignToMe(btn.getAttribute('data-assign'), session);
          draw();
        });
      });
    }

    ['filtroStatus', 'filtroModalidade', 'filtroPrioridade', 'filtroPeriodo', 'ordenacao'].forEach((id) => {
      document.getElementById(id).addEventListener('change', draw);
    });

    draw();
  }

  function renderChamado() {
    const session = requireAuth();
    if (!session) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const chamado = getChamadoById(id);
    const currentNavLink = document.querySelector('a[aria-current="page"]');
    if (currentNavLink && id) {
      currentNavLink.href = `./chamado.html?id=${encodeURIComponent(id)}`;
    }
    if (!chamado) {
      document.getElementById('chamadoContainer').innerHTML = '<p>Chamado não encontrado.</p>';
      return;
    }

    function draw() {
      const updated = getChamadoById(id);
      updated.prioridade = canonicalPriority(updated.prioridade);
      const sla = getSlaVisual(updated);
      const optionsModalidade = MODALIDADES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

      setTrustedHTML(document.getElementById('chamadoContainer'), `
        <div class="card">
          <h2>${escapeHtml(updated.id)} - ${escapeHtml(updated.titulo)}</h2>
          <p><strong>Cliente:</strong> ${escapeHtml(updated.nomeCliente)} | ${escapeHtml(updated.emailCliente)} | ${escapeHtml(updated.telefoneCliente)}</p>
          <p><strong>Modalidade:</strong> ${escapeHtml(updated.modalidade)} | <strong>Prioridade:</strong> ${escapeHtml(updated.prioridade)} | <strong>Status:</strong> ${escapeHtml(updated.status)}</p>
          <p><strong>Datas:</strong> Criação ${formatDate(updated.dataCriacao)} | Atribuição ${formatDate(updated.dataAtribuicao)} | Fechamento ${formatDate(updated.dataFechamento)}</p>
          <p><strong>Atribuído para:</strong> ${escapeHtml(updated.atribuidoPara || '-')}</p>
          <p><strong>Descrição:</strong> ${escapeHtml(updated.descricao)}</p>
          <p><strong>Tags:</strong> ${(updated.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ') || '-'}</p>

          <div class="sla-box">
            <p><strong>SLA:</strong> ${escapeHtml(sla.remaining)}</p>
            <div class="sla-progress"><div class="${sla.color}" style="width:${sla.progress}%"></div></div>
          </div>
        </div>

        <div class="card">
          <h3>Histórico de Comentários</h3>
          <div class="timeline">
            ${(updated.comentarios || []).map((c) => `
              <div class="timeline-item ${escapeHtml(c.tipo)}">
                <strong>${escapeHtml(c.autor)}</strong> (${escapeHtml(c.tipo)}) - ${formatDate(c.data)}
                <p>${escapeHtml(c.texto)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <h3>Responder</h3>
          <textarea id="respostaTexto" rows="4" placeholder="Escreva sua resposta"></textarea>
          <div class="inline-options">
            <label><input type="checkbox" id="optResolvido"> Marcar como Resolvido</label>
            <label><input type="checkbox" id="optPendente"> Marcar como Pendente Cliente</label>
          </div>
          <button id="btnEnviar" class="btn">Enviar Resposta</button>
        </div>

        <div class="card">
          <h3>Ações</h3>
          <div class="grid-2">
            <div>
              <label>Atribuir para colaborador</label>
              <select id="acaoAtribuir"><option value="">Selecione</option>${COLABORADORES.map((c) => `<option value="${escapeHtml(c.email)}">${escapeHtml(c.nome)}</option>`).join('')}</select>
            </div>
            <div>
              <label>Mudar status</label>
              <select id="acaoStatus">
                <option value="aberto">aberto</option>
                <option value="em_atendimento">em_atendimento</option>
                <option value="pendente_cliente">pendente_cliente</option>
                <option value="fechado">fechado</option>
              </select>
            </div>
            <div>
              <label>Mudar prioridade</label>
              <select id="acaoPrioridade">
                <option value="baixa">baixa</option>
                <option value="media">media</option>
                <option value="alta">alta</option>
                <option value="crítica">crítica</option>
              </select>
            </div>
            <div>
              <label>Adicionar tag/label</label>
              <input type="text" id="acaoTag" placeholder="ex.: bloqueador">
            </div>
            <div>
              <label>Motivo de fechamento</label>
              <input type="text" id="acaoMotivo" placeholder="Informe o motivo">
            </div>
            <div>
              <label>Modalidade (somente visual)</label>
              <select disabled>${optionsModalidade}</select>
            </div>
          </div>
          <div class="actions-row">
            <button id="btnSalvarAcoes" class="btn">Salvar Ações</button>
            <button id="btnFechar" class="btn danger">Fechar chamado</button>
          </div>
        </div>
      `);

      document.getElementById('acaoStatus').value = updated.status;
      document.getElementById('acaoPrioridade').value = updated.prioridade;
      document.getElementById('acaoAtribuir').value = updated.atribuidoPara || '';

      document.getElementById('btnEnviar').addEventListener('click', () => {
        const texto = document.getElementById('respostaTexto').value.trim();
        if (!texto) return;
        const resolved = document.getElementById('optResolvido').checked;
        const pendente = document.getElementById('optPendente').checked;
        addComentario(id, texto, session, resolved ? 'fechado' : pendente ? 'pendente_cliente' : undefined);
        draw();
      });

      document.getElementById('btnSalvarAcoes').addEventListener('click', () => {
        updateChamado(id, {
          atribuidoPara: document.getElementById('acaoAtribuir').value || null,
          status: document.getElementById('acaoStatus').value,
          prioridade: document.getElementById('acaoPrioridade').value,
          novaTag: document.getElementById('acaoTag').value.trim()
        }, session);
        draw();
      });

      document.getElementById('btnFechar').addEventListener('click', () => {
        const motivo = document.getElementById('acaoMotivo').value.trim() || 'Fechado sem motivo informado';
        addComentario(id, `Fechamento: ${motivo}`, session, 'fechado');
        draw();
      });
    }

    draw();
  }

  function renderBaseConhecimento() {
    const session = requireAuth();
    if (!session) return;

    document.getElementById('artigoModalidade').innerHTML = MODALIDADES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    document.getElementById('filtroCategoria').innerHTML = '<option value="todos">Todas</option>' + MODALIDADES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

    let artigoAberto = null;
    let editandoId = null;

    function draw() {
      const termo = document.getElementById('buscaGlobal').value.toLowerCase().trim();
      const categoria = document.getElementById('filtroCategoria').value;
      const artigos = getArtigos().filter((a) => {
        const bySearch = !termo || a.titulo.toLowerCase().includes(termo) || a.conteudo.toLowerCase().includes(termo);
        const byCat = categoria === 'todos' || a.modalidade === categoria;
        return bySearch && byCat;
      });

      const rows = artigos.map((a) => `
        <tr>
          <td>${escapeHtml(a.titulo)}</td>
          <td>${escapeHtml(a.autor)}</td>
          <td>${formatDate(a.dataAtualizacao)}</td>
          <td>${a.visualizacoes}</td>
          <td>
            <button data-read="${escapeHtml(a.id)}" class="btn small">Ler</button>
            <button data-edit="${escapeHtml(a.id)}" class="btn small secondary">Editar</button>
            <button data-delete="${escapeHtml(a.id)}" class="btn small danger">Deletar</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="5">Nenhum artigo encontrado.</td></tr>';
      setTrustedHTML(document.getElementById('artigosBody'), rows);

      document.querySelectorAll('[data-read]').forEach((btn) => btn.addEventListener('click', () => {
        artigoAberto = getArtigos().find((a) => a.id === btn.getAttribute('data-read'));
        if (!artigoAberto) return;
        trackArtigoView(artigoAberto.id);
        artigoAberto = getArtigos().find((a) => a.id === artigoAberto.id);
        setTrustedHTML(document.getElementById('visualizadorArtigo'), `
          <h3>${escapeHtml(artigoAberto.titulo)}</h3>
          <p><strong>Autor:</strong> ${escapeHtml(artigoAberto.autor)} | <strong>Data:</strong> ${formatDate(artigoAberto.dataAtualizacao)} | <strong>Views:</strong> ${artigoAberto.visualizacoes}</p>
          <div class="article-content">${sanitizeRichContent(artigoAberto.conteudo)}</div>
          <p><strong>Relacionados:</strong> ${getArtigos().filter((x) => x.modalidade === artigoAberto.modalidade && x.id !== artigoAberto.id).slice(0, 3).map((x) => escapeHtml(x.titulo)).join(' | ') || 'Sem sugestões'}</p>
          <button id="btnVoltarArtigo" class="btn secondary">Voltar</button>
        `);
        document.getElementById('btnVoltarArtigo').addEventListener('click', () => {
          document.getElementById('visualizadorArtigo').innerHTML = '<p>Selecione um artigo para leitura.</p>';
        });
        draw();
      }));

      document.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
        const artigo = getArtigos().find((a) => a.id === btn.getAttribute('data-edit'));
        if (!artigo) return;
        if (artigo.autorEmail !== session.email && session.role !== 'Admin') {
          window.alert('Somente o autor do artigo ou um usuário com perfil Admin pode editar.');
          return;
        }
        editandoId = artigo.id;
        document.getElementById('artigoTitulo').value = artigo.titulo;
        document.getElementById('artigoModalidade').value = artigo.modalidade;
        document.getElementById('artigoConteudo').value = artigo.conteudo;
      }));

      document.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => {
        const result = deleteArtigo(btn.getAttribute('data-delete'), session);
        if (!result.ok) window.alert(result.error);
        draw();
      }));
    }

    document.getElementById('buscaGlobal').addEventListener('input', draw);
    document.getElementById('filtroCategoria').addEventListener('change', draw);
    document.getElementById('formArtigo').addEventListener('submit', (e) => {
      e.preventDefault();
      const result = saveArtigo({
        id: editandoId,
        titulo: document.getElementById('artigoTitulo').value.trim(),
        modalidade: document.getElementById('artigoModalidade').value,
        conteudo: document.getElementById('artigoConteudo').value.trim()
      }, session);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      e.target.reset();
      editandoId = null;
      draw();
    });

    draw();
  }

  function renderRelatorios() {
    const session = requireAuth();
    if (!session) return;

    document.getElementById('filtroRelModalidade').innerHTML = '<option value="todos">Todas</option>' + MODALIDADES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    document.getElementById('filtroRelAtendente').innerHTML = '<option value="todos">Todos</option>' + COLABORADORES.map((c) => `<option value="${escapeHtml(c.email)}">${escapeHtml(c.nome)}</option>`).join('');

    function getRange() {
      const ini = document.getElementById('filtroRelInicio').value;
      const fim = document.getElementById('filtroRelFim').value;
      return { ini: ini ? new Date(`${ini}T00:00:00`).getTime() : null, fim: fim ? new Date(`${fim}T23:59:59`).getTime() : null };
    }

    function inRange(timestamp, range) {
      return (!range.ini || timestamp >= range.ini) && (!range.fim || timestamp <= range.fim);
    }

    function dataset() {
      const mod = document.getElementById('filtroRelModalidade').value;
      const atendente = document.getElementById('filtroRelAtendente').value;
      return getChamados().filter((c) => {
        const modOk = mod === 'todos' || c.modalidade === mod;
        const atendOk = atendente === 'todos' || c.atribuidoPara === atendente;
        return modOk && atendOk;
      });
    }

    function calc() {
      const all = dataset();
      const range = getRange();
      const chamados = all.filter((c) => inRange(new Date(c.dataCriacao).getTime(), range));
      const resolvidos = all.filter((c) => c.status === 'fechado' && c.dataFechamento && inRange(new Date(c.dataFechamento).getTime(), range));
      const sla = resolvidos.length
        ? Math.round((resolvidos.filter((c) => new Date(c.dataFechamento) <= new Date(c.slaVencimento)).length / resolvidos.length) * 100)
        : 0;
      const tempoMedio = resolvidos.length
        ? Math.round(resolvidos.reduce((sum, c) => sum + hoursBetween(c.dataCriacao, c.dataFechamento), 0) / resolvidos.length)
        : 0;
      return { chamados, resolvidos, sla, tempoMedio };
    }

    function openTab(name) {
      document.querySelectorAll('.tab-pane').forEach((el) => el.classList.remove('active'));
      document.querySelectorAll('[data-tab-btn]').forEach((el) => el.classList.remove('active'));
      document.querySelector(`[data-tab="${name}"]`).classList.add('active');
      document.querySelector(`[data-tab-btn="${name}"]`).classList.add('active');
    }

    function draw() {
      const { chamados, resolvidos, sla, tempoMedio } = calc();
      const geral = document.getElementById('visaoGeral');
      geral.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'dashboard-grid';
      [
        ['Total', `${chamados.length}`],
        ['Abertos', `${chamados.filter((c) => c.status === 'aberto').length}`],
        ['Resolvidos', `${resolvidos.length}`],
        ['Tempo Médio', `${tempoMedio}h`]
      ].forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'kpi-card';
        const label = document.createElement('div');
        label.className = 'kpi-label';
        label.textContent = item[0];
        const value = document.createElement('div');
        value.className = 'kpi-value';
        value.textContent = item[1];
        card.appendChild(label);
        card.appendChild(value);
        if (index === 3) {
          const change = document.createElement('div');
          change.className = 'kpi-change';
          change.textContent = `SLA ${sla}%`;
          card.appendChild(change);
        }
        grid.appendChild(card);
      });
      geral.appendChild(grid);

      const porMod = MODALIDADES.map((m) => {
        const group = chamados.filter((c) => c.modalidade === m);
        const gRes = resolvidos.filter((c) => c.modalidade === m);
        const gSla = gRes.length ? Math.round((gRes.filter((c) => new Date(c.dataFechamento) <= new Date(c.slaVencimento)).length / gRes.length) * 100) : 0;
        const gTempo = gRes.length ? Math.round(gRes.reduce((sum, c) => sum + hoursBetween(c.dataCriacao, c.dataFechamento), 0) / gRes.length) : 0;
        return { m, total: group.length, resolvidos: gRes.length, sla: gSla, tempo: gTempo };
      }).filter((x) => x.total > 0);

      document.getElementById('porModalidade').innerHTML = `
        <table><thead><tr><th>Modalidade</th><th>Total</th><th>Resolvidos</th><th>% SLA</th><th>Tempo Médio</th></tr></thead>
        <tbody>${porMod.map((x) => `<tr><td>${escapeHtml(x.m)}</td><td>${x.total}</td><td>${x.resolvidos}</td><td>${x.sla}%</td><td>${x.tempo}h</td></tr>`).join('') || '<tr><td colspan="5">Sem dados</td></tr>'}</tbody></table>
        <div class="chart-card">${porMod.map((x) => `<div class="chart-row"><span>${escapeHtml(x.m)}</span><div class="bar"><div style="width:${Math.max(5, x.total * 10)}%"></div></div><strong>${x.total}</strong></div>`).join('')}</div>
      `;

      const porAtendente = COLABORADORES.map((u) => {
        const group = chamados.filter((c) => c.atribuidoPara === u.email);
        const gRes = resolvidos.filter((c) => c.atribuidoPara === u.email);
        const gTempo = gRes.length ? Math.round(gRes.reduce((sum, c) => sum + hoursBetween(c.dataCriacao, c.dataFechamento), 0) / gRes.length) : 0;
        return {
          u,
          atribu: group.length,
          resolvidos: gRes.length,
          tempo: gTempo,
          rating: gRes.length === 0
            ? '-'
            : Math.max(REPORT_RATING.min, Math.min(REPORT_RATING.max, REPORT_RATING.max - (gTempo / REPORT_RATING.baselineHours))).toFixed(1)
        };
      });

      document.getElementById('porAtendente').innerHTML = `
        <table><thead><tr><th>Atendente</th><th>Atribuídos</th><th>Resolvidos</th><th>Tempo Médio</th><th>Rating</th></tr></thead>
        <tbody>${porAtendente.map((x) => `<tr><td>${escapeHtml(x.u.nome)}</td><td>${x.atribu}</td><td>${x.resolvidos}</td><td>${x.tempo}h</td><td>${x.rating}</td></tr>`).join('')}</tbody></table>
        <div class="chart-card">${porAtendente.map((x) => `<div class="chart-row"><span>${escapeHtml(x.u.nome)}</span><div class="bar"><div style="width:${Math.max(5, x.resolvidos * 12)}%"></div></div><strong>${x.resolvidos}</strong></div>`).join('')}</div>
      `;

      const trends = avgResolutionTrend(chamados, 30);
      const maxV = Math.max(...trends.map((x) => x.avg), 1);
      const peak = trends.reduce((acc, x) => (x.avg > acc.avg ? x : acc), { avg: -1, day: '-' });
      const best = trends.reduce((acc, x) => ((x.avg > 0 && x.avg < acc.avg) ? x : acc), { avg: 99999, day: '-' });
      document.getElementById('tendencias').innerHTML = `
        <div class="chart-card">${trends.map((x) => `<div class="chart-row"><span>${x.day}</span><div class="bar"><div style="width:${Math.round((x.avg / maxV) * 100)}%"></div></div><strong>${x.avg}h</strong></div>`).join('')}</div>
        <div class="alert-box">Pico de demanda no dia ${escapeHtml(peak.day)} • Melhora em ${escapeHtml(best.day)}</div>
      `;
    }

    document.querySelectorAll('[data-tab-btn]').forEach((btn) => btn.addEventListener('click', () => openTab(btn.getAttribute('data-tab-btn'))));
    ['filtroRelInicio', 'filtroRelFim', 'filtroRelModalidade', 'filtroRelAtendente'].forEach((id) => {
      document.getElementById(id).addEventListener('change', draw);
    });

    document.getElementById('btnDownloadPdf').addEventListener('click', () => {
      window.alert('Download PDF gerado (simulado).');
    });

    openTab('geral');
    draw();
  }

  function renderConfig() {
    const session = requireAuth();
    if (!session) return;

    function drawSla() {
      const cfg = getSlaConfig();
      const rows = Object.entries(cfg).map(([mod, h]) => `
        <tr>
          <td>${escapeHtml(mod)}</td>
          <td><input type="number" min="1" data-sla="${escapeHtml(mod)}" value="${h}"></td>
          <td><button class="btn small" data-save-sla="${escapeHtml(mod)}">Salvar</button></td>
        </tr>
      `).join('');
      setTrustedHTML(document.getElementById('slaBody'), rows);

      document.querySelectorAll('[data-save-sla]').forEach((btn) => btn.addEventListener('click', () => {
        const mod = btn.getAttribute('data-save-sla');
        const input = Array.from(document.querySelectorAll('[data-sla]')).find((el) => el.getAttribute('data-sla') === mod);
        cfg[mod] = Math.max(1, Number(input.value || 24));
        writeJSON(STORAGE.configSla, cfg);
        const chamados = getChamados();
        chamados.forEach((c) => {
          if (c.status === 'fechado') return;
          c.slaHoras = cfg[c.modalidade] || c.slaHoras || 24;
          c.slaVencimento = new Date(new Date(c.dataCriacao).getTime() + c.slaHoras * 36e5).toISOString();
        });
        saveChamados(chamados);
      }));
    }

    function drawTemplates() {
      const templates = readJSON(STORAGE.templates, []);
      setTrustedHTML(document.getElementById('templatesBody'), templates.map((t) => `
        <tr>
          <td>${escapeHtml(t.titulo)}</td>
          <td>${escapeHtml(t.conteudo)}</td>
          <td>
            <button class="btn small secondary" data-edit-template="${escapeHtml(t.id)}">Editar</button>
            <button class="btn small danger" data-delete-template="${escapeHtml(t.id)}">Excluir</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="3">Sem templates</td></tr>');

      document.querySelectorAll('[data-edit-template]').forEach((btn) => btn.addEventListener('click', () => {
        const t = templates.find((x) => x.id === btn.getAttribute('data-edit-template'));
        if (!t) return;
        document.getElementById('templateId').value = t.id;
        document.getElementById('templateTitulo').value = t.titulo;
        document.getElementById('templateConteudo').value = t.conteudo;
      }));

      document.querySelectorAll('[data-delete-template]').forEach((btn) => btn.addEventListener('click', () => {
        writeJSON(STORAGE.templates, templates.filter((x) => x.id !== btn.getAttribute('data-delete-template')));
        drawTemplates();
      }));
    }

    function drawFilas() {
      const cfg = getFilasConfig();
      document.getElementById('filaPadrao').checked = !!cfg.filaPadrao;
      document.getElementById('prioridadeAutomatica').checked = !!cfg.prioridadeAutomatica;
      const meus = cfg.especializacoes[session.email] || [];
      document.getElementById('especializacoes').value = meus.join(', ');
      document.getElementById('integracaoSlack').checked = !!cfg.integracoes.slack;
      document.getElementById('integracaoEmail').checked = !!cfg.integracoes.email;
      document.getElementById('integracaoCrm').checked = !!cfg.integracoes.crm;
    }

    document.getElementById('formTemplate').addEventListener('submit', (e) => {
      e.preventDefault();
      const templates = readJSON(STORAGE.templates, []);
      const id = document.getElementById('templateId').value;
      const payload = {
        id: id || `template-${Date.now()}`,
        titulo: document.getElementById('templateTitulo').value.trim(),
        conteudo: document.getElementById('templateConteudo').value.trim()
      };
      const existing = templates.findIndex((t) => t.id === payload.id);
      if (existing >= 0) templates[existing] = payload;
      else templates.push(payload);
      writeJSON(STORAGE.templates, templates);
      e.target.reset();
      drawTemplates();
    });

    document.getElementById('btnSalvarFilas').addEventListener('click', () => {
      const cfg = getFilasConfig();
      cfg.filaPadrao = document.getElementById('filaPadrao').checked;
      cfg.prioridadeAutomatica = document.getElementById('prioridadeAutomatica').checked;
      cfg.especializacoes[session.email] = document.getElementById('especializacoes').value.split(',').map((x) => x.trim()).filter(Boolean);
      cfg.integracoes = {
        slack: document.getElementById('integracaoSlack').checked,
        email: document.getElementById('integracaoEmail').checked,
        crm: document.getElementById('integracaoCrm').checked
      };
      writeJSON(STORAGE.configFilas, cfg);
      window.alert('Configuração salva.');
    });

    drawSla();
    drawTemplates();
    drawFilas();
  }

  function renderLogin() {
    ensureData();
    const session = getSession();
    if (isSessionValid(session)) {
      window.location.href = './dashboard.html';
      return;
    }
    localStorage.removeItem(STORAGE.session);

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value;
      const result = await login(email, senha);
      if (!result) {
        document.getElementById('erroLogin').textContent = 'Email e/ou senha inválidos.';
        return;
      }
      window.location.href = './dashboard.html';
    });
  }

  function attachCommonEvents() {
    document.querySelectorAll('[data-logout]').forEach((btn) => btn.addEventListener('click', logout));
  }

  function bootstrap() {
    ensureData();
    const page = document.body.dataset.page;
    attachCommonEvents();

    if (page === 'login') return renderLogin();
    if (page === 'dashboard') return renderDashboard();
    if (page === 'fila') return renderFila();
    if (page === 'chamado') return renderChamado();
    if (page === 'base-conhecimento') return renderBaseConhecimento();
    if (page === 'relatorios') return renderRelatorios();
    if (page === 'config') return renderConfig();
  }

  window.HelpDeskInterno = {
    TRUSTED_ACCOUNTS,
    MODALIDADES,
    requireAuth,
    logout,
    escapeHtml,
    getChamados,
    getArtigos
  };

  document.addEventListener('DOMContentLoaded', bootstrap);
}());
