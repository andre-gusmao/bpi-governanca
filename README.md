# 🏢 BPI Governança - Website Premium + Help Desk Avançado

Sistema completo de website corporativo premium com área restrita para clientes, portal com Help Desk avançado, gerenciamento de chamados por modalidade de serviço, base de conhecimento com chat inteligente e sistema de controle de SLA.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Instalação e Setup](#instalação-e-setup)
5. [Funcionalidades Implementadas](#funcionalidades-implementadas)
6. [Modalidades de Serviço](#modalidades-de-serviço)
7. [Sistema de Help Desk](#sistema-de-help-desk)
8. [Como Usar](#como-usar)

---

## 🎯 Visão Geral

A **BPI Governança** é uma consultoria premium especializada em Governança Corporativa, Compliance, ERP Advisory, Integração Empresarial e Transformação Digital.

Este projeto implementa:
- ✅ Website Institucional (HTML5 + CSS3 + JS puro)
- ✅ Portal do Cliente com Dashboard
- ✅ Sistema de Help Desk Avançado
- ✅ Chat com Base de Conhecimento
- ✅ Controle de SLA (Acordo de Nível de Serviço)
- ✅ Histórico Privado/Público
- ✅ Notificação por Email (Simulada)
- ✅ 11 Modalidades de Serviço
- ✅ 16 Status de Chamado

---

## 💻 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica e acessibilidade
- **CSS3** - Design responsivo, animações suaves
- **JavaScript Puro** - Sem dependências, sem frameworks pesados
- **LocalStorage** - Banco de dados simulado no navegador
- **Responsive Design** - Mobile-first approach

---

## 📁 Estrutura de Diretórios

```
bpi-governanca/
├── index.html
├── pages/
│   ├── solucoes.html
│   ├── experiencia.html
│   └── contato.html
├── portal/
│   ├── login.html
│   ├── dashboard.html
│   ├── chamados.html
│   └── chat.html
├── assets/
│   ├── css/style.css (2.500+ linhas)
│   ├── js/
│   │   ├── app.js (400+ linhas)
│   │   └── helpdesk.js (800+ linhas)
│   └── images/logobpi.png
└── README.md
```

---

## 🚀 Instalação e Setup

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Editor de código (VS Code recomendado)

### Passo 1: Clonar Repositório

```bash
git clone https://github.com/andre-gusmao/bpi-governanca.git
cd bpi-governanca
```

### Passo 2: Executar Localmente

**Opção 1 - Live Server (VS Code):**
1. Instale extensão "Live Server"
2. Clique direito em index.html
3. Selecione "Open with Live Server"

**Opção 2 - Python:**
```bash
python -m http.server 8000
```

Acesse: `http://localhost:8000`

### Passo 3: Customizar

1. Substitua `assets/images/logobpi.png` com seu logo
2. Edite informações em `index.html` e `pages/contato.html`
3. Configure emails em `pages/contato.html`

---

## ✨ Funcionalidades Implementadas

### Website Institucional
✅ Navbar responsiva
✅ Hero section com CTA
✅ Seção Quem Somos
✅ Diferenciais (6 cards)
✅ Portfólio (6 serviços)
✅ Cases de sucesso (6 projetos)
✅ Grid de clientes
✅ Footer com links
✅ 100% responsivo

### Portal do Cliente
✅ Login com sessão
✅ Dashboard com KPIs
✅ Lista de chamados com filtros
✅ Abrir novo chamado (modal)
✅ Chat inteligente
✅ Base de conhecimento
✅ Sidebar de navegação
✅ Logout seguro

### Help Desk System
✅ 11 Modalidades de serviço
✅ 16 Status de chamado
✅ Sistema de prioridades (Crítica, Alta, Média, Baixa)
✅ Controle de SLA customizável
✅ Histórico privado/público
✅ Comentários visíveis/invisíveis
✅ Sistema de propostas
✅ Notificações por email
✅ Base de conhecimento dinâmica
✅ Chat com sugestões inteligentes

---

## 🎫 Modalidades de Serviço

1. **☁️ Cloud** - Infraestrutura em nuvem
2. **📚 Treinamento** - Capacitação de usuários
3. **🔐 Acesso** - Gerenciamento de permissões
4. **🚀 Implementações** - Deploy e setup
5. **📝 Hub de Notas** - Documentação e gestão
6. **📊 BI** - Business Intelligence e dashboards
7. **📈 Dashboard** - Customização de painéis
8. **💰 BPO Financeiro** - Operações financeiras
9. **📋 BPO Contábil** - Serviços contábeis
10. **🔄 Integrações** - APIs e conexões entre sistemas
11. **❓ Dúvidas** - Suporte geral e orientações

---

## 🛠️ Sistema de Help Desk

### Componentes Principais

**HelpDeskConfig** - Configuração central
- Modalidades com SLA
- Status e transições
- Prioridades

**ChamadosDB** - Gerenciador de dados
- CRUD de chamados
- Histórico com visibilidade controlada
- Comentários públicos/privados
- Propostas
- Notificações por email

**BaseConhecimento** - Artigos inteligentes
- Busca por palavra-chave
- Filtro por modalidade
- Tags para categorização

**ChatIA** - Assistente inteligente
- Análise de descrição
- Sugestão de soluções
- Detecção de urgência automática

### Fluxo de Chamado

```
ABERTO → EM_ANALISE → EM_PROGRESSO → [CRITICO/MODERADO] → RESOLVIDO → FECHADO
        ↓
     PROPOSTA_ENVIADA → [ACEITA/REJEITADA]
        ↓
     IMPLEMENTACAO → RESOLVIDO
```

### Controle de Visibilidade

**Privado (Não aparece para cliente):**
- Criação do chamado
- Circulações internas de status
- Comentários marcados como "interno"
- Notas de análise
- Discussões entre atendentes

**Público (Aparece para cliente):**
- Status de progresso
- Comentários públicos
- Propostas
- Histórico de aceitação/rejeição
- Resolução

---

## 💬 Como Usar

### Para Clientes

#### Acessar Portal
```
URL: http://localhost:8000/portal/login.html
Email: qualquer@email.com
Senha: qualquer
```

#### Abrir Chamado
1. Clique em "Meus Chamados"
2. Clique em "+ Novo Chamado"
3. Preencha: Título, Modalidade, Prioridade, Descrição
4. Clique em "Abrir Chamado"
5. Receba email de confirmação

#### Usar Chat + Base de Conhecimento
1. Clique em "Chat & Conhecimento"
2. Digite sua dúvida
3. IA sugere artigos relevantes
4. Clique em artigo para aprender
5. Abra chamado se precisar de atendimento personalizado

#### Acompanhar Chamado
1. Veja status em tempo real
2. Leia comentários públicos
3. Receba email quando mudar status
4. Aceite/rejeite propostas
5. Finalize chamado quando resolvido

---

## 📧 Sistema de Notificações

Emails enviados automaticamente:

1. **Chamado Criado**
   - Para: Cliente
   - Conteúdo: Confirmação + número do chamado

2. **Status Atualizado**
   - Para: Cliente
   - Conteúdo: Novo status + data

3. **Proposta Enviada**
   - Para: Cliente
   - Conteúdo: Valor + Prazo + Link para aceitar

4. **Comentário Adicionado (Público)**
   - Para: Cliente
   - Conteúdo: Texto do comentário da equipe

---

## 🎨 Identidade Visual

### Paleta de Cores
- **Preto Primário**: #0F1117
- **Grafite**: #171C25
- **Dourado/Cobre**: #C9A66B
- **Branco**: #FFFFFF
- **Cinza Claro**: #F5F5F5

### Tipografia
- **Headings**: Poppins
- **Body**: Segoe UI, Tahoma, Geneva, Verdana

### Responsividade
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 📁 LocalStorage Structure

```javascript
// Chamados
localStorage.getItem('helpdesk_chamados')
// [{ id, numeroSequencial, clientId, status, ... }]

// Contador
localStorage.getItem('helpdesk_contador')
// "45"

// Emails
localStorage.getItem('helpdesk_emails')
// [{ para, assunto, corpo, tipo, ... }]

// Sessão
localStorage.getItem('userSession')
// { email, name, clientId, role, ... }
```

---

## 🚀 Próximas Fases (Planejadas)

### Fase 2 - Painel Administrativo
- Dashboard de admin
- Gerenciar todos os chamados
- Configurar SLA e prioridades
- Cadastro de clientes
- Relatórios avançados

### Fase 3 - Portal do Atendente
- Dashboard de atendente
- Interface de atendimento
- Chat em tempo real

### Fase 4 - Integrações
- Email real (SendGrid)
- WhatsApp (Twilio)
- Slack
- CRM (Salesforce, HubSpot)
- Analytics

---

## 📞 Contato

**BPI Governança**
- Email: contato@bpigovernanca.com.br
- Telefone: (11) 3000-0000
- Website: https://github.com/andre-gusmao/bpi-governanca

---

## 📄 Licença

Todos os direitos reservados © 2026 BPI Governança

---

**Versão**: 1.0.0 | **Status**: ✅ Completo | **Atualizado**: 11/09/2026