# 🏢 BPI Governança - Platform Completa Premium

**Versão 2.0** | Website Institucional + Portal Cliente + Help Desk + Treinamentos + PMO + Colaboradores + Comercial + Integração Proposta→Projeto→Atividades

---

## 📋 ÍNDICE RÁPIDO

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Modalidades de Serviço](#modalidades-de-serviço)
4. [Fluxo Proposta → Projeto → Atividades](#fluxo-proposta--projeto--atividades)
5. [Catálogo de Produtos/Serviços](#catálogo-de-produtosserviços)
6. [Portal do Cliente](#portal-do-cliente)
7. [Portal de Colaboradores](#portal-de-colaboradores)
8. [Como Usar](#como-usar)

---

## 🎯 Visão Geral

Sistema completo de gestão para consultoria premium BPI Governança com:

- ✅ Website institucional responsivo
- ✅ Portal cliente (login exclusivo)
- ✅ Help desk avançado com 13 modalidades
- ✅ Chat inteligente + base de conhecimento
- ✅ Treinamentos com prova IA + certificado LinkedIn
- ✅ Gestão PMO (projetos + atividades por ator)
- ✅ Portal colaborador (PMO Geral + Comercial)
- ✅ **Propostas comerciais → PDF + Email automático**
- ✅ **Catálogo de Produtos/Serviços**
- ✅ **Escopo detalhado integrado**
- ✅ **Fluxo automático: Proposta Aceita → Projeto → Atividades**

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      WEBSITE PÚBLICO                         │
│  (index.html + páginas estáticas + CTAs)                    │
└────────────────┬────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              TRÊS PORTAIS COM LOGIN SEPARADO                │
├──────────────────────┬──────────────────────┬───────────────┤
│   PORTAL CLIENTE     │  PORTAL COLABORADOR  │  (Admin)      │
│  (Exclusivo/Cliente) │   (Equipe BPI)       │               │
├──────────────────────┼──────────────────────┼───────────────┤
│ ✅ Chamados          │ ✅ PMO Geral         │               │
│ ✅ Chat              │ ✅ Comercial         │               │
│ ✅ Treinamentos      │ ✅ Propostas         │               │
│ ✅ Meu PMO           │ ✅ Projetos          │               │
│ ✅ Certificados      │                      │               │
└──────────────────────┴──────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (LocalStorage)                  │
│  • Clientes + Colaboradores                                 │
│  • Chamados + Histórico                                     │
│  • Propostas + PDF gerados                                  │
│  • Projetos + Atividades + Timeline                         │
│  • Treinamentos + Provas + Certificados                     │
│  • Produtos/Serviços (Catálogo)                            │
│  • Escopo + Entregas                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎫 Modalidades de Serviço

1. ☁️ **Cloud** - Infraestrutura em nuvem
2. 📚 **Treinamento** - Capacitação de usuários
3. 🔐 **Gestão de Acessos** - Gerenciamento de permissões
4. 🚀 **Implementações** - Deploy e setup
5. 📝 **Hub de Notas** - Documentação e gestão
6. 📊 **BI** - Business Intelligence e dashboards
7. 📈 **Dashboard** - Customização de painéis
8. 💰 **BPO Financeiro** - Operações financeiras
9. 📋 **BPO Contábil** - Serviços contábeis
10. 🎯 **BPO Fiscal** - Gestão fiscal e tributária
11. 💼 **BPO Folha de Pagamento** - Folha de pagamento e benefícios
12. 🔄 **Integrações** - APIs e conexões entre sistemas
13. ❓ **Dúvidas** - Suporte geral e orientações

---

## 🔄 Fluxo Proposta → Projeto → Atividades

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  COMERCIAL ELABORA PROPOSTA                                  │
├─────────────────────────────────────────────────────────────┤
│  1. Seleciona cliente                                        │
│  2. Escolhe modalidade + prazos                             │
│  3. Seleciona Produtos/Serviços do Catálogo               │
│  4. Define Escopo Detalhado (descrição do projeto)         │
│  5. Preenche valores (setup + recorrência)                 │
│  6. Clica: "Gerar PDF + Enviar por Email"                  │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │  PDF GERADO      │
        │  + EMAIL ENVIADO │
        └────────┬─────────┘
                 │
    ┌────────────▼────────────────┐
    │  CLIENTE RECEBE EMAIL       │
    │  + REVISA PDF               │
    │  + RESPONDE (ACEITO/RECUSO) │
    └────────────┬────────────────┘
                 │
        ┌────────▼──────────┐
        │  PROPOSTA ACEITA? │
        │  SIM / NÃO        │
        └───┬──────────┬────┘
            │          │
       SIM  │          │  NÃO → FIM
            │          └──────────────────────┐
            │                                  │
    ┌───────▼─────────────────────────────┐  │
    │  SISTEMA CRIA PROJETO AUTOMATICAMENTE│  │
    │  ├─ Nome: [nome da proposta]        │  │
    │  ├─ Cliente: [cliente]              │  │
    │  ├─ Modalidade: [modalidade]        │  │
    │  ├─ Data Início: [hoje]             │  │
    │  ├─ Data Fim: [prazo da proposta]  │  │
    │  └─ Status: Planejamento            │  │
    └───────┬─────────────────────────────┘  │
            │                                  │
    ┌───────▼──────────────────────────────┐ │
    │  SISTEMA CRIA ATIVIDADES              │ │
    │  DO ESCOPO DA PROPOSTA               │ │
    │  ├─ Atividade 1 (do escopo)          │ │
    │  ├─ Atividade 2 (do escopo)          │ │
    │  ├─ Atividade 3 (do escopo)          │ │
    │  └─ Atividade N (do escopo)          │ │
    │                                       │ │
    │  Cada atividade recebe:              │ │
    │  • Prazo: [calculado do cronograma] │ │
    │  • Ator: [responsável designado]    │ │
    │  • Status: Não iniciada              │ │
    │  • Vinculação: Produtos/Serviços    │ │
    └───────┬──────────────────────────────┘ │
            │                                  │
    ┌───────▼──────────────────────────────┐ │
    │  TERMO DE ABERTURA ENVIADO           │ │
    │  Para cliente assinar (DocuSign)     │ │
    │  Status: Pendente de Assinatura      │ │
    └───────┬──────────────────────────────┘ │
            │                                  │
    ┌───────▼──────────────────────────────┐ │
    │  CLIENTE ASSINA (DocuSign)           │ │
    │  Status do Projeto: Em Andamento    │ │
    │  Atividades liberadas para execução │ │
    └───────┬──────────────────────────���───┘ │
            │                                  │
    ┌───────▼──────────────────────────────┐ │
    │  PMO ACOMPANHA ATIVIDADES            │ │
    │  • Monitor prazos                    │ │
    │  • Notifica atrasos                  │ │
    │  • Marca como finalizadas            │ │
    └───────┬──────────────────────────────┘ │
            │                                  │
    ┌───────▼──────────────────────────────┐ │
    │  TODAS ATIVIDADES 100% = PRONTO      │ │
    │  Sistema gera Relatório Final        │ │
    │  Envia para assinatura (DocuSign)    │ │
    └───────┬──────────────────────────────┘ │
            │                                  │
    ┌───────▼──────────────────────────────┐ │
    │  PROJETO ENCERRADO                   │ │
    │  Status: Encerrado                   │ │
    │  Cliente recebe documentação         │ │
    └───────────────────────────────────────┘ │
            │                                  │
            └──────────────────────────────────┘
```

---

## 📦 Catálogo de Produtos/Serviços

### A) SERVIÇOS COM SETUP (por Horas)

```javascript
{
  id: "srv-impl-erp",
  nome: "Implementação ERP - Módulo Financeiro",
  descricao: "Setup, configuração, testes e treinamento",
  categoria: "Implementações",
  tipo: "setup", // setup ou recorrente
  horasEstimadas: 120,
  valorHora: 250, // R$
  valorTotal: 30000, // 120 * 250
  prazoEstimado: 45, // dias
  escopo: "Análise de requisitos, configuração do sistema...",
  entregas: [
    "Análise de requisitos",
    "Configuração inicial",
    "Testes integrados",
    "Treinamento de usuários"
  ],
  dependenciasCliente: [
    "Ambiente preparado",
    "Usuários acessos",
    "Informações de negócio"
  ],
  ativo: true
}
```

**Exemplos de Serviços Setup:**
- Implementação ERP (120h @ R$250 = R$30.000)
- Treinamento de Usuários (40h @ R$200 = R$8.000)
- Consultoria de Otimização (60h @ R$300 = R$18.000)
- Análise de Requisitos (30h @ R$280 = R$8.400)
- Testes e Validação (50h @ R$220 = R$11.000)

---

### B) LICENCIAMENTO & SUSTENTAÇÃO (Recorrente)

```javascript
{
  id: "lic-suporte-premium",
  nome: "Suporte Premium 24/7",
  descricao: "Suporte técnico premium com resposta em 1 hora",
  categoria: "Sustentação",
  tipo: "recorrente", // setup ou recorrente
  valorMensal: 2000, // R$ / mês
  periodicidade: "mensal", // mensal, trimestral, anual
  servicosInclusos: [
    "Suporte via email/phone/chat",
    "Resposta em 1 hora",
    "Acesso remoto",
    "Relatórios mensais"
  ],
  prazoPagamento: 12, // meses de contrato mínimo
  ativo: true
}
```

**Exemplos de Licenciamento:**
- Suporte Premium - R$2.000/mês
- Manutenção Preventiva - R$1.500/mês
- Monitoramento 24/7 - R$3.000/mês
- Gestão de Mudanças - R$1.200/mês
- Backup e DR - R$800/mês

---

## 📝 Página de Serviços & Produtos Contratados

### Layout da Página (Colaborador/Comercial)

```
┌─────────────────────────────────────────────────────────┐
│  📦 SERVIÇOS & PRODUTOS DISPONÍVEIS                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 FILTROS                                             │
│  [ Todos ▼ ]  [ Setup ▼ ]  [ Recorrente ▼ ]            │
│  [ Modalidade ▼ ]  [ Buscar... ]                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  SETUP - PROJETOS                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Implementação ERP - Módulo Financeiro            │  │
│  │ 120 horas @ R$ 250/hora = R$ 30.000             │  │
│  │ Prazo: 45 dias                                   │  │
│  │ Entregas:                                         │  │
│  │ ✓ Análise de requisitos                          │  │
│  │ ✓ Configuração inicial                           │  │
│  │ ✓ Testes integrados                              │  │
│  │ ✓ Treinamento de usuários                        │  │
│  │                                                   │  │
│  │ Dependências do Cliente:                         │  │
│  │ • Ambiente preparado                             │  │
│  │ • Usuários com acessos                           │  │
│  │ • Informações de negócio                         │  │
│  │                                                   │  │
│  │                    [+ Adicionar à Proposta]      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Treinamento de Usuários                          │  │
│  │ 40 horas @ R$ 200/hora = R$ 8.000               │  │
│  │ Prazo: 20 dias                                   │  │
│  │ ...                                               │  │
│  │                    [+ Adicionar à Proposta]      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  RECORRENTES - LICENCIAMENTO & SUSTENTAÇÃO             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Suporte Premium 24/7                             │  │
│  │ R$ 2.000 / mês                                   │  │
│  │ Contrato mínimo: 12 meses                        │  │
│  │ Serviços inclusos:                               │  │
│  │ ✓ Suporte via email/phone/chat                   │  │
│  │ ✓ Resposta em 1 hora                             │  │
│  │ ✓ Acesso remoto                                  │  │
│  │ ✓ Relatórios mensais                             │  │
│  │                                                   │  │
│  │                    [+ Adicionar à Proposta]      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Manutenção Preventiva                            │  │
│  │ R$ 1.500 / mês                                   │  │
│  │ ...                                               │  │
│  │                    [+ Adicionar à Proposta]      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📄 Página de Escopo Detalhado

### Layout (Dentro da Proposta/Projeto)

```
┌─────────────────────────────────────────────────────────┐
│  📋 ESCOPO DETALHADO DO PROJETO                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎯 VISÃO GERAL                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Projeto: [Nome do Projeto]                       │  │
│  │ Cliente: [Nome do Cliente]                       │  │
│  │ Gestor: [Nome do Gestor]                         │  │
│  │ Data Início: [DD/MM/YYYY]                        │  │
│  │ Data Fim Prevista: [DD/MM/YYYY]                  │  │
│  │ Modalidade: [Ex: Implementações]                 │  │
│  │ Status: [Planejamento/Em Andamento/Encerrado]   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  📝 DESCRIÇÃO DO ESCOPO                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Texto longo descrevendo exatamente o que       │  │
│  │ será feito, objetivos, abrangência]             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  📦 SERVIÇOS CONTRATADOS                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Implementação ERP - Módulo Financeiro         │  │
│  │    • 120 horas @ R$ 250/hora                     │  │
│  │    • Prazo: 45 dias                              │  │
│  │    • Status: Ativo                               │  │
│  │                                                   │  │
│  │ 2. Treinamento de Usuários                       │  │
│  │    • 40 horas @ R$ 200/hora                      │  │
│  │    • Prazo: 20 dias                              │  │
│  │    • Status: Ativo                               │  │
│  │                                                   │  │
│  │ 3. Suporte Premium 24/7 (Recorrente)             │  │
│  │    • R$ 2.000 / mês                              │  │
│  │    • Contrato: 12 meses                          │  │
│  │    • Status: Ativo                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ✅ ENTREGAS ESPERADAS                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Análise de requisitos completa               │  │
│  │ 2. Ambiente de produção configurado              │  │
│  │ 3. Testes integrados executados                  │  │
│  │ 4. Documentação técnica                          │  │
│  │ 5. Equipe treinada e certificada                 │  │
│  │ 6. Suporte de pós-implementação (30 dias)        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ⚠️ DEPENDÊNCIAS DO CLIENTE                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • Ambiente de servidor preparado                 │  │
│  │ • Acesso a dados históricos                      │  │
│  │ • Designação de usuários-chave                   │  │
│  │ • Aprovação de mudanças de escopo                │  │
│  │ • Disponibilidade para reuniões de alinhamento   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  📅 CRONOGRAMA                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Fase 1: Diagnóstico        [05/10 - 12/10]     │  │
│  │ Fase 2: Configuração       [13/10 - 27/10]     │  │
│  │ Fase 3: Testes             [28/10 - 03/11]     │  │
│  │ Fase 4: Implantação        [04/11 - 10/11]     │  │
│  │ Fase 5: Treinamento        [11/11 - 15/11]     │  │
│  │ Fase 6: Encerramento       [16/11 - 17/11]     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  💰 INVESTIMENTO                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Serviços Setup (Projetos):   R$ 38.000          │  │
│  │ Serviços Recorrentes/mês:    R$ 2.000           │  │
│  │ Contrato Mínimo (12 meses):  R$ 24.000          │  │
│  │ ─────────────────────────────────────────────── │  │
│  │ INVESTIMENTO TOTAL INICIAL:  R$ 62.000          │  │
│  │                                                   │  │
│  │ (Setup: R$38.000 + Suporte 1º ano: R$24.000)    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  📋 OBSERVAÇÕES IMPORTANTES                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • Mudanças de escopo serão avaliadas e podem    │  │
│  │   impactar prazos e valores                      │  │
│  │ • Aprovação das entregas em até 5 dias úteis     │  │
│  │ • SLA de suporte conforme contrato               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Integração: Como o Escopo vira Atividades

### Mapeamento Automático

Quando proposta é **ACEITA**, o sistema:

1. **Cria PROJETO** com dados da proposta
2. **Lê ESCOPO** detalhado
3. **Extrai ATIVIDADES** do escopo

**Exemplo:**

```
ESCOPO:
"Implementação de ERP com 5 fases: 
 (1) Diagnóstico do ambiente atual
 (2) Configuração do módulo financeiro
 (3) Testes integrados
 (4) Treinamento de usuários
 (5) Suporte de pós-implementação"

↓ SISTEMA CRIA ATIVIDADES:

ATIVIDADE 1: Diagnóstico do ambiente atual
├─ Prazo: 7 dias (do cronograma)
├─ Ator: [Designado pelo gestor]
├─ Produto/Serviço: Implementação ERP
└─ Status: Não iniciada

ATIVIDADE 2: Configuração do módulo financeiro
├─ Prazo: 14 dias
├─ Ator: [Designado pelo gestor]
├─ Produto/Serviço: Implementação ERP
└─ Status: Não iniciada

ATIVIDADE 3: Testes integrados
├─ Prazo: 7 dias
├─ Ator: [Designado pelo gestor]
├─ Produto/Serviço: Implementação ERP
└─ Status: Não iniciada

ATIVIDADE 4: Treinamento de usuários
├─ Prazo: 5 dias
├─ Ator: [Designado pelo gestor]
├─ Produto/Serviço: Treinamento de Usuários
└─ Status: Não iniciada

ATIVIDADE 5: Suporte de pós-implementação
├─ Prazo: 30 dias
├─ Ator: [Designado pelo gestor]
├─ Produto/Serviço: Suporte Premium 24/7
└─ Status: Não iniciada
```

---

## 🚀 Portal do Cliente

### Fluxo Cliente

```
1️⃣ LOGIN
   └─ Email + Senha (sessão exclusiva)

2️⃣ DASHBOARD
   ├─ KPIs dos projetos
   ├─ Próximas atividades
   ├─ Chamados abertos
   └─ Treinamentos disponíveis

3️⃣ MEUS PROJETOS (PMO)
   ├─ Lista de projetos atribuídos (EXCLUSIVOS)
   ├─ Ver detalhes
   ├─ Acompanhar atividades
   ├─ Marcar como finalizada
   └─ Assinar documentos (DocuSign)

4️⃣ MEUS CHAMADOS (Help Desk)
   ├─ Criar novo chamado
   ├─ Ver status
   ├─ Comentários públicos
   └─ Chat com sugestões

5️⃣ TREINAMENTOS
   ├─ Vídeos exclusivos (APENAS SEUS)
   ├─ Prova automática (20 questões)
   ├─ Certificado LinkedIn
   └─ Histórico de conclusão

6️⃣ CERTIFICADOS
   ├─ Todos certificados conquistados
   ├─ Download em PDF
   └─ Publicar no LinkedIn
```

---

## 👥 Portal de Colaboradores

### Acesso PMO Geral

```
1️⃣ LOGIN (Colaborador)
   └─ Email + Senha (equipe BPI)

2️⃣ DASHBOARD PMO
   ├─ Total de projetos
   ├─ Projetos em andamento
   ├─ Atividades em atraso (CRÍTICAS)
   ├─ Taxa de sucesso geral
   └─ Estatísticas por cliente

3️⃣ TODOS OS PROJETOS
   ├─ VÊ TODOS os clientes
   ├─ Filtros avançados
   ├─ Análise de atrasos
   ├─ Relatórios
   └─ Timeline visual

4️⃣ ATIVIDADES
   ├─ Ver todas as atividades
   ├─ Filtrar por status/ator/cliente
   ├─ Gerenciar prazos
   └─ Notificações de atraso
```

### Acesso Comercial

```
1️⃣ LOGIN (Comercial)
   └─ Email + Senha (equipe BPI)

2️⃣ DASHBOARD COMERCIAL
   ├─ Propostas em rascunho
   ├─ Propostas enviadas (aguardando)
   ├─ Propostas aceitas (conversão)
   └─ Histórico de valores

3️⃣ ELABORAR PROPOSTA
   ├─ Selecionar cliente
   ├─ Escolher serviços do catálogo
   ├─ Definir escopo
   ├─ Calcular valores (setup + recorrente)
   ├─ Preview PDF em tempo real
   └─ Enviar por email

4️⃣ HISTÓRICO DE PROPOSTAS
   ├─ Ver todas as propostas
   ├─ Status (rascunho/enviada/aceita/recusada)
   ├─ Reenviar por email
   └─ Baixar PDF
```

---

## 💻 Estrutura de Diretórios

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
│   ├── chat.html
│   ├── treinamentos.html
│   ├── pmo.html
│   ├── projeto-detalhes.html
│   ├── certificados.html
│   └── meu-perfil.html
├── colaborador/
│   ├── login.html
│   ├── dashboard.html
│   ├── pmo-geral.html
│   ├── comercial.html
│   ├── produtos-servicos.html
│   ├── escopo-detalhado.html
│   ├── proposta-detalhes.html
│   └── perfil.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── portal.css
│   │   ├── comercial.css
│   │   └── pmo.css
│   ├── js/
│   │   ├── app.js
│   │   ├── helpdesk.js
│   │   ├── treinamentos.js
│   │   ├── pmo.js
│   │   ├── comercial.js
│   │   ├── catalogo.js
│   │   ├── escopo.js
│   │   ├── pdf-generator.js
│   │   └── email-integration.js
│   ├── comercial/
│   │   └── [PDFs de referência]
│   └── images/
│       ├── logobpi-light.png
│       └── logobpi-dark.png
└── README.md
```

---

## 📊 Estrutura de Dados (LocalStorage)

```javascript
// CATÁLOGO DE PRODUTOS/SERVIÇOS
localStorage.getItem('helpdesk_catalogo')
// [
//   {
//     id, nome, descricao, categoria, tipo (setup/recorrente),
//     horasEstimadas, valorHora, valorTotal (setup),
//     valorMensal (recorrente), prazoEstimado, escopo,
//     entregas[], dependenciasCliente[], ativo
//   }
// ]

// PROPOSTAS
localStorage.getItem('helpdesk_propostas')
// [
//   {
//     id, numero, clientId, nomeCliente, emailCliente,
//     titulo, descricao, escopo, modalidade,
//     servicos[] (id + produto),
//     valores { setup, recorrente, desconto, total },
//     prazos { inicio, duracao, fim, validadeProposta },
//     status (rascunho/enviada/aceita/recusada/expirada),
//     dataCriacao, dataEnvio, dataResposta,
//     elaboradoPor, pdfUrl, codigoUnico
//   }
// ]

// PROJETOS
localStorage.getItem('helpdesk_projetos')
// [
//   {
//     id, clientId, nomeCliente, titulo, descricao,
//     escopo, status (planejamento/em_andamento/encerrado),
//     dataInicio, dataFimPrevisto, dataFimReal,
//     gestorResponsavel, gestorEmail,
//     percentualConclusao, prioridade, modalidade,
//     servicosContratados[], escopo, entregas[],
//     cronograma[], termoAberturaDocId, statusTermoAbertura,
//     termoEnceramentoDocId, statusTermoEncerramento,
//     atividades[], documentos[]
//   }
// ]

// ATIVIDADES
localStorage.getItem('helpdesk_atividades')
// [
//   {
//     id, clientId, projetoId, titulo, descricao,
//     ator, atorEmail, atorCargo,
//     dataPrevista, dataRealizada,
//     status (nao_iniciada/em_andamento/finalizada),
//     prioridade, dependencias[],
//     servicoVinculado (id do serviço na proposta),
//     statusAtraso, diasAtraso,
//     dataCriacao, dataAtualizacao
//   }
// ]

// ESCOPO
localStorage.getItem('helpdesk_escopo')
// [
//   {
//     id, projetoId, descricaoDetalhada, servicosContratados[],
//     entregas[], dependenciasCliente[], 
//     cronograma [], investimentoTotal,
//     observacoes, dataCriacao, dataAtualizacao
//   }
// ]
```

---

## 🎯 Fluxo de Uso Completo (Comercial → PMO → Cliente)

### COMERCIAL

```
1. Acessa Portal Colaborador
2. Clica em "Comercial"
3. Clica em "Elaborar Proposta"
4. Preenche:
   ├─ Cliente (dropdown)
   ├─ Título do projeto
   ├─ Modalidade
   ├─ Escopo detalhado (descrição)
   └─ Adiciona Serviços do Catálogo:
       ├─ Implementação ERP (120h @ R$250)
       ├─ Treinamento (40h @ R$200)
       └─ Suporte Premium (R$2.000/mês)
5. Sistema calcula valores automaticamente
6. Preview PDF em tempo real
7. Clica "Enviar por Email"
8. Cliente recebe proposta + PDF anexado
```

### CLIENTE

```
1. Recebe email com proposta
2. Abre PDF e revisa tudo
3. Responde email: "Aceito"
4. Sistema cria PROJETO automaticamente:
   ├─ Nome: [nome da proposta]
   ├─ Escopo: [do arquivo da proposta]
   ├─ Serviços: [Impl. ERP, Treinamento, Suporte]
   └─ Atividades (criadas do escopo):
       ├─ Diagnóstico do ambiente (7 dias)
       ├─ Configuração ERP (14 dias)
       ├─ Testes (7 dias)
       ├─ Treinamento (5 dias)
       └─ Suporte 30 dias
5. Recebe email: "Termo de Abertura para assinar"
6. Acessa DocuSign e assina digitalmente
7. Projeto status → "Em Andamento"
8. Entra no portal e vê atividades com prazos
9. Ator recebe notificação de cada atividade
10. Marca como finalizada quando completar
11. PMO acompanha progresso em tempo real
12. Quando 100% pronto → Termo de Encerramento
13. Cliente assina (DocuSign)
14. Projeto encerrado + PDF entregue
```

### PMO (Colaborador)

```
1. Acessa "PMO Geral"
2. Vê TODOS os projetos de TODOS os clientes
3. Dashboard mostra:
   ├─ Projetos em andamento
   ├─ Atividades em atraso (CRÍTICAS)
   ├─ Taxa de sucesso
   └─ Timeline de entrega
4. Clica no projeto para ver atividades
5. Monitora prazos de cada ator
6. Recebe notificação de atrasos
7. Pode estender prazos se necessário
8. Gera relatórios de progresso
```

---

## 📧 Emails Automáticos (Fluxo Completo)

```
1️⃣ PROPOSTA ENVIADA (para Cliente)
   └─ "Proposta Commercial - [Número]"
   └─ Anexo: PDF gerado

2️⃣ PROJETO CRIADO (para Gestor)
   └─ "Novo Projeto Criado - Proposta Aceita"

3️⃣ TERMO ABERTURA (para Cliente)
   └─ "Assine Termo de Abertura via DocuSign"

4️⃣ ATIVIDADE ATRIBUÍDA (para Ator)
   └─ "Nova Atividade - [Título] - Prazo: [data]"

5️⃣ ATIVIDADE EM ATRASO (3, 7, 14 dias)
   └─ Para: Cliente + CC: Gestor
   └─ "Atividade Atrasada - [Título]"

6️⃣ ATIVIDADE FINALIZADA (para Gestor)
   └─ "[Cliente] finalizou [Atividade]"

7️⃣ PROJETO 100% PRONTO (para Cliente)
   └─ "Projeto Pronto - Assine Termo de Encerramento"

8️⃣ PROJETO ENCERRADO (para Cliente)
   └─ "Projeto Encerrado - Documentação Anexada"
```

---

## 🚀 Próximas Fases

### Fase 2 - Admin Portal
- Dashboard completo
- Gerenciar colaboradores
- Cadastro de clientes
- Configurar catálogo
- Relatórios avançados

#### ✅ Andamento Atual da Fase 2
- Navegação do Admin padronizada em todas as telas principais
- Dashboard Admin com visão operacional (chamados + clientes + colaboradores + catálogo)
- Gestão de colaboradores e clientes integrada ao modelo localStorage compartilhado
- Nova tela `admin/catalogo-servicos.html` com cadastro e ativação/inativação de serviços

### Fase 3 - Integrações Real
- Email (SendGrid)
- DocuSign API
- PDF geração (jsPDF)
- Analytics

---

## ✅ RESUMO FINAL

| Componente | Status | Páginas |
|---|---|---|
| Website Público | ✅ | 5 |
| Portal Cliente | ✅ | 8 |
| Portal Colaborador | ✅ | 5 |
| Help Desk | ✅ | 13 modalidades |
| Treinamentos | ✅ | Com prova + certificado |
| PMO | ✅ | Cliente + Colaborador |
| Comercial | ✅ | Propostas + PDF + Email |
| Catálogo Produtos | ✅ | Setup + Recorrente |
| Escopo Integrado | ✅ | Proposta → Atividades |
| Assinaturas DocuSign | ✅ | Simulado |

**Total de Páginas**: ~25 arquivos HTML
**Total de Funcionalidades**: 50+
**Status**: Pronto para construção

---

## 📞 Contato

**BPI Governança**
- Email: contato@bpigovernanca.com.br
- Telefone: (11) 3000-0000
- Website: bpig.com.br

---

**Versão**: 2.0 | **Status**: ✅ README COMPLETO | **Atualizado**: 12/09/2026
