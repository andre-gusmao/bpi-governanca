
(function () {
  'use strict';

  const KEYS = {
    catalogo: 'treinamentos_catalogo',
    progresso: 'treinamentos_progresso',
    progressoLista: 'treinamentos_progresso_lista',
    certificados: 'treinamentos_certificados',
    bancoQuestoes: 'treinamentos_bancoquestoes',
    emails: 'treinamentos_emails'
  };

  const FALLBACK_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

  const STATE = {
    currentUser: null,
    currentAdmin: null,
    progressTimer: null,
    provaTimer: null,
    provaData: null
  };

  function safeJSONParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function read(key, fallback) {
    return safeJSONParse(localStorage.getItem(key), fallback);
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function pad(n, size = 2) {
    return String(n).padStart(size, '0');
  }

  function esc(value) {
    const txt = String(value ?? '');
    return txt.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'' : '&#39;', '"': '&quot;' }[char]));
  }

  function initials(name) {
    return String(name || 'Colaborador')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('pt-BR');
  }

  function formatHours(seconds) {
    return (Number(seconds || 0) / 3600).toFixed(1);
  }

  function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds || 0)));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  }

  function progressKey(colaboradorId) {
    return `${KEYS.progresso}_${colaboradorId}`;
  }

  function ensureSeedData() {
    if (!Array.isArray(read(KEYS.catalogo, null))) {
      const catalogo = [
        {
          id: 'treino-001',
          titulo: 'Governança em Cloud',
          descricao: 'Boas práticas de governança, segurança e compliance em ambientes cloud.',
          duracao: 3.5,
          dificuldade: 'intermediario',
          rating: 4.8,
          instrutora: 'Marina Costa',
          thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80&auto=format&fit=crop',
          modalidade: 'Cloud',
          objetivos: ['Definir políticas de governança', 'Mapear riscos e compliance', 'Aplicar controles de acesso'],
          recursos: ['Checklist de governança (PDF)', 'Template de política de acesso'],
          videos: [
            { id: 'vid-001', titulo: 'Introdução à Governança em Cloud', descricao: 'Conceitos iniciais e panorama de riscos.', duracao: 900, url: FALLBACK_VIDEO },
            { id: 'vid-002', titulo: 'Práticas de Segurança e Compliance', descricao: 'Políticas, auditoria e trilhas de conformidade.', duracao: 1200, url: FALLBACK_VIDEO },
            { id: 'vid-003', titulo: 'Plano de Ação e Monitoramento', descricao: 'Roadmap para implantação e métricas de controle.', duracao: 950, url: FALLBACK_VIDEO }
          ],
          prova: { totalQuestoes: 30, tempoLimiteMinutos: 90, notaMinima: 70, bancoDadosId: 'banco-cloud-001' },
          status: 'disponivel',
          dataCriacao: '2026-09-13T00:00:00Z',
          slaDiasConclusao: 30
        },
        {
          id: 'treino-002',
          titulo: 'LGPD e Governança de Dados',
          descricao: 'Diretrizes de privacidade, gestão de dados pessoais e controles operacionais.',
          duracao: 4.2,
          dificuldade: 'avancado',
          rating: 4.9,
          instrutora: 'Carla Menezes',
          thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=640&q=80&auto=format&fit=crop',
          modalidade: 'Dados',
          objetivos: ['Aplicar bases legais', 'Classificar dados sensíveis', 'Definir ciclo de retenção'],
          recursos: ['Matriz ROPA (PDF)', 'Modelo de inventário de dados'],
          videos: [
            { id: 'vid-101', titulo: 'Bases da LGPD', descricao: 'Princípios e bases legais.', duracao: 1020, url: FALLBACK_VIDEO },
            { id: 'vid-102', titulo: 'Governança de Dados', descricao: 'Papéis e processos de governança.', duracao: 1180, url: FALLBACK_VIDEO },
            { id: 'vid-103', titulo: 'Resposta a Incidentes', descricao: 'Fluxo de notificação e mitigação.', duracao: 980, url: FALLBACK_VIDEO }
          ],
          prova: { totalQuestoes: 30, tempoLimiteMinutos: 90, notaMinima: 70, bancoDadosId: 'banco-dados-001' },
          status: 'disponivel',
          dataCriacao: '2026-08-08T00:00:00Z',
          slaDiasConclusao: 35
        },
        {
          id: 'treino-003',
          titulo: 'Fundamentos de PMO',
          descricao: 'Planejamento, execução e monitoramento de portfólio com práticas PMO.',
          duracao: 2.8,
          dificuldade: 'iniciante',
          rating: 4.6,
          instrutora: 'Juliana Rocha',
          thumbnail: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=640&q=80&auto=format&fit=crop',
          modalidade: 'PMO',
          objetivos: ['Criar cronogramas', 'Acompanhar marcos', 'Gerenciar riscos'],
          recursos: ['Template de cronograma', 'Matriz de risco'],
          videos: [
            { id: 'vid-201', titulo: 'PMO na prática', descricao: 'Estrutura e rotina de acompanhamento.', duracao: 840, url: FALLBACK_VIDEO },
            { id: 'vid-202', titulo: 'Métricas e indicadores', descricao: 'KPIs essenciais para governança.', duracao: 930, url: FALLBACK_VIDEO }
          ],
          prova: { totalQuestoes: 30, tempoLimiteMinutos: 90, notaMinima: 70, bancoDadosId: 'banco-pmo-001' },
          status: 'disponivel',
          dataCriacao: '2026-07-18T00:00:00Z',
          slaDiasConclusao: 20
        }
      ];
      write(KEYS.catalogo, catalogo);
    }

    if (!Array.isArray(read(KEYS.bancoQuestoes, null))) {
      const bancos = [
        createQuestionBank('banco-cloud-001', 'Cloud', ['Conceitos Fundamentais', 'Governança', 'Segurança', 'Custos']),
        createQuestionBank('banco-dados-001', 'Dados', ['LGPD', 'Privacidade', 'Inventário', 'Resposta a Incidentes']),
        createQuestionBank('banco-pmo-001', 'PMO', ['Planejamento', 'Riscos', 'Métricas', 'Comunicação'])
      ];
      write(KEYS.bancoQuestoes, bancos);
    }

    if (!Array.isArray(read(KEYS.certificados, null))) write(KEYS.certificados, []);
    if (!Array.isArray(read(KEYS.progressoLista, null))) write(KEYS.progressoLista, []);
    if (!Array.isArray(read(KEYS.emails, null))) write(KEYS.emails, []);

    const user = getCurrentUser();
    const progressoAtual = read(progressKey(user.id), null) || read(KEYS.progresso, null);
    if (!progressoAtual || !Array.isArray(progressoAtual.historico)) {
      const seed = {
        colaboradorId: user.id,
        colaboradorNome: user.name,
        historico: []
      };
      write(progressKey(user.id), seed);
      write(KEYS.progresso, seed);
      upsertProgressList(seed);
    } else {
      progressoAtual.colaboradorId = user.id;
      progressoAtual.colaboradorNome = user.name;
      write(progressKey(user.id), progressoAtual);
      write(KEYS.progresso, progressoAtual);
      upsertProgressList(progressoAtual);
    }
  }

  function createQuestionBank(id, modalidade, topicos) {
    const questoes = Array.from({ length: 65 }).map((_, idx) => {
      const n = idx + 1;
      const topico = topicos[idx % topicos.length];
      return {
        id: `${id}-q-${pad(n, 3)}`,
        pergunta: `${modalidade}: qual prática está mais alinhada ao tópico ${topico}? (Questão ${n})`,
        opcoes: [
          `${topico} com monitoramento e evidência contínua`,
          `${topico} sem documentação formal`,
          `${topico} sem responsável definido`,
          `${topico} apenas em ambiente de teste`
        ],
        correta: 0,
        explicacao: `A prática recomendada para ${topico} exige governança contínua, registro de evidências e responsáveis claros.`,
        topico
      };
    });
    return { id, modalidade, questoes };
  }

  function getCurrentUser() {
    if (STATE.currentUser) return STATE.currentUser;
    const session = safeJSONParse(localStorage.getItem('colaborador_session'), null);
    STATE.currentUser = session || { id: 'col-001', name: 'André Gusmão', email: 'andre@bpi.com.br', role: 'PMO_Comercial', avatar: 'AG' };
    return STATE.currentUser;
  }

  function getCurrentAdmin() {
    if (STATE.currentAdmin) return STATE.currentAdmin;
    const session = safeJSONParse(localStorage.getItem('adminSession'), null);
    STATE.currentAdmin = session;
    return STATE.currentAdmin;
  }

  function requireColaborador() {
    const user = getCurrentUser();
    const tag = document.getElementById('userTag');
    if (tag) tag.textContent = `${user.name} (${user.id})`;
  }

  function requireAdmin() {
    const admin = getCurrentAdmin();
    if (!admin) {
      window.location.href = '../admin/login-admin.html';
      return false;
    }
    const tag = document.getElementById('adminTag');
    if (tag) tag.textContent = `${admin.nome || admin.name || admin.email || 'Admin'}`;
    return true;
  }

  function getCatalogo() {
    return read(KEYS.catalogo, []);
  }

  function setCatalogo(catalogo) {
    write(KEYS.catalogo, catalogo);
  }

  function getBancos() {
    return read(KEYS.bancoQuestoes, []);
  }

  function getProgressoAtual() {
    const user = getCurrentUser();
    const progresso = read(progressKey(user.id), null) || read(KEYS.progresso, { colaboradorId: user.id, colaboradorNome: user.name, historico: [] });
    if (!Array.isArray(progresso.historico)) progresso.historico = [];
    progresso.colaboradorId = user.id;
    progresso.colaboradorNome = user.name;
    return progresso;
  }

  function saveProgressoAtual(progresso) {
    write(progressKey(progresso.colaboradorId), progresso);
    write(KEYS.progresso, progresso);
    upsertProgressList(progresso);
  }

  function upsertProgressList(progresso) {
    const lista = read(KEYS.progressoLista, []);
    const idx = lista.findIndex((item) => item.colaboradorId === progresso.colaboradorId);
    const payload = {
      colaboradorId: progresso.colaboradorId,
      colaboradorNome: progresso.colaboradorNome,
      historico: progresso.historico
    };
    if (idx >= 0) lista[idx] = payload;
    else lista.push(payload);
    write(KEYS.progressoLista, lista);
  }

  function getHistoricoTreinamento(treinamentoId, createIfMissing = false) {
    const progresso = getProgressoAtual();
    let hist = progresso.historico.find((item) => item.treinamentoId === treinamentoId);
    if (!hist && createIfMissing) {
      hist = {
        treinamentoId,
        status: 'em_andamento',
        dataInicio: new Date().toISOString(),
        dataConclusao: null,
        notaFinal: null,
        ultimoVideoIndex: 0,
        progresso: [],
        tentativas: []
      };
      progresso.historico.push(hist);
      saveProgressoAtual(progresso);
    }
    return { hist, progresso };
  }

  function updateVideoProgress(treinamentoId, videoId, percentual, tempoAssistido, videoIndex) {
    const { hist, progresso } = getHistoricoTreinamento(treinamentoId, true);
    const treinamento = getTrainingById(treinamentoId);
    let item = hist.progresso.find((p) => p.videoId === videoId);
    if (!item) {
      item = { videoId, percentual: 0, tempoAssistido: 0, dataVista: null };
      hist.progresso.push(item);
    }
    item.percentual = Math.max(item.percentual, Math.min(100, Math.round(percentual)));
    item.tempoAssistido = Math.max(item.tempoAssistido || 0, Math.round(tempoAssistido || 0));
    item.dataVista = new Date().toISOString();
    hist.ultimoVideoIndex = Math.max(hist.ultimoVideoIndex || 0, videoIndex || 0);
    const videosTotais = Array.isArray(treinamento?.videos) ? treinamento.videos.length : 0;
    const videosConcluidos = hist.progresso.filter((p) => p.percentual >= 90).length;
    if (videosTotais > 0 && videosConcluidos >= videosTotais) hist.status = 'concluido';
    saveProgressoAtual(progresso);
    return item;
  }

  function getTrainingStatusForUser(treinamento) {
    const progresso = getProgressoAtual();
    const hist = progresso.historico.find((h) => h.treinamentoId === treinamento.id);
    const cert = read(KEYS.certificados, []).find((c) => c.treinamentoId === treinamento.id && c.colaboradorId === progresso.colaboradorId);
    if (cert) {
      return { status: 'concluido', label: 'Concluído ✓', percentual: 100, action: 'certificado' };
    }
    if (!hist) return { status: 'disponivel', label: 'Disponível', percentual: 0, action: 'iniciar' };
    const total = treinamento.videos.length;
    const completos = hist.progresso.filter((p) => p.percentual >= 90).length;
    const percentual = total ? Math.round((completos / total) * 100) : 0;
    if (percentual >= 100 && (hist.notaFinal || 0) >= treinamento.prova.notaMinima) {
      return { status: 'concluido', label: 'Concluído ✓', percentual: 100, action: 'certificado' };
    }
    return { status: 'em_andamento', label: 'Em andamento', percentual, action: 'continuar', videoIndex: hist.ultimoVideoIndex || 0 };
  }

  function startCatalogPage() {
    requireColaborador();
    const statusSelect = document.getElementById('filterStatus');
    const diffSelect = document.getElementById('filterDificuldade');
    const searchInput = document.getElementById('filterBusca');
    const list = document.getElementById('catalogoGrid');

    function render() {
      const status = statusSelect.value;
      const diff = diffSelect.value;
      const q = searchInput.value.trim().toLowerCase();
      const treinamentos = getCatalogo().filter((t) => {
        const userStatus = getTrainingStatusForUser(t).status;
        const matchesStatus = !status || userStatus === status;
        const matchesDiff = !diff || t.dificuldade === diff;
        const matchesQ = !q || t.titulo.toLowerCase().includes(q) || t.descricao.toLowerCase().includes(q);
        return matchesStatus && matchesDiff && matchesQ;
      });

      if (!treinamentos.length) {
        list.innerHTML = '<div class="card">Nenhum treinamento encontrado para os filtros selecionados.</div>';
        return;
      }

      list.innerHTML = treinamentos.map((t) => {
        const st = getTrainingStatusForUser(t);
        const actionLabel = st.action === 'continuar' ? 'Continuar' : (st.action === 'certificado' ? 'Ver Certificado' : 'Iniciar');
        const href = st.action === 'certificado'
          ? `./meu-historico.html`
          : `./video.html?id=${encodeURIComponent(t.id)}&videoIndex=${encodeURIComponent(st.videoIndex || 0)}`;
        return `
          <article class="card training-card">
            <img src="${esc(t.thumbnail || '')}" alt="Thumbnail ${esc(t.titulo)}" loading="lazy" />
            <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:start;">
              <h3 style="margin:0;font-size:1.05rem;">${esc(t.titulo)}</h3>
              <span class="badge ${esc(st.status)}">${esc(st.label)}</span>
            </div>
            <p style="margin:.2rem 0 .4rem 0;color:#4b5563;">${esc(t.descricao)}</p>
            <div class="meta">
              <span>⏱ ${esc(t.duracao)}h</span>
              <span>🎯 ${esc(t.dificuldade)}</span>
              <span>⭐ ${esc(t.rating)}</span>
              <span>👩‍🏫 ${esc(t.instrutora)}</span>
            </div>
            ${st.status === 'em_andamento' ? `<div><div class="progress"><span style="width:${st.percentual}%;"></span></div><small>${st.percentual}%</small></div>` : ''}
            <div style="display:flex;gap:.5rem;">
              <a class="btn primary" href="${href}">${actionLabel}</a>
            </div>
          </article>
        `;
      }).join('');
    }

    [statusSelect, diffSelect, searchInput].forEach((el) => el.addEventListener('input', render));
    render();
  }

  function getTrainingById(id) {
    return getCatalogo().find((t) => t.id === id) || null;
  }

  function startVideoPage() {
    requireColaborador();
    const params = new URLSearchParams(window.location.search);
    const treinamentoId = params.get('id') || '';
    const videoIndexParam = Number(params.get('videoIndex') || 0);
    const treinamento = getTrainingById(treinamentoId);
    const container = document.getElementById('videoContainer');

    if (!treinamento) {
      container.innerHTML = '<div class="card">Treinamento não encontrado.</div>';
      return;
    }

    const videos = treinamento.videos || [];
    const maxIndex = Math.max(0, videos.length - 1);
    const videoIndex = Math.min(Math.max(0, videoIndexParam), maxIndex);
    const video = videos[videoIndex];

    const { hist } = getHistoricoTreinamento(treinamento.id, true);
    const videoProgress = hist.progresso.find((p) => p.videoId === video.id);
    const locked = videoIndex > 0 && !(hist.progresso.find((p) => p.videoId === videos[videoIndex - 1].id)?.percentual >= 90);

    if (locked) {
      container.innerHTML = `<div class="card">Você precisa concluir o vídeo anterior em pelo menos 90% para avançar.<br><br><a class="btn primary" href="./video.html?id=${encodeURIComponent(treinamento.id)}&videoIndex=${videoIndex - 1}">Voltar ao vídeo anterior</a></div>`;
      return;
    }

    container.innerHTML = `
      <div class="video-layout">
        <section class="card">
          <h2 style="margin-top:0;">${esc(video.titulo)}</h2>
          <p>${esc(video.descricao || '')}</p>
          <video id="videoPlayer" controls preload="metadata">
            <source src="${esc(video.url || FALLBACK_VIDEO)}" type="video/mp4" />
          </video>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.6rem;">
            <div class="timer" id="videoTime">00:00:00 / 00:00:00</div>
            <div style="display:flex;gap:.4rem;align-items:center;">
              <label for="playbackSpeed">Velocidade</label>
              <select id="playbackSpeed" style="width:auto;">
                <option value="0.75">0.75x</option>
                <option value="1" selected>1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
              <a class="btn light" href="#" id="legendaBtn">Legenda (stub)</a>
            </div>
          </div>
          <div style="margin-top:.6rem;">
            <div class="progress"><span id="videoProgressBar" style="width:${videoProgress?.percentual || 0}%;"></span></div>
            <small id="videoProgressTxt">${videoProgress?.percentual || 0}% concluído</small>
          </div>
          <div class="quiz-mini" id="quizMini" hidden>
            <strong>Mini Quiz:</strong>
            <p id="miniQuizPergunta"></p>
            <div id="miniQuizOpcoes"></div>
            <small id="miniQuizResultado"></small>
          </div>
          <div style="display:flex;gap:.5rem;margin-top:.8rem;" class="actions-print-hide">
            <a class="btn light" href="./catalogo.html">Voltar ao catálogo</a>
            <a id="nextVideoBtn" class="btn primary" href="#" aria-disabled="true">Próximo vídeo</a>
            <a id="startExamBtn" class="btn secondary" href="./prova.html?id=${encodeURIComponent(treinamento.id)}">Iniciar prova</a>
          </div>
        </section>
        <aside class="card">
          <h3 style="margin-top:0;">Treinamento</h3>
          <p><strong>${esc(treinamento.titulo)}</strong></p>
          <p class="notice">Duração do vídeo: ${Math.round((video.duracao || 0) / 60)} min</p>
          <h4>Objetivos de aprendizado</h4>
          <ul>${(treinamento.objetivos || []).map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
          <h4>Recursos</h4>
          <ul>${(treinamento.recursos || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          <h4>Playlist</h4>
          <ol>
            ${videos.map((v, idx) => {
              const p = hist.progresso.find((pg) => pg.videoId === v.id)?.percentual || 0;
              const className = idx === videoIndex ? ' style="font-weight:700;"' : '';
              return `<li${className}>${esc(v.titulo)} (${p}%)</li>`;
            }).join('')}
          </ol>
        </aside>
      </div>
    `;

    const player = document.getElementById('videoPlayer');
    const speed = document.getElementById('playbackSpeed');
    const time = document.getElementById('videoTime');
    const progressBar = document.getElementById('videoProgressBar');
    const progressTxt = document.getElementById('videoProgressTxt');
    const nextBtn = document.getElementById('nextVideoBtn');
    const examBtn = document.getElementById('startExamBtn');
    const legendaBtn = document.getElementById('legendaBtn');
    const quizBox = document.getElementById('quizMini');
    const quizPergunta = document.getElementById('miniQuizPergunta');
    const quizOpcoes = document.getElementById('miniQuizOpcoes');
    const quizResultado = document.getElementById('miniQuizResultado');

    if (videoProgress?.tempoAssistido) {
      player.currentTime = Math.min(videoProgress.tempoAssistido, video.duracao || videoProgress.tempoAssistido);
    }

    function unlockActions(percentualAtual) {
      const liberado = percentualAtual >= 90;
      const isLast = videoIndex >= videos.length - 1;
      if (!isLast) {
        nextBtn.href = liberado ? `./video.html?id=${encodeURIComponent(treinamento.id)}&videoIndex=${videoIndex + 1}` : '#';
        nextBtn.textContent = liberado ? 'Próximo vídeo liberado' : 'Próximo vídeo (bloqueado até 90%)';
        nextBtn.classList.toggle('secondary', liberado);
      } else {
        nextBtn.style.display = 'none';
      }
      examBtn.style.display = isLast ? 'inline-block' : 'none';
      if (isLast && !liberado) {
        examBtn.classList.add('light');
        examBtn.classList.remove('secondary');
        examBtn.href = '#';
        examBtn.textContent = 'Iniciar prova (liberado em 90%)';
      } else if (isLast) {
        examBtn.classList.add('secondary');
        examBtn.classList.remove('light');
        examBtn.href = `./prova.html?id=${encodeURIComponent(treinamento.id)}`;
        examBtn.textContent = 'Iniciar prova';
      }
    }

    function tick() {
      const duration = Number(player.duration || video.duracao || 0);
      const current = Number(player.currentTime || 0);
      const percentual = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
      progressBar.style.width = `${percentual.toFixed(1)}%`;
      progressTxt.textContent = `${Math.round(percentual)}% concluído`;
      time.textContent = `${formatDuration(current)} / ${formatDuration(duration)}`;
      unlockActions(percentual);
    }

    speed.addEventListener('change', () => { player.playbackRate = Number(speed.value || 1); });
    player.addEventListener('timeupdate', tick);
    player.addEventListener('loadedmetadata', tick);

    legendaBtn.addEventListener('click', (event) => {
      event.preventDefault();
      alert('Legenda disponível em breve (stub).');
    });

    nextBtn.addEventListener('click', (event) => {
      if (nextBtn.getAttribute('href') === '#') {
        event.preventDefault();
        alert('Conclua ao menos 90% deste vídeo para avançar.');
      }
    });

    examBtn.addEventListener('click', (event) => {
      if (examBtn.getAttribute('href') === '#') {
        event.preventDefault();
        alert('Conclua ao menos 90% do último vídeo para iniciar a prova.');
      }
    });

    function renderMiniQuiz() {
      const mini = [
        {
          pergunta: 'Qual é o primeiro passo recomendado após assistir ao conteúdo?',
          opcoes: ['Aplicar o checklist no projeto atual', 'Pular para outro módulo sem revisão', 'Ignorar métricas'],
          correta: 0
        },
        {
          pergunta: 'A governança efetiva depende de:',
          opcoes: ['Evidências e monitoramento contínuo', 'Ações sem processo', 'Somente ferramentas'],
          correta: 0
        }
      ];
      const q = mini[videoIndex % mini.length];
      quizPergunta.textContent = q.pergunta;
      quizOpcoes.innerHTML = q.opcoes.map((op, i) => `<button type="button" class="btn light" data-alt="${i}" style="margin:.2rem;">${esc(op)}</button>`).join('');
      quizBox.hidden = false;
      quizOpcoes.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ok = Number(btn.dataset.alt) === q.correta;
          quizResultado.textContent = ok ? '✅ Correto! Ótima fixação.' : '⚠️ Revise o conteúdo deste tópico.';
        });
      });
    }

    player.addEventListener('ended', renderMiniQuiz);

    if (STATE.progressTimer) window.clearInterval(STATE.progressTimer);
    STATE.progressTimer = window.setInterval(() => {
      const duration = Number(player.duration || video.duracao || 0);
      const current = Number(player.currentTime || 0);
      if (duration > 0 && current >= 0) {
        const percentual = (current / duration) * 100;
        updateVideoProgress(treinamento.id, video.id, percentual, current, videoIndex);
      }
    }, 5000);

    window.addEventListener('beforeunload', () => {
      const duration = Number(player.duration || video.duracao || 0);
      const current = Number(player.currentTime || 0);
      if (duration > 0) {
        const percentual = (current / duration) * 100;
        updateVideoProgress(treinamento.id, video.id, percentual, current, videoIndex);
      }
    });

    unlockActions(videoProgress?.percentual || 0);
    tick();
  }

  function getTentativaKey(treinamentoId) {
    return `treinamentos_tentativa_${getCurrentUser().id}_${treinamentoId}`;
  }

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startProvaPage() {
    requireColaborador();
    const params = new URLSearchParams(window.location.search);
    const treinamentoId = params.get('id') || '';
    const treinamento = getTrainingById(treinamentoId);
    const app = document.getElementById('provaApp');

    if (!treinamento) {
      app.innerHTML = '<div class="card">Treinamento não encontrado.</div>';
      return;
    }

    const { hist } = getHistoricoTreinamento(treinamento.id, true);
    const videosConcluidos = (hist.progresso || []).filter((p) => p.percentual >= 90).length;
    if (videosConcluidos < treinamento.videos.length) {
      app.innerHTML = `<div class="card">Para iniciar a prova você deve concluir todos os vídeos com ao menos 90%.<br><br><a class="btn primary" href="./video.html?id=${encodeURIComponent(treinamento.id)}&videoIndex=${hist.ultimoVideoIndex || 0}">Retomar vídeos</a></div>`;
      return;
    }

    const banco = getBancos().find((b) => b.id === treinamento.prova.bancoDadosId);
    if (!banco || !Array.isArray(banco.questoes) || banco.questoes.length < 30) {
      app.innerHTML = '<div class="card">Banco de questões indisponível para este treinamento.</div>';
      return;
    }

    const key = getTentativaKey(treinamento.id);
    let tentativa = read(key, null);
    if (!tentativa || tentativa.finalizada) {
      const selecionadas = shuffle(banco.questoes).slice(0, treinamento.prova.totalQuestoes);
      tentativa = {
        treinamentoId: treinamento.id,
        colaboradorId: getCurrentUser().id,
        iniciadaEm: new Date().toISOString(),
        tempoLimiteMinutos: treinamento.prova.tempoLimiteMinutos,
        questoes: selecionadas,
        respostas: {},
        marcadas: [],
        indiceAtual: 0,
        finalizada: false
      };
      write(key, tentativa);
    }

    STATE.provaData = tentativa;

    app.innerHTML = `
      <div class="grid cols-2">
        <section class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;">
            <h2 style="margin:.2rem 0;">Prova - ${esc(treinamento.titulo)}</h2>
            <div class="timer" id="provaTimer">--:--:--</div>
          </div>
          <p id="provaIndicador" class="notice"></p>
          <div id="questaoBox"></div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem;">
            <button class="btn light" id="btnAnterior" type="button">Anterior</button>
            <button class="btn light" id="btnPular" type="button">Pular</button>
            <button class="btn light" id="btnMarcar" type="button">Marcar revisão</button>
            <button class="btn secondary" id="btnProxima" type="button">Próxima</button>
            <button class="btn primary" id="btnEnviar" type="button">Enviar Prova</button>
          </div>
          <div id="resultadoBox" style="margin-top:1rem;"></div>
        </section>
        <aside class="card">
          <h3 style="margin-top:.2rem;">Painel de revisão</h3>
          <div id="painelRevisao" class="panel-revisao"></div>
          <p class="notice" style="margin-top:.7rem;">🟩 Respondida | Borda laranja = marcada para revisão</p>
        </aside>
      </div>
    `;

    const timerEl = document.getElementById('provaTimer');
    const indicador = document.getElementById('provaIndicador');
    const questaoBox = document.getElementById('questaoBox');
    const painel = document.getElementById('painelRevisao');
    const resultadoBox = document.getElementById('resultadoBox');

    function saveTentativa() {
      write(key, STATE.provaData);
    }

    function renderPainel() {
      painel.innerHTML = STATE.provaData.questoes.map((q, idx) => {
        const answered = Object.prototype.hasOwnProperty.call(STATE.provaData.respostas, q.id) ? 'resp' : '';
        const marked = STATE.provaData.marcadas.includes(q.id) ? 'mark' : '';
        return `<button class="${answered} ${marked}" type="button" data-i="${idx}">${idx + 1}</button>`;
      }).join('');
      painel.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          STATE.provaData.indiceAtual = Number(btn.dataset.i);
          saveTentativa();
          renderQuestao();
        });
      });
    }

    function renderQuestao() {
      const idx = STATE.provaData.indiceAtual;
      const q = STATE.provaData.questoes[idx];
      if (!q) return;
      indicador.textContent = `Questão ${idx + 1} de ${STATE.provaData.questoes.length}`;
      const selected = STATE.provaData.respostas[q.id];
      const marcado = STATE.provaData.marcadas.includes(q.id);
      questaoBox.innerHTML = `
        <p><strong>${esc(q.pergunta)}</strong></p>
        ${q.imagem ? `<img src="${esc(q.imagem)}" alt="Imagem da questão" style="max-width:100%;border-radius:8px;">` : ''}
        <div class="question-options">
          ${q.opcoes.map((opt, i) => `
            <label>
              <input type="radio" name="opcaoQuestao" value="${i}" ${selected === i ? 'checked' : ''}/>
              ${esc(opt)}
            </label>
          `).join('')}
        </div>
        <p class="notice">Tópico: ${esc(q.topico || 'Geral')} | Marcada para revisão: ${marcado ? 'Sim' : 'Não'}</p>
      `;

      questaoBox.querySelectorAll('input[name="opcaoQuestao"]').forEach((input) => {
        input.addEventListener('change', () => {
          STATE.provaData.respostas[q.id] = Number(input.value);
          saveTentativa();
          renderPainel();
        });
      });
    }

    function finalizar(forceTimeout = false) {
      if (STATE.provaData.finalizada) return;
      if (!forceTimeout) {
        const confirmar = window.confirm('Confirma o envio da prova? Você não poderá alterar respostas depois.');
        if (!confirmar) return;
      }

      STATE.provaData.finalizada = true;
      STATE.provaData.finalizadaEm = new Date().toISOString();
      saveTentativa();

      const total = STATE.provaData.questoes.length;
      let acertos = 0;
      const topicos = {};
      const erros = [];

      STATE.provaData.questoes.forEach((q) => {
        const resposta = STATE.provaData.respostas[q.id];
        const topico = q.topico || 'Geral';
        if (!topicos[topico]) topicos[topico] = { total: 0, acertos: 0 };
        topicos[topico].total += 1;
        if (resposta === q.correta) {
          acertos += 1;
          topicos[topico].acertos += 1;
        } else {
          erros.push({ pergunta: q.pergunta, correta: q.opcoes[q.correta], explicacao: q.explicacao });
        }
      });

      const nota = Math.round((acertos / total) * 100);
      const tempo = Math.max(0, (new Date(STATE.provaData.finalizadaEm).getTime() - new Date(STATE.provaData.iniciadaEm).getTime()) / 1000);
      const aprovado = nota >= treinamento.prova.notaMinima;

      const { hist, progresso } = getHistoricoTreinamento(treinamento.id, true);
      hist.notaFinal = nota;
      hist.dataConclusao = new Date().toISOString();
      hist.status = aprovado ? 'concluido' : 'em_andamento';
      hist.tentativas = hist.tentativas || [];
      hist.tentativas.push({ data: new Date().toISOString(), nota, acertos, total, tempoSegundos: tempo, topicos });
      saveProgressoAtual(progresso);

      let cert = null;
      if (aprovado) cert = emitCertificate(treinamento, nota);

      resultadoBox.innerHTML = `
        <div class="card" style="border-color:${aprovado ? '#16a34a' : '#dc2626'};">
          <h3 style="margin-top:0;">${aprovado ? '✅ Aprovado! Certificado liberado.' : '❌ Reprovado. Tente novamente.'}</h3>
          <p><strong>Nota final:</strong> ${nota}% | <strong>Acertos:</strong> ${acertos}/${total} | <strong>Tempo:</strong> ${formatDuration(tempo)}</p>
          <h4>Análise por tópico</h4>
          <ul>${Object.entries(topicos).map(([t, data]) => `<li>${esc(t)}: ${data.acertos}/${data.total}</li>`).join('')}</ul>
          ${aprovado && cert ? `<p class="notice">Email simulado de aprovação registrado em <code>${KEYS.emails}</code>.</p>
          <a class="btn primary" href="./certificado.html?id=${encodeURIComponent(cert.id)}">Ver Certificado</a>` : `<p>Revise as questões incorretas abaixo e retome o treinamento.</p>
          <a class="btn light" href="./video.html?id=${encodeURIComponent(treinamento.id)}&videoIndex=0">Retomar Treinamento</a>`}
          ${!aprovado ? `<details style="margin-top:.6rem;"><summary>Questões para revisão</summary><ul>${erros.map((e) => `<li><strong>${esc(e.pergunta)}</strong><br>Correta: ${esc(e.correta)}<br><small>${esc(e.explicacao)}</small></li>`).join('')}</ul></details>` : ''}
        </div>
      `;

      document.getElementById('btnEnviar').disabled = true;
      if (STATE.provaTimer) window.clearInterval(STATE.provaTimer);
    }

    function updateTimer() {
      const inicio = new Date(STATE.provaData.iniciadaEm).getTime();
      const limite = STATE.provaData.tempoLimiteMinutos * 60;
      const elapsed = Math.floor((Date.now() - inicio) / 1000);
      const remaining = Math.max(0, limite - elapsed);
      timerEl.textContent = formatDuration(remaining);
      timerEl.classList.toggle('warn', remaining <= 300);
      if (remaining <= 0) {
        finalizar(true);
      }
    }

    document.getElementById('btnAnterior').addEventListener('click', () => {
      STATE.provaData.indiceAtual = Math.max(0, STATE.provaData.indiceAtual - 1);
      saveTentativa();
      renderQuestao();
      renderPainel();
    });

    document.getElementById('btnProxima').addEventListener('click', () => {
      STATE.provaData.indiceAtual = Math.min(STATE.provaData.questoes.length - 1, STATE.provaData.indiceAtual + 1);
      saveTentativa();
      renderQuestao();
      renderPainel();
    });

    document.getElementById('btnPular').addEventListener('click', () => {
      STATE.provaData.indiceAtual = Math.min(STATE.provaData.questoes.length - 1, STATE.provaData.indiceAtual + 1);
      saveTentativa();
      renderQuestao();
      renderPainel();
    });

    document.getElementById('btnMarcar').addEventListener('click', () => {
      const q = STATE.provaData.questoes[STATE.provaData.indiceAtual];
      if (!q) return;
      const idx = STATE.provaData.marcadas.indexOf(q.id);
      if (idx >= 0) STATE.provaData.marcadas.splice(idx, 1);
      else STATE.provaData.marcadas.push(q.id);
      saveTentativa();
      renderQuestao();
      renderPainel();
    });

    document.getElementById('btnEnviar').addEventListener('click', () => finalizar(false));

    renderPainel();
    renderQuestao();
    updateTimer();
    if (STATE.provaTimer) window.clearInterval(STATE.provaTimer);
    STATE.provaTimer = window.setInterval(updateTimer, 1000);
  }

  function generateValidationCode(cert) {
    const base = `${cert.colaboradorId}|${cert.treinamentoId}|${cert.dataConclusao}|${cert.notaFinal}`;
    let hash = 0;
    for (let i = 0; i < base.length; i += 1) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    return Math.abs(hash).toString(36).toUpperCase().padStart(12, '0').slice(0, 12);
  }

  function emitCertificate(treinamento, nota) {
    const certs = read(KEYS.certificados, []);
    const user = getCurrentUser();
    const existing = certs.find((c) => c.colaboradorId === user.id && c.treinamentoId === treinamento.id);
    if (existing) return existing;

    const year = new Date().getFullYear();
    const seq = String(certs.length + 1).padStart(5, '0');
    const dataConclusao = new Date().toISOString();
    const dataValidade = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const cert = {
      id: `cert-${year}-${seq}`,
      colaboradorId: user.id,
      colaboradorNome: user.name,
      treinamentoId: treinamento.id,
      treinamentoNome: treinamento.titulo,
      numero: `CERT-${year}-${seq}-${initials(user.name)}`,
      codigoValidacao: '',
      dataConclusao,
      notaFinal: nota,
      dataValidade,
      compartilhadoLinkedin: false,
      dataCompartilhamento: null
    };
    cert.codigoValidacao = generateValidationCode(cert);
    certs.push(cert);
    write(KEYS.certificados, certs);

    const emails = read(KEYS.emails, []);
    emails.push({
      para: user.email || `${user.id}@bpi.com.br`,
      assunto: `Aprovação no treinamento ${treinamento.titulo}`,
      corpo: `Parabéns ${user.name}, você foi aprovado com ${nota}% no treinamento ${treinamento.titulo}. Certificado ${cert.numero}.`,
      dataEnvio: new Date().toISOString(),
      tipo: 'aprovacao_treinamento'
    });
    write(KEYS.emails, emails);
    return cert;
  }

  function qrSvgData(text) {
    const size = 21;
    const cells = [];
    let seed = 0;
    for (let i = 0; i < text.length; i += 1) seed = (seed + text.charCodeAt(i) * (i + 1)) % 9973;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const finder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        let dark = finder ? (x === 0 || y === 0 || x === 6 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) : false;
        if (!finder) dark = ((x * y + seed + x + y) % 3) === 0;
        if (dark) cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="#111"/>`);
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${cells.join('')}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function startCertificadoPage() {
    const user = getCurrentUser();
    requireColaborador();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    const cert = read(KEYS.certificados, []).find((c) => c.id === id);
    const app = document.getElementById('certificadoApp');

    if (!cert) {
      app.innerHTML = '<div class="card">Certificado não encontrado.</div>';
      return;
    }
    if (cert.colaboradorId !== user.id) {
      app.innerHTML = '<div class="card">Você não tem permissão para visualizar este certificado.</div>';
      return;
    }

    const validationLink = `${window.location.origin}${window.location.pathname.replace('certificado.html', 'validar-certificado.html')}?codigo=${encodeURIComponent(cert.codigoValidacao)}`;

    app.innerHTML = `
      <div class="card cert">
        <div style="font-size:1.2rem;">BPI Governança</div>
        <h1 class="title">Certificado Oficial</h1>
        <p>Certificamos que</p>
        <h2 style="margin:.2rem 0 1rem 0;">${esc(cert.colaboradorNome)}</h2>
        <p>concluiu com sucesso o treinamento</p>
        <h3 style="margin:.2rem 0 1rem 0;">${esc(cert.treinamentoNome)}</h3>
        <p>com nota final <strong>${esc(cert.notaFinal)}%</strong> em ${formatDate(cert.dataConclusao)}.</p>
        <p class="number">${esc(cert.numero)}</p>
        <p>Código de validação: <strong>${esc(cert.codigoValidacao)}</strong></p>
        <div class="cert-grid">
          <div>
            <img src="${qrSvgData(validationLink)}" alt="QR de validação" style="width:140px;height:140px;border:1px solid #d1d5db;"/>
            <div><small>Validação pública</small></div>
          </div>
          <div>
            <img src="${qrSvgData(`assinatura:${cert.numero}`)}" alt="Assinatura digital simulada" style="width:140px;height:140px;border:1px solid #d1d5db;"/>
            <div><small>Assinatura digital (simulada)</small></div>
          </div>
        </div>
        <p>Validade até: <strong>${formatDate(cert.dataValidade)}</strong></p>
        <div class="actions-print-hide" style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-top:1rem;">
          <a class="btn light" id="downloadPdf" href="#">Download PDF (simulado)</a>
          <a class="btn secondary" id="shareLinkedin" href="#">Compartilhar no LinkedIn</a>
          <button class="btn primary" type="button" id="printCert">Imprimir</button>
          <a class="btn light" href="./catalogo.html">Retornar ao catálogo</a>
        </div>
        <div class="notice actions-print-hide" style="margin-top:.8rem;">Validação: <a href="${validationLink}">${validationLink}</a></div>
      </div>
    `;

    document.getElementById('downloadPdf').addEventListener('click', (event) => {
      event.preventDefault();
      alert('Download PDF simulado. Utilize a opção Imprimir para salvar em PDF.');
    });

    document.getElementById('printCert').addEventListener('click', () => window.print());

    document.getElementById('shareLinkedin').addEventListener('click', (event) => {
      event.preventDefault();
      const text = `Concluí o treinamento ${cert.treinamentoNome} na BPI Governança com nota ${cert.notaFinal}%! Certificado ${cert.numero}.`;
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(validationLink)}&summary=${encodeURIComponent(text)}`;
      const certs = read(KEYS.certificados, []);
      const idx = certs.findIndex((c) => c.id === cert.id);
      if (idx >= 0) {
        certs[idx].compartilhadoLinkedin = true;
        certs[idx].dataCompartilhamento = new Date().toISOString();
        write(KEYS.certificados, certs);
      }
      window.open(url, '_blank', 'noopener');
    });
  }

  function startValidacaoPage() {
    const app = document.getElementById('validacaoApp');
    const params = new URLSearchParams(window.location.search);
    const codigoQ = params.get('codigo') || '';

    app.innerHTML = `
      <div class="card">
        <h2 style="margin-top:0;">Validação de Certificado</h2>
        <p>Esse certificado foi emitido por BPI Governança.</p>
        <div class="filters" style="margin-bottom:.6rem;">
          <input class="input" id="codigoInput" placeholder="Informe o código de validação" value="${esc(codigoQ)}" />
          <button class="btn primary" id="buscarCodigo" type="button">Validar</button>
        </div>
        <div id="validacaoResultado"></div>
      </div>
    `;

    const out = document.getElementById('validacaoResultado');
    function validar() {
      const codigo = document.getElementById('codigoInput').value.trim().toUpperCase();
      const certs = read(KEYS.certificados, []);
      const cert = certs.find((c) => String(c.codigoValidacao || '').toUpperCase() === codigo || String(c.numero || '').toUpperCase() === codigo);
      if (!cert) {
        out.innerHTML = '<div class="card" style="border-color:#dc2626;"><strong>Status: Inválido</strong><p>Nenhum certificado encontrado para o código informado.</p></div>';
        return;
      }
      const expirado = new Date(cert.dataValidade).getTime() < Date.now();
      const status = expirado ? 'Expirado' : 'Válido';
      const color = expirado ? '#f59e0b' : '#16a34a';
      const validationLink = `${window.location.origin}${window.location.pathname}?codigo=${encodeURIComponent(cert.codigoValidacao)}`;
      out.innerHTML = `
        <div class="card" style="border-color:${color};">
          <h3 style="margin-top:0;">Status: ${status}</h3>
          <p><strong>Colaborador:</strong> ${esc(cert.colaboradorNome)}</p>
          <p><strong>Treinamento:</strong> ${esc(cert.treinamentoNome)}</p>
          <p><strong>Data de conclusão:</strong> ${formatDate(cert.dataConclusao)}</p>
          <p><strong>Nota final:</strong> ${esc(cert.notaFinal)}%</p>
          <p><strong>Validade:</strong> ${formatDate(cert.dataValidade)}</p>
          <a class="btn secondary" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(validationLink)}" target="_blank" rel="noopener">Compartilhar no LinkedIn</a>
        </div>
      `;
    }

    document.getElementById('buscarCodigo').addEventListener('click', validar);
    if (codigoQ) validar();
  }

  function startHistoricoPage() {
    requireColaborador();
    const listEl = document.getElementById('historicoList');
    const filtroStatus = document.getElementById('histFilterStatus');
    const ordenacao = document.getElementById('histSort');

    function render() {
      const status = filtroStatus.value;
      const sort = ordenacao.value;
      const progresso = getProgressoAtual();
      const catalogo = getCatalogo();
      const certs = read(KEYS.certificados, []).filter((c) => c.colaboradorId === progresso.colaboradorId);

      let rows = progresso.historico.map((h) => {
        const treino = catalogo.find((t) => t.id === h.treinamentoId);
        if (!treino) return null;
        const cert = certs.find((c) => c.treinamentoId === h.treinamentoId);
        const horas = (h.progresso || []).reduce((acc, p) => acc + Number(p.tempoAssistido || 0), 0);
        const statusView = cert ? 'certificado' : h.status;
        return { h, treino, cert, horas, statusView };
      }).filter(Boolean);

      rows = rows.filter((r) => !status || status === 'todos' || r.statusView === status);

      rows.sort((a, b) => {
        if (sort === 'data_desc') return new Date(b.h.dataConclusao || b.h.dataInicio || 0) - new Date(a.h.dataConclusao || a.h.dataInicio || 0);
        if (sort === 'nota_desc') return (b.h.notaFinal || 0) - (a.h.notaFinal || 0);
        return a.treino.titulo.localeCompare(b.treino.titulo, 'pt-BR');
      });

      if (!rows.length) {
        listEl.innerHTML = '<div class="card">Nenhum registro para os filtros selecionados.</div>';
        return;
      }

      listEl.innerHTML = rows.map((r) => `
        <article class="card">
          <div style="display:grid;grid-template-columns:120px 1fr;gap:1rem;align-items:start;">
            <img src="${esc(r.treino.thumbnail)}" alt="${esc(r.treino.titulo)}" style="width:120px;height:80px;border-radius:8px;object-fit:cover;"/>
            <div>
              <h3 style="margin:.1rem 0;">${esc(r.treino.titulo)} ${r.cert ? '🏆' : ''}</h3>
              <p style="margin:.2rem 0;color:#4b5563;">${esc(r.treino.modalidade)} • ${esc(r.treino.dificuldade)}</p>
              <div class="meta">
                <span>Status: <strong>${esc(r.cert ? 'Certificado' : r.h.status)}</strong></span>
                <span>Início: ${formatDate(r.h.dataInicio)}</span>
                <span>Conclusão: ${formatDate(r.h.dataConclusao)}</span>
                <span>Nota: ${r.h.notaFinal ?? '-'}</span>
                <span>Horas investidas: ${formatHours(r.horas)}h</span>
              </div>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.6rem;">
                <a class="btn light" href="./video.html?id=${encodeURIComponent(r.treino.id)}&videoIndex=${r.h.ultimoVideoIndex || 0}">Retomar</a>
                <a class="btn light" href="./prova.html?id=${encodeURIComponent(r.treino.id)}">Revisar Prova</a>
                ${r.cert ? `<a class="btn primary" href="./certificado.html?id=${encodeURIComponent(r.cert.id)}">Baixar Certificado</a>
                <a class="btn secondary" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/treinamentos/validar-certificado.html?codigo=' + r.cert.codigoValidacao)}">Compartilhar Certificado</a>` : '<span class="notice">Aguardando aprovação</span>'}
              </div>
            </div>
          </div>
        </article>
      `).join('');
    }

    filtroStatus.addEventListener('change', render);
    ordenacao.addEventListener('change', render);
    render();
  }

  function startRelatoriosPage() {
    const user = getCurrentUser();
    const adminSession = getCurrentAdmin();
    const isAdmin = !!(adminSession && adminSession.type === 'admin');
    const tag = document.getElementById('viewerTag');
    if (tag) tag.textContent = isAdmin ? 'Admin (todos os colaboradores)' : `${user.name} (somente seus dados)`;

    const progressoLista = read(KEYS.progressoLista, []);
    const data = isAdmin ? progressoLista : progressoLista.filter((p) => p.colaboradorId === user.id);
    const catalogo = getCatalogo();

    const allHistoricos = data.flatMap((p) => (p.historico || []).map((h) => ({ ...h, colaboradorId: p.colaboradorId, colaboradorNome: p.colaboradorNome })));
    const totalColab = new Set(allHistoricos.map((h) => h.colaboradorId)).size;
    const horas = allHistoricos.reduce((acc, h) => acc + (h.progresso || []).reduce((sum, p) => sum + Number(p.tempoAssistido || 0), 0), 0);
    const completados = allHistoricos.filter((h) => h.status === 'concluido').length;
    const aprovados = allHistoricos.filter((h) => Number(h.notaFinal || 0) >= 70).length;
    const taxaConclusao = allHistoricos.length ? Math.round((completados / allHistoricos.length) * 100) : 0;
    const taxaAprovacao = allHistoricos.length ? Math.round((aprovados / allHistoricos.length) * 100) : 0;

    const kpi = document.getElementById('kpiGrid');
    kpi.innerHTML = `
      <div class="kpi"><div>Total colaboradores treinados</div><div class="num">${totalColab}</div></div>
      <div class="kpi"><div>Horas totais investidas</div><div class="num">${formatHours(horas)}h</div></div>
      <div class="kpi"><div>Taxa de conclusão</div><div class="num">${taxaConclusao}%</div></div>
      <div class="kpi"><div>Taxa de aprovação</div><div class="num">${taxaAprovacao}%</div></div>
    `;

    const popular = {};
    allHistoricos.forEach((h) => { popular[h.treinamentoId] = (popular[h.treinamentoId] || 0) + 1; });
    const catalogoMap = Object.fromEntries(catalogo.map((t) => [t.id, t]));
    const top = Object.entries(popular)
      .map(([id, count]) => ({ titulo: catalogoMap[id]?.titulo || id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const popEl = document.getElementById('chartPopular');
    const totalTop = top.reduce((acc, t) => acc + t.count, 0) || 1;
    const parts = top.map((t, idx) => {
      const colors = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444'];
      return `${colors[idx]} ${(t.count / totalTop) * 100}%`;
    }).join(', ');
    popEl.innerHTML = `
      <div class="pie" style="background:conic-gradient(${parts || '#e5e7eb 100%'});"></div>
      <ul>${top.map((t) => `<li>${esc(t.titulo)} (${t.count})</li>`).join('')}</ul>
    `;

    const byMonth = {};
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      byMonth[key] = 0;
    }
    allHistoricos.forEach((h) => {
      const dt = new Date(h.dataConclusao || h.dataInicio || 0);
      const key = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
      if (Object.prototype.hasOwnProperty.call(byMonth, key)) byMonth[key] += 1;
    });
    const monthMax = Math.max(1, ...Object.values(byMonth));
    document.getElementById('chartMes').innerHTML = `
      <div class="chart-bar">
      ${Object.entries(byMonth).map(([m, v]) => `<div class="chart-row"><span>${m}</span><div class="bar"><span style="width:${(v / monthMax) * 100}%;"></span></div><span>${v}</span></div>`).join('')}
      </div>
    `;

    const bins = { '0-50': 0, '50-70': 0, '70-90': 0, '90-100': 0 };
    allHistoricos.forEach((h) => {
      const n = Number(h.notaFinal || 0);
      if (n < 50) bins['0-50'] += 1;
      else if (n < 70) bins['50-70'] += 1;
      else if (n < 90) bins['70-90'] += 1;
      else bins['90-100'] += 1;
    });
    const maxBin = Math.max(1, ...Object.values(bins));
    document.getElementById('chartNotas').innerHTML = `
      <div class="chart-bar">
      ${Object.entries(bins).map(([b, v]) => `<div class="chart-row"><span>${b}%</span><div class="bar"><span style="width:${(v / maxBin) * 100}%;background:#16a34a;"></span></div><span>${v}</span></div>`).join('')}
      </div>
    `;

    const perfByColab = {};
    allHistoricos.forEach((h) => {
      if (!perfByColab[h.colaboradorId]) perfByColab[h.colaboradorId] = { nome: h.colaboradorNome || h.colaboradorId, total: 0, concluidos: 0, notas: [], certificados: 0 };
      const p = perfByColab[h.colaboradorId];
      p.total += 1;
      if (h.status === 'concluido') p.concluidos += 1;
      if (h.notaFinal != null) p.notas.push(Number(h.notaFinal));
      if (Number(h.notaFinal || 0) >= 70) p.certificados += 1;
    });

    const tbody = document.getElementById('perfTbody');
    tbody.innerHTML = Object.values(perfByColab).map((p) => {
      const media = p.notas.length ? (p.notas.reduce((a, b) => a + b, 0) / p.notas.length).toFixed(1) : '-';
      const taxa = p.total ? Math.round((p.concluidos / p.total) * 100) : 0;
      return `<tr><td>${esc(p.nome)}</td><td>${p.total}</td><td>${p.concluidos}</td><td>${taxa}%</td><td>${media}</td><td>${p.certificados}</td></tr>`;
    }).join('') || '<tr><td colspan="6">Sem dados para o período.</td></tr>';

    document.getElementById('exportPdf').addEventListener('click', () => {
      alert('Export PDF simulado para relatório executivo.');
    });
  }

  function startAdminPage() {
    if (!requireAdmin()) return;
    const tableBody = document.getElementById('adminTreinamentosBody');
    const modal = document.getElementById('treinamentoModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('treinamentoForm');
    const videosBody = document.getElementById('videosTableBody');
    const bancoSelect = document.getElementById('formBanco');
    const bancoPreview = document.getElementById('bancoPreview');
    const uploadJson = document.getElementById('uploadJson');
    const uploadCsv = document.getElementById('uploadCsv');

    let editingId = null;
    let draftVideos = [];

    function parseCsvRow(line) {
      const out = [];
      let current = '';
      let quoted = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const next = line[i + 1];
        if (ch === '"') {
          if (quoted && next === '"') {
            current += '"';
            i += 1;
          } else {
            quoted = !quoted;
          }
        } else if (ch === ',' && !quoted) {
          out.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      out.push(current.trim());
      return out;
    }

    function fillBancos() {
      const bancos = getBancos();
      bancoSelect.innerHTML = '<option value="">Selecionar banco</option>' + bancos.map((b) => `<option value="${esc(b.id)}">${esc(b.modalidade)} - ${esc(b.id)}</option>`).join('');
      if (bancoSelect.value) renderBancoPreview();
    }

    function renderBancoPreview() {
      const banco = getBancos().find((b) => b.id === bancoSelect.value);
      if (!banco) {
        bancoPreview.innerHTML = '<small>Selecione um banco para pré-visualizar.</small>';
        return;
      }
      bancoPreview.innerHTML = `
        <strong>${esc(banco.modalidade)} (${banco.questoes.length} questões)</strong>
        <ol>${banco.questoes.slice(0, 5).map((q) => `<li>${esc(q.pergunta)}</li>`).join('')}</ol>
      `;
    }

    function renderVideosDraft() {
      videosBody.innerHTML = draftVideos.map((v, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${esc(v.titulo)}</td>
          <td>${Math.round(Number(v.duracao || 0) / 60)} min</td>
          <td>
            <button type="button" class="btn light" data-video-edit="${idx}">Editar</button>
            <button type="button" class="btn light" data-video-up="${idx}">↑</button>
            <button type="button" class="btn light" data-video-down="${idx}">↓</button>
            <button type="button" class="btn danger" data-video-del="${idx}">Excluir</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="4">Nenhum vídeo cadastrado.</td></tr>';

      videosBody.querySelectorAll('[data-video-edit]').forEach((btn) => btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.videoEdit);
        const cur = draftVideos[idx];
        const titulo = prompt('Título do vídeo', cur.titulo);
        if (!titulo) return;
        const descricao = prompt('Descrição', cur.descricao || '');
        const duracaoMin = Number(prompt('Duração (minutos)', String(Math.round((cur.duracao || 0) / 60))) || 0);
        const url = prompt('URL do vídeo', cur.url || FALLBACK_VIDEO);
        draftVideos[idx] = { ...cur, titulo, descricao, duracao: duracaoMin * 60, url: url || FALLBACK_VIDEO };
        renderVideosDraft();
      }));

      videosBody.querySelectorAll('[data-video-del]').forEach((btn) => btn.addEventListener('click', () => {
        draftVideos.splice(Number(btn.dataset.videoDel), 1);
        renderVideosDraft();
      }));

      videosBody.querySelectorAll('[data-video-up]').forEach((btn) => btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.videoUp);
        if (idx <= 0) return;
        [draftVideos[idx - 1], draftVideos[idx]] = [draftVideos[idx], draftVideos[idx - 1]];
        renderVideosDraft();
      }));

      videosBody.querySelectorAll('[data-video-down]').forEach((btn) => btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.videoDown);
        if (idx >= draftVideos.length - 1) return;
        [draftVideos[idx + 1], draftVideos[idx]] = [draftVideos[idx], draftVideos[idx + 1]];
        renderVideosDraft();
      }));

      const totalHours = (draftVideos.reduce((acc, v) => acc + Number(v.duracao || 0), 0) / 3600).toFixed(1);
      document.getElementById('formDuracao').value = totalHours;
    }

    function openModal(treinamento) {
      editingId = treinamento?.id || null;
      modalTitle.textContent = editingId ? 'Editar Treinamento' : 'Novo Treinamento';
      form.reset();
      draftVideos = (treinamento?.videos || []).map((v) => ({ ...v }));
      form.formId.value = treinamento?.id || '';
      form.formTitulo.value = treinamento?.titulo || '';
      form.formDescricao.value = treinamento?.descricao || '';
      form.formModalidade.value = treinamento?.modalidade || '';
      form.formDificuldade.value = treinamento?.dificuldade || 'iniciante';
      form.formRating.value = treinamento?.rating || 4.5;
      form.formInstrutora.value = treinamento?.instrutora || '';
      form.formThumbnail.value = treinamento?.thumbnail || '';
      form.formDuracao.value = treinamento?.duracao || '';
      form.formSla.value = treinamento?.slaDiasConclusao || 30;
      form.formStatus.value = treinamento?.status || 'disponivel';
      bancoSelect.value = treinamento?.prova?.bancoDadosId || '';
      renderBancoPreview();
      renderVideosDraft();
      modal.classList.add('active');
    }

    function closeModal() {
      modal.classList.remove('active');
    }

    function renderTable() {
      const treinamentos = getCatalogo();
      tableBody.innerHTML = treinamentos.map((t) => `
        <tr>
          <td>${esc(t.id)}</td>
          <td>${esc(t.titulo)}</td>
          <td>${esc(t.modalidade)}</td>
          <td>${esc(t.dificuldade)}</td>
          <td><span class="badge ${esc(t.status)}">${esc(t.status)}</span></td>
          <td>
            <button class="btn light" type="button" data-edit="${esc(t.id)}">Editar</button>
            <button class="btn light" type="button" data-clone="${esc(t.id)}">Clonar</button>
            <button class="btn light" type="button" data-toggle="${esc(t.id)}">${t.status === 'disponivel' ? 'Desativar' : 'Ativar'}</button>
            <button class="btn danger" type="button" data-del="${esc(t.id)}">Excluir</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="6">Nenhum treinamento cadastrado.</td></tr>';

      tableBody.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
        const treino = getCatalogo().find((t) => t.id === btn.dataset.edit);
        openModal(treino);
      }));

      tableBody.querySelectorAll('[data-clone]').forEach((btn) => btn.addEventListener('click', () => {
        const catalogo = getCatalogo();
        const treino = catalogo.find((t) => t.id === btn.dataset.clone);
        if (!treino) return;
        const clone = { ...treino, id: uid('treino'), titulo: `${treino.titulo} (Cópia)`, dataCriacao: new Date().toISOString() };
        clone.videos = (treino.videos || []).map((v) => ({ ...v, id: uid('vid') }));
        catalogo.push(clone);
        setCatalogo(catalogo);
        renderTable();
      }));

      tableBody.querySelectorAll('[data-toggle]').forEach((btn) => btn.addEventListener('click', () => {
        const catalogo = getCatalogo();
        const treino = catalogo.find((t) => t.id === btn.dataset.toggle);
        if (!treino) return;
        treino.status = treino.status === 'disponivel' ? 'bloqueado' : 'disponivel';
        setCatalogo(catalogo);
        renderTable();
      }));

      tableBody.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => {
        if (!window.confirm('Confirma a exclusão do treinamento?')) return;
        const catalogo = getCatalogo().filter((t) => t.id !== btn.dataset.del);
        setCatalogo(catalogo);
        renderTable();
      }));

      renderStats();
    }

    function renderStats() {
      const catalogo = getCatalogo();
      const progressoLista = read(KEYS.progressoLista, []);
      const allHist = progressoLista.flatMap((p) => p.historico || []);
      const iniciado = allHist.length;
      const concluido = allHist.filter((h) => h.status === 'concluido').length;
      const aprovado = allHist.filter((h) => Number(h.notaFinal || 0) >= 70).length;
      const tempoMedio = (() => {
        const vals = allHist.map((h) => (h.progresso || []).reduce((acc, p) => acc + Number(p.tempoAssistido || 0), 0)).filter((v) => v > 0);
        if (!vals.length) return 0;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      })();
      const notaMedia = (() => {
        const notas = allHist.map((h) => Number(h.notaFinal || 0)).filter((n) => n > 0);
        if (!notas.length) return 0;
        return notas.reduce((a, b) => a + b, 0) / notas.length;
      })();

      document.getElementById('adminStats').innerHTML = `
        <div class="kpi-grid">
          <div class="kpi"><div>Treinamentos cadastrados</div><div class="num">${catalogo.length}</div></div>
          <div class="kpi"><div>Iniciados</div><div class="num">${iniciado}</div></div>
          <div class="kpi"><div>Concluídos</div><div class="num">${concluido}</div></div>
          <div class="kpi"><div>Aprovados</div><div class="num">${aprovado}</div></div>
          <div class="kpi"><div>Tempo médio</div><div class="num">${formatHours(tempoMedio)}h</div></div>
          <div class="kpi"><div>Nota média</div><div class="num">${notaMedia.toFixed(1)}%</div></div>
        </div>
      `;
    }

    document.getElementById('openCreateModal').addEventListener('click', () => openModal(null));
    document.getElementById('closeModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('addVideo').addEventListener('click', () => {
      const titulo = prompt('Título do vídeo');
      if (!titulo) return;
      const descricao = prompt('Descrição do vídeo', 'Conteúdo programático do módulo') || '';
      const duracaoMin = Number(prompt('Duração (minutos)', '15') || 15);
      const url = prompt('URL do vídeo (ou deixe em branco para stub)', FALLBACK_VIDEO) || FALLBACK_VIDEO;
      draftVideos.push({ id: uid('vid'), titulo, descricao, duracao: duracaoMin * 60, url });
      renderVideosDraft();
    });

    bancoSelect.addEventListener('change', renderBancoPreview);

    uploadJson.addEventListener('change', async () => {
      const file = uploadJson.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = safeJSONParse(text, null);
        const list = Array.isArray(parsed) ? parsed : (parsed?.questoes || []);
        if (!Array.isArray(list) || !list.length) throw new Error('JSON sem questões válidas.');
        const bancos = getBancos();
        const id = uid('banco');
        bancos.push({
          id,
          modalidade: form.formModalidade.value || 'Customizado',
          questoes: list.map((q, idx) => ({
            id: q.id || `${id}-q-${pad(idx + 1, 3)}`,
            pergunta: String(q.pergunta || `Pergunta ${idx + 1}`),
            opcoes: Array.isArray(q.opcoes) && q.opcoes.length >= 4 ? q.opcoes.slice(0, 4).map(String) : ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
            correta: Number(q.correta ?? 0),
            explicacao: String(q.explicacao || 'Explicação não informada'),
            topico: String(q.topico || 'Geral')
          }))
        });
        write(KEYS.bancoQuestoes, bancos);
        fillBancos();
        bancoSelect.value = id;
        renderBancoPreview();
      } catch (err) {
        alert(`Falha ao importar JSON: ${err.message}`);
      }
    });

    uploadCsv.addEventListener('change', async () => {
      const file = uploadCsv.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        const rows = lines.slice(1).map((line) => parseCsvRow(line));
        const id = uid('banco');
        const questoes = rows.filter((r) => r.length >= 7).map((r, idx) => ({
          id: `${id}-q-${pad(idx + 1, 3)}`,
          pergunta: r[0],
          opcoes: [r[1], r[2], r[3], r[4]],
          correta: Number(r[5]) || 0,
          explicacao: r[6] || 'Sem explicação',
          topico: r[7] || 'Geral'
        }));
        if (!questoes.length) throw new Error('CSV vazio ou inválido. Formato esperado: pergunta,op1,op2,op3,op4,correta,explicacao,topico');
        const bancos = getBancos();
        bancos.push({ id, modalidade: form.formModalidade.value || 'Customizado', questoes });
        write(KEYS.bancoQuestoes, bancos);
        fillBancos();
        bancoSelect.value = id;
        renderBancoPreview();
      } catch (err) {
        alert(`Falha ao importar CSV: ${err.message}`);
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!draftVideos.length) {
        alert('Adicione pelo menos um vídeo ao treinamento.');
        return;
      }
      if (!bancoSelect.value) {
        alert('Selecione um banco de questões para a prova.');
        return;
      }

      const catalogo = getCatalogo();
      const duracao = Number(form.formDuracao.value || 0) || Number((draftVideos.reduce((acc, v) => acc + Number(v.duracao || 0), 0) / 3600).toFixed(1));
      const payload = {
        id: editingId || form.formId.value || uid('treino'),
        titulo: form.formTitulo.value.trim(),
        descricao: form.formDescricao.value.trim(),
        duracao,
        dificuldade: form.formDificuldade.value,
        rating: Number(form.formRating.value || 4.5),
        instrutora: form.formInstrutora.value.trim(),
        thumbnail: form.formThumbnail.value.trim() || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=640&q=80&auto=format&fit=crop',
        modalidade: form.formModalidade.value.trim(),
        videos: draftVideos.map((v) => ({ ...v })),
        objetivos: ['Aplicar boas práticas', 'Executar plano de ação', 'Monitorar indicadores'],
        recursos: ['Material PDF', 'Exercícios práticos'],
        prova: {
          totalQuestoes: 30,
          tempoLimiteMinutos: 90,
          notaMinima: 70,
          bancoDadosId: bancoSelect.value
        },
        status: form.formStatus.value,
        dataCriacao: editingId ? (catalogo.find((t) => t.id === editingId)?.dataCriacao || new Date().toISOString()) : new Date().toISOString(),
        slaDiasConclusao: Number(form.formSla.value || 30)
      };

      const idx = catalogo.findIndex((t) => t.id === payload.id);
      if (idx >= 0) catalogo[idx] = payload;
      else catalogo.push(payload);
      setCatalogo(catalogo);
      closeModal();
      renderTable();
    });

    fillBancos();
    renderTable();
  }

  function init() {
    ensureSeedData();
    const page = document.body.dataset.page;
    switch (page) {
      case 'treinamentos-catalogo':
        startCatalogPage();
        break;
      case 'treinamentos-video':
        startVideoPage();
        break;
      case 'treinamentos-prova':
        startProvaPage();
        break;
      case 'treinamentos-certificado':
        startCertificadoPage();
        break;
      case 'treinamentos-validar':
        startValidacaoPage();
        break;
      case 'treinamentos-historico':
        startHistoricoPage();
        break;
      case 'treinamentos-relatorios':
        startRelatoriosPage();
        break;
      case 'admin-treinamentos':
        startAdminPage();
        break;
      default:
        break;
    }
  }

  window.BPITreinamentos = { init, esc, emitCertificate };
  document.addEventListener('DOMContentLoaded', init);
})();
