(function(global) {
  const STORAGE_KEYS = {
    projetos: 'helpdesk_projetos',
    atividades: 'helpdesk_atividades'
  };

  const STATUS_PROJETO = {
    planejamento: { label: 'Planejamento', className: 'planejamento', color: '#3B82F6' },
    em_andamento: { label: 'Em Andamento', className: 'em-andamento', color: '#F59E0B' },
    encerrado: { label: 'Encerrado', className: 'encerrado', color: '#10B981' }
  };

  const STATUS_ATIVIDADE = {
    nao_iniciada: { label: 'Não iniciada', className: 'nao-iniciada' },
    em_andamento: { label: 'Em andamento', className: 'em-andamento' },
    finalizada: { label: 'Finalizada', className: 'finalizada' }
  };

  const PRIORIDADES = {
    alta: { label: 'Alta', icon: '🔴', color: '#DC2626' },
    media: { label: 'Média', icon: '🟡', color: '#D97706' },
    baixa: { label: 'Baixa', icon: '🟢', color: '#16A34A' }
  };

  function safeParse(value, fallback) {
    if (!value) return fallback;

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
    } catch (error) {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function startOfDay(date) {
    const base = new Date(date);
    base.setHours(0, 0, 0, 0);
    return base;
  }

  function parseDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parsedDate = new Date(value + 'T00:00:00');
      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDateISO(date) {
    return startOfDay(date).toISOString().slice(0, 10);
  }

  function formatDateBR(value) {
    const date = parseDate(value);
    return date ? date.toLocaleDateString('pt-BR') : '—';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function normalizeStatusProjeto(status) {
    const raw = String(status || '').toLowerCase().trim();

    if (raw === 'em_andamento') return 'em_andamento';
    if (raw === 'andamento') return 'em_andamento';
    if (raw === 'em andamento') return 'em_andamento';
    if (raw === 'em-andamento') return 'em_andamento';
    if (raw === 'planejamento') return 'planejamento';
    if (raw === 'encerrado') return 'encerrado';

    return 'planejamento';
  }

  function normalizeStatusAtividade(status) {
    const raw = String(status || '').toLowerCase().trim();

    if (raw === 'em andamento') return 'em_andamento';
    if (raw === 'em-andamento') return 'em_andamento';
    if (raw === 'nao-iniciada') return 'nao_iniciada';
    if (raw === 'não iniciada') return 'nao_iniciada';
    if (raw === 'não_iniciada') return 'nao_iniciada';
    if (raw === 'finalizada') return 'finalizada';
    if (raw === 'em_andamento') return 'em_andamento';
    if (raw === 'nao_iniciada') return 'nao_iniciada';

    return 'nao_iniciada';
  }

  function normalizePrioridade(value) {
    const raw = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    if (raw === 'alta') return 'alta';
    if (raw === 'media') return 'media';
    if (raw === 'baixa') return 'baixa';

    return 'media';
  }

  function diffInDays(target, base) {
    const targetDate = startOfDay(target);
    const baseDate = startOfDay(base);
    return Math.round((targetDate.getTime() - baseDate.getTime()) / 86400000);
  }

  function extractMonetaryValue(item, primaryKey, fallbackKey) {
    const primary = Number(item && item[primaryKey]);
    if (!Number.isNaN(primary) && primary > 0) return primary;

    const fallback = Number(item && item[fallbackKey]);
    return Number.isNaN(fallback) ? 0 : fallback;
  }

  function getProjetoFinanceiro(projeto) {
    const servicos = Array.isArray(projeto.servicosContratados) ? projeto.servicosContratados : [];

    const setupFromServices = servicos.reduce(function(total, servico) {
      if (String(servico.tipo || '').toLowerCase() === 'recorrente') return total;
      return total + extractMonetaryValue(servico, 'valorTotal', 'valor');
    }, 0);

    const recorrenteFromServices = servicos.reduce(function(total, servico) {
      if (String(servico.tipo || '').toLowerCase() !== 'recorrente') return total;
      return total + extractMonetaryValue(servico, 'valorMensal', 'valor');
    }, 0);

    const valorSetup = extractMonetaryValue(projeto, 'valorSetup', 'setup') || extractMonetaryValue(projeto.valores || {}, 'setup', 'valorSetup') || setupFromServices;
    const valorRecorrenteMensal = extractMonetaryValue(projeto, 'valorRecorrenteMensal', 'recorrente') || extractMonetaryValue(projeto.valores || {}, 'recorrente', 'valorRecorrenteMensal') || recorrenteFromServices;

    return {
      valorSetup: valorSetup,
      valorRecorrenteMensal: valorRecorrenteMensal,
      valorTotal: valorSetup + (valorRecorrenteMensal * 12)
    };
  }

  function createDateOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDateISO(date);
  }

  function ensureSeedData() {
    const projetosExistentes = localStorage.getItem(STORAGE_KEYS.projetos);
    const atividadesExistentes = localStorage.getItem(STORAGE_KEYS.atividades);

    if (projetosExistentes || atividadesExistentes) {
      return;
    }

    const projetos = [
      {
        id: 'proj-seed-001',
        clientId: 'cli-001',
        nomeCliente: 'Grupo Atlas',
        titulo: 'Implementação ERP Financeiro',
        descricao: 'Projeto de implantação do módulo financeiro.',
        escopo: 'Mapeamento, parametrização, testes e go-live.',
        status: 'em_andamento',
        dataInicio: createDateOffset(-24),
        dataFimPrevisto: createDateOffset(20),
        gestorResponsavel: 'André Gusmão',
        gestorEmail: 'andre@bpi.com.br',
        percentualConclusao: 55,
        prioridade: 'alta',
        modalidade: 'Implementações',
        servicosContratados: [
          { id: 'srv-001', nome: 'Implantação', tipo: 'setup', valorTotal: 38000 },
          { id: 'srv-002', nome: 'Sustentação', tipo: 'recorrente', valorMensal: 2200 }
        ]
      },
      {
        id: 'proj-seed-002',
        clientId: 'cli-002',
        nomeCliente: 'Solar Norte',
        titulo: 'Consultoria de Processos',
        descricao: 'Consultoria de redesenho operacional.',
        escopo: 'Diagnóstico, plano de ação e acompanhamento.',
        status: 'planejamento',
        dataInicio: createDateOffset(-3),
        dataFimPrevisto: createDateOffset(32),
        gestorResponsavel: 'Maria Silva',
        gestorEmail: 'maria@bpi.com.br',
        percentualConclusao: 12,
        prioridade: 'media',
        modalidade: 'Consultoria',
        servicosContratados: [
          { id: 'srv-003', nome: 'Consultoria', tipo: 'setup', valorTotal: 24000 }
        ]
      },
      {
        id: 'proj-seed-003',
        clientId: 'cli-003',
        nomeCliente: 'Viva Saúde',
        titulo: 'Sustentação de Indicadores',
        descricao: 'Operação assistida e rotina de indicadores.',
        escopo: 'Acompanhamento mensal e melhorias incrementais.',
        status: 'em_andamento',
        dataInicio: createDateOffset(-40),
        dataFimPrevisto: createDateOffset(50),
        gestorResponsavel: 'João Santos',
        gestorEmail: 'joao@bpi.com.br',
        percentualConclusao: 38,
        prioridade: 'alta',
        modalidade: 'Sustentação',
        servicosContratados: [
          { id: 'srv-004', nome: 'Sustentação', tipo: 'recorrente', valorMensal: 3200 }
        ]
      },
      {
        id: 'proj-seed-004',
        clientId: 'cli-004',
        nomeCliente: 'Tech Nova',
        titulo: 'Treinamento de Usuários',
        descricao: 'Capacitação de multiplicadores internos.',
        escopo: 'Treinamento funcional e avaliação final.',
        status: 'encerrado',
        dataInicio: createDateOffset(-50),
        dataFimPrevisto: createDateOffset(-5),
        dataFimReal: createDateOffset(-4),
        gestorResponsavel: 'Fernanda Lima',
        gestorEmail: 'fernanda@bpi.com.br',
        percentualConclusao: 100,
        prioridade: 'baixa',
        modalidade: 'Treinamento',
        servicosContratados: [
          { id: 'srv-005', nome: 'Treinamento', tipo: 'setup', valorTotal: 12000 }
        ]
      },
      {
        id: 'proj-seed-005',
        clientId: 'cli-005',
        nomeCliente: 'Retail Prime',
        titulo: 'BI Comercial',
        descricao: 'Construção de dashboards executivos.',
        escopo: 'Levantamento, modelagem e publicação.',
        status: 'em_andamento',
        dataInicio: createDateOffset(-12),
        dataFimPrevisto: createDateOffset(15),
        gestorResponsavel: 'André Gusmão',
        gestorEmail: 'andre@bpi.com.br',
        percentualConclusao: 46,
        prioridade: 'media',
        modalidade: 'BI',
        servicosContratados: [
          { id: 'srv-006', nome: 'Dashboard BI', tipo: 'setup', valorTotal: 28000 },
          { id: 'srv-007', nome: 'Monitoramento', tipo: 'recorrente', valorMensal: 1800 }
        ]
      }
    ];

    const atividades = [
      {
        id: 'ativ-seed-001',
        clientId: 'cli-001',
        projetoId: 'proj-seed-001',
        titulo: 'Kickoff com cliente',
        descricao: 'Alinhamento inicial.',
        dataPrevista: createDateOffset(-20),
        dataRealizada: createDateOffset(-20),
        status: 'finalizada',
        prioridade: 'alta',
        dataCriacao: createDateOffset(-25),
        dataAtualizacao: createDateOffset(-20)
      },
      {
        id: 'ativ-seed-002',
        clientId: 'cli-001',
        projetoId: 'proj-seed-001',
        titulo: 'Mapeamento de processos',
        descricao: 'Levantamento funcional.',
        dataPrevista: createDateOffset(-10),
        status: 'em_andamento',
        prioridade: 'alta',
        dataCriacao: createDateOffset(-18),
        dataAtualizacao: createDateOffset(-2)
      },
      {
        id: 'ativ-seed-003',
        clientId: 'cli-001',
        projetoId: 'proj-seed-001',
        titulo: 'Configuração fiscal',
        descricao: 'Parâmetros iniciais.',
        dataPrevista: createDateOffset(3),
        status: 'nao_iniciada',
        prioridade: 'media',
        dataCriacao: createDateOffset(-8),
        dataAtualizacao: createDateOffset(-8)
      },
      {
        id: 'ativ-seed-004',
        clientId: 'cli-002',
        projetoId: 'proj-seed-002',
        titulo: 'Diagnóstico operacional',
        descricao: 'Coleta de requisitos.',
        dataPrevista: createDateOffset(2),
        status: 'nao_iniciada',
        prioridade: 'media',
        dataCriacao: createDateOffset(-10),
        dataAtualizacao: createDateOffset(-10)
      },
      {
        id: 'ativ-seed-005',
        clientId: 'cli-002',
        projetoId: 'proj-seed-002',
        titulo: 'Plano de ação',
        descricao: 'Planejamento detalhado.',
        dataPrevista: createDateOffset(8),
        status: 'nao_iniciada',
        prioridade: 'baixa',
        dataCriacao: createDateOffset(-10),
        dataAtualizacao: createDateOffset(-10)
      },
      {
        id: 'ativ-seed-006',
        clientId: 'cli-003',
        projetoId: 'proj-seed-003',
        titulo: 'Revisão de indicadores',
        descricao: 'Revisar KPIs da operação.',
        dataPrevista: createDateOffset(-16),
        status: 'nao_iniciada',
        prioridade: 'alta',
        dataCriacao: createDateOffset(-20),
        dataAtualizacao: createDateOffset(-18)
      },
      {
        id: 'ativ-seed-007',
        clientId: 'cli-003',
        projetoId: 'proj-seed-003',
        titulo: 'Publicação do dashboard',
        descricao: 'Atualizar versão executiva.',
        dataPrevista: createDateOffset(5),
        status: 'em_andamento',
        prioridade: 'media',
        dataCriacao: createDateOffset(-6),
        dataAtualizacao: createDateOffset(-1)
      },
      {
        id: 'ativ-seed-008',
        clientId: 'cli-004',
        projetoId: 'proj-seed-004',
        titulo: 'Treinamento módulo fiscal',
        descricao: 'Sessão prática.',
        dataPrevista: createDateOffset(-7),
        dataRealizada: createDateOffset(-6),
        status: 'finalizada',
        prioridade: 'baixa',
        dataCriacao: createDateOffset(-12),
        dataAtualizacao: createDateOffset(-6)
      },
      {
        id: 'ativ-seed-009',
        clientId: 'cli-005',
        projetoId: 'proj-seed-005',
        titulo: 'Validação do layout executivo',
        descricao: 'Aprovação visual.',
        dataPrevista: createDateOffset(-9),
        status: 'em_andamento',
        prioridade: 'media',
        dataCriacao: createDateOffset(-12),
        dataAtualizacao: createDateOffset(-3)
      },
      {
        id: 'ativ-seed-010',
        clientId: 'cli-005',
        projetoId: 'proj-seed-005',
        titulo: 'Carga incremental',
        descricao: 'Rotina de atualização.',
        dataPrevista: createDateOffset(6),
        status: 'nao_iniciada',
        prioridade: 'baixa',
        dataCriacao: createDateOffset(-5),
        dataAtualizacao: createDateOffset(-5)
      },
      {
        id: 'ativ-seed-011',
        clientId: 'cli-005',
        projetoId: 'proj-seed-005',
        titulo: 'Homologação com diretoria',
        descricao: 'Apresentação final.',
        dataPrevista: createDateOffset(1),
        dataRealizada: createDateOffset(-1),
        status: 'finalizada',
        prioridade: 'alta',
        dataCriacao: createDateOffset(-4),
        dataAtualizacao: createDateOffset(-1)
      }
    ];

    saveStorage(STORAGE_KEYS.projetos, projetos);
    saveStorage(STORAGE_KEYS.atividades, atividades);
  }

  function getProjetos() {
    ensureSeedData();
    return safeParse(localStorage.getItem(STORAGE_KEYS.projetos), []);
  }

  function getAtividades() {
    ensureSeedData();
    return safeParse(localStorage.getItem(STORAGE_KEYS.atividades), []);
  }

  function listAtividadesDetalhadas() {
    const projetos = getProjetos();
    const projetosMap = projetos.reduce(function(map, projeto) {
      map[projeto.id] = projeto;
      return map;
    }, {});
    const today = new Date();

    return getAtividades().map(function(atividade) {
      const projeto = projetosMap[atividade.projetoId] || {};
      const status = normalizeStatusAtividade(atividade.status);
      const dataPrevista = parseDate(atividade.dataPrevista);
      const finalizada = status === 'finalizada';
      const diasAtraso = !finalizada && dataPrevista ? Math.max(0, diffInDays(today, dataPrevista)) : 0;
      const diasRestantes = dataPrevista ? diffInDays(dataPrevista, today) : null;

      return Object.assign({}, atividade, {
        status: status,
        prioridade: normalizePrioridade(atividade.prioridade),
        dataPrevista: dataPrevista ? formatDateISO(dataPrevista) : '',
        dataRealizada: atividade.dataRealizada ? formatDateISO(parseDate(atividade.dataRealizada)) : '',
        diasAtraso: typeof atividade.diasAtraso === 'number' ? atividade.diasAtraso : diasAtraso,
        statusAtraso: diasAtraso > 0 ? 'atrasada' : 'em_dia',
        diasRestantes: diasRestantes,
        projeto: projeto.titulo || 'Projeto não encontrado',
        cliente: projeto.nomeCliente || projeto.cliente || 'Cliente não informado'
      });
    });
  }

  function listProjetosDetalhados() {
    const atividades = listAtividadesDetalhadas();
    const atividadesPorProjeto = atividades.reduce(function(map, atividade) {
      if (!map[atividade.projetoId]) {
        map[atividade.projetoId] = [];
      }
      map[atividade.projetoId].push(atividade);
      return map;
    }, {});

    return getProjetos().map(function(projeto) {
      const atividadesProjeto = atividadesPorProjeto[projeto.id] || [];
      const financeiro = getProjetoFinanceiro(projeto);
      const atividadesFinalizadas = atividadesProjeto.filter(function(atividade) {
        return atividade.status === 'finalizada';
      }).length;
      const percentualCalculado = atividadesProjeto.length ? Math.round((atividadesFinalizadas / atividadesProjeto.length) * 100) : 0;
      const percentualConclusao = Number.isFinite(Number(projeto.percentualConclusao))
        ? Number(projeto.percentualConclusao)
        : percentualCalculado;
      const atividadesAtrasadas = atividadesProjeto.filter(function(atividade) {
        return atividade.diasAtraso > 0 && atividade.status !== 'finalizada';
      });
      const proximaAtividade = atividadesProjeto
        .filter(function(atividade) {
          return atividade.status !== 'finalizada';
        })
        .sort(function(a, b) {
          return parseDate(a.dataPrevista) - parseDate(b.dataPrevista);
        })[0] || null;
      const possuiAtividadeIniciada = atividadesProjeto.some(function(atividade) {
        return atividade.status === 'em_andamento' || atividade.status === 'finalizada';
      });
      const primeiraAtividade = atividadesProjeto
        .slice()
        .sort(function(a, b) {
          return parseDate(a.dataCriacao || a.dataPrevista) - parseDate(b.dataCriacao || b.dataPrevista);
        })[0] || null;
      const semAtividadeIniciada7dias = !possuiAtividadeIniciada
        && primeiraAtividade
        && diffInDays(new Date(), parseDate(primeiraAtividade.dataCriacao || primeiraAtividade.dataPrevista)) > 7;

      return Object.assign({}, projeto, financeiro, {
        status: normalizeStatusProjeto(projeto.status),
        percentualConclusao: percentualConclusao,
        atividades: atividadesProjeto,
        atividadesAtrasadas: atividadesAtrasadas,
        proximaAtividade: proximaAtividade,
        semAtividadeIniciada7dias: semAtividadeIniciada7dias
      });
    });
  }

  function calcularKPIs() {
    const projetos = listProjetosDetalhados();
    const atividades = listAtividadesDetalhadas();
    const totalProjetos = projetos.length;
    const projetosEmAndamento = projetos.filter(function(projeto) {
      return projeto.status === 'em_andamento';
    }).length;
    const atividadesEmAtraso = atividades.filter(function(atividade) {
      return atividade.diasAtraso > 0 && atividade.status !== 'finalizada';
    }).length;
    const finalizadas = atividades.filter(function(atividade) {
      return atividade.status === 'finalizada';
    }).length;
    const taxaSucesso = atividades.length ? finalizadas / atividades.length : 0;
    const valorTotalProjetos = projetos.reduce(function(total, projeto) {
      return total + projeto.valorTotal;
    }, 0);
    const valorEmRisco = projetos.reduce(function(total, projeto) {
      return total + (projeto.atividadesAtrasadas.length ? projeto.valorTotal : 0);
    }, 0);

    return {
      totalProjetos: totalProjetos,
      projetosEmAndamento: projetosEmAndamento,
      atividadesEmAtraso: atividadesEmAtraso,
      taxaSucesso: taxaSucesso,
      valorTotalProjetos: valorTotalProjetos,
      valorEmRisco: valorEmRisco,
      projetos: projetos,
      atividades: atividades
    };
  }

  function obterProximasAtividades(dias) {
    const limiteDias = Number.isFinite(Number(dias)) ? Number(dias) : 7;
    const today = new Date();

    return listAtividadesDetalhadas()
      .filter(function(atividade) {
        return atividade.status !== 'finalizada'
          && atividade.diasRestantes !== null
          && atividade.diasRestantes >= 0
          && atividade.diasRestantes <= limiteDias;
      })
      .sort(function(a, b) {
        return parseDate(a.dataPrevista) - parseDate(b.dataPrevista);
      })
      .map(function(atividade) {
        return {
          id: atividade.id,
          titulo: atividade.titulo,
          projeto: atividade.projeto,
          cliente: atividade.cliente,
          dataPrevista: atividade.dataPrevista,
          prioridade: atividade.prioridade,
          status: atividade.status,
          diasRestantes: diffInDays(parseDate(atividade.dataPrevista), today)
        };
      });
  }

  function obterAtividadesAtrasadas() {
    return listAtividadesDetalhadas()
      .filter(function(atividade) {
        return atividade.diasAtraso > 0 && atividade.status !== 'finalizada';
      })
      .sort(function(a, b) {
        return b.diasAtraso - a.diasAtraso;
      });
  }

  function obterTopClientesPorValor(limit) {
    const max = Number.isFinite(Number(limit)) ? Number(limit) : 5;
    const agrupado = listProjetosDetalhados().reduce(function(map, projeto) {
      const cliente = projeto.nomeCliente || projeto.cliente || 'Cliente não informado';

      if (!map[cliente]) {
        map[cliente] = { cliente: cliente, valor: 0, projetos: 0 };
      }

      map[cliente].valor += projeto.valorTotal;
      map[cliente].projetos += 1;

      return map;
    }, {});

    return Object.keys(agrupado)
      .map(function(chave) { return agrupado[chave]; })
      .sort(function(a, b) { return b.valor - a.valor; })
      .slice(0, max);
  }

  function obterProjetoPorStatus() {
    const distribuicao = {
      planejamento: 0,
      em_andamento: 0,
      encerrado: 0
    };

    listProjetosDetalhados().forEach(function(projeto) {
      distribuicao[projeto.status] += 1;
    });

    return Object.keys(distribuicao).map(function(status) {
      return {
        status: status,
        label: STATUS_PROJETO[status].label,
        total: distribuicao[status],
        color: STATUS_PROJETO[status].color
      };
    });
  }

  function obterModalidadesMaisContratadas() {
    const ranking = listProjetosDetalhados().reduce(function(map, projeto) {
      const modalidade = projeto.modalidade || 'Não informada';
      if (!map[modalidade]) {
        map[modalidade] = { modalidade: modalidade, total: 0, valor: 0 };
      }

      map[modalidade].total += 1;
      map[modalidade].valor += projeto.valorTotal;
      return map;
    }, {});

    return Object.keys(ranking)
      .map(function(chave) { return ranking[chave]; })
      .sort(function(a, b) {
        if (b.total !== a.total) return b.total - a.total;
        return b.valor - a.valor;
      });
  }

  function calcularProgresso7Dias() {
    const atividades = listAtividadesDetalhadas();
    const totalAtividades = atividades.length || 1;
    const hoje = startOfDay(new Date());
    const pontos = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const dia = new Date(hoje);
      dia.setDate(dia.getDate() - offset);

      const concluidas = atividades.filter(function(atividade) {
        if (atividade.status !== 'finalizada') {
          return false;
        }

        const referenciaConclusao = parseDate(atividade.dataRealizada || atividade.dataAtualizacao || atividade.dataPrevista);
        return referenciaConclusao && startOfDay(referenciaConclusao) <= dia;
      }).length;

      pontos.push({
        data: formatDateISO(dia),
        label: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        percentual: Math.round((concluidas / totalAtividades) * 100),
        concluidas: concluidas
      });
    }

    return pontos;
  }

  function obterAlertas() {
    const atrasadas = obterAtividadesAtrasadas();
    const projetos = listProjetosDetalhados();

    return {
      criticos: atrasadas.filter(function(atividade) {
        return atividade.diasAtraso > 14;
      }),
      alertas: atrasadas.filter(function(atividade) {
        return atividade.diasAtraso >= 7 && atividade.diasAtraso <= 14;
      }),
      semInicio: projetos.filter(function(projeto) {
        return projeto.semAtividadeIniciada7dias;
      })
    };
  }

  function getCanvasContext(canvas) {
    if (!canvas || typeof canvas.getContext !== 'function') return null;
    return canvas.getContext('2d');
  }

  function clearCanvas(ctx, canvas) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawLegend(ctx, items, startX, startY) {
    items.forEach(function(item, index) {
      const y = startY + (index * 22);
      ctx.fillStyle = item.color;
      ctx.fillRect(startX, y - 10, 12, 12);
      ctx.fillStyle = '#4B5563';
      ctx.font = '12px Montserrat, sans-serif';
      ctx.fillText(item.label + ' (' + item.total + ')', startX + 18, y);
    });
  }

  function drawPieChart(canvas, items) {
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    clearCanvas(ctx, canvas);

    const total = items.reduce(function(sum, item) { return sum + item.total; }, 0);
    if (!total) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Montserrat, sans-serif';
      ctx.fillText('Sem dados para exibir.', 20, canvas.height / 2);
      return;
    }

    let startAngle = -Math.PI / 2;
    const radius = 72;
    const centerX = 110;
    const centerY = canvas.height / 2;

    items.forEach(function(item) {
      const slice = (item.total / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.fillStyle = item.color;
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fill();
      startAngle += slice;
    });

    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(centerX, centerY, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(total), centerX, centerY + 6);
    ctx.textAlign = 'left';

    drawLegend(ctx, items, 220, 80);
  }

  function drawBarChart(canvas, items) {
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    clearCanvas(ctx, canvas);

    if (!items.length) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Montserrat, sans-serif';
      ctx.fillText('Sem dados para exibir.', 20, canvas.height / 2);
      return;
    }

    const maxValue = Math.max.apply(null, items.map(function(item) { return item.valor; })) || 1;
    const chartHeight = 180;
    const chartBottom = 220;
    const barWidth = 48;
    const gap = 24;

    items.forEach(function(item, index) {
      const barHeight = Math.max(12, (item.valor / maxValue) * chartHeight);
      const x = 40 + (index * (barWidth + gap));
      const y = chartBottom - barHeight;

      ctx.fillStyle = '#C9A66B';
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.fillStyle = '#374151';
      ctx.font = '11px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatCurrency(item.valor).replace(',00', ''), x + (barWidth / 2), y - 8);
      ctx.fillText(item.cliente.slice(0, 10), x + (barWidth / 2), chartBottom + 18);
    });

    ctx.textAlign = 'left';
  }

  function drawLineChart(canvas, points) {
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    clearCanvas(ctx, canvas);

    if (!points.length) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Montserrat, sans-serif';
      ctx.fillText('Sem dados para exibir.', 20, canvas.height / 2);
      return;
    }

    const chartLeft = 40;
    const chartTop = 30;
    const chartHeight = 170;
    const chartWidth = 500;

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let step = 0; step <= 4; step += 1) {
      const y = chartTop + (step * (chartHeight / 4));
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartLeft + chartWidth, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#C9A66B';
    ctx.lineWidth = 3;
    ctx.beginPath();

    points.forEach(function(point, index) {
      const x = chartLeft + (index * (chartWidth / Math.max(points.length - 1, 1)));
      const y = chartTop + chartHeight - ((point.percentual / 100) * chartHeight);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    points.forEach(function(point, index) {
      const x = chartLeft + (index * (chartWidth / Math.max(points.length - 1, 1)));
      const y = chartTop + chartHeight - ((point.percentual / 100) * chartHeight);
      ctx.fillStyle = '#A0845A';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4B5563';
      ctx.font = '11px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x, chartTop + chartHeight + 18);
      ctx.fillText(point.percentual + '%', x, y - 10);
    });

    ctx.textAlign = 'left';
  }

  function drawHorizontalBarChart(canvas, items) {
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    clearCanvas(ctx, canvas);

    if (!items.length) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Montserrat, sans-serif';
      ctx.fillText('Sem dados para exibir.', 20, canvas.height / 2);
      return;
    }

    const maxValue = Math.max.apply(null, items.map(function(item) { return item.total; })) || 1;

    items.slice(0, 5).forEach(function(item, index) {
      const y = 40 + (index * 42);
      const width = 120 + ((item.total / maxValue) * 320);

      ctx.fillStyle = '#EFE7DA';
      ctx.fillRect(180, y, 330, 18);
      ctx.fillStyle = '#C9A66B';
      ctx.fillRect(180, y, width, 18);
      ctx.fillStyle = '#374151';
      ctx.font = '12px Montserrat, sans-serif';
      ctx.fillText(item.modalidade, 20, y + 13);
      ctx.fillText(String(item.total), Math.min(530, 190 + width), y + 13);
    });
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setHTML(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = value;
    }
  }

  function renderKPIs(kpis) {
    setText('kpiTotalProjetos', String(kpis.totalProjetos));
    setText('kpiProjetosAndamento', String(kpis.projetosEmAndamento));
    setText('kpiAtividadesAtraso', String(kpis.atividadesEmAtraso));
    setText('kpiTaxaSucesso', Math.round(kpis.taxaSucesso * 100) + '%');
    setText('kpiValorTotal', formatCurrency(kpis.valorTotalProjetos));
    setText('kpiValorRisco', formatCurrency(kpis.valorEmRisco));
  }

  function renderTimeline() {
    const container = document.getElementById('timelineList');
    if (!container) return;

    const atividades = obterProximasAtividades(7);

    if (!atividades.length) {
      container.innerHTML = '<div class="empty-message">Nenhuma atividade prevista para os próximos 7 dias.</div>';
      return;
    }

    container.innerHTML = atividades.map(function(atividade) {
      const prioridade = PRIORIDADES[atividade.prioridade] || PRIORIDADES.media;
      const status = STATUS_ATIVIDADE[atividade.status] || STATUS_ATIVIDADE.nao_iniciada;
      const prazoTexto = atividade.diasRestantes === 0 ? 'Hoje' : 'Em ' + atividade.diasRestantes + ' dia(s)';

      return (
        '<article class="timeline-item">'
        + '<div class="timeline-priority">' + prioridade.icon + '</div>'
        + '<div class="timeline-content">'
        + '<div class="timeline-title-row"><h3>' + atividade.titulo + '</h3><span class="status-pill ' + status.className + '">' + status.label + '</span></div>'
        + '<p><strong>Projeto:</strong> ' + atividade.projeto + '</p>'
        + '<p><strong>Cliente:</strong> ' + atividade.cliente + '</p>'
        + '<p><strong>Prazo:</strong> ' + formatDateBR(atividade.dataPrevista) + ' · ' + prazoTexto + '</p>'
        + '</div>'
        + '</article>'
      );
    }).join('');
  }

  function renderProjetosDestaque() {
    const tbody = document.getElementById('projetosDestaqueBody');
    if (!tbody) return;

    const filtro = document.getElementById('projetosStatusFiltro');
    const ordenacao = document.getElementById('projetosOrdenacao');
    const filtroStatus = filtro ? filtro.value : 'todos';
    const ordenacaoAtual = ordenacao ? ordenacao.value : 'conclusao_desc';

    let projetos = listProjetosDetalhados().slice();

    if (filtroStatus !== 'todos') {
      projetos = projetos.filter(function(projeto) {
        return projeto.status === filtroStatus;
      });
    }

    projetos.sort(function(a, b) {
      if (ordenacaoAtual === 'conclusao_asc') return a.percentualConclusao - b.percentualConclusao;
      if (ordenacaoAtual === 'data_desc') return parseDate(b.dataFimPrevisto || b.dataInicio || new Date(0)) - parseDate(a.dataFimPrevisto || a.dataInicio || new Date(0));
      if (ordenacaoAtual === 'data_asc') return parseDate(a.dataFimPrevisto || a.dataInicio || new Date(0)) - parseDate(b.dataFimPrevisto || b.dataInicio || new Date(0));
      return b.percentualConclusao - a.percentualConclusao;
    });

    if (!projetos.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-table">Nenhum projeto encontrado para o filtro selecionado.</td></tr>';
      return;
    }

    tbody.innerHTML = projetos.map(function(projeto) {
      const status = STATUS_PROJETO[projeto.status];
      const proximaAtividade = projeto.proximaAtividade
        ? projeto.proximaAtividade.titulo + ' · ' + formatDateBR(projeto.proximaAtividade.dataPrevista)
        : 'Sem atividades pendentes';

      return (
        '<tr>'
        + '<td>' + (projeto.nomeCliente || '—') + '</td>'
        + '<td>' + projeto.titulo + '</td>'
        + '<td><span class="status-pill ' + status.className + '">' + status.label + '</span></td>'
        + '<td>'
        + '<div class="progress-cell"><span>' + projeto.percentualConclusao + '%</span><div class="progress-bar"><div class="progress-fill" style="width:' + projeto.percentualConclusao + '%"></div></div></div>'
        + '</td>'
        + '<td>' + proximaAtividade + '</td>'
        + '<td><a class="table-link" href="./pmo-geral.html?projetoId=' + encodeURIComponent(projeto.id) + '">Ver Detalhes</a></td>'
        + '</tr>'
      );
    }).join('');
  }

  function renderAlertas() {
    const container = document.getElementById('alertasList');
    if (!container) return;

    const alertas = obterAlertas();
    const secoes = [];

    if (alertas.criticos.length) {
      secoes.push(
        '<section class="alert-block critical">'
        + '<h3>CRÍTICO 🔴</h3>'
        + alertas.criticos.map(function(atividade) {
          return '<div class="alert-row"><strong>' + atividade.titulo + '</strong><span>' + atividade.projeto + ' · ' + atividade.diasAtraso + ' dias de atraso</span></div>';
        }).join('')
        + '</section>'
      );
    }

    if (alertas.alertas.length) {
      secoes.push(
        '<section class="alert-block warning">'
        + '<h3>ALERTA 🟡</h3>'
        + alertas.alertas.map(function(atividade) {
          return '<div class="alert-row"><strong>' + atividade.titulo + '</strong><span>' + atividade.projeto + ' · ' + atividade.diasAtraso + ' dias de atraso</span></div>';
        }).join('')
        + '</section>'
      );
    }

    if (alertas.semInicio.length) {
      secoes.push(
        '<section class="alert-block neutral">'
        + '<h3>Sem atividades iniciadas há mais de 7 dias</h3>'
        + alertas.semInicio.map(function(projeto) {
          return '<div class="alert-row"><strong>' + projeto.titulo + '</strong><span>' + (projeto.nomeCliente || 'Cliente não informado') + '</span></div>';
        }).join('')
        + '</section>'
      );
    }

    if (!secoes.length) {
      container.innerHTML = '<div class="empty-message">Nenhum alerta relevante no momento.</div>';
      return;
    }

    container.innerHTML = secoes.join('');
  }

  function renderCharts() {
    drawPieChart(document.getElementById('statusChart'), obterProjetoPorStatus());
    drawBarChart(document.getElementById('clientesChart'), obterTopClientesPorValor(5));
    drawLineChart(document.getElementById('progressoChart'), calcularProgresso7Dias());
    drawHorizontalBarChart(document.getElementById('modalidadesChart'), obterModalidadesMaisContratadas());
  }

  function renderLastUpdated() {
    setText('dashboardAtualizadoEm', 'Atualizado em ' + new Date().toLocaleString('pt-BR'));
  }

  function renderDashboardPage() {
    if (!document.getElementById('kpiTotalProjetos')) return;

    const kpis = calcularKPIs();
    renderKPIs(kpis);
    renderCharts();
    renderTimeline();
    renderProjetosDestaque();
    renderAlertas();
    renderLastUpdated();
  }

  function getPmoFiltroFromQuery(value) {
    if (value === 'andamento') return 'em_andamento';
    if (value === 'em_andamento') return 'em_andamento';
    if (value === 'encerrado') return 'encerrado';
    if (value === 'planejamento') return 'planejamento';
    return 'todos';
  }

  function renderPmoProjetosGrid() {
    const grid = document.getElementById('projetosGrid');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    const filtro = getPmoFiltroFromQuery(params.get('filtro'));
    const projetoId = params.get('projetoId');
    let projetos = listProjetosDetalhados();

    if (projetoId) {
      projetos = projetos.filter(function(projeto) {
        return projeto.id === projetoId;
      });
    } else if (filtro !== 'todos') {
      projetos = projetos.filter(function(projeto) {
        return projeto.status === filtro;
      });
    }

    if (!projetos.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><h3>Nenhum projeto encontrado</h3><p>Verifique o filtro aplicado no PMO Geral.</p></div>';
      return;
    }

    grid.innerHTML = projetos.map(function(projeto) {
      const status = STATUS_PROJETO[projeto.status];
      const atividades = projeto.atividades.slice(0, 4).map(function(atividade) {
        const statusAtividade = STATUS_ATIVIDADE[atividade.status] || STATUS_ATIVIDADE.nao_iniciada;
        return (
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-sm);gap:var(--spacing-sm);">'
          + '<span style="font-size:var(--fs-sm);">' + atividade.titulo + '</span>'
          + '<span class="status-badge ' + statusAtividade.className + '">' + statusAtividade.label + '</span>'
          + '</div>'
        );
      }).join('');

      return (
        '<div class="projeto-card ' + status.className + (projetoId === projeto.id ? ' selected' : '') + '">'
        + '<div class="projeto-header">'
        + '<h3 class="projeto-titulo">' + projeto.titulo + '</h3>'
        + '<p class="projeto-cliente">👤 ' + (projeto.nomeCliente || 'Cliente não informado') + '</p>'
        + '<span class="projeto-status">' + status.label + '</span>'
        + '</div>'
        + '<div class="projeto-body">'
        + '<div class="projeto-info-row"><span class="info-label">Gestor</span><span class="info-value">' + (projeto.gestorResponsavel || '—') + '</span></div>'
        + '<div class="projeto-info-row"><span class="info-label">Início</span><span class="info-value">' + formatDateBR(projeto.dataInicio) + '</span></div>'
        + '<div class="projeto-info-row"><span class="info-label">Previsão</span><span class="info-value">' + formatDateBR(projeto.dataFimPrevisto) + '</span></div>'
        + '<div class="projeto-info-row"><span class="info-label">Valor</span><span class="info-value">' + formatCurrency(projeto.valorTotal) + '</span></div>'
        + '<div class="projeto-info-row"><span class="info-label">Progresso</span><span class="info-value">' + projeto.percentualConclusao + '%</span></div>'
        + '<div class="progress-bar"><div class="progress-fill" style="width:' + projeto.percentualConclusao + '%"></div></div>'
        + '<h4 style="margin-top:var(--spacing-lg);margin-bottom:var(--spacing-md);font-weight:var(--fw-bold);font-size:var(--fs-base);">Próximas atividades</h4>'
        + (atividades || '<p class="text-muted">Sem atividades vinculadas.</p>')
        + '</div>'
        + '<div class="projeto-footer">'
        + '<a class="btn-view" href="./pmo-geral.html?projetoId=' + encodeURIComponent(projeto.id) + '">👁️ Visualizar</a>'
        + '</div>'
        + '</div>'
      );
    }).join('');
  }

  function syncPmoButtons() {
    const params = new URLSearchParams(window.location.search);
    const filtro = getPmoFiltroFromQuery(params.get('filtro'));
    const projetoId = params.get('projetoId');
    const buttons = document.querySelectorAll('.filter-btn[data-filter]');

    buttons.forEach(function(button) {
      button.classList.toggle('active', !projetoId && button.getAttribute('data-filter') === filtro);
    });
  }

  function bindDashboardFilters() {
    const filtro = document.getElementById('projetosStatusFiltro');
    const ordenacao = document.getElementById('projetosOrdenacao');

    if (filtro) filtro.addEventListener('change', renderProjetosDestaque);
    if (ordenacao) ordenacao.addEventListener('change', renderProjetosDestaque);
  }

  function bindPmoFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(function(button) {
      button.addEventListener('click', function() {
        const filter = button.getAttribute('data-filter');
        const query = filter && filter !== 'todos' ? '?filtro=' + encodeURIComponent(filter) : '';
        window.location.href = './pmo-geral.html' + query;
      });
    });
  }

  function initRealtimeRefresh() {
    window.addEventListener('storage', function() {
      renderDashboardPage();
      renderPmoProjetosGrid();
      syncPmoButtons();
    });

    window.addEventListener('focus', function() {
      renderDashboardPage();
      renderPmoProjetosGrid();
      syncPmoButtons();
    });
  }

  const api = {
    ensureSeedData: ensureSeedData,
    listarProjetosDetalhados: listProjetosDetalhados,
    listarAtividadesDetalhadas: listAtividadesDetalhadas,
    calcularKPIs: calcularKPIs,
    obterProximasAtividades: obterProximasAtividades,
    obterAtividadesAtrasadas: obterAtividadesAtrasadas,
    obterTopClientesPorValor: obterTopClientesPorValor,
    obterProjetoPorStatus: obterProjetoPorStatus,
    obterModalidadesMaisContratadas: obterModalidadesMaisContratadas,
    calcularProgresso7Dias: calcularProgresso7Dias,
    obterAlertas: obterAlertas,
    renderDashboardPage: renderDashboardPage,
    renderPmoProjetosGrid: renderPmoProjetosGrid,
    syncPmoButtons: syncPmoButtons,
    bindDashboardFilters: bindDashboardFilters,
    bindPmoFilters: bindPmoFilters,
    initRealtimeRefresh: initRealtimeRefresh,
    formatCurrency: formatCurrency,
    formatDateBR: formatDateBR
  };

  global.DashboardPMO = api;
}(window));
