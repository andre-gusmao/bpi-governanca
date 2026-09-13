(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    propostas: 'helpdesk_propostas',
    emails: 'helpdesk_emails',
    catalogo: 'helpdesk_catalogo',
    clientes: 'helpdesk_clientes'
  };

  const DEFAULT_MODALIDADES = [
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
    'BPO Folha de Pagamento',
    'Integrações',
    'Dúvidas'
  ];

  const FALLBACK_CLIENTES = [
    {
      id: 'cli-001',
      nome: 'Empresa XYZ Inc',
      empresa: 'Empresa XYZ Inc',
      cnpj: '12.345.678/0001-90',
      email: 'contato@xyz.com.br'
    },
    {
      id: 'cli-002',
      nome: 'Tech Solutions',
      empresa: 'Tech Solutions',
      cnpj: '98.765.432/0001-10',
      email: 'admin@techsolutions.com.br'
    },
    {
      id: 'cli-003',
      nome: 'Holding Internacional',
      empresa: 'Holding Internacional',
      cnpj: '55.555.555/0001-55',
      email: 'financeiro@holding.com.br'
    }
  ];

  const DEFAULT_SERVICOS = [
    {
      id: 'srv-impl-erp',
      nome: 'Implementação ERP - Módulo Financeiro',
      descricao: 'Implementação completa do módulo financeiro com setup e treinamento inicial.',
      categoria: 'Implementações',
      tipo: 'setup',
      horasEstimadas: 120,
      valorHora: 250,
      valorTotal: 30000,
      prazoEstimado: 45,
      ativo: true
    },
    {
      id: 'srv-train-users',
      nome: 'Treinamento de Usuários',
      descricao: 'Capacitação operacional e funcional das equipes do cliente.',
      categoria: 'Treinamento',
      tipo: 'setup',
      horasEstimadas: 40,
      valorHora: 200,
      valorTotal: 8000,
      prazoEstimado: 20,
      ativo: true
    },
    {
      id: 'srv-consult-opt',
      nome: 'Consultoria de Otimização',
      descricao: 'Mapeamento, diagnóstico e plano de otimização de processos.',
      categoria: 'Consultoria',
      tipo: 'setup',
      horasEstimadas: 60,
      valorHora: 300,
      valorTotal: 18000,
      prazoEstimado: 30,
      ativo: true
    },
    {
      id: 'lic-suporte-premium',
      nome: 'Suporte Premium 24/7',
      descricao: 'Atendimento prioritário com canais dedicados e resposta rápida.',
      categoria: 'Sustentação',
      tipo: 'recorrente',
      horasMes: 40,
      valorMensal: 2000,
      prazoEstimado: 365,
      ativo: true
    },
    {
      id: 'lic-manutencao',
      nome: 'Manutenção Preventiva',
      descricao: 'Rotina mensal de revisão de ambiente e prevenção de incidentes.',
      categoria: 'Sustentação',
      tipo: 'recorrente',
      horasMes: 24,
      valorMensal: 1500,
      prazoEstimado: 365,
      ativo: true
    }
  ];

  const TRUSTED_ACCOUNTS = global.TRUSTED_ACCOUNTS || {
    cliente: FALLBACK_CLIENTES.slice()
  };

  function parseStorage(key, fallback) {
    if (!global.localStorage) {
      return Array.isArray(fallback) ? fallback.slice() : fallback;
    }

    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) {
        return Array.isArray(fallback) ? fallback.slice() : fallback;
      }

      const parsed = JSON.parse(raw);
      if (parsed == null) {
        return Array.isArray(fallback) ? fallback.slice() : fallback;
      }

      return parsed;
    } catch (error) {
      console.warn('Falha ao ler localStorage para', key, error);
      return Array.isArray(fallback) ? fallback.slice() : fallback;
    }
  }

  function saveStorage(key, value) {
    if (!global.localStorage) {
      return value;
    }

    global.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value) || 0);
  }

  function toISODate(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const adjusted = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return adjusted.toISOString().split('T')[0];
  }

  function addDays(baseDate, daysToAdd) {
    const date = new Date(baseDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    date.setDate(date.getDate() + Number(daysToAdd || 0));
    return toISODate(date);
  }

  function formatDate(value) {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('pt-BR');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizePdfText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\\()]/g, '\\$&');
  }

  function wrapText(text, maxLength) {
    const content = String(text || '').trim();
    if (!content) {
      return [];
    }

    const words = content.split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const tentative = currentLine ? currentLine + ' ' + word : word;
      if (tentative.length <= maxLength) {
        currentLine = tentative;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  function sanitizeServico(produto) {
    const tipo = produto.tipo === 'recorrente' ? 'recorrente' : 'setup';
    const valor = tipo === 'setup'
      ? Number(produto.valorTotal != null ? produto.valorTotal : produto.valor) || 0
      : Number(produto.valorMensal != null ? produto.valorMensal : produto.valor) || 0;

    return {
      id: produto.id,
      nome: produto.nome,
      tipo: tipo,
      valor: valor,
      horasEstimadas: Number(produto.horasEstimadas) || 0,
      horasMes: Number(produto.horasMes) || 0,
      valorTotal: Number(produto.valorTotal) || (tipo === 'setup' ? valor : 0),
      valorMensal: Number(produto.valorMensal) || (tipo === 'recorrente' ? valor : 0),
      categoria: produto.categoria || '',
      prazoEstimado: Number(produto.prazoEstimado) || 0,
      descricao: produto.descricao || ''
    };
  }

  function listarCatalogo() {
    const catalogo = parseStorage(STORAGE_KEYS.catalogo, DEFAULT_SERVICOS);
    if (!Array.isArray(catalogo) || !catalogo.length) {
      return DEFAULT_SERVICOS.map(sanitizeServico);
    }

    return catalogo
      .filter((item) => item && item.ativo !== false)
      .map(sanitizeServico);
  }

  function listarClientes() {
    const clientesExtras = parseStorage(STORAGE_KEYS.clientes, []);
    const agrupados = new Map();

    TRUSTED_ACCOUNTS.cliente.forEach((cliente) => {
      agrupados.set(cliente.id, {
        id: cliente.id,
        nome: cliente.nome || cliente.empresa || '',
        empresa: cliente.empresa || cliente.nome || '',
        cnpj: cliente.cnpj || '',
        email: cliente.email || ''
      });
    });

    if (Array.isArray(clientesExtras)) {
      clientesExtras.forEach((cliente, index) => {
        if (!cliente || !(cliente.id || cliente.email || cliente.nome)) {
          return;
        }

        const id = cliente.id || 'cli-extra-' + index;
        if (!agrupados.has(id)) {
          agrupados.set(id, {
            id: id,
            nome: cliente.nome || cliente.empresa || '',
            empresa: cliente.empresa || cliente.nome || '',
            cnpj: cliente.cnpj || '',
            email: cliente.email || ''
          });
        }
      });
    }

    return Array.from(agrupados.values());
  }

  function calcularValores(servicos, descontoPercentual) {
    const itens = Array.isArray(servicos) ? servicos.map(sanitizeServico) : [];
    const setup = itens.reduce((total, item) => total + (item.tipo === 'setup' ? item.valorTotal : 0), 0);
    const recorrente = itens.reduce((total, item) => total + (item.tipo === 'recorrente' ? item.valorMensal : 0), 0);
    const recorrenteAnual = recorrente * 12;
    const percentual = Math.min(Math.max(Number(descontoPercentual) || 0, 0), 100);
    const subtotal = setup + recorrenteAnual;
    const desconto = subtotal * (percentual / 100);
    const total = subtotal - desconto;

    return {
      setup: setup,
      recorrente: recorrente,
      recorrenteAnual: recorrenteAnual,
      desconto: desconto,
      descontoPercentual: percentual,
      subtotal: subtotal,
      total: total
    };
  }

  function calcularPrazos(inicio, duracao, validadeEmDias, dataReferencia) {
    const inicioISO = toISODate(inicio);
    const duracaoNumerica = Number(duracao) || 0;
    const validadeNumerica = Number(validadeEmDias) || 0;
    const emissaoBase = toISODate(dataReferencia || new Date()) || toISODate(new Date());

    return {
      inicio: inicioISO,
      duracao: duracaoNumerica,
      fim: inicioISO && duracaoNumerica > 0 ? addDays(inicioISO, duracaoNumerica) : '',
      validadeEmDias: validadeNumerica,
      dataValidade: emissaoBase && validadeNumerica > 0 ? addDays(emissaoBase, validadeNumerica) : ''
    };
  }

  function gerarProximoNumero() {
    const propostas = parseStorage(STORAGE_KEYS.propostas, []);
    const ano = new Date().getFullYear();
    const sequencial = propostas.filter((proposta) => String(proposta.numero || '').endsWith('/' + ano)).length + 1;
    const numeroFormatado = String(sequencial).padStart(3, '0');

    return {
      id: 'prop-' + ano + '-' + numeroFormatado,
      numero: numeroFormatado + '/' + ano,
      codigoUnico: 'PROP-' + ano + '-' + Date.now()
    };
  }

  function criarProposta(payload) {
    const identificador = payload.id && payload.numero && payload.codigoUnico
      ? {
          id: payload.id,
          numero: payload.numero,
          codigoUnico: payload.codigoUnico
        }
      : gerarProximoNumero();

    const cliente = payload.cliente || {
      id: payload.clientId,
      nome: payload.nomeCliente,
      empresa: payload.nomeCliente,
      email: payload.emailCliente,
      cnpj: payload.cnpjCliente
    };
    const servicos = Array.isArray(payload.servicos) ? payload.servicos.map(sanitizeServico) : [];
    const dataCriacao = payload.dataCriacao || new Date().toISOString();
    const descontoPercentual = payload.descontoPercentual != null
      ? payload.descontoPercentual
      : (payload.valores && payload.valores.descontoPercentual);
    const inicio = payload.inicio != null ? payload.inicio : (payload.prazos && payload.prazos.inicio);
    const duracao = payload.duracao != null ? payload.duracao : (payload.prazos && payload.prazos.duracao);
    const validadeEmDias = payload.validadeEmDias != null
      ? payload.validadeEmDias
      : (payload.prazos && payload.prazos.validadeEmDias);
    const valores = calcularValores(servicos, descontoPercentual);
    const prazos = calcularPrazos(inicio, duracao, validadeEmDias, dataCriacao);

    return {
      id: identificador.id,
      numero: identificador.numero,
      clientId: cliente.id || '',
      nomeCliente: cliente.nome || cliente.empresa || '',
      emailCliente: cliente.email || '',
      cnpjCliente: cliente.cnpj || '',
      titulo: payload.titulo || '',
      descricao: payload.descricao || '',
      escopo: payload.escopo || '',
      modalidade: payload.modalidade || '',
      servicos: servicos.map((servico) => ({
        id: servico.id,
        nome: servico.nome,
        tipo: servico.tipo,
        valor: servico.tipo === 'setup' ? servico.valorTotal : servico.valorMensal,
        horasEstimadas: servico.horasEstimadas,
        horasMes: servico.horasMes,
        valorTotal: servico.valorTotal,
        valorMensal: servico.valorMensal,
        categoria: servico.categoria
      })),
      valores: valores,
      prazos: prazos,
      status: payload.status || 'rascunho',
      dataCriacao: dataCriacao,
      dataEnvio: payload.dataEnvio || null,
      dataResposta: payload.dataResposta || null,
      elaboradoPor: payload.elaboradoPor || '',
      pdfUrl: payload.pdfUrl || null,
      codigoUnico: identificador.codigoUnico,
      emailEnviadoPara: payload.emailEnviadoPara || null
    };
  }

  const PropostaDB = {
    salvar: function (proposta) {
      const propostas = parseStorage(STORAGE_KEYS.propostas, []);
      const propostaNormalizada = criarProposta(proposta);
      const index = propostas.findIndex((item) => item.id === propostaNormalizada.id);

      if (index >= 0) {
        propostas[index] = propostaNormalizada;
      } else {
        propostas.push(propostaNormalizada);
      }

      saveStorage(STORAGE_KEYS.propostas, propostas);
      return propostaNormalizada;
    },

    listar: function () {
      return parseStorage(STORAGE_KEYS.propostas, []);
    },

    obter: function (id) {
      return this.listar().find((proposta) => proposta.id === id) || null;
    },

    atualizar: function (id, dados) {
      const existente = this.obter(id);
      if (!existente) {
        return null;
      }

      const atualizado = criarProposta({
        ...existente,
        ...dados,
        id: existente.id,
        numero: existente.numero,
        codigoUnico: existente.codigoUnico,
        cliente: {
          id: dados.clientId || existente.clientId,
          nome: dados.nomeCliente || existente.nomeCliente,
          empresa: dados.nomeCliente || existente.nomeCliente,
          email: dados.emailCliente || existente.emailCliente,
          cnpj: dados.cnpjCliente || existente.cnpjCliente
        },
        inicio: dados.prazos && dados.prazos.inicio ? dados.prazos.inicio : (dados.inicio || (existente.prazos && existente.prazos.inicio)),
        duracao: dados.prazos && dados.prazos.duracao != null ? dados.prazos.duracao : (dados.duracao != null ? dados.duracao : (existente.prazos && existente.prazos.duracao)),
        validadeEmDias: dados.prazos && dados.prazos.validadeEmDias != null ? dados.prazos.validadeEmDias : (dados.validadeEmDias != null ? dados.validadeEmDias : (existente.prazos && existente.prazos.validadeEmDias)),
        descontoPercentual: dados.valores && dados.valores.descontoPercentual != null
          ? dados.valores.descontoPercentual
          : (dados.descontoPercentual != null ? dados.descontoPercentual : (existente.valores && existente.valores.descontoPercentual)),
        servicos: dados.servicos || existente.servicos,
        dataCriacao: existente.dataCriacao,
        dataEnvio: dados.dataEnvio !== undefined ? dados.dataEnvio : existente.dataEnvio,
        dataResposta: dados.dataResposta !== undefined ? dados.dataResposta : existente.dataResposta,
        elaboradoPor: dados.elaboradoPor || existente.elaboradoPor,
        pdfUrl: dados.pdfUrl !== undefined ? dados.pdfUrl : existente.pdfUrl,
        status: dados.status || existente.status,
        emailEnviadoPara: dados.emailEnviadoPara !== undefined ? dados.emailEnviadoPara : existente.emailEnviadoPara
      });

      return this.salvar(atualizado);
    }
  };

  function buildPreviewHtml(proposta) {
    const resumoEscopo = escapeHtml((proposta.escopo || '').slice(0, 280) || 'Escopo detalhado será exibido aqui.');
    const linhasServicos = proposta.servicos.length
      ? proposta.servicos.map((servico) => {
          const horas = servico.tipo === 'setup'
            ? (servico.horasEstimadas ? servico.horasEstimadas + 'h' : 'Setup')
            : (servico.horasMes ? servico.horasMes + 'h/mês' : 'Recorrente');
          const valorUnitario = servico.tipo === 'setup' ? servico.valorTotal : servico.valorMensal;
          const valorTotal = servico.tipo === 'setup' ? servico.valorTotal : servico.valorMensal;

          return '<tr>' +
            '<td>' + escapeHtml(servico.nome) + '</td>' +
            '<td>' + escapeHtml(horas) + '</td>' +
            '<td>' + formatCurrency(valorUnitario) + (servico.tipo === 'recorrente' ? '/mês' : '') + '</td>' +
            '<td><strong>' + formatCurrency(valorTotal) + (servico.tipo === 'recorrente' ? '/mês' : '') + '</strong></td>' +
            '</tr>';
        }).join('')
      : '<tr><td colspan="4" style="text-align:center;color:#6B7280;">Nenhum serviço selecionado</td></tr>';

    return [
      '<div class="pdf-preview-sheet">',
      '  <div class="pdf-preview-header">',
      '    <div>',
      '      <div class="pdf-preview-logo">BPI</div>',
      '      <div class="pdf-preview-subtitle">PROPOSTA COMERCIAL</div>',
      '    </div>',
      '    <div class="pdf-preview-meta">',
      '      <strong>' + escapeHtml(proposta.codigoUnico || 'PROP-0000') + '</strong>',
      '      <span>Emissão: ' + formatDate(proposta.dataCriacao) + '</span>',
      '      <span>Validade: ' + formatDate(proposta.prazos.dataValidade) + '</span>',
      '    </div>',
      '  </div>',
      '  <div class="pdf-preview-grid">',
      '    <div class="pdf-preview-card">',
      '      <div class="pdf-preview-label">Cliente</div>',
      '      <div class="pdf-preview-value">' + escapeHtml(proposta.nomeCliente || 'Selecione um cliente') + '</div>',
      '      <div class="pdf-preview-muted">' + escapeHtml(proposta.cnpjCliente || 'CNPJ não informado') + '</div>',
      '      <div class="pdf-preview-muted">' + escapeHtml(proposta.emailCliente || 'Email não informado') + '</div>',
      '    </div>',
      '    <div class="pdf-preview-card">',
      '      <div class="pdf-preview-label">Projeto</div>',
      '      <div class="pdf-preview-value">' + escapeHtml(proposta.titulo || 'Título do projeto') + '</div>',
      '      <div class="pdf-preview-muted">Modalidade: ' + escapeHtml(proposta.modalidade || '—') + '</div>',
      '      <div class="pdf-preview-muted">Prazo: ' + (proposta.prazos.duracao ? escapeHtml(String(proposta.prazos.duracao)) + ' dias' : '—') + '</div>',
      '    </div>',
      '  </div>',
      '  <div class="pdf-preview-section">',
      '    <h4>Escopo resumido</h4>',
      '    <p>' + resumoEscopo + '</p>',
      '  </div>',
      '  <div class="pdf-preview-section">',
      '    <h4>Serviços</h4>',
      '    <table class="pdf-preview-table">',
      '      <thead><tr><th>Serviço</th><th>Horas/mês</th><th>Valor unitário</th><th>Valor total</th></tr></thead>',
      '      <tbody>' + linhasServicos + '</tbody>',
      '    </table>',
      '  </div>',
      '  <div class="pdf-preview-grid resumo">',
      '    <div class="pdf-preview-card"><div class="pdf-preview-label">Setup</div><div class="pdf-preview-value">' + formatCurrency(proposta.valores.setup) + '</div></div>',
      '    <div class="pdf-preview-card"><div class="pdf-preview-label">Recorrente / mês</div><div class="pdf-preview-value">' + formatCurrency(proposta.valores.recorrente) + '</div></div>',
      '    <div class="pdf-preview-card"><div class="pdf-preview-label">Subtotal (12 meses)</div><div class="pdf-preview-value">' + formatCurrency(proposta.valores.subtotal) + '</div></div>',
      '    <div class="pdf-preview-card"><div class="pdf-preview-label">Total investimento</div><div class="pdf-preview-value destaque">' + formatCurrency(proposta.valores.total) + '</div></div>',
      '  </div>',
      '  <div class="pdf-preview-cta">',
      '    <button type="button" disabled>Aceitar</button>',
      '    <button type="button" disabled>Recusar</button>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function buildPdfLines(proposta) {
    const lines = [
      'BPI GOVERNANCA',
      'PROPOSTA COMERCIAL',
      'Codigo: ' + (proposta.codigoUnico || ''),
      'Numero: ' + (proposta.numero || ''),
      'Emissao: ' + formatDate(proposta.dataCriacao),
      'Validade: ' + formatDate(proposta.prazos.dataValidade),
      '',
      'CLIENTE',
      'Nome: ' + (proposta.nomeCliente || ''),
      'CNPJ: ' + (proposta.cnpjCliente || ''),
      'Email: ' + (proposta.emailCliente || ''),
      '',
      'PROJETO',
      'Titulo: ' + (proposta.titulo || ''),
      'Modalidade: ' + (proposta.modalidade || ''),
      'Inicio: ' + formatDate(proposta.prazos.inicio),
      'Fim: ' + formatDate(proposta.prazos.fim),
      'Duracao: ' + (proposta.prazos.duracao || 0) + ' dias',
      '',
      'ESCOPO'
    ];

    wrapText(proposta.escopo, 82).forEach((line) => lines.push(line));

    lines.push('', 'SERVICOS');

    proposta.servicos.forEach((servico) => {
      const linha = servico.nome + ' | ' + (servico.tipo === 'setup' ? 'Setup' : 'Recorrente') + ' | ' + formatCurrency(servico.tipo === 'setup' ? servico.valorTotal : servico.valorMensal);
      lines.push(linha);
    });

    lines.push(
      '',
      'RESUMO FINANCEIRO',
      'Setup: ' + formatCurrency(proposta.valores.setup),
      'Recorrente mensal: ' + formatCurrency(proposta.valores.recorrente),
      'Desconto: ' + formatCurrency(proposta.valores.desconto),
      'Total investimento: ' + formatCurrency(proposta.valores.total),
      '',
      'Valida por ' + (proposta.prazos.validadeEmDias || 0) + ' dias',
      'Assinatura digital simulada - BPI Governanca',
      'CTA Cliente: Aceitar / Recusar'
    );

    return lines;
  }

  function buildPdfString(proposta) {
    const lines = buildPdfLines(proposta);
    const contentLines = ['BT', '/F1 11 Tf', '50 790 Td'];

    lines.forEach((line, index) => {
      if (index > 0) {
        contentLines.push('0 -15 Td');
      }
      contentLines.push('(' + normalizePdfText(line) + ') Tj');
    });

    contentLines.push('ET');
    const streamContent = contentLines.join('\n');

    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
      '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj',
      '4 0 obj\n<< /Length ' + streamContent.length + ' >>\nstream\n' + streamContent + '\nendstream\nendobj',
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object) => {
      offsets.push(pdf.length);
      pdf += object + '\n';
    });

    const xrefStart = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
    pdf += '0000000000 65535 f \n';

    for (let index = 1; index < offsets.length; index += 1) {
      pdf += String(offsets[index]).padStart(10, '0') + ' 00000 n \n';
    }

    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
    pdf += 'startxref\n' + xrefStart + '\n%%EOF';

    return pdf;
  }

  const PDFGenerator = {
    gerar: function (proposta) {
      const html = buildPreviewHtml(proposta);
      const pdfString = buildPdfString(proposta);
      let pdfUrl = null;

      if (typeof Blob !== 'undefined' && global.URL && typeof global.URL.createObjectURL === 'function') {
        const blob = new Blob([pdfString], { type: 'application/pdf' });
        pdfUrl = global.URL.createObjectURL(blob);
      }

      return {
        fileName: 'proposta-' + (proposta.numero || 'comercial').replace(/\//g, '-') + '.pdf',
        pdfUrl: pdfUrl,
        html: html,
        content: pdfString,
        generatedAt: new Date().toISOString()
      };
    },

    baixar: function (resultado) {
      if (!resultado) {
        return false;
      }

      if (resultado.pdfUrl && global.document) {
        const anchor = global.document.createElement('a');
        anchor.href = resultado.pdfUrl;
        anchor.download = resultado.fileName;
        anchor.rel = 'noopener';
        global.document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        return true;
      }

      return false;
    }
  };

  const EmailSimulator = {
    enviar: function (proposta, email) {
      const destino = String(email || proposta.emailCliente || '').trim();
      if (!destino) {
        throw new Error('Email do cliente é obrigatório para envio.');
      }

      const timestamp = new Date().toISOString();
      const registro = {
        id: 'email-' + Date.now(),
        propostaId: proposta.id,
        numeroProposta: proposta.numero,
        para: destino,
        assunto: 'Proposta Comercial - ' + proposta.numero,
        corpo: 'Segue proposta comercial ' + proposta.numero + ' da BPI Governança.',
        enviadoEm: timestamp,
        anexo: proposta.pdfUrl || null,
        status: 'simulado'
      };

      const emails = parseStorage(STORAGE_KEYS.emails, []);
      emails.push(registro);
      saveStorage(STORAGE_KEYS.emails, emails);

      const propostaAtualizada = PropostaDB.atualizar(proposta.id, {
        status: 'enviada',
        dataEnvio: timestamp,
        emailEnviadoPara: destino,
        emailCliente: destino,
        pdfUrl: proposta.pdfUrl || null
      });

      return {
        registro: registro,
        proposta: propostaAtualizada
      };
    }
  };

  global.TRUSTED_ACCOUNTS = TRUSTED_ACCOUNTS;
  global.PropostaDB = PropostaDB;
  global.PDFGenerator = PDFGenerator;
  global.EmailSimulator = EmailSimulator;
  global.PropostaCatalogo = {
    listar: listarCatalogo
  };
  global.PropostaClientes = {
    listar: listarClientes
  };
  global.PropostaUtils = {
    modalidades: DEFAULT_MODALIDADES.slice(),
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    toISODate: toISODate,
    calcularValores: calcularValores,
    calcularPrazos: calcularPrazos,
    criarProposta: criarProposta,
    buildPreviewHtml: buildPreviewHtml
  };
})(typeof window !== 'undefined' ? window : globalThis);
