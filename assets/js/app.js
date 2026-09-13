// ===========================
// APP.JS - Lógica Global
// ===========================

// Verificar se está em modo desenvolvimento
const isDev = true;

// ===========================
// SISTEMA DE ARMAZENAMENTO
// ===========================

class StorageManager {
    static init() {
        // Carregar dados iniciais se não existirem
        if (!localStorage.getItem('bpi_initialized')) {
            this.loadInitialData();
            localStorage.setItem('bpi_initialized', 'true');
        }
    }

    static loadInitialData() {
        // Clientes
        const clientes = [
            { id: 1, nome: 'Empresa XYZ', email: 'contato@xyz.com.br', status: 'Ativo' },
            { id: 2, nome: 'Consultoria ABC', email: 'contato@abc.com.br', status: 'Ativo' },
            { id: 3, nome: 'Indústria DEF', email: 'contato@def.com.br', status: 'Ativo' },
            { id: 4, nome: 'Varejo GHI', email: 'contato@ghi.com.br', status: 'Ativo' },
            { id: 5, nome: 'Tech JKL', email: 'contato@jkl.com.br', status: 'Ativo' }
        ];
        localStorage.setItem('helpdesk_clientes', JSON.stringify(clientes));

        // Catálogo de Produtos/Serviços
        const catalogo = [
            {
                id: 'srv-impl-erp',
                nome: 'Implementação ERP - Módulo Financeiro',
                descricao: 'Setup, configuração, testes e treinamento',
                categoria: 'Implementações',
                tipo: 'setup',
                horasEstimadas: 120,
                valorHora: 250,
                valorTotal: 30000,
                prazoEstimado: 45,
                entregas: ['Análise de requisitos', 'Configuração inicial', 'Testes integrados', 'Treinamento de usuários'],
                ativo: true
            },
            {
                id: 'srv-treinamento-usuarios',
                nome: 'Treinamento de Usuários',
                descricao: 'Capacitação completa para usuários finais',
                categoria: 'Treinamento',
                tipo: 'setup',
                horasEstimadas: 40,
                valorHora: 200,
                valorTotal: 8000,
                prazoEstimado: 20,
                entregas: ['Definição de personas', 'Material de treinamento', 'Sessões práticas', 'Documentação'],
                ativo: true
            },
            {
                id: 'lic-suporte-premium',
                nome: 'Suporte Premium 24/7',
                descricao: 'Suporte técnico premium com resposta em 1 hora',
                categoria: 'Sustentação',
                tipo: 'recorrente',
                valorMensal: 2000,
                periodicidade: 'mensal',
                servicosInclusos: ['Suporte via email/phone/chat', 'Resposta em 1 hora', 'Acesso remoto', 'Relatórios mensais'],
                ativo: true
            }
        ];
        localStorage.setItem('helpdesk_catalogo', JSON.stringify(catalogo));

        // Colaboradores
        const colaboradores = [
            { 
                id: 1, 
                nome: 'João Silva', 
                email: 'pmo@bpigovernanca.com.br', 
                senha: 'PMO123!', 
                perfil: 'PMO', 
                ativo: true 
            },
            { 
                id: 2, 
                nome: 'Maria Santos', 
                email: 'comercial@bpigovernanca.com.br', 
                senha: 'Comercial123!', 
                perfil: 'Comercial', 
                ativo: true 
            }
        ];
        localStorage.setItem('helpdesk_colaboradores', JSON.stringify(colaboradores));

        // Chamados Help Desk
        const chamados = [
            {
                id: 1,
                numero: 'CHM-001',
                clienteId: 1,
                cliente: 'Empresa XYZ',
                titulo: 'Dúvida sobre Cloud',
                modalidade: 'Cloud',
                descricao: 'Questão sobre infraestrutura em nuvem',
                status: 'novo',
                dataCriacao: new Date().toISOString()
            }
        ];
        localStorage.setItem('helpdesk_chamados', JSON.stringify(chamados));

        // Projetos
        const projetos = [
            {
                id: 1,
                clienteId: 1,
                nomeCliente: 'Empresa XYZ',
                titulo: 'Implementação ERP Financeiro',
                descricao: 'Projeto de implementação do módulo financeiro',
                status: 'em_andamento',
                dataInicio: new Date().toISOString(),
                dataFimPrevisto: new Date(Date.now() + 45*24*60*60*1000).toISOString(),
                percentualConclusao: 45
            }
        ];
        localStorage.setItem('helpdesk_projetos', JSON.stringify(projetos));

        // Treinamentos
        const treinamentos = [
            {
                id: 1,
                titulo: 'Governança Corporativa',
                descricao: 'Fundamentos de governança corporativa',
                video: 'https://example.com/video1.mp4',
                duracao: '2h 30min',
                modulos: 5,
                status: 'disponivel'
            }
        ];
        localStorage.setItem('helpdesk_treinamentos', JSON.stringify(treinamentos));

        console.log('✅ Dados iniciais carregados no LocalStorage');
    }

    static get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static add(key, item) {
        const data = this.get(key) || [];
        data.push(item);
        this.set(key, data);
        return item;
    }

    static update(key, id, updates) {
        const data = this.get(key) || [];
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.set(key, data);
            return data[index];
        }
        return null;
    }

    static delete(key, id) {
        const data = this.get(key) || [];
        const filtered = data.filter(item => item.id !== id);
        this.set(key, filtered);
    }
}

// ===========================
// AUTENTICAÇÃO
// ===========================

class AuthManager {
    static login(email, senha, tipo = 'cliente') {
        if (tipo === 'cliente') {
            // Aceita qualquer email/senha para cliente (demo)
            if (email && senha) {
                const user = { email, tipo: 'cliente', nome: 'Cliente' };
                localStorage.setItem('bpi_user', JSON.stringify(user));
                return user;
            }
        } else if (tipo === 'colaborador') {
            const colaboradores = StorageManager.get('helpdesk_colaboradores') || [];
            const user = colaboradores.find(c => c.email === email && c.senha === senha);
            if (user) {
                localStorage.setItem('bpi_user', JSON.stringify(user));
                return user;
            }
        }
        return null;
    }

    static logout() {
        localStorage.removeItem('bpi_user');
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('bpi_user') || 'null');
    }

    static isAuthenticated() {
        return this.getUser() !== null;
    }

    static checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/portal/login.html';
        }
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#27AE60' : '#E74C3C'};
        color: white;
        border-radius: 4px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// ===========================
// INICIALIZAÇÃO
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
    console.log('🚀 BPI Governança iniciada');
});

// Export para uso em outros arquivos
window.StorageManager = StorageManager;
window.AuthManager = AuthManager;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.generateId = generateId;
window.showNotification = showNotification;
window.showModal = showModal;
window.closeModal = closeModal;