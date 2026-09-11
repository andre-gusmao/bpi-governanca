// ==========================================
// HELP DESK AVANÇADO - SISTEMA CORE
// Sistema de gerenciamento de chamados
// Modalidades: Cloud, Treinamento, Acesso, 
// Implementações, BI, BPO, Integrações, Suporte
// ==========================================

// ==========================================
// CONFIGURAÇÃO CENTRAL DO HELP DESK
// ==========================================

const HelpDeskConfig = {
    // Modalidades de Serviço
    modalidades: {
        'CLOUD': {
            nome: 'Cloud',
            descricao: 'Serviços de infraestrutura em nuvem',
            icone: '☁️',
            sla: { critico: 2, alto: 4, medio: 8, baixo: 24 }
        },
        'TREINAMENTO': {
            nome: 'Solicitação de Treinamento',
            descricao: 'Capacitação de usuários e equipes',
            icone: '📚',
            sla: { critico: 8, alto: 16, medio: 48, baixo: 120 }
        },
        'ACESSO': {
            nome: 'Acesso a Usuários',
            descricao: 'Gerenciamento de permissões e acesso',
            icone: '🔐',
            sla: { critico: 1, alto: 2, medio: 4, baixo: 8 }
        },
        'IMPLEMENTACAO': {
            nome: 'Implementações',
            descricao: 'Deploy e implementação de soluções',
            icone: '🚀',
            sla: { critico: 4, alto: 8, medio: 24, baixo: 72 }
        },
        'NOTAS': {
            nome: 'Hub de Capturas de Notas',
            descricao: 'Gestão de documentação e notas',
            icone: '📝',
            sla: { critico: 4, alto: 8, medio: 16, baixo: 48 }
        },
        'BI': {
            nome: 'Business Intelligence',
            descricao: 'Dashboards, relatórios e análises',
            icone: '📊',
            sla: { critico: 6, alto: 12, medio: 24, baixo: 72 }
        },
        'DASHBOARD': {
            nome: 'Dashboard',
            descricao: 'Customização e configuração de painéis',
            icone: '📈',
            sla: { critico: 6, alto: 12, medio: 24, baixo: 72 }
        },
        'BPO_FINANCEIRO': {
            nome: 'BPO Financeiro',
            descricao: 'Processamento de operações financeiras',
            icone: '💰',
            sla: { critico: 2, alto: 4, medio: 8, baixo: 24 }
        },
        'BPO_CONTABIL': {
            nome: 'BPO Contábil',
            descricao: 'Serviços de contabilidade terceirizada',
            icone: '📋',
            sla: { critico: 4, alto: 8, medio: 16, baixo: 48 }
        },
        'INTEGRACAO': {
            nome: 'Barramento de Integrações',
            descricao: 'APIs e integrações entre sistemas',
            icone: '🔄',
            sla: { critico: 2, alto: 4, medio: 8, baixo: 24 }
        },
        'DUVIDA': {
            nome: 'Esclarecimento de Dúvidas',
            descricao: 'Suporte geral e orientações',
            icone: '❓',
            sla: { critico: 4, alto: 8, medio: 16, baixo: 48 }
        }
    },

    // Status de Chamados
    status: {
        'ABERTO': { label: 'Aberto', cor: '#0066cc', permiteTransicao: ['EM_ANALISE', 'EM_PROGRESSO'] },
        'EM_ANALISE': { label: 'Em Análise', cor: '#FFA500', permiteTransicao: ['EM_PROGRESSO', 'PROPOSTA_ENVIADA', 'AGUARDANDO_CLIENTE'] },
        'EM_PROGRESSO': { label: 'Em Progresso', cor: '#FF9500', permiteTransicao: ['CRITICO', 'MODERADO', 'RESOLVIDO', 'AGUARDANDO_CLIENTE'] },
        'CRITICO': { label: 'Crítico', cor: '#DC143C', permiteTransicao: ['EM_PROGRESSO', 'ESCALADO'] },
        'MODERADO': { label: 'Moderado', cor: '#FF6347', permiteTransicao: ['EM_PROGRESSO', 'RESOLVIDO'] },
        'CUSTOMIZADO': { label: 'Customizado', cor: '#9370DB', permiteTransicao: ['PROPOSTA_ENVIADA', 'IMPLEMENTACAO'] },
        'PROPOSTA_ENVIADA': { label: 'Proposta Enviada', cor: '#4169E1', permiteTransicao: ['PROPOSTA_ACEITA', 'PROPOSTA_REJEITADA'] },
        'PROPOSTA_ACEITA': { label: 'Proposta Aceita', cor: '#228B22', permiteTransicao: ['IMPLEMENTACAO'] },
        'PROPOSTA_REJEITADA': { label: 'Proposta Rejeitada', cor: '#8B0000', permiteTransicao: ['ABERTO'] },
        'IMPLEMENTACAO': { label: 'Em Implementação', cor: '#FF8C00', permiteTransicao: ['RESOLVIDO', 'CRITICO'] },
        'ESCALADO': { label: 'Escalado', cor: '#DC143C', permiteTransicao: ['EM_PROGRESSO', 'RESOLVIDO'] },
        'AGUARDANDO_CLIENTE': { label: 'Aguardando Cliente', cor: '#FFA500', permiteTransicao: ['EM_ANALISE', 'EM_PROGRESSO'] },
        'RESOLVIDO': { label: 'Resolvido', cor: '#28A745', permiteTransicao: ['FECHADO', 'REABERTO'] },
        'REABERTO': { label: 'Reaberto', cor: '#FF8C00', permiteTransicao: ['EM_ANALISE', 'EM_PROGRESSO'] },
        'FECHADO': { label: 'Fechado', cor: '#808080', permiteTransicao: [] }
    },

    // Prioridades
    prioridades: {
        'CRITICA': { nivel: 1, label: 'Crítica', cor: '#DC143C', horasResposta: 1 },
        'ALTA': { nivel: 2, label: 'Alta', cor: '#FF6347', horasResposta: 2 },
        'MEDIA': { nivel: 3, label: 'Média', cor: '#FFA500', horasResposta: 8 },
        'BAIXA': { nivel: 4, label: 'Baixa', cor: '#28A745', horasResposta: 24 }
    }
};

