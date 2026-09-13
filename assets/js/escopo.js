(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    escopo: 'helpdesk_escopo',
    propostas: 'helpdesk_propostas',
    projetos: 'helpdesk_projetos',
    atividades: 'helpdesk_atividades',
    sessaoColaborador: 'colaborador_session'
  };

  const DEFAULT_FASES = [
    { fase: 'Diagnóstico', peso: 0.15 },
    { fase: 'Configuração', peso: 0.3 },
    { fase: 'Testes', peso: 0.15 },
    { fase: 'Implantação', peso: 0.15 },
    { fase: 'Treinamento', peso: 0.15 },
    { fase: 'Encerramento', peso: 0.1 }
  ];

  function readCollection(key) {
    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(`Falha ao ler ${key}:`, error);
      return [];
    }
  }

  function writeCollection(key, items) {
    global.localStorage.setItem(key, JSON.stringify(items));
    return items;
  }

  function getNowIso() {
    return new Date().toISOString();
  }

  function toISODate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString().slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
  }

  function formatDateBR(value) {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('pt-BR');
  }

  function addDays(dateValue, daysToAdd) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return toISODate();
    }

    date.setDate(date.getDate() + Number(daysToAdd || 0));
    return toISODate(date);
  }

  function excerpt(text, size) {
    if (!text) {
      return '';
    }

    return text.length > size ? `${text.slice(0, size - 3)}...` : text;
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function slugify(value, fallback) {
    const slug = normalizeText(value)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return slug || fallback;
  }

  function createIdGenerator(prefix, key) {
    const items = readCollection(key);
    const year = new Date().getFullYear();
    let max = items.reduce((accumulator, item) => {
      const match = String(item && item.id ? item.id : '').match(new RegExp(`^${prefix}-(\\d{4})-(\\d+)$`));
      if (!match || Number(match[1]) !== year) {
        return accumulator;
      }

      return Math.max(accumulator, Number(match[2]));
    }, 0);

    return function generateId() {
      max += 1;
      return `${prefix}-${year}-${String(max).padStart(3, '0')}`;
    };
  }

  function getColaboradorSession() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEYS.sessaoColaborador);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Falha ao ler sessão do colaborador:', error);
      return null;
    }
  }

  function getServicosFromProposal(proposta) {
    const servicos = proposta && Array.isArray(proposta.servicos)
      ? proposta.servicos
      : proposta && Array.isArray(proposta.produtos)
        ? proposta.produtos
        : [];

    return servicos.map((servico, index) => {
      const valor = Number(
        servico.valorTotal ||
        servico.valorMensal ||
        servico.valor ||
        0
      );
      const prazo = Number(
        servico.prazo ||
        servico.prazoEstimado ||
        servico.duracao ||
        0
      );
      const tipo = servico.tipo === 'recorrente' ? 'recorrente' : 'setup';

      return {
        id: servico.id || `srv-${index + 1}`,
        nome: servico.nome || servico.titulo || `Serviço ${index + 1}`,
        tipo,
        valor,
        prazo: prazo > 0 ? prazo : (tipo === 'recorrente' ? 12 : 30),
        status: servico.status || 'Ativo',
        horasEstimadas: servico.horasEstimadas || null,
        valorHora: servico.valorHora || null
      };
    });
  }

  function getProjectDurationDays(servicos, proposta) {
    const setupServices = servicos.filter((servico) => servico.tipo !== 'recorrente');
    const candidateServices = setupServices.length ? setupServices : servicos;
    const maxPrazo = candidateServices.reduce((maximo, servico) => {
      const prazo = Number(servico.prazo || 0);
      return prazo > maximo ? prazo : maximo;
    }, 0);

    const proposalDuration = Number(
      proposta &&
      proposta.prazos &&
      (proposta.prazos.duracao || proposta.prazos.prazo)
    );

    return maxPrazo || proposalDuration || 30;
  }

  function allocateDurations(totalDias, count, weights) {
    const total = Math.max(1, Number(totalDias || 0));
    const itemCount = Math.max(1, Number(count || 0));

    if (!weights || !weights.length) {
      weights = new Array(itemCount).fill(1);
    }

    const selectedWeights = weights.slice(0, itemCount);
    while (selectedWeights.length < itemCount) {
      selectedWeights.push(1);
    }

    const weightSum = selectedWeights.reduce((sum, weight) => sum + Number(weight || 0), 0) || itemCount;
    const provisional = selectedWeights.map((weight) => Math.max(1, Math.round((total * Number(weight || 0)) / weightSum)));

    let diff = total - provisional.reduce((sum, duration) => sum + duration, 0);
    let cursor = 0;

    while (diff !== 0) {
      const direction = diff > 0 ? 1 : -1;
      const targetIndex = cursor % provisional.length;

      if (direction > 0 || provisional[targetIndex] > 1) {
        provisional[targetIndex] += direction;
        diff -= direction;
      }

      cursor += 1;
    }

    return provisional;
  }

  function buildCronograma(startDate, totalDias) {
    const inicio = toISODate(startDate);
    const durations = allocateDurations(
      totalDias,
      DEFAULT_FASES.length,
      DEFAULT_FASES.map((fase) => fase.peso)
    );

    let cursorDate = inicio;

    return DEFAULT_FASES.map((fase, index) => {
      const duracao = durations[index];
      const dataInicio = cursorDate;
      const dataFim = addDays(cursorDate, duracao - 1);
      cursorDate = addDays(dataFim, 1);

      return {
        fase: fase.fase,
        dataInicio,
        dataFim,
        duracao
      };
    });
  }

  function buildEntregas(servicos, descricaoDetalhada) {
    const fromDescription = parseActivityTitles(descricaoDetalhada);
    const baseEntregas = [
      'Análise de requisitos completa',
      'Ambiente de produção configurado',
      'Testes integrados executados',
      'Documentação técnica',
      'Equipe treinada e certificada',
      'Suporte de pós-implementação (30 dias)'
    ];

    if (fromDescription.length) {
      return fromDescription.map((item) => item.endsWith('.') ? item : item);
    }

    if (servicos.some((servico) => normalizeText(servico.nome).includes('treinamento'))) {
      baseEntregas[4] = 'Equipe treinada e apta para operação';
    }

    if (!servicos.some((servico) => servico.tipo === 'recorrente')) {
      return baseEntregas.slice(0, 5);
    }

    return baseEntregas;
  }

  function buildDependencias(modalidade) {
    const defaults = [
      'Ambiente de servidor preparado',
      'Acesso a dados históricos',
      'Designação de usuários-chave',
      'Aprovação de mudanças de escopo',
      'Disponibilidade para reuniões de alinhamento'
    ];

    if (normalizeText(modalidade).includes('treinamento')) {
      defaults[0] = 'Disponibilidade da equipe para agenda de capacitação';
    }

    return defaults;
  }

  function findBestServiceForActivity(title, servicos) {
    if (!servicos.length) {
      return null;
    }

    const normalizedTitle = normalizeText(title);
    const recorrente = servicos.find((servico) => servico.tipo === 'recorrente');
    const treinamento = servicos.find((servico) => normalizeText(servico.nome).includes('treinamento'));
    const primarySetup = servicos.find((servico) => servico.tipo === 'setup') || servicos[0];

    if (normalizedTitle.includes('treinamento') && treinamento) {
      return treinamento;
    }

    if (
      recorrente &&
      (normalizedTitle.includes('suporte') || normalizedTitle.includes('monitoramento') || normalizedTitle.includes('acompanhamento'))
    ) {
      return recorrente;
    }

    return primarySetup;
  }

  function parseActivityTitles(description) {
    const text = String(description || '');
    const matches = [...text.matchAll(/\(\s*\d+\s*\)\s*([^\n\r]+)/g)]
      .map((match) => match[1].trim())
      .filter(Boolean);

    if (matches.length) {
      return matches;
    }

    const lineMatches = text
      .split(/\r?\n/)
      .filter((line) => /^(\s*[-•*]\s+|\s*\d+[.)]\s+)/.test(line))
      .map((line) => line.replace(/^(\s*[-•*]\s+|\s*\d+[.)]\s+)/, '').trim())
      .filter((line) => line.length > 0);

    return lineMatches.slice(0, 6);
  }

  function buildDefaultScope(proposta) {
    const servicosContratados = getServicosFromProposal(proposta);
    const dataInicio = proposta && proposta.prazos && proposta.prazos.inicio
      ? proposta.prazos.inicio
      : toISODate();
    const duracaoProjeto = getProjectDurationDays(servicosContratados, proposta);
    const descricaoDetalhada = proposta && (proposta.escopo || proposta.descricao)
      ? (proposta.escopo || proposta.descricao)
      : `Projeto ${proposta && proposta.titulo ? proposta.titulo : 'sem título'}.\n(1) Diagnóstico do ambiente atual\n(2) Configuração do ambiente e serviços\n(3) Testes integrados\n(4) Treinamento de usuários\n(5) Suporte de pós-implementação`;
    const setupTotal = servicosContratados
      .filter((servico) => servico.tipo === 'setup')
      .reduce((sum, servico) => sum + Number(servico.valor || 0), 0);
    const recorrenteMensal = servicosContratados
      .filter((servico) => servico.tipo === 'recorrente')
      .reduce((sum, servico) => sum + Number(servico.valor || 0), 0);
    const desconto = Number(
      proposta &&
      proposta.valores &&
      proposta.valores.desconto
        ? proposta.valores.desconto
        : 0
    );
    const cronograma = buildCronograma(dataInicio, duracaoProjeto);
    const total = setupTotal - desconto + (recorrenteMensal * 12);

    return {
      propostaId: proposta && proposta.id ? proposta.id : null,
      descricaoDetalhada,
      servicosContratados,
      entregas: buildEntregas(servicosContratados, descricaoDetalhada),
      dependenciasCliente: buildDependencias(proposta && proposta.modalidade),
      cronograma,
      investimento: {
        setupTotal,
        recorrenteAnual: recorrenteMensal * 12,
        desconto,
        total
      },
      observacoes: proposta && proposta.observacoes
        ? proposta.observacoes
        : 'Mudanças de escopo serão avaliadas previamente, podendo impactar prazo, custo e SLA do projeto.'
    };
  }

  function buildActivitiesForProject(projectId, proposta, escopo, timestamp, previousActivities) {
    const generateActivityId = createIdGenerator('ativ', STORAGE_KEYS.atividades);
    const previousByTitle = new Map(
      (previousActivities || []).map((atividade) => [normalizeText(atividade.titulo), atividade])
    );

    return EscopoProcessor.extrairAtividades(
      Object.assign({}, escopo, { proposta })
    ).map((atividade) => {
      const anterior = previousByTitle.get(normalizeText(atividade.titulo));
      return {
        id: anterior && anterior.id ? anterior.id : generateActivityId(),
        clientId: proposta.clientId || `cli-${slugify(proposta.nomeCliente || proposta.nomeEmpresa || 'cliente', '001')}`,
        projetoId: projectId,
        servicoVinculado: atividade.servicoVinculado,
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        ator: atividade.ator,
        atorEmail: activityFallbackEmail(atividade.atorEmail),
        atorCargo: atividade.atorCargo,
        dataPrevista: atividade.dataPrevista,
        dataRealizada: anterior ? anterior.dataRealizada : null,
        status: anterior && anterior.status ? anterior.status : 'nao_iniciada',
        prioridade: atividade.prioridade,
        dependencias: anterior && Array.isArray(anterior.dependencias) ? anterior.dependencias : [],
        statusAtraso: anterior && anterior.statusAtraso ? anterior.statusAtraso : 'no_prazo',
        diasAtraso: anterior && typeof anterior.diasAtraso === 'number' ? anterior.diasAtraso : 0,
        dataCriacao: anterior && anterior.dataCriacao ? anterior.dataCriacao : timestamp,
        dataAtualizacao: timestamp
      };
    });
  }

  const EscopoDB = {
    salvar(escopo) {
      const existing = readCollection(STORAGE_KEYS.escopo);
      const now = getNowIso();
      const generateId = createIdGenerator('esc', STORAGE_KEYS.escopo);
      const payload = Object.assign({}, escopo);
      const index = existing.findIndex((item) => item.id === payload.id);

      payload.id = payload.id || generateId();
      payload.dataCriacao = index >= 0 ? existing[index].dataCriacao : now;
      payload.dataAtualizacao = now;

      if (index >= 0) {
        existing[index] = Object.assign({}, existing[index], payload);
      } else {
        existing.push(payload);
      }

      writeCollection(STORAGE_KEYS.escopo, existing);
      return payload;
    },

    listar() {
      return readCollection(STORAGE_KEYS.escopo);
    },

    obter(id) {
      return this.listar().find((item) => item.id === id) || null;
    },

    obterPorPropostaId(propostaId) {
      return this.listar().find((item) => item.propostaId === propostaId) || null;
    }
  };

  const EscopoProcessor = {
    criarPadrao(proposta) {
      return buildDefaultScope(proposta || {});
    },

    extrairAtividades(escopo) {
      const scope = escopo || {};
      const proposta = scope.proposta || {};
      const servicos = Array.isArray(scope.servicosContratados) ? scope.servicosContratados : [];
      const cronograma = Array.isArray(scope.cronograma) && scope.cronograma.length
        ? scope.cronograma
        : buildCronograma(
          proposta.prazos && proposta.prazos.inicio ? proposta.prazos.inicio : toISODate(),
          getProjectDurationDays(servicos, proposta)
        );
      const titles = parseActivityTitles(scope.descricaoDetalhada);
      const timelineReference = titles.length
        ? titles
        : cronograma.map((fase) => fase.fase);
      const totalDias = cronograma.reduce((sum, fase) => sum + Number(fase.duracao || 0), 0) || getProjectDurationDays(servicos, proposta);
      const durations = allocateDurations(totalDias, timelineReference.length);
      const session = getColaboradorSession();
      const startDate = cronograma[0] ? cronograma[0].dataInicio : toISODate();
      let accumulatedDays = 0;

      return timelineReference.map((title, index) => {
        accumulatedDays += durations[index];
        const servico = findBestServiceForActivity(title, servicos);

        return {
          titulo: title,
          descricao: `Atividade gerada automaticamente a partir do escopo: ${title}`,
          ator: session && session.name ? session.name : 'Consultor responsável',
          atorEmail: session && session.email ? session.email : 'consultor@bpi.com.br',
          atorCargo: session && session.role ? session.role : 'Consultor',
          dataPrevista: addDays(startDate, accumulatedDays - 1),
          dataRealizada: null,
          status: 'nao_iniciada',
          prioridade: servico && servico.tipo === 'recorrente' ? 'média' : 'alta',
          dependencias: [],
          statusAtraso: 'no_prazo',
          diasAtraso: 0,
          servicoVinculado: servico ? servico.id : null,
          diasPrevistos: durations[index]
        };
      });
    }
  };

  const ProjetoIntegrador = {
    criar(proposta, escopo) {
      if (!proposta) {
        throw new Error('Proposta obrigatória para criar projeto.');
      }

      const projetos = readCollection(STORAGE_KEYS.projetos);
      const projetoExistente = projetos.find((item) => item.propostaId === proposta.id);

      if (projetoExistente) {
        const escopoPersistido = projetoExistente.escopoId
          ? EscopoDB.obter(projetoExistente.escopoId)
          : EscopoDB.obterPorPropostaId(proposta.id);
        const escopoAtualizado = EscopoDB.salvar(
          Object.assign(
            {},
            buildDefaultScope(proposta),
            escopoPersistido || {},
            escopo || {},
            {
              id: (escopo && escopo.id) || projetoExistente.escopoId || undefined,
              propostaId: proposta.id,
              projetoId: projetoExistente.id
            }
          )
        );
        const atividadesAtuais = readCollection(STORAGE_KEYS.atividades);
        const atividadesProjetoExistente = atividadesAtuais
          .filter((atividade) => atividade.projetoId === projetoExistente.id);
        const atividadesSincronizadas = buildActivitiesForProject(
          projetoExistente.id,
          proposta,
          escopoAtualizado,
          getNowIso(),
          atividadesProjetoExistente
        );
        const outrasAtividades = atividadesAtuais
          .filter((atividade) => atividade.projetoId !== projetoExistente.id);
        writeCollection(STORAGE_KEYS.atividades, outrasAtividades.concat(atividadesSincronizadas));

        const projetosAtualizados = projetos.map((item) => {
          if (item.id !== projetoExistente.id) {
            return item;
          }

          return Object.assign({}, item, {
            escopoId: escopoAtualizado.id,
            escopo: escopoAtualizado.descricaoDetalhada,
            servicosContratados: escopoAtualizado.servicosContratados || item.servicosContratados,
            entregas: escopoAtualizado.entregas || item.entregas,
            cronograma: escopoAtualizado.cronograma || item.cronograma,
            atividades: atividadesSincronizadas.map((atividade) => atividade.id),
            dataAtualizacao: getNowIso()
          });
        });
        writeCollection(STORAGE_KEYS.projetos, projetosAtualizados);
        updateProposalStatus(proposta.id, escopoAtualizado.id, getNowIso());

        return {
          projeto: projetosAtualizados.find((item) => item.id === projetoExistente.id) || projetoExistente,
          atividades: atividadesSincronizadas
        };
      }

      const escopoSalvo = EscopoDB.salvar(
        Object.assign(
          {},
          buildDefaultScope(proposta),
          escopo || {},
          { propostaId: proposta.id }
        )
      );
      const session = getColaboradorSession();
      const now = getNowIso();
      const servicosContratados = Array.isArray(escopoSalvo.servicosContratados) ? escopoSalvo.servicosContratados : [];
      const startDate = proposta.prazos && proposta.prazos.inicio
        ? proposta.prazos.inicio
        : escopoSalvo.cronograma && escopoSalvo.cronograma[0]
          ? escopoSalvo.cronograma[0].dataInicio
          : toISODate();
      const cronograma = Array.isArray(escopoSalvo.cronograma) && escopoSalvo.cronograma.length
        ? escopoSalvo.cronograma
        : buildCronograma(startDate, getProjectDurationDays(servicosContratados, proposta));
      const endDate = cronograma.length
        ? cronograma[cronograma.length - 1].dataFim
        : addDays(startDate, getProjectDurationDays(servicosContratados, proposta) - 1);
      const generateProjectId = createIdGenerator('proj', STORAGE_KEYS.projetos);
      const projectId = generateProjectId();
      const atividades = readCollection(STORAGE_KEYS.atividades);
      const atividadesCriadas = buildActivitiesForProject(projectId, proposta, escopoSalvo, now, []);
      const projeto = {
        id: projectId,
        propostaId: proposta.id || null,
        escopoId: escopoSalvo.id,
        clientId: proposta.clientId || `cli-${slugify(proposta.nomeCliente || proposta.nomeEmpresa || 'cliente', '001')}`,
        nomeCliente: proposta.nomeCliente || proposta.nomeEmpresa || 'Cliente não informado',
        titulo: proposta.titulo || proposta.nomeProjeto || 'Projeto sem título',
        descricao: proposta.descricao || excerpt(escopoSalvo.descricaoDetalhada, 160),
        escopo: escopoSalvo.descricaoDetalhada,
        status: 'planejamento',
        dataInicio: startDate,
        dataFimPrevisto: endDate,
        dataFimReal: null,
        gestorResponsavel: session && session.name ? session.name : (proposta.elaboradoPor || 'Gestor responsável'),
        gestorEmail: activityFallbackEmail(session && session.email ? session.email : proposta.gestorEmail),
        percentualConclusao: 0,
        prioridade: 'média',
        modalidade: proposta.modalidade || 'Implementações',
        servicosContratados,
        entregas: escopoSalvo.entregas || [],
        cronograma,
        termoAberturaDocId: null,
        statusTermoAbertura: 'pendente',
        termoEncerramentoDocId: null,
        statusTermoEncerramento: 'pendente',
        atividades: atividadesCriadas.map((atividade) => atividade.id),
        documentos: [],
        dataCriacao: now,
        dataAtualizacao: now
      };

      writeCollection(STORAGE_KEYS.atividades, atividades.concat(atividadesCriadas));
      writeCollection(STORAGE_KEYS.projetos, projetos.concat(projeto));
      EscopoDB.salvar(Object.assign({}, escopoSalvo, { projetoId: projeto.id }));
      updateProposalStatus(proposta.id, escopoSalvo.id, now);

      return {
        projeto,
        atividades: atividadesCriadas
      };
    }
  };

  function activityFallbackEmail(email) {
    return email || 'consultor@bpi.com.br';
  }

  function updateProposalStatus(propostaId, escopoId, timestamp) {
    if (!propostaId) {
      return;
    }

    const propostas = readCollection(STORAGE_KEYS.propostas);
    const proposalIndex = propostas.findIndex((item) => item.id === propostaId);

    if (proposalIndex < 0) {
      return;
    }

    propostas[proposalIndex] = Object.assign({}, propostas[proposalIndex], {
      status: 'aceita',
      escopoId,
      dataResposta: timestamp,
      dataAtualizacao: timestamp
    });

    writeCollection(STORAGE_KEYS.propostas, propostas);
  }

  global.EscopoDB = EscopoDB;
  global.EscopoProcessor = EscopoProcessor;
  global.ProjetoIntegrador = ProjetoIntegrador;
  global.BPIEscopoUtils = {
    formatDateBR,
    formatCurrency(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    },
    toISODate,
    addDays
  };
})(window);
