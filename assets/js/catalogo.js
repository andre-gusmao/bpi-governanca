(function (global) {
  const STORAGE_KEY = 'helpdesk_catalogo';
  const TIPO_TODOS = 'todos';
  const MODALIDADE_TODAS = 'todas';

  const seedCatalogo = [
    {
      id: 'srv-impl-erp',
      nome: 'Implementação ERP - Módulo Financeiro',
      descricao: 'Setup, configuração, testes e treinamento do módulo financeiro.',
      categoria: 'Implementações',
      modalidade: 'Implementações',
      tipo: 'setup',
      horasEstimadas: 120,
      valorHora: 250,
      valorTotal: 30000,
      prazoEstimado: 45,
      escopo: 'Mapeamento de requisitos, parametrização, testes integrados e transição assistida.',
      entregas: ['Análise de requisitos', 'Configuração inicial', 'Testes integrados', 'Treinamento de usuários'],
      dependenciasCliente: ['Ambiente preparado', 'Usuários com acessos', 'Informações de negócio'],
      ativo: true
    },
    {
      id: 'srv-train-users',
      nome: 'Treinamento de Usuários Power',
      descricao: 'Capacitação prática para usuários-chave e multiplicadores internos.',
      categoria: 'Treinamento',
      modalidade: 'Treinamento',
      tipo: 'setup',
      horasEstimadas: 40,
      valorHora: 200,
      valorTotal: 8000,
      prazoEstimado: 20,
      escopo: 'Treinamento funcional com material, exercícios guiados e sessão de dúvidas.',
      entregas: ['Plano de treinamento', 'Aulas ao vivo', 'Material de apoio', 'Avaliação final'],
      dependenciasCliente: ['Sala ou link de reunião', 'Lista de participantes', 'Acesso ao ambiente de treino'],
      ativo: true
    },
    {
      id: 'srv-consult-cloud',
      nome: 'Arquitetura Cloud Assistida',
      descricao: 'Desenho e implantação inicial de infraestrutura em nuvem.',
      categoria: 'Cloud',
      modalidade: 'Cloud',
      tipo: 'setup',
      horasEstimadas: 80,
      valorHora: 280,
      valorTotal: 22400,
      prazoEstimado: 30,
      escopo: 'Provisionamento base, políticas de segurança, backups e monitoramento essencial.',
      entregas: ['Arquitetura alvo', 'Provisionamento inicial', 'Políticas de backup', 'Guia operacional'],
      dependenciasCliente: ['Conta cloud ativa', 'Aprovação de custos', 'Acessos administrativos'],
      ativo: true
    },
    {
      id: 'srv-gestao-acessos',
      nome: 'Revisão de Perfis e Permissões',
      descricao: 'Estruturação de papéis, segregação de função e revisão de acessos.',
      categoria: 'Gestão de Acessos',
      modalidade: 'Gestão de Acessos',
      tipo: 'setup',
      horasEstimadas: 32,
      valorHora: 230,
      valorTotal: 7360,
      prazoEstimado: 15,
      escopo: 'Levantamento de perfis, análise de risco e implementação das regras aprovadas.',
      entregas: ['Matriz de acessos', 'Plano de segregação', 'Perfis revisados', 'Ata de homologação'],
      dependenciasCliente: ['Responsáveis por área', 'Listagem de usuários', 'Acesso ao sistema alvo'],
      ativo: true
    },
    {
      id: 'srv-hub-notas',
      nome: 'Estruturação de Hub de Notas',
      descricao: 'Organização de documentação, taxonomia e modelos de conhecimento.',
      categoria: 'Hub de Notas',
      modalidade: 'Hub de Notas',
      tipo: 'setup',
      horasEstimadas: 24,
      valorHora: 210,
      valorTotal: 5040,
      prazoEstimado: 12,
      escopo: 'Definição de categorias, templates e fluxo básico de governança documental.',
      entregas: ['Mapa de conteúdo', 'Templates padrão', 'Estrutura inicial', 'Guia de uso'],
      dependenciasCliente: ['Conteúdo de origem', 'Responsáveis por área', 'Ferramenta homologada'],
      ativo: true
    },
    {
      id: 'srv-bi-dash',
      nome: 'Dashboard Executivo de BI',
      descricao: 'Criação de indicadores, modelagem e painéis executivos.',
      categoria: 'BI',
      modalidade: 'BI',
      tipo: 'setup',
      horasEstimadas: 60,
      valorHora: 300,
      valorTotal: 18000,
      prazoEstimado: 25,
      escopo: 'Modelagem de dados, criação de KPI e publicação de dashboard inicial.',
      entregas: ['Levantamento de KPI', 'Modelagem inicial', 'Dashboard publicado', 'Treinamento rápido'],
      dependenciasCliente: ['Fontes de dados liberadas', 'Definição dos KPI', 'Patrocinador de negócio'],
      ativo: true
    },
    {
      id: 'srv-dashboard-custom',
      nome: 'Customização de Painéis Operacionais',
      descricao: 'Adequação visual e funcional de dashboards existentes.',
      categoria: 'Dashboard',
      modalidade: 'Dashboard',
      tipo: 'setup',
      horasEstimadas: 36,
      valorHora: 240,
      valorTotal: 8640,
      prazoEstimado: 18,
      escopo: 'Revisão de usabilidade, filtros, metas visuais e componentes prioritários.',
      entregas: ['Protótipo visual', 'Painéis revisados', 'Indicadores padronizados', 'Checklist de aceite'],
      dependenciasCliente: ['Painéis existentes', 'Usuários para validação', 'Branding aprovado'],
      ativo: true
    },
    {
      id: 'srv-bpo-financeiro',
      nome: 'Implantação de Rotina BPO Financeiro',
      descricao: 'Configuração operacional para contas a pagar, receber e conciliações.',
      categoria: 'BPO Financeiro',
      modalidade: 'BPO Financeiro',
      tipo: 'setup',
      horasEstimadas: 48,
      valorHora: 260,
      valorTotal: 12480,
      prazoEstimado: 20,
      escopo: 'Desenho de processo, cadastros, fluxos de aprovação e treinamento operacional.',
      entregas: ['Fluxo desenhado', 'Cadastros homologados', 'Procedimento operacional', 'Treinamento do time'],
      dependenciasCliente: ['Extratos e plano de contas', 'Aprovadores definidos', 'Equipe operacional disponível'],
      ativo: true
    },
    {
      id: 'srv-bpo-contabil',
      nome: 'Onboarding Contábil Assistido',
      descricao: 'Preparação inicial para operação contábil recorrente.',
      categoria: 'BPO Contábil',
      modalidade: 'BPO Contábil',
      tipo: 'setup',
      horasEstimadas: 44,
      valorHora: 255,
      valorTotal: 11220,
      prazoEstimado: 22,
      escopo: 'Levantamento fiscal-contábil, calendário de entregas e definição de responsáveis.',
      entregas: ['Diagnóstico inicial', 'Calendário contábil', 'Matriz de responsabilidades', 'Plano de implantação'],
      dependenciasCliente: ['Balancetes anteriores', 'Procurações válidas', 'Contato do escritório anterior'],
      ativo: true
    },
    {
      id: 'srv-bpo-fiscal',
      nome: 'Mapeamento Fiscal e Tributário',
      descricao: 'Setup de regras fiscais, parametrizações e rotina de apuração.',
      categoria: 'BPO Fiscal',
      modalidade: 'BPO Fiscal',
      tipo: 'setup',
      horasEstimadas: 52,
      valorHora: 270,
      valorTotal: 14040,
      prazoEstimado: 24,
      escopo: 'Análise do regime tributário, parametrização e roteiro de fechamento fiscal.',
      entregas: ['Diagnóstico tributário', 'Regras parametrizadas', 'Roteiro de apuração', 'Checklist fiscal'],
      dependenciasCliente: ['Documentos fiscais', 'Acessos ao ERP', 'Informações de enquadramento'],
      ativo: true
    },
    {
      id: 'srv-bpo-folha',
      nome: 'Implantação da Folha e Benefícios',
      descricao: 'Setup de folha de pagamento, rubricas, admissões e benefícios.',
      categoria: 'BPO Folha de Pagamento',
      modalidade: 'BPO Folha de Pagamento',
      tipo: 'setup',
      horasEstimadas: 55,
      valorHora: 250,
      valorTotal: 13750,
      prazoEstimado: 28,
      escopo: 'Configuração de eventos, encargos, calendário e rotinas de fechamento da folha.',
      entregas: ['Cadastro de rubricas', 'Calendário da folha', 'Parâmetros de encargos', 'Homologação de cálculo'],
      dependenciasCliente: ['Dados cadastrais dos colaboradores', 'Histórico da folha', 'Acesso ao eSocial'],
      ativo: true
    },
    {
      id: 'srv-integracoes-api',
      nome: 'Integração API ERP + CRM',
      descricao: 'Conexão de sistemas com mapeamento, testes e monitoramento inicial.',
      categoria: 'Integrações',
      modalidade: 'Integrações',
      tipo: 'setup',
      horasEstimadas: 70,
      valorHora: 310,
      valorTotal: 21700,
      prazoEstimado: 35,
      escopo: 'Mapeamento de endpoints, autenticação, tratamento de erros e testes ponta a ponta.',
      entregas: ['Especificação de integração', 'Conectores implementados', 'Testes homologados', 'Plano de suporte inicial'],
      dependenciasCliente: ['Documentação das APIs', 'Credenciais válidas', 'Ambiente de homologação'],
      ativo: true
    },
    {
      id: 'lic-suporte-premium',
      nome: 'Suporte Premium 24/7',
      descricao: 'Suporte técnico premium com resposta em até 1 hora.',
      categoria: 'Sustentação',
      modalidade: 'Dúvidas',
      tipo: 'recorrente',
      valorMensal: 2000,
      periodicidade: 'mensal',
      prazoPagamento: 12,
      escopo: 'Atendimento contínuo com SLAs prioritários e relatórios de acompanhamento.',
      entregas: ['Suporte via email/telefone/chat', 'Resposta em 1 hora', 'Acesso remoto', 'Relatórios mensais'],
      dependenciasCliente: ['Canais de contato definidos', 'Equipe focal', 'Acessos remotos autorizados'],
      ativo: true
    },
    {
      id: 'lic-manutencao-cloud',
      nome: 'Manutenção Preventiva Cloud',
      descricao: 'Rotina recorrente de atualização, hardening e melhoria contínua.',
      categoria: 'Cloud',
      modalidade: 'Cloud',
      tipo: 'recorrente',
      valorMensal: 1500,
      periodicidade: 'mensal',
      prazoPagamento: 6,
      escopo: 'Acompanhamento mensal da infraestrutura, patching e recomendações.',
      entregas: ['Checklist mensal', 'Atualizações preventivas', 'Relatório de capacidade', 'Plano de ação'],
      dependenciasCliente: ['Janela de manutenção', 'Acessos administrativos', 'Aprovação de mudanças'],
      ativo: true
    },
    {
      id: 'lic-monitoramento-bi',
      nome: 'Monitoramento de KPIs e Dados',
      descricao: 'Acompanhamento recorrente da saúde dos painéis e das cargas.',
      categoria: 'BI',
      modalidade: 'BI',
      tipo: 'recorrente',
      valorMensal: 3000,
      periodicidade: 'mensal',
      prazoPagamento: 12,
      escopo: 'Monitoramento de cargas, consistência de indicadores e fila de melhorias.',
      entregas: ['Monitoramento diário', 'Alertas proativos', 'Relatório executivo', 'Reunião mensal'],
      dependenciasCliente: ['Responsável de negócio', 'Acesso às fontes', 'Definição de SLA de dados'],
      ativo: true
    },
    {
      id: 'lic-gestao-mudancas',
      nome: 'Gestão de Mudanças Operacionais',
      descricao: 'Planejamento e acompanhamento de mudanças em produção.',
      categoria: 'Gestão de Acessos',
      modalidade: 'Gestão de Acessos',
      tipo: 'recorrente',
      valorMensal: 1200,
      periodicidade: 'mensal',
      prazoPagamento: 3,
      escopo: 'Janela controlada para mudanças, evidências e trilha de aprovação.',
      entregas: ['Backlog priorizado', 'Registro de mudanças', 'Ata de aprovação', 'Relatório de execução'],
      dependenciasCliente: ['CAB definido', 'Critérios de prioridade', 'Janela operacional acordada'],
      ativo: true
    }
  ];

  function clonar(dados) {
    return JSON.parse(JSON.stringify(dados));
  }

  function normalizarTexto(valor) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function numeroValido(valor) {
    return Number.isFinite(Number(valor)) && Number(valor) >= 0;
  }

  function arrayValido(valor) {
    return Array.isArray(valor) && valor.length > 0 && valor.every(item => typeof item === 'string' && item.trim());
  }

  function normalizarProduto(produto) {
    if (!produto || typeof produto !== 'object') {
      return null;
    }

    const tipo = normalizarTexto(produto.tipo);
    const base = {
      id: String(produto.id || '').trim(),
      nome: String(produto.nome || '').trim(),
      descricao: String(produto.descricao || '').trim(),
      categoria: String(produto.categoria || '').trim(),
      modalidade: String(produto.modalidade || produto.categoria || '').trim(),
      tipo,
      escopo: String(produto.escopo || '').trim(),
      entregas: Array.isArray(produto.entregas) ? produto.entregas.map(item => String(item).trim()).filter(Boolean) : [],
      dependenciasCliente: Array.isArray(produto.dependenciasCliente) ? produto.dependenciasCliente.map(item => String(item).trim()).filter(Boolean) : [],
      ativo: produto.ativo !== false
    };

    if (tipo === 'setup') {
      base.horasEstimadas = Number(produto.horasEstimadas || 0);
      base.valorHora = Number(produto.valorHora || 0);
      base.valorTotal = Number(produto.valorTotal || (base.horasEstimadas * base.valorHora));
      base.prazoEstimado = Number(produto.prazoEstimado || 0);
    }

    if (tipo === 'recorrente') {
      base.valorMensal = Number(produto.valorMensal || 0);
      base.periodicidade = String(produto.periodicidade || 'mensal').trim().toLowerCase();
      base.prazoPagamento = Number(produto.prazoPagamento || 0);
    }

    return base;
  }

  function validarProduto(produto) {
    if (!produto || !produto.id || !produto.nome || !produto.descricao || !produto.categoria || !produto.modalidade) {
      return false;
    }

    if (!arrayValido(produto.entregas) || !arrayValido(produto.dependenciasCliente)) {
      return false;
    }

    if (produto.tipo === 'setup') {
      return numeroValido(produto.horasEstimadas)
        && numeroValido(produto.valorHora)
        && numeroValido(produto.valorTotal)
        && numeroValido(produto.prazoEstimado);
    }

    if (produto.tipo === 'recorrente') {
      return numeroValido(produto.valorMensal)
        && !!String(produto.periodicidade || '').trim()
        && numeroValido(produto.prazoPagamento);
    }

    return false;
  }

  function lerCatalogo() {
    try {
      const bruto = global.localStorage.getItem(STORAGE_KEY);
      if (!bruto) {
        return [];
      }

      const dados = JSON.parse(bruto);
      return Array.isArray(dados) ? dados : [];
    } catch (error) {
      return [];
    }
  }

  function salvarCatalogo(produtos) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
  }

  function inicializarSeed() {
    const atual = lerCatalogo();
    if (atual.length > 0) {
      return;
    }

    salvarCatalogo(seedCatalogo);
  }

  const CatalogoDB = {
    chaveStorage: STORAGE_KEY,

    listar: function () {
      inicializarSeed();

      return lerCatalogo()
        .map(normalizarProduto)
        .filter(produto => validarProduto(produto))
        .map(produto => clonar(produto));
    },

    filtrar: function (tipo, modalidade, busca) {
      const tipoNormalizado = normalizarTexto(tipo || TIPO_TODOS);
      const modalidadeNormalizada = normalizarTexto(modalidade || MODALIDADE_TODAS);
      const buscaNormalizada = normalizarTexto(busca);

      return this.listar().filter(produto => {
        const correspondeTipo = tipoNormalizado === TIPO_TODOS || produto.tipo === tipoNormalizado;
        const correspondeModalidade = modalidadeNormalizada === MODALIDADE_TODAS
          || normalizarTexto(produto.modalidade) === modalidadeNormalizada;
        const textoBusca = normalizarTexto([
          produto.nome,
          produto.descricao,
          produto.categoria,
          produto.modalidade,
          produto.escopo
        ].join(' '));
        const correspondeBusca = !buscaNormalizada || textoBusca.includes(buscaNormalizada);

        return correspondeTipo && correspondeModalidade && correspondeBusca && produto.ativo;
      });
    },

    obter: function (id) {
      if (!id || typeof id !== 'string') {
        return null;
      }

      const produto = this.listar().find(item => item.id === id.trim());
      return produto ? clonar(produto) : null;
    }
  };

  global.CatalogoDB = CatalogoDB;
})(window);