// ==========================================
// BANCO DE DADOS DE CHAMADOS (LocalStorage)
// ==========================================

const ChamadosDB = {
    
    // Obter todos os chamados
    obterTodos: function() {
        const chamados = localStorage.getItem('helpdesk_chamados');
        return chamados ? JSON.parse(chamados) : [];
    },

    // Obter chamados por cliente
    obterPorCliente: function(clientId) {
        return this.obterTodos().filter(c => c.clientId === clientId);
    },

    // Obter chamado por ID
    obterPorId: function(id) {
        return this.obterTodos().find(c => c.id === id);
    },

    // Criar novo chamado
    criar: function(dados) {
        const id = 'CH-' + Date.now();
        const chamado = {
            id: id,
            numeroSequencial: this.gerarNumeroSequencial(),
            clientId: dados.clientId,
            clienteName: dados.clienteName,
            modalidade: dados.modalidade,
            titulo: dados.titulo,
            descricao: dados.descricao,
            prioridade: dados.prioridade,
            status: 'ABERTO',
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString(),
            dataVencimentoSLA: this.calcularVencimentoSLA(dados.prioridade, dados.modalidade),
            atendente: null,
            responsavel: null,
            historico: [
                {
                    data: new Date().toISOString(),
                    acao: 'CRIACAO',
                    status: 'ABERTO',
                    autor: dados.clienteName,
                    tipoAutor: 'cliente',
                    descricao: 'Chamado aberto',
                    visivel: false
                }
            ],
            comentarios: [],
            anexos: [],
            tags: [],
            baseConhecimento: [],
            proposta: null
        };
        
        const chamados = this.obterTodos();
        chamados.push(chamado);
        localStorage.setItem('helpdesk_chamados', JSON.stringify(chamados));
        
        return chamado;
    },

    // Atualizar status do chamado
    atualizarStatus: function(chamadoId, novoStatus, descricaoInterno = '', autorEmail = '', tipoAutor = 'sistema') {
        const chamados = this.obterTodos();
        const chamado = chamados.find(c => c.id === chamadoId);
        
        if (chamado) {
            const statusAnterior = chamado.status;
            chamado.status = novoStatus;
            chamado.dataAtualizacao = new Date().toISOString();
            
            chamado.historico.push({
                data: new Date().toISOString(),
                acao: 'MUDANCA_STATUS',
                statusAnterior: statusAnterior,
                statusNovo: novoStatus,
                autor: autorEmail || 'Sistema',
                tipoAutor: tipoAutor,
                descricao: descricaoInterno,
                visivel: false
            });
            
            localStorage.setItem('helpdesk_chamados', JSON.stringify(chamados));
            
            this.enviarEmailStatusAtualizado(chamado, novoStatus);
            
            return chamado;
        }
        return null;
    },

    // Adicionar comentário
    adicionarComentario: function(chamadoId, texto, autorEmail, tipoAutor = 'cliente', visivel = true) {
        const chamados = this.obterTodos();
        const chamado = chamados.find(c => c.id === chamadoId);
        
        if (chamado) {
            const comentario = {
                id: 'COM-' + Date.now(),
                data: new Date().toISOString(),
                autor: autorEmail,
                tipoAutor: tipoAutor,
                texto: texto,
                visivel: visivel,
                resposta: null
            };
            
            chamado.comentarios.push(comentario);
            chamado.dataAtualizacao = new Date().toISOString();
            
            chamado.historico.push({
                data: new Date().toISOString(),
                acao: 'COMENTARIO_ADICIONADO',
                status: chamado.status,
                autor: autorEmail,
                tipoAutor: tipoAutor,
                descricao: `Comentário adicionado${visivel ? ' (visível ao cliente)' : ' (interno)'}`,
                visivel: visivel
            });
            
            localStorage.setItem('helpdesk_chamados', JSON.stringify(chamados));
            return comentario;
        }
        return null;
    },

    // Enviar proposta
    enviarProposta: function(chamadoId, proposta) {
        const chamados = this.obterTodos();
        const chamado = chamados.find(c => c.id === chamadoId);
        
        if (chamado) {
            chamado.proposta = {
                id: 'PROP-' + Date.now(),
                dataEnvio: new Date().toISOString(),
                descricao: proposta.descricao,
                valor: proposta.valor,
                prazo: proposta.prazo,
                detalhes: proposta.detalhes,
                status: 'ENVIADA'
            };
            
            chamado.status = 'PROPOSTA_ENVIADA';
            chamado.dataAtualizacao = new Date().toISOString();
            
            chamado.historico.push({
                data: new Date().toISOString(),
                acao: 'PROPOSTA_ENVIADA',
                status: 'PROPOSTA_ENVIADA',
                autor: 'Sistema',
                tipoAutor: 'sistema',
                descricao: `Proposta enviada ao cliente - R$ ${proposta.valor}`,
                visivel: true
            });
            
            localStorage.setItem('helpdesk_chamados', JSON.stringify(chamados));
            this.enviarEmailPropostaEnviada(chamado);
            
            return chamado;
        }
        return null;
    },

    // Adicionar artigos de base de conhecimento
    adicionarArtigoBaseConhecimento: function(chamadoId, artigo) {
        const chamados = this.obterTodos();
        const chamado = chamados.find(c => c.id === chamadoId);
        
        if (chamado) {
            chamado.baseConhecimento.push({
                id: 'ART-' + Date.now(),
                titulo: artigo.titulo,
                conteudo: artigo.conteudo,
                categoria: artigo.categoria,
                dataAdicao: new Date().toISOString()
            });
            
            localStorage.setItem('helpdesk_chamados', JSON.stringify(chamados));
        }
    },

    // Calcular vencimento SLA
    calcularVencimentoSLA: function(prioridade, modalidade) {
        const config = HelpDeskConfig.prioridades[prioridade];
        const horas = config.horasResposta;
        const data = new Date();
        data.setHours(data.getHours() + horas);
        return data.toISOString();
    },

    // Gerar número sequencial
    gerarNumeroSequencial: function() {
        const contador = parseInt(localStorage.getItem('helpdesk_contador') || '0');
        localStorage.setItem('helpdesk_contador', (contador + 1).toString());
        return String(contador + 1).padStart(6, '0');
    },

    // Enviar email simulado - Status Atualizado
    enviarEmailStatusAtualizado: function(chamado, novoStatus) {
        const email = {
            para: chamado.clienteName + '@empresa.com.br',
            assunto: `[${chamado.numeroSequencial}] Seu chamado teve atualização: ${HelpDeskConfig.status[novoStatus].label}`,
            corpo: `Prezado Cliente,\n\nInformamos que seu chamado #${chamado.numeroSequencial} - ${chamado.titulo}\nteve a situação atualizada para: ${HelpDeskConfig.status[novoStatus].label}\n\nModalidade: ${HelpDeskConfig.modalidades[chamado.modalidade].nome}\nData de Atualização: ${new Date(chamado.dataAtualizacao).toLocaleString('pt-BR')}\n\nAcesse o portal para mais detalhes: https://bpigovernanca.com.br/portal/dashboard.html\n\nAtenciosamente,\nBPI Governança - Help Desk`,
            tipo: 'status_atualizado',
            chamadoId: chamado.id,
            dataPedido: new Date().toISOString(),
            enviado: false
        };
        
        this.registrarEmail(email);
    },

    // Enviar email simulado - Proposta Enviada
    enviarEmailPropostaEnviada: function(chamado) {
        const email = {
            para: chamado.clienteName + '@empresa.com.br',
            assunto: `[${chamado.numeroSequencial}] Proposta enviada para seu chamado`,
            corpo: `Prezado Cliente,\n\nUma proposta foi enviada para seu chamado #${chamado.numeroSequencial}\n\nValor: R$ ${chamado.proposta.valor}\nPrazo: ${chamado.proposta.prazo}\n\nClique aqui para visualizar os detalhes e aceitar a proposta.\n\nAtenciosamente,\nBPI Governança - Help Desk`,
            tipo: 'proposta_enviada',
            chamadoId: chamado.id,
            dataPedido: new Date().toISOString(),
            enviado: false
        };
        
        this.registrarEmail(email);
    },

    // Registrar email (simulado)
    registrarEmail: function(email) {
        const emails = JSON.parse(localStorage.getItem('helpdesk_emails') || '[]');
        emails.push(email);
        localStorage.setItem('helpdesk_emails', JSON.stringify(emails));
        console.log('📧 Email registrado:', email);
    },

    // Obter histórico visível para cliente
    obterHistoricoVisivel: function(chamadoId) {
        const chamado = this.obterPorId(chamadoId);
        if (chamado) {
            return chamado.historico.filter(h => h.visivel === true);
        }
        return [];
    },

    // Obter comentários visíveis para cliente
    obterComentariosVisiveis: function(chamadoId) {
        const chamado = this.obterPorId(chamadoId);
        if (chamado) {
            return chamado.comentarios.filter(c => c.visivel === true);
        }
        return [];
    }
};

