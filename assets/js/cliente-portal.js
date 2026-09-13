(function () {
  'use strict';

  const STORAGE_KEYS = {
    session: 'cliente_session',
    clients: 'helpdesk_clientes',
    projects: 'helpdesk_projetos',
    activities: 'helpdesk_atividades',
    chamados: 'helpdesk_chamados',
    chatCurrent: 'cliente_chat_historico',
    chatMap: 'cliente_chat_historico_map',
    trainingProgress: 'cliente_treinamentos_status',
    certificates: 'cliente_treinamentos_concluidos'
  };

  const PORTAL_PAGES = ['dashboard.html', 'meus-projetos.html', 'chamados.html', 'chat.html', 'treinamentos.html', 'certificados.html', 'perfil.html'];

  const MODALIDADES = [
    'Cloud',
    'Treinamento',
    'Gestão de Acessos',
    'Implementações',
    'Hub de Notas',
    'BI',
    'Dashboard',
    'BPO Financeiro',
    'BPO Contábil',
    'BPO Fiscal',
    'BPO Folha',
    'Integrações',
    'Dúvidas'
  ];

  const TRAININGS = [
    {
      id: 'treino-001',
      titulo: 'Governança em Cloud',
      descricao: 'Boas práticas de governança, gestão de custos e monitoramento contínuo em ambientes cloud.',
      duracaoMinutos: 45,
      instrutora: 'Marina Costa'
    },
    {
      id: 'treino-002',
      titulo: 'Processos de Help Desk BPI',
      descricao: 'Fluxo de chamados, prioridades, SLA e rituais de acompanhamento com a equipe BPI.',
      duracaoMinutos: 35,
      instrutora: 'Aline Ribeiro'
    },
    {
      id: 'treino-003',
      titulo: 'Leitura de Dashboards Executivos',
      descricao: 'Interpretação de indicadores, filtros e drill-downs para tomada de decisão baseada em dados.',
      duracaoMinutos: 50,
      instrutora: 'Diego Martins'
    },
    {
      id: 'treino-004',
      titulo: 'Integrações e Segurança Operacional',
      descricao: 'Checklist de integrações, validações de dados e recomendações de segurança operacional.',
      duracaoMinutos: 40,
      instrutora: 'Fernanda Lopes'
    }
  ];

  const QUESTION_TOPICS = [
    'Governança em Cloud',
    'Custos em Nuvem',
    'KPIs Executivos',
    'Processos de Help Desk',
    'Gestão de Acessos',
    'BI Corporativo',
    'Integrações',
    'BPO Financeiro',
    'BPO Contábil',
    'BPO Fiscal',
    'Folha de Pagamento',
    'Compliance',
    'Automação',
    'Treinamento de Usuários'
  ];

  const QUESTION_POOL = QUESTION_TOPICS.flatMap((topic, topicIndex) => {
    return [
      {
        id: `q-${topicIndex + 1}-a`,
        pergunta: `No contexto de ${topic}, qual prática aumenta a previsibilidade operacional?`,
        opcoes: ['Definir responsáveis, prazos e evidências de execução', 'Executar atividades sem registros formais', 'Trocar indicadores toda semana sem alinhamento'],
        correta: 0
      },
      {
        id: `q-${topicIndex + 1}-b`,
        pergunta: `Qual é o melhor indicador para acompanhar ${topic}?`,
        opcoes: ['Indicadores de prazo, qualidade e aderência ao plano', 'Apenas quantidade de e-mails trocados', 'Somente percepção individual do time'],
        correta: 0
      },
      {
        id: `q-${topicIndex + 1}-c`,
        pergunta: `Em uma operação de ${topic}, o que fazer ao identificar risco relevante?`,
        opcoes: ['Registrar o risco, comunicar stakeholders e definir plano de ação', 'Ignorar o risco até o cliente reclamar', 'Alterar prazos sem avisar ninguém'],
        correta: 0
      }
    ];
  });

  const CLIENT_PROFILES = Object.freeze([
    {
      clientId: 'cli-001',
      nomeCliente: 'Cliente A',
      razaoSocial: 'Cliente A Tecnologia Ltda.',
      cnpj: '12.345.678/0001-90',
      email: 'contato@clientea.com.br',
      avatar: 'CA',
      telefone: '(11) 3000-0001',
      endereco: 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP',
      contatos: [
        { nome: 'Ana Martins', email: 'ana.martins@clientea.com.br', telefone: '(11) 98888-0101', cargo: 'Diretora Financeira' },
        { nome: 'Carlos Lima', email: 'carlos.lima@clientea.com.br', telefone: '(11) 98888-0102', cargo: 'Coordenador de TI' }
      ]
    },
    {
      clientId: 'cli-002',
      nomeCliente: 'Cliente B',
      razaoSocial: 'Cliente B Operações S.A.',
      cnpj: '98.765.432/0001-10',
      email: 'contato@clienteb.com.br',
      avatar: 'CB',
      telefone: '(21) 3100-2200',
      endereco: 'Rua das Laranjeiras, 220 - Rio de Janeiro/RJ',
      contatos: [
        { nome: 'Beatriz Souza', email: 'beatriz.souza@clienteb.com.br', telefone: '(21) 97777-1101', cargo: 'Gerente Administrativa' }
      ]
    },
    {
      clientId: 'cli-003',
      nomeCliente: 'Cliente C',
      razaoSocial: 'Cliente C Participações Ltda.',
      cnpj: '55.555.555/0001-55',
      email: 'contato@clientec.com.br',
      avatar: 'CC',
      telefone: '(31) 3200-5500',
      endereco: 'Av. Afonso Pena, 1450 - Centro - Belo Horizonte/MG',
      contatos: [
        { nome: 'Fernanda Rocha', email: 'fernanda.rocha@clientec.com.br', telefone: '(31) 96666-9901', cargo: 'Head de Operações' }
      ]
    }
  ]);

  const TRUSTED_ACCOUNTS = Object.freeze({
    cliente: CLIENT_PROFILES.map((profile) => ({
      clientId: profile.clientId,
      email: profile.email,
      cnpj: profile.cnpj,
      password: '123456'
    }))
  });

  const state = {
    selectedProjectId: null,
    projectActivityFilter: 'todas',
    selectedChamadoId: null,
    selectedTrainingId: null,
    quizQuestions: [],
    selectedQuizTrainingId: null,
    certificationMessage: ''
  };

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Falha ao ler ${key}`, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function normalizeCredential(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value || 'arquivo')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'arquivo';
  }

  function isoOffset(days) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  }

  function statusLabel(status) {
    const labels = {
      planejamento: 'Planejamento',
      em_andamento: 'Em andamento',
      encerrado: 'Encerrado',
      concluido: 'Concluído',
      disponivel: 'Disponível',
      nao_iniciada: 'Não iniciada',
      finalizada: 'Finalizada',
      aberto: 'Aberto',
      em_atendimento: 'Em atendimento',
      fechado: 'Fechado',
      risco: 'Com risco',
      atrasado: 'Atrasado'
    };
    return labels[status] || status || '—';
  }

  function priorityLabel(priority) {
    const labels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
    return labels[priority] || priority || '—';
  }

  function priorityIcon(priority) {
    const icons = { alta: '🔴', media: '🟡', baixa: '🟢' };
    return icons[priority] || '⚪';
  }

  function getSafeReturnPath(rawValue) {
    if (!rawValue) return './dashboard.html';
    try {
      const parsed = decodeURIComponent(rawValue);
      const withoutPrefix = parsed.replace(/^\.?\/cliente\//, '').replace(/^\.?\//, '');
      const url = new URL(`https://portal.local/${withoutPrefix}`);
      const fileName = url.pathname.split('/').pop();
      if (!PORTAL_PAGES.includes(fileName)) {
        return './dashboard.html';
      }
      const search = url.search || '';
      const hash = url.hash || '';
      return `./${fileName}${search}${hash}`;
    } catch (_error) {
      return './dashboard.html';
    }
  }

  function buildDefaultClients() {
    return CLIENT_PROFILES.map((profile) => ({
      id: profile.clientId,
      nome: profile.nomeCliente,
      nomeCliente: profile.nomeCliente,
      razaoSocial: profile.razaoSocial,
      cnpj: profile.cnpj,
      email: profile.email,
      telefone: profile.telefone,
      endereco: profile.endereco,
      avatar: profile.avatar,
      contatos: profile.contatos,
      ativo: true
    }));
  }

  function buildSeedProjects() {
    return [
      {
        id: 'proj-cli-001-01',
        clientId: 'cli-001',
        nomeCliente: 'Cliente A',
        titulo: 'Implantação Financeira Integrada',
        descricao: 'Projeto de estruturação financeira, painéis gerenciais e automação de fechamentos.',
        escopo: 'Implantação do módulo financeiro, desenho de indicadores de performance, parametrização de aprovações e sustentação assistida.',
        status: 'em_andamento',
        dataInicio: isoOffset(-20),
        dataFimPrevisto: isoOffset(24),
        gestorResponsavel: 'André Gusmão',
        gestorEmail: 'andre@bpi.com.br',
        percentualConclusao: 58,
        prioridade: 'alta',
        modalidade: 'BPO Financeiro',
        servicosContratados: [
          { nome: 'Setup Financeiro', tipo: 'setup', valor: 18000, prazo: '15 dias', status: 'finalizada' },
          { nome: 'Operação Recorrente', tipo: 'recorrente', valorMensal: 3200, prazo: '12 meses', status: 'em_andamento' },
          { nome: 'Dashboard Executivo', tipo: 'setup', valor: 9500, prazo: '20 dias', status: 'em_andamento' }
        ],
        entregas: ['Plano de contas revisado', 'Workflow de aprovações', 'Dashboard executivo liberado'],
        cronograma: [
          { fase: 'Kickoff', inicio: isoOffset(-20), fim: isoOffset(-18), status: 'finalizada' },
          { fase: 'Mapeamento', inicio: isoOffset(-17), fim: isoOffset(-8), status: 'finalizada' },
          { fase: 'Implantação', inicio: isoOffset(-7), fim: isoOffset(15), status: 'em_andamento' },
          { fase: 'Estabilização', inicio: isoOffset(16), fim: isoOffset(24), status: 'nao_iniciada' }
        ],
        termoAberturaDocId: 'TAB-001',
        statusTermoAbertura: 'Assinado',
        termoEncerramentoDocId: 'TEC-001',
        statusTermoEncerramento: 'Pendente',
        documentos: [],
        atividades: []
      },
      {
        id: 'proj-cli-001-02',
        clientId: 'cli-001',
        nomeCliente: 'Cliente A',
        titulo: 'Treinamento de Lideranças Operacionais',
        descricao: 'Capacitação para uso de dashboards e rituais de governança mensal.',
        escopo: 'Treinamentos executivos, exercícios práticos e preparação para acompanhamento de indicadores operacionais.',
        status: 'planejamento',
        dataInicio: isoOffset(6),
        dataFimPrevisto: isoOffset(32),
        gestorResponsavel: 'João Santos',
        gestorEmail: 'joao@bpi.com.br',
        percentualConclusao: 10,
        prioridade: 'media',
        modalidade: 'Treinamento',
        servicosContratados: [
          { nome: 'Trilha de Liderança', tipo: 'setup', valor: 6400, prazo: '10 dias', status: 'nao_iniciada' },
          { nome: 'Acompanhamento Pós-turma', tipo: 'recorrente', valorMensal: 900, prazo: '3 meses', status: 'nao_iniciada' }
        ],
        entregas: ['Agenda aprovada', 'Material de apoio entregue', 'Avaliação de reação aplicada'],
        cronograma: [
          { fase: 'Planejamento', inicio: isoOffset(6), fim: isoOffset(10), status: 'em_andamento' },
          { fase: 'Execução', inicio: isoOffset(11), fim: isoOffset(25), status: 'nao_iniciada' },
          { fase: 'Encerramento', inicio: isoOffset(26), fim: isoOffset(32), status: 'nao_iniciada' }
        ],
        termoAberturaDocId: 'TAB-002',
        statusTermoAbertura: 'Pendente',
        termoEncerramentoDocId: 'TEC-002',
        statusTermoEncerramento: 'Pendente',
        documentos: [],
        atividades: []
      },
      {
        id: 'proj-cli-002-01',
        clientId: 'cli-002',
        nomeCliente: 'Cliente B',
        titulo: 'Hub de Notas e Conciliação',
        descricao: 'Automação de captura de notas, conciliações e monitoramento de exceções.',
        escopo: 'Integração do hub de notas com painéis executivos e governança de exceções operacionais.',
        status: 'em_andamento',
        dataInicio: isoOffset(-14),
        dataFimPrevisto: isoOffset(18),
        gestorResponsavel: 'Maria Silva',
        gestorEmail: 'maria@bpi.com.br',
        percentualConclusao: 68,
        prioridade: 'alta',
        modalidade: 'Hub de Notas',
        servicosContratados: [
          { nome: 'Implantação Hub', tipo: 'setup', valor: 21000, prazo: '25 dias', status: 'em_andamento' },
          { nome: 'Monitoramento Mensal', tipo: 'recorrente', valorMensal: 2800, prazo: '12 meses', status: 'em_andamento' }
        ],
        entregas: ['Conector homologado', 'Dashboard de exceções', 'Playbook operacional'],
        cronograma: [
          { fase: 'Análise', inicio: isoOffset(-14), fim: isoOffset(-10), status: 'finalizada' },
          { fase: 'Construção', inicio: isoOffset(-9), fim: isoOffset(10), status: 'em_andamento' },
          { fase: 'Go-live', inicio: isoOffset(11), fim: isoOffset(18), status: 'nao_iniciada' }
        ],
        termoAberturaDocId: 'TAB-003',
        statusTermoAbertura: 'Assinado',
        termoEncerramentoDocId: 'TEC-003',
        statusTermoEncerramento: 'Pendente',
        documentos: [],
        atividades: []
      },
      {
        id: 'proj-cli-003-01',
        clientId: 'cli-003',
        nomeCliente: 'Cliente C',
        titulo: 'Painel Fiscal Corporativo',
        descricao: 'Centralização de indicadores fiscais com alertas de obrigações e variações tributárias.',
        escopo: 'Construção de painéis fiscais, rotinas de validação e gestão de riscos tributários.',
        status: 'encerrado',
        dataInicio: isoOffset(-60),
        dataFimPrevisto: isoOffset(-8),
        dataFimReal: isoOffset(-6),
        gestorResponsavel: 'André Gusmão',
        gestorEmail: 'andre@bpi.com.br',
        percentualConclusao: 100,
        prioridade: 'baixa',
        modalidade: 'BPO Fiscal',
        servicosContratados: [
          { nome: 'Painel Fiscal', tipo: 'setup', valor: 15000, prazo: '30 dias', status: 'finalizada' },
          { nome: 'Suporte de Ajustes', tipo: 'recorrente', valorMensal: 1500, prazo: '6 meses', status: 'finalizada' }
        ],
        entregas: ['Painel publicado', 'Manual de operação', 'Checklist de fechamento fiscal'],
        cronograma: [
          { fase: 'Descoberta', inicio: isoOffset(-60), fim: isoOffset(-48), status: 'finalizada' },
          { fase: 'Desenvolvimento', inicio: isoOffset(-47), fim: isoOffset(-20), status: 'finalizada' },
          { fase: 'Encerramento', inicio: isoOffset(-19), fim: isoOffset(-8), status: 'finalizada' }
        ],
        termoAberturaDocId: 'TAB-004',
        statusTermoAbertura: 'Assinado',
        termoEncerramentoDocId: 'TEC-004',
        statusTermoEncerramento: 'Assinado',
        documentos: [],
        atividades: []
      }
    ];
  }

  function buildSeedActivities() {
    return [
      { id: 'atv-001', clientId: 'cli-001', projetoId: 'proj-cli-001-01', titulo: 'Kickoff executivo', descricao: 'Alinhamento inicial do cronograma e governança.', ator: 'BPI', atorEmail: 'andre@bpi.com.br', atorCargo: 'Gestor PMO', dataPrevista: isoOffset(-19), status: 'finalizada', prioridade: 'alta', percentualConclusao: 100, dataCriacao: isoOffset(-21), dataAtualizacao: isoOffset(-19) },
      { id: 'atv-002', clientId: 'cli-001', projetoId: 'proj-cli-001-01', titulo: 'Homologar plano de contas', descricao: 'Validação do plano de contas revisado.', ator: 'Cliente', atorEmail: 'ana.martins@clientea.com.br', atorCargo: 'Diretora Financeira', dataPrevista: isoOffset(-2), status: 'finalizada', prioridade: 'media', percentualConclusao: 100, dataCriacao: isoOffset(-14), dataAtualizacao: isoOffset(-2) },
      { id: 'atv-003', clientId: 'cli-001', projetoId: 'proj-cli-001-01', titulo: 'Configurar workflow de aprovação', descricao: 'Configuração das regras de aprovação de pagamentos.', ator: 'BPI', atorEmail: 'maria@bpi.com.br', atorCargo: 'Consultora', dataPrevista: isoOffset(2), status: 'em_andamento', prioridade: 'alta', percentualConclusao: 70, dataCriacao: isoOffset(-5), dataAtualizacao: isoOffset(-1) },
      { id: 'atv-004', clientId: 'cli-001', projetoId: 'proj-cli-001-01', titulo: 'Validar dashboard executivo', descricao: 'Avaliação final dos indicadores no painel.', ator: 'Cliente', atorEmail: 'carlos.lima@clientea.com.br', atorCargo: 'Coordenador de TI', dataPrevista: isoOffset(5), status: 'nao_iniciada', prioridade: 'media', percentualConclusao: 0, dataCriacao: isoOffset(-3), dataAtualizacao: isoOffset(-3) },
      { id: 'atv-005', clientId: 'cli-001', projetoId: 'proj-cli-001-02', titulo: 'Aprovar agenda do treinamento', descricao: 'Confirmação dos participantes e agenda.', ator: 'Cliente', atorEmail: 'ana.martins@clientea.com.br', atorCargo: 'Diretora Financeira', dataPrevista: isoOffset(7), status: 'nao_iniciada', prioridade: 'baixa', percentualConclusao: 0, dataCriacao: isoOffset(0), dataAtualizacao: isoOffset(0) },
      { id: 'atv-006', clientId: 'cli-001', projetoId: 'proj-cli-001-02', titulo: 'Preparar material da turma', descricao: 'Montagem do material e avaliação.', ator: 'BPI', atorEmail: 'joao@bpi.com.br', atorCargo: 'Instrutor', dataPrevista: isoOffset(10), status: 'nao_iniciada', prioridade: 'media', percentualConclusao: 0, dataCriacao: isoOffset(1), dataAtualizacao: isoOffset(1) },
      { id: 'atv-007', clientId: 'cli-002', projetoId: 'proj-cli-002-01', titulo: 'Mapear regras de captura', descricao: 'Levantamento com o time fiscal.', ator: 'Cliente', atorEmail: 'beatriz.souza@clienteb.com.br', atorCargo: 'Gerente Administrativa', dataPrevista: isoOffset(-8), status: 'finalizada', prioridade: 'media', percentualConclusao: 100, dataCriacao: isoOffset(-15), dataAtualizacao: isoOffset(-8) },
      { id: 'atv-008', clientId: 'cli-002', projetoId: 'proj-cli-002-01', titulo: 'Corrigir layout de integração', descricao: 'Ajuste no layout enviado pelo ERP.', ator: 'BPI', atorEmail: 'maria@bpi.com.br', atorCargo: 'Consultora', dataPrevista: isoOffset(-1), status: 'em_andamento', prioridade: 'alta', percentualConclusao: 45, dataCriacao: isoOffset(-7), dataAtualizacao: isoOffset(-1) },
      { id: 'atv-009', clientId: 'cli-002', projetoId: 'proj-cli-002-01', titulo: 'Homologação final do hub', descricao: 'Teste ponta a ponta com usuário-chave.', ator: 'Cliente', atorEmail: 'beatriz.souza@clienteb.com.br', atorCargo: 'Gerente Administrativa', dataPrevista: isoOffset(3), status: 'nao_iniciada', prioridade: 'alta', percentualConclusao: 0, dataCriacao: isoOffset(-1), dataAtualizacao: isoOffset(-1) },
      { id: 'atv-010', clientId: 'cli-003', projetoId: 'proj-cli-003-01', titulo: 'Treinamento final de usuários', descricao: 'Transferência operacional e encerramento.', ator: 'BPI', atorEmail: 'andre@bpi.com.br', atorCargo: 'Gestor PMO', dataPrevista: isoOffset(-10), status: 'finalizada', prioridade: 'baixa', percentualConclusao: 100, dataCriacao: isoOffset(-15), dataAtualizacao: isoOffset(-10) }
    ];
  }

  function buildSeedChamados() {
    return [
      {
        id: 'chamado-2026-001',
        clientId: 'cli-001',
        titulo: 'Erro ao localizar painel financeiro',
        modalidade: 'Dashboard',
        descricao: 'Ao abrir o painel executivo, alguns filtros não carregam após o login.',
        prioridade: 'media',
        status: 'em_atendimento',
        dataCriacao: isoOffset(-3),
        dataFechamento: null,
        comentarios: [
          { autor: 'Cliente', texto: 'Os filtros somem quando acesso pelo notebook.', data: isoOffset(-3) },
          { autor: 'Suporte', texto: 'Estamos validando os dados do navegador e retornaremos ainda hoje.', data: isoOffset(-2) }
        ]
      },
      {
        id: 'chamado-2026-002',
        clientId: 'cli-001',
        titulo: 'Dúvida sobre próximos passos do treinamento',
        modalidade: 'Treinamento',
        descricao: 'Preciso confirmar datas e pré-requisitos para a próxima turma.',
        prioridade: 'baixa',
        status: 'aberto',
        dataCriacao: isoOffset(-1),
        dataFechamento: null,
        comentarios: [
          { autor: 'Cliente', texto: 'Podem enviar a agenda preliminar?', data: isoOffset(-1) }
        ]
      },
      {
        id: 'chamado-2026-003',
        clientId: 'cli-002',
        titulo: 'Integração rejeitando XML de teste',
        modalidade: 'Integrações',
        descricao: 'Os XMLs de homologação estão sendo rejeitados na etapa 2 da integração.',
        prioridade: 'alta',
        status: 'aberto',
        dataCriacao: isoOffset(-2),
        dataFechamento: null,
        comentarios: []
      },
      {
        id: 'chamado-2026-004',
        clientId: 'cli-003',
        titulo: 'Ajuste de perfil de acesso concluído',
        modalidade: 'Gestão de Acessos',
        descricao: 'Solicitação de ajuste de permissões para usuários fiscais.',
        prioridade: 'baixa',
        status: 'fechado',
        dataCriacao: isoOffset(-18),
        dataFechamento: isoOffset(-15),
        comentarios: [
          { autor: 'Suporte', texto: 'Permissões atualizadas e validadas com o gestor.', data: isoOffset(-15) }
        ]
      }
    ];
  }

  function ensureSeedData() {
    if (!readJson(STORAGE_KEYS.clients, []).length) {
      writeJson(STORAGE_KEYS.clients, buildDefaultClients());
    }

    if (!readJson(STORAGE_KEYS.projects, []).length) {
      writeJson(STORAGE_KEYS.projects, buildSeedProjects());
    }

    if (!readJson(STORAGE_KEYS.activities, []).length) {
      writeJson(STORAGE_KEYS.activities, buildSeedActivities());
    }

    if (!readJson(STORAGE_KEYS.chamados, []).length) {
      writeJson(STORAGE_KEYS.chamados, buildSeedChamados());
    }

    if (!Array.isArray(readJson(STORAGE_KEYS.certificates, []))) {
      writeJson(STORAGE_KEYS.certificates, []);
    }

    if (!Array.isArray(readJson(STORAGE_KEYS.trainingProgress, []))) {
      writeJson(STORAGE_KEYS.trainingProgress, []);
    }

    if (!Array.isArray(readJson(STORAGE_KEYS.chatMap, []))) {
      writeJson(STORAGE_KEYS.chatMap, []);
    }
  }

  function getClientProfiles() {
    const defaults = buildDefaultClients();
    const stored = readJson(STORAGE_KEYS.clients, []);
    const byId = new Map(defaults.map((profile) => [profile.id, { ...profile }]));

    stored.forEach((item) => {
      const merged = {
        ...byId.get(item.id || item.clientId) || {},
        id: item.id || item.clientId,
        nome: item.nome || item.nomeCliente || item.razaoSocial,
        nomeCliente: item.nomeCliente || item.nome || item.razaoSocial,
        razaoSocial: item.razaoSocial || item.nome || item.nomeCliente,
        cnpj: item.cnpj,
        email: item.email,
        telefone: item.telefone || '',
        endereco: item.endereco || '',
        avatar: item.avatar || initialsFromName(item.nome || item.nomeCliente || item.razaoSocial),
        contatos: Array.isArray(item.contatos) ? item.contatos.slice(0, 5) : (byId.get(item.id || item.clientId)?.contatos || []),
        ativo: item.ativo !== false
      };
      if (merged.id) {
        byId.set(merged.id, merged);
      }
    });

    return Array.from(byId.values());
  }

  function initialsFromName(value) {
    const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0, 2).map((part) => part[0]).join('') || 'CL').toUpperCase();
  }

  function getClientProfile(clientId) {
    return getClientProfiles().find((profile) => profile.id === clientId) || null;
  }

  function getCurrentSession() {
    return readJson(STORAGE_KEYS.session, null);
  }

  function setCurrentSession(profile) {
    const session = {
      clientId: profile.clientId,
      nomeCliente: profile.nomeCliente,
      cnpj: profile.cnpj,
      email: profile.email,
      avatar: profile.avatar,
      loginEm: new Date().toISOString()
    };
    writeJson(STORAGE_KEYS.session, session);
    return session;
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    window.location.href = './login.html';
  }

  function requireSession() {
    const session = getCurrentSession();
    if (!session) {
      const currentPath = `${window.location.pathname.split('/').pop()}${window.location.search || ''}${window.location.hash || ''}`;
      window.location.href = `./login.html?return=${encodeURIComponent(currentPath)}`;
      return null;
    }
    hydrateUserBadges(session);
    return session;
  }

  function hydrateUserBadges(session) {
    const profile = getClientProfile(session.clientId) || session;
    document.querySelectorAll('[data-client-name]').forEach((node) => {
      node.textContent = profile.nomeCliente || profile.nome || session.nomeCliente;
    });
    document.querySelectorAll('[data-client-email]').forEach((node) => {
      node.textContent = profile.email || session.email;
    });
    document.querySelectorAll('[data-client-avatar]').forEach((node) => {
      node.textContent = profile.avatar || session.avatar || initialsFromName(session.nomeCliente);
    });
  }

  function getProjects(clientId) {
    return readJson(STORAGE_KEYS.projects, []).filter((project) => project.clientId === clientId);
  }

  function getActivities(clientId) {
    return readJson(STORAGE_KEYS.activities, []).filter((activity) => activity.clientId === clientId);
  }

  function getChamados(clientId) {
    return readJson(STORAGE_KEYS.chamados, []).filter((chamado) => chamado.clientId === clientId);
  }

  function calculateProjectProgress(project, activities) {
    const projectActivities = activities.filter((activity) => activity.projetoId === project.id);
    if (!projectActivities.length) {
      return Number(project.percentualConclusao || 0);
    }
    const total = projectActivities.reduce((sum, activity) => sum + Number(activity.percentualConclusao || (activity.status === 'finalizada' ? 100 : 0)), 0);
    return Math.round(total / projectActivities.length);
  }

  function getAnnualContractValue(project) {
    return (project.servicosContratados || []).reduce((sum, service) => {
      const setup = Number(service.valor || 0);
      const recurring = Number(service.valorMensal || 0) * 12;
      return sum + setup + recurring;
    }, 0);
  }

  function getUpcomingActivities(clientId, withinDays) {
    const now = Date.now();
    const max = now + withinDays * 24 * 60 * 60 * 1000;
    return getActivities(clientId)
      .filter((activity) => {
        const when = new Date(activity.dataPrevista).getTime();
        return !Number.isNaN(when) && when >= now && when <= max;
      })
      .sort((left, right) => new Date(left.dataPrevista) - new Date(right.dataPrevista));
  }

  function getOverdueActivities(clientId) {
    const now = Date.now();
    return getActivities(clientId)
      .filter((activity) => activity.status !== 'finalizada' && new Date(activity.dataPrevista).getTime() < now)
      .sort((left, right) => new Date(left.dataPrevista) - new Date(right.dataPrevista));
  }

  function getProjectById(clientId, projectId) {
    return getProjects(clientId).find((project) => project.id === projectId) || null;
  }

  function getProjectNextActivity(projectId, activities) {
    return activities
      .filter((activity) => activity.projetoId === projectId && activity.status !== 'finalizada')
      .sort((left, right) => new Date(left.dataPrevista) - new Date(right.dataPrevista))[0] || null;
  }

  function getProjectAlerts(clientId) {
    const projects = getProjects(clientId);
    const activities = getActivities(clientId);
    return projects.reduce((alerts, project) => {
      const overdue = activities.filter((activity) => activity.projetoId === project.id && activity.status !== 'finalizada' && new Date(activity.dataPrevista) < new Date());
      const progress = calculateProjectProgress(project, activities);
      if (overdue.length) {
        alerts.push({
          tipo: 'Atraso',
          titulo: project.titulo,
          descricao: `${overdue.length} atividade(s) em atraso. Próxima pendência: ${overdue[0].titulo}.`,
          status: 'atrasado'
        });
      } else if (project.status === 'em_andamento' && progress < 50) {
        alerts.push({
          tipo: 'Risco',
          titulo: project.titulo,
          descricao: `Projeto em andamento com ${progress}% de conclusão.`,
          status: 'risco'
        });
      }
      return alerts;
    }, []);
  }

  function renderEmptyState(targetId, title, description) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
  }

  function renderDashboard(session) {
    const projects = getProjects(session.clientId);
    const activities = getActivities(session.clientId);
    const activeProjects = projects.filter((project) => project.status === 'em_andamento').length;
    const completedActivities = activities.filter((activity) => activity.status === 'finalizada').length;
    const completionRate = activities.length ? Math.round((completedActivities / activities.length) * 100) : 0;
    const contractedValue = projects.reduce((sum, project) => sum + getAnnualContractValue(project), 0);

    setText('kpiProjetosAtivos', String(activeProjects));
    setText('kpiTaxaConclusao', `${completionRate}%`);
    setText('kpiValorContratado', formatCurrency(contractedValue));

    const projectContainer = document.getElementById('dashboardProjects');
    if (projectContainer) {
      if (!projects.length) {
        projectContainer.innerHTML = '<div class="empty-state"><strong>Nenhum projeto vinculado.</strong><p>Quando um projeto for criado, ele aparecerá aqui.</p></div>';
      } else {
        projectContainer.innerHTML = projects.map((project) => {
          const progress = calculateProjectProgress(project, activities);
          const nextActivity = getProjectNextActivity(project.id, activities);
          return `
            <article class="project-card">
              <div class="card-header-inline">
                <div>
                  <h3>${escapeHtml(project.titulo)}</h3>
                  <p class="small-muted">${escapeHtml(project.modalidade || 'Modalidade não informada')}</p>
                </div>
                <span class="status-badge status-${escapeHtml(project.status)}">${escapeHtml(statusLabel(project.status))}</span>
              </div>
              <div>
                <div class="meta-list"><span>Conclusão</span><strong>${progress}%</strong></div>
                <div class="progress-track"><div class="progress-fill" style="width: ${progress}%"></div></div>
              </div>
              <div class="summary-grid">
                <div><span class="small-muted">Próxima atividade</span><strong>${escapeHtml(nextActivity ? nextActivity.titulo : 'Sem pendências')}</strong></div>
                <div><span class="small-muted">Prazo final</span><strong>${escapeHtml(formatDate(project.dataFimPrevisto))}</strong></div>
              </div>
              <div class="inline-actions">
                <a class="btn btn-outline" href="./meus-projetos.html?projetoId=${encodeURIComponent(project.id)}">Ver Detalhes</a>
              </div>
            </article>`;
        }).join('');
      }
    }

    const upcomingContainer = document.getElementById('dashboardUpcoming');
    const upcoming = getUpcomingActivities(session.clientId, 7);
    if (upcomingContainer) {
      if (!upcoming.length) {
        upcomingContainer.innerHTML = '<div class="empty-state"><strong>Sem atividades para os próximos 7 dias.</strong><p>Seu cronograma está atualizado.</p></div>';
      } else {
        upcomingContainer.innerHTML = `<div class="timeline-list">${upcoming.map((activity) => `
          <div class="timeline-item">
            <div class="badge-row">
              <span class="priority-chip priority-${escapeHtml(activity.prioridade)}">${priorityIcon(activity.prioridade)} ${escapeHtml(priorityLabel(activity.prioridade))}</span>
              <span class="status-badge status-${escapeHtml(activity.status)}">${escapeHtml(statusLabel(activity.status))}</span>
            </div>
            <strong>${escapeHtml(activity.titulo)}</strong>
            <p>${escapeHtml(activity.ator)} • ${escapeHtml(formatDate(activity.dataPrevista))}</p>
          </div>`).join('')}</div>`;
      }
    }

    const alertContainer = document.getElementById('dashboardAlerts');
    const alerts = getProjectAlerts(session.clientId);
    if (alertContainer) {
      if (!alerts.length) {
        alertContainer.innerHTML = '<div class="empty-state"><strong>Sem alertas no momento.</strong><p>Não há atividades em atraso ou projetos com risco.</p></div>';
      } else {
        alertContainer.innerHTML = alerts.map((alert) => `
          <article class="alert-card">
            <div class="badge-row">
              <span class="status-badge status-${escapeHtml(alert.status)}">${escapeHtml(alert.tipo)}</span>
            </div>
            <h3>${escapeHtml(alert.titulo)}</h3>
            <p>${escapeHtml(alert.descricao)}</p>
          </article>`).join('');
      }
    }
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function initProjetos(session) {
    const filter = document.getElementById('projectStatusFilter');
    const activityFilter = document.getElementById('activityStatusFilter');
    const projects = getProjects(session.clientId);
    state.selectedProjectId = new URLSearchParams(window.location.search).get('projetoId') || (projects[0] && projects[0].id) || null;

    if (filter) {
      filter.addEventListener('change', () => renderProjectList(session.clientId, filter.value));
    }

    if (activityFilter) {
      activityFilter.addEventListener('change', () => {
        state.projectActivityFilter = activityFilter.value;
        renderProjectDetail(session.clientId, state.selectedProjectId);
      });
    }

    renderProjectList(session.clientId, filter ? filter.value : 'todos');
    renderProjectDetail(session.clientId, state.selectedProjectId);
  }

  function renderProjectList(clientId, filterValue) {
    const list = document.getElementById('projectList');
    if (!list) return;
    const activities = getActivities(clientId);
    const projects = getProjects(clientId).filter((project) => filterValue === 'todos' || project.status === filterValue);

    if (!projects.length) {
      list.innerHTML = '<div class="empty-state"><strong>Nenhum projeto encontrado.</strong><p>Ajuste o filtro para visualizar outros status.</p></div>';
      return;
    }

    list.innerHTML = projects.map((project) => {
      const progress = calculateProjectProgress(project, activities);
      const nextActivity = getProjectNextActivity(project.id, activities);
      return `
        <article class="project-card ${project.id === state.selectedProjectId ? 'is-selected' : ''}" data-project-id="${escapeHtml(project.id)}">
          <div class="card-header-inline">
            <div>
              <h3>${escapeHtml(project.titulo)}</h3>
              <p class="small-muted">${escapeHtml(project.modalidade || '')}</p>
            </div>
            <span class="status-badge status-${escapeHtml(project.status)}">${escapeHtml(statusLabel(project.status))}</span>
          </div>
          <div class="meta-list"><span>Conclusão</span><strong>${progress}%</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width: ${progress}%"></div></div>
          <div class="summary-grid">
            <div><span class="small-muted">Gestor</span><strong>${escapeHtml(project.gestorResponsavel || '—')}</strong></div>
            <div><span class="small-muted">Próxima atividade</span><strong>${escapeHtml(nextActivity ? nextActivity.titulo : 'Sem pendências')}</strong></div>
          </div>
          <button type="button" class="btn btn-outline" data-project-select="${escapeHtml(project.id)}">Selecionar</button>
        </article>`;
    }).join('');

    list.querySelectorAll('[data-project-select]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedProjectId = button.getAttribute('data-project-select');
        const url = new URL(window.location.href);
        url.searchParams.set('projetoId', state.selectedProjectId);
        window.history.replaceState({}, '', url);
        renderProjectList(clientId, filterValue);
        renderProjectDetail(clientId, state.selectedProjectId);
      });
    });
  }

  function renderProjectDetail(clientId, projectId) {
    const detail = document.getElementById('projectDetail');
    if (!detail) return;
    const project = getProjectById(clientId, projectId);
    const activities = getActivities(clientId);

    if (!project) {
      detail.innerHTML = '<div class="empty-state"><strong>Selecione um projeto.</strong><p>Escolha um item da lista para ver os detalhes completos.</p></div>';
      return;
    }

    const projectActivities = activities
      .filter((activity) => activity.projetoId === project.id)
      .filter((activity) => state.projectActivityFilter === 'todas' || activity.status === state.projectActivityFilter)
      .sort((left, right) => new Date(left.dataPrevista) - new Date(right.dataPrevista));

    const progress = calculateProjectProgress(project, activities);

    detail.innerHTML = `
      <section class="detail-card">
        <div class="detail-header">
          <div>
            <h2>${escapeHtml(project.titulo)}</h2>
            <p>${escapeHtml(project.descricao || 'Projeto sem descrição adicional.')}</p>
          </div>
          <span class="status-badge status-${escapeHtml(project.status)}">${escapeHtml(statusLabel(project.status))}</span>
        </div>
        <div class="metric-grid">
          <div><span class="small-muted">Conclusão</span><strong>${progress}%</strong></div>
          <div><span class="small-muted">Início</span><strong>${escapeHtml(formatDate(project.dataInicio))}</strong></div>
          <div><span class="small-muted">Fim previsto</span><strong>${escapeHtml(formatDate(project.dataFimPrevisto))}</strong></div>
          <div><span class="small-muted">Gestor responsável</span><strong>${escapeHtml(project.gestorResponsavel || '—')}</strong></div>
          <div><span class="small-muted">Modalidade</span><strong>${escapeHtml(project.modalidade || '—')}</strong></div>
          <div><span class="small-muted">Valor total contratado</span><strong>${escapeHtml(formatCurrency(getAnnualContractValue(project)))}</strong></div>
        </div>
        <div>
          <span class="field-label">Descrição do Escopo</span>
          <p>${escapeHtml(project.escopo || 'Escopo não informado.')}</p>
        </div>
        <div>
          <span class="field-label">Serviços Contratados</span>
          <div class="table-wrapper">
            <table class="client-table">
              <thead>
                <tr><th>Nome</th><th>Tipo</th><th>Valor</th><th>Prazo</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${(project.servicosContratados || []).map((service) => `
                  <tr>
                    <td>${escapeHtml(service.nome)}</td>
                    <td>${escapeHtml(service.tipo)}</td>
                    <td>${escapeHtml(formatCurrency(service.valor || ((service.valorMensal || 0) * 12)))}</td>
                    <td>${escapeHtml(service.prazo || '—')}</td>
                    <td><span class="status-badge status-${escapeHtml(service.status)}">${escapeHtml(statusLabel(service.status))}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="content-columns">
          <div>
            <span class="field-label">Entregas Esperadas</span>
            <div class="timeline-list">${(project.entregas || []).map((item) => `<div class="timeline-item"><strong>✅ ${escapeHtml(typeof item === 'string' ? item : item.titulo || item.nome || '')}</strong></div>`).join('')}</div>
          </div>
          <div>
            <span class="field-label">Cronograma</span>
            <div class="timeline-list">${(project.cronograma || []).map((phase) => `
              <div class="timeline-item">
                <strong>${escapeHtml(phase.fase)}</strong>
                <p>${escapeHtml(formatDate(phase.inicio))} até ${escapeHtml(formatDate(phase.fim))}</p>
                <span class="status-badge status-${escapeHtml(phase.status)}">${escapeHtml(statusLabel(phase.status))}</span>
              </div>`).join('')}</div>
          </div>
        </div>
        <div>
          <div class="section-header">
            <div>
              <span class="field-label">Atividades Detalhadas</span>
              <p class="small-muted">Filtro ativo: ${escapeHtml(statusLabel(state.projectActivityFilter === 'todas' ? 'Todas' : state.projectActivityFilter))}</p>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="client-table">
              <thead>
                <tr><th>Título</th><th>Ator</th><th>Prazo</th><th>Status</th><th>%</th></tr>
              </thead>
              <tbody>
                ${projectActivities.length ? projectActivities.map((activity) => `
                  <tr>
                    <td>${escapeHtml(activity.titulo)}</td>
                    <td>${escapeHtml(activity.ator || '—')}</td>
                    <td>${escapeHtml(formatDate(activity.dataPrevista))}</td>
                    <td><span class="status-badge status-${escapeHtml(activity.status)}">${escapeHtml(statusLabel(activity.status))}</span></td>
                    <td>${escapeHtml(String(Number(activity.percentualConclusao || (activity.status === 'finalizada' ? 100 : 0))))}%</td>
                  </tr>`).join('') : '<tr><td colspan="5">Nenhuma atividade neste filtro.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <span class="field-label">Documentos & Assinaturas</span>
          <div class="documents-grid">
            <article class="doc-card">
              <div class="card-header-inline">
                <div>
                  <h3>Termo de Abertura</h3>
                  <p class="small-muted">Documento simulado • ${escapeHtml(project.termoAberturaDocId || '—')}</p>
                </div>
                <span class="document-badge">${escapeHtml(project.statusTermoAbertura || 'Pendente')}</span>
              </div>
              <button type="button" class="btn btn-outline" data-doc-type="abertura" data-project-doc="${escapeHtml(project.id)}">Baixar simulado</button>
            </article>
            <article class="doc-card">
              <div class="card-header-inline">
                <div>
                  <h3>Termo de Encerramento</h3>
                  <p class="small-muted">Documento simulado • ${escapeHtml(project.termoEncerramentoDocId || '—')}</p>
                </div>
                <span class="document-badge">${escapeHtml(project.statusTermoEncerramento || 'Pendente')}</span>
              </div>
              <button type="button" class="btn btn-outline" data-doc-type="encerramento" data-project-doc="${escapeHtml(project.id)}">Baixar simulado</button>
            </article>
          </div>
        </div>
      </section>`;

    detail.querySelectorAll('[data-project-doc]').forEach((button) => {
      button.addEventListener('click', () => downloadProjectDocument(clientId, button.getAttribute('data-project-doc'), button.getAttribute('data-doc-type')));
    });
  }

  function downloadProjectDocument(clientId, projectId, type) {
    const project = getProjectById(clientId, projectId);
    if (!project) return;
    const title = type === 'abertura' ? 'Termo de Abertura' : 'Termo de Encerramento';
    const content = `${title}\n\nProjeto: ${project.titulo}\nCliente: ${project.nomeCliente}\nStatus: ${project.status}\nGestor: ${project.gestorResponsavel}\nData de emissão: ${formatDateTime(new Date().toISOString())}\n\nDocumento simulado para validação do portal do cliente.`;
    downloadBlob(`${slugify(title)}-${slugify(project.titulo)}.pdf`, content, 'application/pdf');
  }

  function buildTicketId(chamados) {
    const year = new Date().getFullYear();
    const count = chamados.filter((item) => item.id.startsWith(`chamado-${year}-`)).length + 1;
    return `chamado-${year}-${String(count).padStart(3, '0')}`;
  }

  function initChamados(session) {
    const form = document.getElementById('chamadoForm');
    const filter = document.getElementById('chamadosStatusFilter');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        createChamado(session.clientId);
      });
    }
    if (filter) {
      filter.addEventListener('change', () => renderChamados(session.clientId, filter.value));
    }
    const chamados = getChamados(session.clientId);
    state.selectedChamadoId = chamados[0] ? chamados[0].id : null;
    renderChamados(session.clientId, filter ? filter.value : 'todos');
    renderChamadoDetail(session.clientId, state.selectedChamadoId);
  }

  function createChamado(clientId) {
    const tituloInput = document.getElementById('chamadoTitulo');
    const modalidadeInput = document.getElementById('chamadoModalidade');
    const descricaoInput = document.getElementById('chamadoDescricao');
    const prioridadeInput = document.getElementById('chamadoPrioridade');
    const feedback = document.getElementById('chamadosFeedback');
    const chamados = readJson(STORAGE_KEYS.chamados, []);
    const session = getCurrentSession();

    const chamado = {
      id: buildTicketId(chamados),
      clientId,
      titulo: tituloInput.value.trim(),
      modalidade: modalidadeInput.value,
      descricao: descricaoInput.value.trim(),
      prioridade: prioridadeInput.value,
      status: 'aberto',
      dataCriacao: new Date().toISOString(),
      dataFechamento: null,
      comentarios: [
        {
          autor: 'Cliente',
          texto: 'Chamado criado pelo portal do cliente.',
          data: new Date().toISOString()
        }
      ]
    };

    chamados.unshift(chamado);
    writeJson(STORAGE_KEYS.chamados, chamados);
    if (feedback) {
      feedback.textContent = `Chamado ${chamado.id} criado com sucesso.`;
      feedback.classList.add('is-visible');
      setTimeout(() => feedback.classList.remove('is-visible'), 3500);
    }
    state.selectedChamadoId = chamado.id;
    document.getElementById('chamadoForm').reset();
    renderChamados(clientId, document.getElementById('chamadosStatusFilter').value);
    renderChamadoDetail(clientId, state.selectedChamadoId);
    if (session) {
      appendProfileHistoryMessage(session.clientId, `Chamado ${chamado.id} criado no portal.`);
    }
  }

  function renderChamados(clientId, filterValue) {
    const tableBody = document.getElementById('chamadosTableBody');
    if (!tableBody) return;
    const chamados = getChamados(clientId).filter((chamado) => {
      if (filterValue === 'todos') return true;
      if (filterValue === 'abertos') return chamado.status !== 'fechado';
      if (filterValue === 'fechados') return chamado.status === 'fechado';
      return chamado.status === filterValue;
    });

    if (!chamados.length) {
      tableBody.innerHTML = '<tr><td colspan="7">Nenhum chamado para o filtro selecionado.</td></tr>';
      return;
    }

    tableBody.innerHTML = chamados.map((chamado) => `
      <tr>
        <td>${escapeHtml(chamado.id)}</td>
        <td>${escapeHtml(chamado.titulo)}</td>
        <td>${escapeHtml(chamado.modalidade)}</td>
        <td><span class="priority-chip priority-${escapeHtml(chamado.prioridade)}">${priorityIcon(chamado.prioridade)} ${escapeHtml(priorityLabel(chamado.prioridade))}</span></td>
        <td><span class="status-badge status-${escapeHtml(chamado.status)}">${escapeHtml(statusLabel(chamado.status))}</span></td>
        <td>${escapeHtml(formatDate(chamado.dataCriacao))}</td>
        <td><button type="button" class="btn btn-outline" data-chamado-select="${escapeHtml(chamado.id)}">Ver Detalhes</button></td>
      </tr>`).join('');

    tableBody.querySelectorAll('[data-chamado-select]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedChamadoId = button.getAttribute('data-chamado-select');
        renderChamadoDetail(clientId, state.selectedChamadoId);
      });
    });
  }

  function renderChamadoDetail(clientId, chamadoId) {
    const container = document.getElementById('chamadoDetail');
    if (!container) return;
    const chamado = getChamados(clientId).find((item) => item.id === chamadoId);

    if (!chamado) {
      container.innerHTML = '<div class="empty-state"><strong>Selecione um chamado.</strong><p>Os detalhes e comentários aparecem aqui.</p></div>';
      return;
    }

    container.innerHTML = `
      <section class="detail-card">
        <div class="detail-header">
          <div>
            <h2>${escapeHtml(chamado.titulo)}</h2>
            <p>${escapeHtml(chamado.descricao)}</p>
          </div>
          <span class="status-badge status-${escapeHtml(chamado.status)}">${escapeHtml(statusLabel(chamado.status))}</span>
        </div>
        <div class="metric-grid">
          <div><span class="small-muted">ID</span><strong>${escapeHtml(chamado.id)}</strong></div>
          <div><span class="small-muted">Modalidade</span><strong>${escapeHtml(chamado.modalidade)}</strong></div>
          <div><span class="small-muted">Prioridade</span><strong>${escapeHtml(priorityLabel(chamado.prioridade))}</strong></div>
          <div><span class="small-muted">Data</span><strong>${escapeHtml(formatDateTime(chamado.dataCriacao))}</strong></div>
        </div>
        <div>
          <span class="field-label">Histórico de comentários</span>
          <div class="comment-list">${(chamado.comentarios || []).map((comment) => `
            <div class="comment-item">
              <strong>${escapeHtml(comment.autor)}</strong>
              <p>${escapeHtml(comment.texto)}</p>
              <span class="small-muted">${escapeHtml(formatDateTime(comment.data))}</span>
            </div>`).join('')}</div>
        </div>
        <form id="commentForm" class="form-grid single">
          <div class="form-group full-span">
            <label for="novoComentario">Adicionar comentário</label>
            <textarea id="novoComentario" class="form-textarea" required placeholder="Escreva uma atualização ou dúvida complementar"></textarea>
          </div>
          <div class="inline-actions">
            <button type="submit" class="btn btn-primary">Adicionar comentário</button>
          </div>
        </form>
      </section>`;

    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
      commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addChamadoComment(clientId, chamado.id);
      });
    }
  }

  function addChamadoComment(clientId, chamadoId) {
    const input = document.getElementById('novoComentario');
    const text = input.value.trim();
    if (!text) return;
    const chamados = readJson(STORAGE_KEYS.chamados, []);
    const chamado = chamados.find((item) => item.id === chamadoId && item.clientId === clientId);
    if (!chamado) return;
    chamado.comentarios.push({ autor: 'Cliente', texto: text, data: new Date().toISOString() });
    writeJson(STORAGE_KEYS.chamados, chamados);
    input.value = '';
    renderChamados(clientId, document.getElementById('chamadosStatusFilter').value);
    renderChamadoDetail(clientId, chamadoId);
  }

  function getChatHistory(clientId) {
    const histories = readJson(STORAGE_KEYS.chatMap, []);
    const found = histories.find((item) => item.clientId === clientId);
    return found || {
      clientId,
      mensagens: [
        {
          tipo: 'sistema',
          texto: 'Bem-vindo ao chat inteligente do Portal do Cliente. Posso orientar sobre projetos, próximos passos, chamados e treinamentos.',
          data: new Date().toISOString()
        }
      ]
    };
  }

  function saveChatHistory(history) {
    const histories = readJson(STORAGE_KEYS.chatMap, []);
    const filtered = histories.filter((item) => item.clientId !== history.clientId);
    filtered.push(history);
    writeJson(STORAGE_KEYS.chatMap, filtered);
    writeJson(STORAGE_KEYS.chatCurrent, history);
  }

  function initChat(session) {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    renderChat(session.clientId);
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendChatMessage(session.clientId);
      });
    }
    if (input) {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendChatMessage(session.clientId);
        }
      });
    }
    document.querySelectorAll('[data-chat-suggestion]').forEach((button) => {
      button.addEventListener('click', () => {
        const field = document.getElementById('chatInput');
        field.value = button.getAttribute('data-chat-suggestion');
        sendChatMessage(session.clientId);
      });
    });
  }

  function renderChat(clientId) {
    const history = getChatHistory(clientId);
    const container = document.getElementById('chatMessages');
    if (!container) return;
    container.innerHTML = history.mensagens.map((message) => `
      <div class="chat-message ${escapeHtml(message.tipo)}">
        <div class="chat-bubble">
          ${escapeHtml(message.texto)}
          <small>${escapeHtml(formatDateTime(message.data))}</small>
        </div>
      </div>`).join('');
    container.scrollTop = container.scrollHeight;
  }

  function sendChatMessage(clientId) {
    const field = document.getElementById('chatInput');
    const text = field.value.trim();
    if (!text) return;
    const history = getChatHistory(clientId);
    history.mensagens.push({ tipo: 'cliente', texto: text, data: new Date().toISOString() });
    history.mensagens.push({ tipo: 'sistema', texto: buildChatResponse(clientId, text), data: new Date().toISOString() });
    saveChatHistory(history);
    field.value = '';
    renderChat(clientId);
  }

  function buildChatResponse(clientId, message) {
    const normalized = normalizeCredential(message);
    const projects = getProjects(clientId);
    const chamados = getChamados(clientId);
    const upcoming = getUpcomingActivities(clientId, 7);

    if (normalized.includes('acompanhar') || normalized.includes('projeto')) {
      const active = projects.filter((item) => item.status !== 'encerrado').length;
      return `Você possui ${active} projeto(s) ativo(s). Acesse “Meus Projetos” para ver cronograma, entregas e documentos.`;
    }
    if (normalized.includes('próximos') || normalized.includes('passos') || normalized.includes('atividade')) {
      const next = upcoming[0];
      return next
        ? `O próximo passo previsto é “${next.titulo}”, com prazo em ${formatDate(next.dataPrevista)} e responsabilidade de ${next.ator}.`
        : 'No momento não há atividades previstas para os próximos 7 dias.';
    }
    if (normalized.includes('especialista') || normalized.includes('falar com')) {
      return 'Você pode abrir um chamado em Help Desk com prioridade adequada. A equipe BPI retorna conforme o SLA da modalidade.';
    }
    if (normalized.includes('chamado') || normalized.includes('suporte')) {
      const open = chamados.filter((item) => item.status !== 'fechado').length;
      return `Há ${open} chamado(s) em aberto ou atendimento. Na página de chamados você pode comentar e acompanhar cada atualização.`;
    }
    if (normalized.includes('treinamento') || normalized.includes('certificado')) {
      return 'Na área de Treinamentos você encontra trilhas disponíveis, prova automática e emissão de certificado quando alcançar 70% de acerto.';
    }
    return 'Posso ajudar com projetos, próximos passos, chamados, treinamentos e certificados. Escolha uma das sugestões rápidas ou descreva o que precisa.';
  }

  function getTrainingProgress(clientId) {
    return readJson(STORAGE_KEYS.trainingProgress, []).filter((item) => item.clientId === clientId);
  }

  function upsertTrainingProgress(progressEntry) {
    const all = readJson(STORAGE_KEYS.trainingProgress, []);
    const remaining = all.filter((item) => !(item.clientId === progressEntry.clientId && item.treinamentoId === progressEntry.treinamentoId));
    remaining.push(progressEntry);
    writeJson(STORAGE_KEYS.trainingProgress, remaining);
  }

  function getCertificates(clientId) {
    return readJson(STORAGE_KEYS.certificates, []).filter((item) => item.clientId === clientId);
  }

  function buildTrainingStatus(clientId, trainingId) {
    const progress = getTrainingProgress(clientId).find((item) => item.treinamentoId === trainingId);
    if (progress && progress.status === 'concluido') return 'concluido';
    if (progress && progress.status === 'em_andamento') return 'em_andamento';
    return 'disponivel';
  }

  function initTreinamentos(session) {
    const filter = document.getElementById('trainingStatusFilter');
    state.selectedTrainingId = TRAININGS[0].id;
    if (filter) {
      filter.addEventListener('change', () => renderTrainings(session.clientId, filter.value));
    }
    renderTrainings(session.clientId, filter ? filter.value : 'todos');
    renderTrainingDetail(session.clientId, state.selectedTrainingId);
  }

  function renderTrainings(clientId, filterValue) {
    const container = document.getElementById('trainingCards');
    if (!container) return;
    const cards = TRAININGS.filter((training) => {
      const status = buildTrainingStatus(clientId, training.id);
      return filterValue === 'todos' || status === filterValue;
    });

    if (!cards.length) {
      container.innerHTML = '<div class="empty-state"><strong>Nenhum treinamento neste filtro.</strong><p>Selecione outro status para continuar.</p></div>';
      return;
    }

    container.innerHTML = cards.map((training) => {
      const status = buildTrainingStatus(clientId, training.id);
      return `
        <article class="training-card ${training.id === state.selectedTrainingId ? 'is-selected' : ''}">
          <div class="card-header-inline">
            <div>
              <h3>${escapeHtml(training.titulo)}</h3>
              <p class="small-muted">${escapeHtml(training.instrutora)}</p>
            </div>
            <span class="status-badge status-${escapeHtml(status)}">${escapeHtml(status === 'disponivel' ? 'Disponível' : statusLabel(status))}</span>
          </div>
          <p>${escapeHtml(training.descricao)}</p>
          <div class="meta-list"><span>Duração</span><strong>${escapeHtml(String(training.duracaoMinutos))} min</strong></div>
          <button type="button" class="btn btn-outline" data-training-select="${escapeHtml(training.id)}">Ver detalhes</button>
        </article>`;
    }).join('');

    container.querySelectorAll('[data-training-select]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedTrainingId = button.getAttribute('data-training-select');
        renderTrainings(clientId, filterValue);
        renderTrainingDetail(clientId, state.selectedTrainingId);
      });
    });
  }

  function renderTrainingDetail(clientId, trainingId) {
    const detail = document.getElementById('trainingDetail');
    const quiz = document.getElementById('trainingQuiz');
    const message = document.getElementById('trainingFeedback');
    const training = TRAININGS.find((item) => item.id === trainingId);
    if (!detail || !quiz) return;
    if (!training) {
      detail.innerHTML = '<div class="empty-state"><strong>Selecione um treinamento.</strong></div>';
      quiz.innerHTML = '';
      return;
    }

    const status = buildTrainingStatus(clientId, trainingId);
    detail.innerHTML = `
      <section class="detail-card">
        <div class="detail-header">
          <div>
            <h2>${escapeHtml(training.titulo)}</h2>
            <p>${escapeHtml(training.descricao)}</p>
          </div>
          <span class="status-badge status-${escapeHtml(status)}">${escapeHtml(status === 'disponivel' ? 'Disponível' : statusLabel(status))}</span>
        </div>
        <div class="doc-card">
          <h3>Vídeo em HTML5 - reprodução simulada</h3>
          <p class="small-muted">Conteúdo demonstrativo para validação do portal do cliente.</p>
          <div class="progress-track"><div class="progress-fill" style="width: 100%"></div></div>
        </div>
        <div class="metric-grid">
          <div><span class="small-muted">Duração</span><strong>${escapeHtml(String(training.duracaoMinutos))} minutos</strong></div>
          <div><span class="small-muted">Instrutora</span><strong>${escapeHtml(training.instrutora)}</strong></div>
          <div><span class="small-muted">Questões por prova</span><strong>20</strong></div>
        </div>
        <div class="inline-actions">
          <button type="button" class="btn btn-primary" id="startTrainingBtn">Iniciar Treinamento</button>
        </div>
      </section>`;

    document.getElementById('startTrainingBtn').addEventListener('click', () => startTraining(clientId, trainingId));
    quiz.innerHTML = '<div class="empty-state"><strong>Inicie o treinamento para gerar a prova automática.</strong><p>São 20 questões aleatórias de um pool com mais de 40 perguntas.</p></div>';
    if (message && state.certificationMessage) {
      message.textContent = state.certificationMessage;
      message.className = state.certificationMessage.includes('Tente novamente') ? 'error-banner is-visible' : 'success-banner is-visible';
    }
  }

  function startTraining(clientId, trainingId) {
    state.selectedQuizTrainingId = trainingId;
    state.quizQuestions = shuffle(QUESTION_POOL).slice(0, 20);
    upsertTrainingProgress({ clientId, treinamentoId: trainingId, status: 'em_andamento', atualizadoEm: new Date().toISOString() });
    renderTrainings(clientId, document.getElementById('trainingStatusFilter').value);
    renderTrainingDetail(clientId, trainingId);
    renderQuiz(clientId, trainingId);
  }

  function renderQuiz(clientId, trainingId) {
    const quiz = document.getElementById('trainingQuiz');
    if (!quiz) return;
    quiz.innerHTML = `
      <section class="quiz-card">
        <div class="section-header">
          <div>
            <h3>Prova Automática</h3>
            <p>Responda 20 questões. Aprovação com 70% de acerto.</p>
          </div>
          <span class="quiz-pill">20 questões</span>
        </div>
        <form id="quizForm" class="quiz-question-list">
          ${state.quizQuestions.map((question, index) => `
            <fieldset class="quiz-question">
              <legend><strong>${index + 1}. ${escapeHtml(question.pergunta)}</strong></legend>
              <div class="quiz-options">
                ${question.opcoes.map((option, optionIndex) => `
                  <label class="quiz-option">
                    <input type="radio" name="question-${escapeHtml(question.id)}" value="${optionIndex}" required>
                    <span>${escapeHtml(option)}</span>
                  </label>`).join('')}
              </div>
            </fieldset>`).join('')}
          <div class="inline-actions">
            <button type="submit" class="btn btn-primary">Finalizar Prova</button>
          </div>
        </form>
      </section>`;

    document.getElementById('quizForm').addEventListener('submit', (event) => {
      event.preventDefault();
      submitQuiz(clientId, trainingId);
    });
  }

  function submitQuiz(clientId, trainingId) {
    const answers = new FormData(document.getElementById('quizForm'));
    let correct = 0;
    state.quizQuestions.forEach((question) => {
      const value = answers.get(`question-${question.id}`);
      if (value != null && Number(value) === question.correta) {
        correct += 1;
      }
    });
    const score = Math.round((correct / state.quizQuestions.length) * 100);
    if (score >= 70) {
      upsertTrainingProgress({ clientId, treinamentoId: trainingId, status: 'concluido', atualizadoEm: new Date().toISOString() });
      const certificate = issueCertificate(clientId, trainingId, score);
      state.certificationMessage = `Parabéns! Você acertou ${score}% e o certificado ${certificate.numeroCertificado} já está disponível.`;
    } else {
      upsertTrainingProgress({ clientId, treinamentoId: trainingId, status: 'em_andamento', atualizadoEm: new Date().toISOString(), ultimoResultado: score });
      state.certificationMessage = `Você acertou ${score}%. Tente novamente para liberar o certificado.`;
    }
    renderTrainings(clientId, document.getElementById('trainingStatusFilter').value);
    renderTrainingDetail(clientId, trainingId);
  }

  function issueCertificate(clientId, trainingId, score) {
    const certificates = readJson(STORAGE_KEYS.certificates, []);
    const existing = certificates.find((item) => item.clientId === clientId && item.treinamentoId === trainingId);
    if (existing) {
    existing.percentualAcerto = score;
    existing.dataConclusao = new Date().toISOString();
    writeJson(STORAGE_KEYS.certificates, certificates);
    return existing;
    }
    const training = TRAININGS.find((item) => item.id === trainingId);
    const profile = getClientProfile(clientId);
    const year = new Date().getFullYear();
    const certificateNumber = `CERT-${year}-${String(certificates.length + 1).padStart(5, '0')}`;
    const certificate = {
      id: `cert-${year}-${String(certificates.length + 1).padStart(3, '0')}`,
      clientId,
      treinamentoId: trainingId,
      nomeTreinamento: training ? training.titulo : 'Treinamento',
      numeroCertificado: certificateNumber,
      dataConclusao: new Date().toISOString(),
      percentualAcerto: score,
      linkedinUrl: null
    };
    certificates.push(certificate);
    writeJson(STORAGE_KEYS.certificates, certificates);
    appendProfileHistoryMessage(clientId, `Treinamento concluído: ${certificate.nomeTreinamento}.`);
    return certificate;
  }

  function buildCertificateContent(profile, trainingName, certificateNumber, completionDate) {
    return `Certificado BPI Governança\n\nCliente: ${profile ? profile.nomeCliente || profile.nome : 'Cliente'}\nTreinamento: ${trainingName || 'Treinamento'}\nNúmero: ${certificateNumber}\nData: ${formatDate(completionDate || new Date().toISOString())}\nAssinatura digital simulada: BPI Governança`;
  }

  function initCertificados(session) {
    renderCertificates(session.clientId);
  }

  function renderCertificates(clientId) {
    const container = document.getElementById('certificateList');
    const shareBox = document.getElementById('linkedinShareBox');
    if (!container) return;
    const certificates = getCertificates(clientId);
    if (!certificates.length) {
      container.innerHTML = '<div class="empty-state"><strong>Nenhum certificado conquistado ainda.</strong><p>Conclua um treinamento com pelo menos 70% de acerto para liberar certificados.</p></div>';
      if (shareBox) {
        shareBox.innerHTML = '';
      }
      return;
    }

    container.innerHTML = certificates.map((certificate) => `
      <article class="certificate-card">
        <div>
          <h3>${escapeHtml(certificate.nomeTreinamento)}</h3>
          <p class="cert-number">${escapeHtml(certificate.numeroCertificado)}</p>
        </div>
        <div class="summary-grid">
          <div><span class="small-muted">Conclusão</span><strong>${escapeHtml(formatDate(certificate.dataConclusao))}</strong></div>
          <div><span class="small-muted">Resultado</span><strong>${escapeHtml(String(certificate.percentualAcerto))}%</strong></div>
        </div>
        <div class="inline-actions">
          <button type="button" class="btn btn-outline" data-cert-download="${escapeHtml(certificate.id)}">Download PDF</button>
          <button type="button" class="btn btn-primary" data-cert-share="${escapeHtml(certificate.id)}" aria-controls="linkedinShareBox">Publicar no LinkedIn</button>
        </div>
      </article>`).join('');

    container.querySelectorAll('[data-cert-download]').forEach((button) => {
      button.addEventListener('click', () => downloadCertificate(clientId, button.getAttribute('data-cert-download')));
    });
    container.querySelectorAll('[data-cert-share]').forEach((button) => {
      button.addEventListener('click', () => shareCertificateOnLinkedIn(clientId, button.getAttribute('data-cert-share')));
    });
  }

  function downloadCertificate(clientId, certificateId) {
    const certificate = getCertificates(clientId).find((item) => item.id === certificateId);
    if (!certificate) return;
    const profile = getClientProfile(clientId);
    const content = buildCertificateContent(profile, certificate.nomeTreinamento, certificate.numeroCertificado, certificate.dataConclusao);
    downloadBlob(`${slugify(certificate.nomeTreinamento)}-${certificate.numeroCertificado}.pdf`, content, 'application/pdf');
  }

  function shareCertificateOnLinkedIn(clientId, certificateId) {
    const certificates = readJson(STORAGE_KEYS.certificates, []);
    const certificate = certificates.find((item) => item.id === certificateId && item.clientId === clientId);
    const profile = getClientProfile(clientId);
    if (!certificate || !profile) return;
    const certificateDate = new Date(certificate.dataConclusao);
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.nomeTreinamento)}&organizationName=${encodeURIComponent('BPI Governança')}&issueYear=${certificateDate.getFullYear()}&issueMonth=${certificateDate.getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(certificate.numeroCertificado)}`;
    certificate.linkedinUrl = url;
    writeJson(STORAGE_KEYS.certificates, certificates);
    const shareBox = document.getElementById('linkedinShareBox');
    if (shareBox) {
      shareBox.innerHTML = `
        <section class="info-banner is-visible" aria-live="polite">
          <strong>Link pronto para publicação</strong>
          <div class="link-box">${escapeHtml(url)}</div>
          <div class="inline-actions"><a class="btn btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Abrir LinkedIn</a></div>
        </section>`;
    }
  }

  function appendProfileHistoryMessage(clientId, description) {
    const key = `cliente_activity_log_${clientId}`;
    const entries = readJson(key, []);
    entries.unshift({ descricao: description, data: new Date().toISOString() });
    writeJson(key, entries.slice(0, 20));
  }

  function getProfileHistory(clientId) {
    const log = readJson(`cliente_activity_log_${clientId}`, []);
    const projects = getProjects(clientId).map((project) => ({ descricao: `Projeto ${project.titulo} em ${statusLabel(project.status)}.`, data: project.dataInicio }));
    const chamados = getChamados(clientId).map((chamado) => ({ descricao: `Chamado ${chamado.id} - ${chamado.titulo}.`, data: chamado.dataCriacao }));
    const certificates = getCertificates(clientId).map((certificate) => ({ descricao: `Certificado liberado: ${certificate.nomeTreinamento}.`, data: certificate.dataConclusao }));
    return [...log, ...projects, ...chamados, ...certificates]
      .filter((item) => item && item.data)
      .sort((left, right) => new Date(right.data) - new Date(left.data))
      .slice(0, 10);
  }

  function initPerfil(session) {
    const profile = getClientProfile(session.clientId);
    if (!profile) return;
    setInputValue('companyName', profile.razaoSocial || profile.nomeCliente);
    setInputValue('companyCnpj', profile.cnpj || session.cnpj);
    setInputValue('companyEmail', profile.email || session.email);
    setInputValue('companyPhone', profile.telefone || '');
    setInputValue('companyAddress', profile.endereco || '');

    renderProfileContacts(profile.contatos || []);
    renderProfileHistory(session.clientId);

    const form = document.getElementById('profileForm');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        saveProfile(session.clientId);
      });
    }
    const contactButton = document.getElementById('supportContactBtn');
    if (contactButton) {
      contactButton.addEventListener('click', () => {
        showInfo('profileFeedback', 'Entre em contato pelo e-mail suporte@bpigovernanca.com.br ou WhatsApp (11) 4000-2026.');
      });
    }
  }

  function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || '';
  }

  function renderProfileContacts(contacts) {
    const container = document.getElementById('contactList');
    if (!container) return;
    if (!contacts.length) {
      container.innerHTML = '<div class="empty-state"><strong>Nenhum contato principal cadastrado.</strong></div>';
      return;
    }
    container.innerHTML = contacts.slice(0, 5).map((contact) => `
      <article class="doc-card">
        <h3>${escapeHtml(contact.nome)}</h3>
        <p>${escapeHtml(contact.cargo || 'Contato principal')}</p>
        <p class="small-muted">${escapeHtml(contact.email)} • ${escapeHtml(contact.telefone || '—')}</p>
      </article>`).join('');
  }

  function renderProfileHistory(clientId) {
    const container = document.getElementById('profileHistory');
    if (!container) return;
    const history = getProfileHistory(clientId);
    if (!history.length) {
      container.innerHTML = '<div class="empty-state"><strong>Sem atividades recentes registradas.</strong></div>';
      return;
    }
    container.innerHTML = `<div class="history-list">${history.map((entry) => `
      <div class="history-item">
        <strong>${escapeHtml(entry.descricao)}</strong>
        <p>${escapeHtml(formatDateTime(entry.data))}</p>
      </div>`).join('')}</div>`;
  }

  function saveProfile(clientId) {
    const profiles = getClientProfiles();
    const updated = profiles.map((profile) => {
      if (profile.id !== clientId) return profile;
      return {
        ...profile,
        nome: document.getElementById('companyName').value.trim(),
        nomeCliente: document.getElementById('companyName').value.trim(),
        razaoSocial: document.getElementById('companyName').value.trim(),
        cnpj: document.getElementById('companyCnpj').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        telefone: document.getElementById('companyPhone').value.trim(),
        endereco: document.getElementById('companyAddress').value.trim()
      };
    });
    writeJson(STORAGE_KEYS.clients, updated);
    const session = getCurrentSession();
    if (session && session.clientId === clientId) {
      writeJson(STORAGE_KEYS.session, {
        ...session,
        nomeCliente: document.getElementById('companyName').value.trim(),
        cnpj: document.getElementById('companyCnpj').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        avatar: session.avatar || initialsFromName(document.getElementById('companyName').value.trim())
      });
      hydrateUserBadges(getCurrentSession());
    }
    appendProfileHistoryMessage(clientId, 'Dados da empresa atualizados pelo portal.');
    renderProfileHistory(clientId);
    showSuccess('profileFeedback', 'Dados da empresa atualizados com sucesso (simulado).');
  }

  function showSuccess(id, text) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text;
    element.className = 'success-banner is-visible';
  }

  function showInfo(id, text) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text;
    element.className = 'info-banner is-visible';
  }

  function showError(id, text) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text;
    element.className = 'error-banner is-visible';
  }

  function hideBanner(id) {
    const element = document.getElementById(id);
    if (!element) return;
    element.className = element.className.replace(/is-visible/g, '').trim();
  }

  function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const currentSession = getCurrentSession();
    if (currentSession) {
      window.location.href = getSafeReturnPath(new URLSearchParams(window.location.search).get('return'));
      return;
    }
    const demoList = document.getElementById('demoAccountList');
    if (demoList) {
      demoList.innerHTML = CLIENT_PROFILES.map((account) => `
        <div class="demo-card">
          <strong>${escapeHtml(account.nomeCliente)}</strong>
          <p class="small-muted">${escapeHtml(account.email)} • ${escapeHtml(account.cnpj)}</p>
          <p class="small-muted">Senha demo: 123456</p>
        </div>`).join('');
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      hideBanner('loginError');
      const credential = document.getElementById('credencial').value;
      const password = document.getElementById('password').value;
      const normalized = normalizeCredential(credential);
      const digits = onlyDigits(credential);
      const account = TRUSTED_ACCOUNTS.cliente.find((item) => {
        return item.password === password && (
          normalizeCredential(item.email) === normalized || onlyDigits(item.cnpj) === digits
        );
      });
      if (!account) {
        showError('loginError', 'Email/CNPJ ou senha inválidos.');
        return;
      }
      const profile = CLIENT_PROFILES.find((item) => item.clientId === account.clientId);
      if (!profile) {
        showError('loginError', 'Conta de cliente não encontrada.');
        return;
      }
      setCurrentSession(profile);
      appendProfileHistoryMessage(account.clientId, 'Login realizado no portal do cliente.');
      window.location.href = getSafeReturnPath(new URLSearchParams(window.location.search).get('return'));
    });
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function shuffle(items) {
    const list = items.slice();
    for (let index = list.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = list[index];
      list[index] = list[swapIndex];
      list[swapIndex] = temp;
    }
    return list;
  }

  function bindGlobalActions() {
    document.querySelectorAll('[data-action="logout"]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
      });
    });
  }

  function initPage() {
    ensureSeedData();
    bindGlobalActions();
    const page = document.body.getAttribute('data-page');
    window.BPIClientePortal = { logout, getCurrentSession };

    if (page === 'login') {
      initLogin();
      return;
    }

    const session = requireSession();
    if (!session) return;

    switch (page) {
      case 'dashboard':
        renderDashboard(session);
        break;
      case 'meus-projetos':
        initProjetos(session);
        break;
      case 'chamados':
        initChamados(session);
        break;
      case 'chat':
        initChat(session);
        break;
      case 'treinamentos':
        initTreinamentos(session);
        break;
      case 'certificados':
        initCertificados(session);
        break;
      case 'perfil':
        initPerfil(session);
        break;
      default:
        break;
    }
  }

  document.addEventListener('DOMContentLoaded', initPage);
}());