// ==========================================
// BASE DE CONHECIMENTO
// ==========================================

const BaseConhecimento = {
    
    artigos: [
        {
            id: 'ART-001',
            titulo: 'Como resetar senha de acesso ao portal',
            categoria: 'ACESSO',
            conteudo: 'Clique em "Esqueceu a senha?" e siga as instruções...',
            tags: ['acesso', 'senha', 'portal'],
            modalidades: ['ACESSO', 'DUVIDA']
        },
        {
            id: 'ART-002',
            titulo: 'Integração de APIs - Guia Completo',
            categoria: 'INTEGRACAO',
            conteudo: 'Documentação completa sobre integração via barramento...',
            tags: ['api', 'integracao', 'desenvolvimento'],
            modalidades: ['INTEGRACAO']
        },
        {
            id: 'ART-003',
            titulo: 'Configurando Dashboards customizados',
            categoria: 'DASHBOARD',
            conteudo: 'Passo a passo para criar e personalizar seus dashboards...',
            tags: ['dashboard', 'customizacao', 'bi'],
            modalidades: ['DASHBOARD', 'BI']
        }
    ],

    // Buscar artigos por modalidade
    buscarPorModalidade: function(modalidade) {
        return this.artigos.filter(a => a.modalidades.includes(modalidade));
    },

    // Buscar artigos por palavra-chave
    buscar: function(termo) {
        const termoLower = termo.toLowerCase();
        return this.artigos.filter(a => 
            a.titulo.toLowerCase().includes(termoLower) ||
            a.conteudo.toLowerCase().includes(termoLower) ||
            a.tags.some(t => t.toLowerCase().includes(termoLower))
        );
    }
};

// ==========================================
// CHAT COM IA - SUGESTÕES INTELIGENTES
// ==========================================

const ChatIA = {
    
    sugerirSolucao: function(titulo, descricao, modalidade) {
        const artigos = BaseConhecimento.buscarPorModalidade(modalidade);
        
        return {
            mensagem: `Encontrei ${artigos.length} artigos que podem ajudar:`,
            artigos: artigos,
            sugereAberturaTicket: artigos.length === 0
        };
    },

    analisarDescricao: function(descricao) {
        const palavrasUrgentesCriticas = ['urgente', 'crítico', 'parado', 'quebrado', 'não funciona', 'erro'];
        const palavrasUrgentesAltas = ['problema', 'issue', 'dificuldade', 'não consegue'];
        
        let prioridade = 'MEDIA';
        
        if (palavrasUrgentesCriticas.some(p => descricao.toLowerCase().includes(p))) {
            prioridade = 'CRITICA';
        } else if (palavrasUrgentesAltas.some(p => descricao.toLowerCase().includes(p))) {
            prioridade = 'ALTA';
        }
        
        return prioridade;
    }
};

console.log('✅ Help Desk Core System Carregado');
console.log('📋 Modalidades disponíveis:', Object.keys(HelpDeskConfig.modalidades).length);
console.log('📚 Artigos na base de conhecimento:', BaseConhecimento.artigos.length);