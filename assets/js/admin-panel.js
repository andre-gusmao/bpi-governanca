(function () {
    "use strict";

    const STORAGE_KEYS = {
        session: "admin_session",
        sessionToken: "admin_session_token",
        clientes: "helpdesk_clientes",
        colaboradores: "helpdesk_colaboradores",
        projetos: "helpdesk_projetos",
        catalogo: "helpdesk_catalogo",
        auditoria: "helpdesk_auditoria",
        modalidades: "bpi_modalidades",
        empresa: "bpi_dados_empresa"
    };

    const ROLES = ["PMO_Comercial", "PMO_Geral", "Consultor", "Suporte"];
    const MODALIDADES_PADRAO = [
        "Cloud", "Treinamento", "Gestão de Acessos", "Implementações", "Hub de Notas",
        "BI", "Dashboard", "BPO Financeiro", "BPO Contábil", "BPO Fiscal",
        "BPO Folha de Pagamento", "Integrações", "Dúvidas"
    ];

    const TRUSTED_ACCOUNTS = window.TRUSTED_ACCOUNTS || {
        admin: [{ email: "admin@bpi.com.br", senhaHash: "240be518fabd2724ddb6f04eeb652e4dd04f28bc072dd4d06fbbe2eb5b78372f", adminId: "admin-001", nome: "Admin BPI", role: "Super Admin" }]
    };
    window.TRUSTED_ACCOUNTS = TRUSTED_ACCOUNTS;

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[char]));
    }

    function simpleHash(value) {
        let hash = 0;
        const input = String(value || "");
        for (let i = 0; i < input.length; i += 1) {
            hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
        }
        return String(hash);
    }

    function getJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return parsed ?? fallback;
        } catch (error) {
            return fallback;
        }
    }

    function setJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function formatMoney(value) {
        return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString("pt-BR");
    }

    function nextId(prefix, list, keyName) {
        const max = list.reduce((acc, item) => {
            const value = String(item[keyName] || "").replace(prefix + "-", "");
            const num = Number(value);
            return Number.isFinite(num) ? Math.max(acc, num) : acc;
        }, 0);
        return `${prefix}-${String(max + 1).padStart(3, "0")}`;
    }

    function ensureSeeds() {
        if (!localStorage.getItem(STORAGE_KEYS.clientes)) {
            setJson(STORAGE_KEYS.clientes, [{
                clientId: "cli-001",
                razaoSocial: "Cliente A Tecnologia Ltda.",
                cnpj: "12.345.678/0001-90",
                email: "contato@clientea.com.br",
                telefone: "(11) 3000-0001",
                endereco: "Av. Paulista, 1000 - São Paulo/SP",
                contatos: [],
                status: "ativo",
                modalidade: "Cloud",
                dataCriacao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString()
            }]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.colaboradores)) {
            setJson(STORAGE_KEYS.colaboradores, [{
                colaboradorId: "col-001",
                nome: "André Gusmão",
                email: "andre@bpi.com.br",
                role: "PMO_Comercial",
                status: "ativo",
                dataCriacao: new Date().toISOString()
            }]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.catalogo)) {
            setJson(STORAGE_KEYS.catalogo, [{
                produtoId: "prod-001",
                nome: "Implementação ERP",
                descricao: "Pacote completo de setup",
                tipo: "setup",
                valor: 30000,
                prazo: 45,
                status: "ativo",
                dataCriacao: new Date().toISOString()
            }]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.projetos)) {
            setJson(STORAGE_KEYS.projetos, [{
                id: "proj-001",
                titulo: "Projeto ERP Cliente A",
                nomeCliente: "Cliente A Tecnologia Ltda.",
                clientId: "cli-001",
                gestorEmail: "andre@bpi.com.br",
                status: "em_andamento",
                modalidade: "Cloud",
                dataInicio: new Date().toISOString(),
                dataFimPrevisto: new Date(Date.now() + 45 * 86400000).toISOString(),
                percentualConclusao: 42,
                valorSetup: 30000,
                valorRecorrente: 2500
            }]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.auditoria)) setJson(STORAGE_KEYS.auditoria, []);
        if (!localStorage.getItem(STORAGE_KEYS.modalidades)) setJson(STORAGE_KEYS.modalidades, MODALIDADES_PADRAO.slice());
        if (!localStorage.getItem(STORAGE_KEYS.empresa)) {
            setJson(STORAGE_KEYS.empresa, {
                razaoSocial: "BPI Governança Ltda.",
                cnpj: "00.000.000/0001-00",
                email: "contato@bpigovernanca.com.br",
                telefone: "(11) 3000-0000",
                endereco: "São Paulo/SP",
                website: "https://bpig.com.br"
            });
        }
    }

    function getSession() {
        return getJson(STORAGE_KEYS.session, null);
    }

    function saveSession(admin) {
        const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(STORAGE_KEYS.sessionToken, token);
        setJson(STORAGE_KEYS.session, {
            adminId: admin.adminId,
            email: admin.email,
            nome: admin.nome,
            role: admin.role,
            loginEm: new Date().toISOString(),
            tokenHash: simpleHash(token)
        });
    }

    function requireAuth() {
        const session = getSession();
        const token = sessionStorage.getItem(STORAGE_KEYS.sessionToken);
        const trusted = (TRUSTED_ACCOUNTS.admin || []).find((item) => String(item.email).toLowerCase() === String(session?.email || "").toLowerCase() && item.adminId === session?.adminId);
        if (!session || !token || session.tokenHash !== simpleHash(token) || !trusted) {
            window.location.href = "/admin/login.html";
            return null;
        }
        const userEl = document.querySelector("[data-admin-user]");
        if (userEl) userEl.textContent = `${session.nome} (${session.role})`;
        return session;
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEYS.session);
        sessionStorage.removeItem(STORAGE_KEYS.sessionToken);
        window.location.href = "/admin/login.html";
    }

    function recordAudit({ acao, recurso, recursoId, descricao, detalhes }) {
        const session = getSession();
        const list = getJson(STORAGE_KEYS.auditoria, []);
        const now = new Date().toISOString();
        const id = `audit-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, "0")}`;
        list.push({
            id,
            timestamp: now,
            adminId: session?.adminId || "admin-001",
            adminEmail: session?.email || "admin@bpi.com.br",
            acao,
            recurso,
            recursoId,
            descricao,
            detalhes: detalhes || { antes: null, depois: null }
        });
        setJson(STORAGE_KEYS.auditoria, list);
    }

    function bindTopBar() {
        const logoutButtons = document.querySelectorAll("[data-action='logout']");
        logoutButtons.forEach((btn) => btn.addEventListener("click", logout));
    }

    function asNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function sumProjetoValor(projeto) {
        if (typeof projeto.valorTotal === "number") return projeto.valorTotal;
        return asNumber(projeto.valorSetup) + asNumber(projeto.valorRecorrente);
    }

    function applyMask(input, type) {
        input.addEventListener("input", () => {
            const n = input.value.replace(/\D/g, "");
            if (type === "cnpj") {
                input.value = n.slice(0, 14)
                    .replace(/^(\d{2})(\d)/, "$1.$2")
                    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                    .replace(/\.(\d{3})(\d)/, ".$1/$2")
                    .replace(/(\d{4})(\d)/, "$1-$2");
                return;
            }
            if (type === "telefone") {
                input.value = n.slice(0, 11)
                    .replace(/^(\d{2})(\d)/g, "($1) $2")
                    .replace(/(\d)(\d{4})$/, "$1-$2");
            }
        });
    }

    function mountDonut(container, entries) {
        const colors = ["#5f79ff", "#f59e0b", "#1f9d55", "#d64545", "#8b5cf6", "#0ea5e9"];
        const total = entries.reduce((acc, item) => acc + item.value, 0);
        if (!total) {
            container.innerHTML = "<p class='muted'>Sem dados.</p>";
            return;
        }
        let start = 0;
        const parts = entries.map((item, index) => {
            const pct = (item.value / total) * 100;
            const end = start + pct;
            const chunk = `${colors[index % colors.length]} ${start}% ${end}%`;
            start = end;
            return chunk;
        });
        const donut = document.createElement("div");
        donut.className = "donut";
        donut.style.background = `conic-gradient(${parts.join(",")})`;
        const legend = document.createElement("div");
        legend.className = "legend";
        entries.forEach((entry, index) => {
            const line = document.createElement("div");
            line.className = "legend-item";
            line.innerHTML = `<span class="legend-dot" style="background:${colors[index % colors.length]}"></span>${escapeHtml(entry.label)} (${entry.value})`;
            legend.appendChild(line);
        });
        container.innerHTML = "";
        container.appendChild(donut);
        container.appendChild(legend);
    }

    function mountBarChart(container, entries, formatter) {
        const max = Math.max(...entries.map((item) => item.value), 0);
        container.innerHTML = "";
        if (!max) {
            container.innerHTML = "<p class='muted'>Sem dados.</p>";
            return;
        }
        entries.forEach((entry) => {
            const row = document.createElement("div");
            row.className = "bar-row";
            row.innerHTML = `
                <span>${escapeHtml(entry.label)}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${(entry.value / max) * 100}%"></div></div>
                <strong>${formatter ? formatter(entry.value) : entry.value}</strong>
            `;
            container.appendChild(row);
        });
    }

    function mountLineChart(container, values) {
        const max = Math.max(...values.map((item) => item.value), 0);
        const wrapper = document.createElement("div");
        wrapper.className = "line-chart";
        values.forEach((item) => {
            const point = document.createElement("div");
            point.className = "line-point";
            point.style.height = `${max ? Math.max(6, (item.value / max) * 100) : 6}px`;
            point.title = `${item.label}: ${formatMoney(item.value)}`;
            wrapper.appendChild(point);
        });
        const labels = document.createElement("div");
        labels.className = "inline";
        labels.style.marginTop = "0.6rem";
        labels.innerHTML = values.map((item) => `<small class="muted">${escapeHtml(item.label)}</small>`).join("");
        container.innerHTML = "";
        if (!values.length || !max) {
            container.innerHTML = "<p class='muted'>Sem dados.</p>";
            return;
        }
        container.appendChild(wrapper);
        container.appendChild(labels);
    }

    function getMonthKey(dateLike) {
        const d = new Date(dateLike);
        if (Number.isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    async function digestSha256(value) {
        if (!window.crypto || !window.crypto.subtle) return simpleHash(value);
        const msgBuffer = new TextEncoder().encode(value);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    function initLogin() {
        const form = document.getElementById("admin-login-form");
        if (!form) return;
        if (getSession()) window.location.href = "/admin/dashboard.html";
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const senha = document.getElementById("senha").value;
            const senhaHash = await digestSha256(senha);
            const account = (TRUSTED_ACCOUNTS.admin || []).find((item) => {
                if (String(item.email).toLowerCase() !== email) return false;
                if (item.senhaHash) return item.senhaHash === senhaHash;
                return item.senha === senha;
            });
            const feedback = document.getElementById("login-feedback");
            if (!account) {
                feedback.textContent = "Credenciais inválidas.";
                feedback.className = "muted";
                return;
            }
            saveSession({
                adminId: account.adminId,
                email: account.email,
                nome: account.nome,
                role: account.role
            });
            recordAudit({
                acao: "login_admin",
                recurso: "sessao",
                recursoId: account.adminId,
                descricao: "Login administrativo realizado",
                detalhes: { antes: null, depois: { email: account.email } }
            });
            window.location.href = "/admin/dashboard.html";
        });
    }

    function initDashboard() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const clientes = getJson(STORAGE_KEYS.clientes, []);
        const colaboradores = getJson(STORAGE_KEYS.colaboradores, []);
        const projetos = getJson(STORAGE_KEYS.projetos, []);
        const auditoria = getJson(STORAGE_KEYS.auditoria, []);

        const carteira = projetos.filter((item) => item.status !== "encerrado").reduce((acc, item) => acc + sumProjetoValor(item), 0);
        const receita = projetos.filter((item) => item.status === "encerrado").reduce((acc, item) => acc + sumProjetoValor(item), 0);
        document.getElementById("kpi-clientes").textContent = clientes.length;
        document.getElementById("kpi-colaboradores").textContent = colaboradores.length;
        document.getElementById("kpi-projetos").textContent = projetos.length;
        document.getElementById("kpi-carteira").textContent = formatMoney(carteira);
        document.getElementById("kpi-receita").textContent = formatMoney(receita);

        const porModalidade = clientes.reduce((acc, item) => {
            const key = item.modalidade || "Não informado";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        mountDonut(document.getElementById("chart-clientes-modalidade"), Object.entries(porModalidade).map(([label, value]) => ({ label, value })));

        const porStatus = projetos.reduce((acc, item) => {
            const key = item.status || "não_informado";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        mountBarChart(document.getElementById("chart-projetos-status"), Object.entries(porStatus).map(([label, value]) => ({ label, value })));

        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = getMonthKey(d);
            months.push({ key, label: d.toLocaleDateString("pt-BR", { month: "short" }), value: 0 });
        }
        projetos.forEach((item) => {
            const key = getMonthKey(item.dataFimReal || item.dataFimPrevisto || item.dataInicio);
            const target = months.find((month) => month.key === key);
            if (target) target.value += sumProjetoValor(item);
        });
        mountLineChart(document.getElementById("chart-receita-mensal"), months);

        const valorClientes = {};
        projetos.forEach((item) => {
            const key = item.nomeCliente || item.clientId || "Sem cliente";
            valorClientes[key] = (valorClientes[key] || 0) + sumProjetoValor(item);
        });
        const top10 = Object.entries(valorClientes)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        mountBarChart(document.getElementById("chart-top-clientes"), top10, (value) => formatMoney(value));

        const timeline = document.getElementById("timeline-acoes");
        timeline.innerHTML = "";
        auditoria.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10).forEach((item) => {
            const el = document.createElement("div");
            el.className = "timeline-item";
            el.innerHTML = `<strong>${escapeHtml(item.acao)}</strong> · ${escapeHtml(item.descricao)}<br><small class="muted">${formatDate(item.timestamp)}</small>`;
            timeline.appendChild(el);
        });
        if (!timeline.children.length) timeline.innerHTML = "<p class='muted'>Sem ações registradas.</p>";
    }

    function openModal(id) {
        document.getElementById(id).classList.add("open");
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove("open");
    }

    function initClientes() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const modal = "modal-cliente";
        const historyModal = "modal-historico-cliente";
        const form = document.getElementById("cliente-form");
        const contatosList = document.getElementById("contatos-list");
        const searchStatus = document.getElementById("filtro-status");
        const sortBy = document.getElementById("ordenacao");
        const openBtn = document.getElementById("btn-novo-cliente");
        const closeButtons = document.querySelectorAll("[data-close-modal]");
        const tbody = document.getElementById("clientes-body");
        let editingId = null;

        const addContato = (contato = { nome: "", email: "", telefone: "", cargo: "" }) => {
            const row = document.createElement("div");
            row.className = "inline contato-row";
            row.innerHTML = `
                <input placeholder="Nome" value="${escapeHtml(contato.nome)}" data-field="nome">
                <input placeholder="Email" value="${escapeHtml(contato.email)}" data-field="email">
                <input placeholder="Telefone" value="${escapeHtml(contato.telefone)}" data-field="telefone">
                <input placeholder="Cargo" value="${escapeHtml(contato.cargo)}" data-field="cargo">
                <button type="button" class="btn btn-danger" data-action="rm-contato">Remover</button>
            `;
            row.querySelector("[data-action='rm-contato']").addEventListener("click", () => row.remove());
            contatosList.appendChild(row);
        };

        document.getElementById("add-contato").addEventListener("click", () => addContato());
        openBtn.addEventListener("click", () => {
            editingId = null;
            form.reset();
            contatosList.innerHTML = "";
            addContato();
            openModal(modal);
        });
        closeButtons.forEach((btn) => btn.addEventListener("click", () => closeModal(btn.dataset.closeModal)));
        applyMask(document.getElementById("cliente-cnpj"), "cnpj");
        applyMask(document.getElementById("cliente-telefone"), "telefone");

        function render() {
            const clientes = getJson(STORAGE_KEYS.clientes, []);
            const auditoria = getJson(STORAGE_KEYS.auditoria, []);
            const filtered = clientes.filter((item) => searchStatus.value === "todos" || item.status === searchStatus.value);
            filtered.sort((a, b) => {
                if (sortBy.value === "nome") return String(a.razaoSocial).localeCompare(String(b.razaoSocial));
                if (sortBy.value === "cnpj") return String(a.cnpj).localeCompare(String(b.cnpj));
                return new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0);
            });
            tbody.innerHTML = "";
            filtered.forEach((item) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${escapeHtml(item.clientId)}</td>
                    <td>${escapeHtml(item.razaoSocial)}</td>
                    <td>${escapeHtml(item.cnpj || "-")}</td>
                    <td>${escapeHtml(item.email || "-")}</td>
                    <td>${escapeHtml(item.telefone || "-")}</td>
                    <td><span class="status ${item.status === "ativo" ? "status-ativo" : "status-inativo"}">${escapeHtml(item.status)}</span></td>
                    <td>
                        <button class="btn btn-ghost" data-action="edit">Editar</button>
                        <button class="btn ${item.status === "ativo" ? "btn-danger" : "btn-success"}" data-action="toggle">${item.status === "ativo" ? "Desativar" : "Ativar"}</button>
                        <button class="btn btn-danger" data-action="delete">Deletar</button>
                        <button class="btn btn-ghost" data-action="history">Histórico</button>
                    </td>
                `;
                tr.querySelector("[data-action='edit']").addEventListener("click", () => {
                    editingId = item.clientId;
                    document.getElementById("cliente-razao").value = item.razaoSocial || "";
                    document.getElementById("cliente-cnpj").value = item.cnpj || "";
                    document.getElementById("cliente-email").value = item.email || "";
                    document.getElementById("cliente-telefone").value = item.telefone || "";
                    document.getElementById("cliente-endereco").value = item.endereco || "";
                    contatosList.innerHTML = "";
                    (item.contatos || []).forEach((contato) => addContato(contato));
                    if (!contatosList.children.length) addContato();
                    openModal(modal);
                });
                tr.querySelector("[data-action='toggle']").addEventListener("click", () => {
                    const list = getJson(STORAGE_KEYS.clientes, []);
                    const idx = list.findIndex((c) => c.clientId === item.clientId);
                    if (idx === -1) return;
                    const before = { ...list[idx] };
                    list[idx].status = list[idx].status === "ativo" ? "inativo" : "ativo";
                    list[idx].dataAtualizacao = new Date().toISOString();
                    setJson(STORAGE_KEYS.clientes, list);
                    recordAudit({
                        acao: `${list[idx].status === "ativo" ? "ativar" : "desativar"}_cliente`,
                        recurso: "cliente",
                        recursoId: item.clientId,
                        descricao: `${item.razaoSocial} ${list[idx].status === "ativo" ? "ativado" : "desativado"}`,
                        detalhes: { antes: before, depois: list[idx] }
                    });
                    render();
                });
                tr.querySelector("[data-action='delete']").addEventListener("click", () => {
                    if (!window.confirm("Confirmar exclusão do cliente?")) return;
                    const list = getJson(STORAGE_KEYS.clientes, []);
                    const found = list.find((c) => c.clientId === item.clientId);
                    setJson(STORAGE_KEYS.clientes, list.filter((c) => c.clientId !== item.clientId));
                    recordAudit({
                        acao: "deletar_cliente",
                        recurso: "cliente",
                        recursoId: item.clientId,
                        descricao: `${item.razaoSocial} removido`,
                        detalhes: { antes: found, depois: null }
                    });
                    render();
                });
                tr.querySelector("[data-action='history']").addEventListener("click", () => {
                    const historyBody = document.getElementById("historico-cliente-body");
                    const logs = auditoria.filter((a) => a.recurso === "cliente" && a.recursoId === item.clientId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    historyBody.innerHTML = logs.map((log) => `<li><strong>${escapeHtml(log.acao)}</strong> - ${escapeHtml(log.descricao)}<br><small>${formatDate(log.timestamp)}</small></li>`).join("");
                    if (!logs.length) historyBody.innerHTML = "<li class='muted'>Sem histórico.</li>";
                    openModal(historyModal);
                });
                tbody.appendChild(tr);
            });
            if (!filtered.length) tbody.innerHTML = "<tr><td colspan='7' class='muted'>Nenhum cliente.</td></tr>";
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const list = getJson(STORAGE_KEYS.clientes, []);
            const contatos = Array.from(contatosList.querySelectorAll(".contato-row")).map((row) => ({
                nome: row.querySelector("[data-field='nome']").value.trim(),
                email: row.querySelector("[data-field='email']").value.trim(),
                telefone: row.querySelector("[data-field='telefone']").value.trim(),
                cargo: row.querySelector("[data-field='cargo']").value.trim()
            })).filter((item) => item.nome || item.email || item.telefone || item.cargo);
            const payload = {
                razaoSocial: document.getElementById("cliente-razao").value.trim(),
                cnpj: document.getElementById("cliente-cnpj").value.trim(),
                email: document.getElementById("cliente-email").value.trim(),
                telefone: document.getElementById("cliente-telefone").value.trim(),
                endereco: document.getElementById("cliente-endereco").value.trim(),
                contatos
            };
            if (!editingId) {
                const novo = {
                    clientId: nextId("cli", list, "clientId"),
                    ...payload,
                    modalidade: (getJson(STORAGE_KEYS.modalidades, MODALIDADES_PADRAO)[0] || MODALIDADES_PADRAO[0]),
                    status: "ativo",
                    dataCriacao: new Date().toISOString(),
                    dataAtualizacao: new Date().toISOString()
                };
                list.push(novo);
                setJson(STORAGE_KEYS.clientes, list);
                recordAudit({
                    acao: "criar_cliente",
                    recurso: "cliente",
                    recursoId: novo.clientId,
                    descricao: `${novo.razaoSocial} criado`,
                    detalhes: { antes: null, depois: novo }
                });
            } else {
                const idx = list.findIndex((c) => c.clientId === editingId);
                if (idx !== -1) {
                    const before = { ...list[idx] };
                    list[idx] = { ...list[idx], ...payload, dataAtualizacao: new Date().toISOString() };
                    setJson(STORAGE_KEYS.clientes, list);
                    recordAudit({
                        acao: "editar_cliente",
                        recurso: "cliente",
                        recursoId: editingId,
                        descricao: `${list[idx].razaoSocial} atualizado`,
                        detalhes: { antes: before, depois: list[idx] }
                    });
                }
            }
            closeModal(modal);
            render();
        });

        searchStatus.addEventListener("change", render);
        sortBy.addEventListener("change", render);
        render();
    }

    function initColaboradores() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const tbody = document.getElementById("colaboradores-body");
        const statusFilter = document.getElementById("filtro-status-col");
        const roleFilter = document.getElementById("filtro-role-col");
        const sortBy = document.getElementById("ordenacao-col");
        const form = document.getElementById("colaborador-form");
        let editingId = null;

        function render() {
            const list = getJson(STORAGE_KEYS.colaboradores, []);
            const projetos = getJson(STORAGE_KEYS.projetos, []);
            const filtered = list
                .filter((item) => statusFilter.value === "todos" || item.status === statusFilter.value)
                .filter((item) => roleFilter.value === "todos" || item.role === roleFilter.value);
            filtered.sort((a, b) => {
                if (sortBy.value === "nome") return String(a.nome).localeCompare(String(b.nome));
                if (sortBy.value === "email") return String(a.email).localeCompare(String(b.email));
                return new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0);
            });
            tbody.innerHTML = "";
            filtered.forEach((item) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${escapeHtml(item.colaboradorId)}</td>
                    <td>${escapeHtml(item.nome)}</td>
                    <td>${escapeHtml(item.email)}</td>
                    <td>${escapeHtml(item.role)}</td>
                    <td><span class="status ${item.status === "ativo" ? "status-ativo" : "status-inativo"}">${escapeHtml(item.status)}</span></td>
                    <td>
                        <button class="btn btn-ghost" data-action="edit">Editar</button>
                        <button class="btn ${item.status === "ativo" ? "btn-danger" : "btn-success"}" data-action="toggle">${item.status === "ativo" ? "Desativar" : "Ativar"}</button>
                        <button class="btn btn-danger" data-action="delete">Deletar</button>
                        <button class="btn btn-ghost" data-action="reset">Reset Senha</button>
                        <button class="btn btn-ghost" data-action="projetos">Ver Projetos</button>
                    </td>
                `;
                tr.querySelector("[data-action='edit']").addEventListener("click", () => {
                    editingId = item.colaboradorId;
                    document.getElementById("col-nome").value = item.nome;
                    document.getElementById("col-email").value = item.email;
                    document.getElementById("col-role").value = item.role;
                    document.getElementById("col-status").checked = item.status === "ativo";
                    openModal("modal-colaborador");
                });
                tr.querySelector("[data-action='toggle']").addEventListener("click", () => {
                    const arr = getJson(STORAGE_KEYS.colaboradores, []);
                    const idx = arr.findIndex((c) => c.colaboradorId === item.colaboradorId);
                    if (idx === -1) return;
                    const before = { ...arr[idx] };
                    arr[idx].status = arr[idx].status === "ativo" ? "inativo" : "ativo";
                    setJson(STORAGE_KEYS.colaboradores, arr);
                    recordAudit({
                        acao: `${arr[idx].status === "ativo" ? "ativar" : "desativar"}_colaborador`,
                        recurso: "colaborador",
                        recursoId: arr[idx].colaboradorId,
                        descricao: `${arr[idx].nome} ${arr[idx].status === "ativo" ? "ativado" : "desativado"}`,
                        detalhes: { antes: before, depois: arr[idx] }
                    });
                    render();
                });
                tr.querySelector("[data-action='delete']").addEventListener("click", () => {
                    if (!window.confirm("Deseja deletar colaborador?")) return;
                    const arr = getJson(STORAGE_KEYS.colaboradores, []);
                    const found = arr.find((c) => c.colaboradorId === item.colaboradorId);
                    setJson(STORAGE_KEYS.colaboradores, arr.filter((c) => c.colaboradorId !== item.colaboradorId));
                    recordAudit({
                        acao: "deletar_colaborador",
                        recurso: "colaborador",
                        recursoId: item.colaboradorId,
                        descricao: `${item.nome} removido`,
                        detalhes: { antes: found, depois: null }
                    });
                    render();
                });
                tr.querySelector("[data-action='reset']").addEventListener("click", () => {
                    const senha = Math.random().toString(36).slice(2, 10);
                    const emails = getJson("helpdesk_emails", []);
                    emails.push({
                        para: item.email,
                        assunto: "Reset de senha",
                        corpo: `Nova senha temporária: ${senha}`,
                        dataPedido: new Date().toISOString()
                    });
                    setJson("helpdesk_emails", emails);
                    recordAudit({
                        acao: "reset_senha_colaborador",
                        recurso: "colaborador",
                        recursoId: item.colaboradorId,
                        descricao: `Reset de senha enviado para ${item.email}`,
                        detalhes: { antes: null, depois: { email: item.email } }
                    });
                    alert(`Email simulado enviado para ${item.email}`);
                });
                tr.querySelector("[data-action='projetos']").addEventListener("click", () => {
                    const vinculados = projetos.filter((p) => p.gestorEmail === item.email).map((p) => p.titulo || p.id);
                    alert(vinculados.length ? vinculados.join("\n") : "Sem projetos vinculados.");
                });
                tbody.appendChild(tr);
            });
            if (!filtered.length) tbody.innerHTML = "<tr><td colspan='6' class='muted'>Nenhum colaborador.</td></tr>";
        }

        document.getElementById("btn-novo-colaborador").addEventListener("click", () => {
            editingId = null;
            form.reset();
            document.getElementById("col-status").checked = true;
            openModal("modal-colaborador");
        });
        document.querySelectorAll("[data-close-modal]").forEach((btn) => btn.addEventListener("click", () => closeModal(btn.dataset.closeModal)));
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const list = getJson(STORAGE_KEYS.colaboradores, []);
            const payload = {
                nome: document.getElementById("col-nome").value.trim(),
                email: document.getElementById("col-email").value.trim(),
                role: document.getElementById("col-role").value,
                status: document.getElementById("col-status").checked ? "ativo" : "inativo"
            };
            if (!editingId) {
                const novo = { colaboradorId: nextId("col", list, "colaboradorId"), ...payload, dataCriacao: new Date().toISOString() };
                list.push(novo);
                setJson(STORAGE_KEYS.colaboradores, list);
                recordAudit({ acao: "criar_colaborador", recurso: "colaborador", recursoId: novo.colaboradorId, descricao: `${novo.nome} criado`, detalhes: { antes: null, depois: novo } });
            } else {
                const idx = list.findIndex((c) => c.colaboradorId === editingId);
                if (idx !== -1) {
                    const before = { ...list[idx] };
                    list[idx] = { ...list[idx], ...payload };
                    setJson(STORAGE_KEYS.colaboradores, list);
                    recordAudit({ acao: "editar_colaborador", recurso: "colaborador", recursoId: editingId, descricao: `${list[idx].nome} atualizado`, detalhes: { antes: before, depois: list[idx] } });
                }
            }
            closeModal("modal-colaborador");
            render();
        });
        [statusFilter, roleFilter, sortBy].forEach((el) => el.addEventListener("change", render));
        render();
    }

    function csvEscape(value) {
        const safe = String(value ?? "");
        if (safe.includes(",") || safe.includes("\"") || safe.includes("\n")) return `"${safe.replace(/"/g, "\"\"")}"`;
        return safe;
    }

    function parseCsv(content) {
        const rows = [];
        let row = [];
        let current = "";
        let inside = false;
        for (let i = 0; i < content.length; i += 1) {
            const char = content[i];
            if (char === "\"") {
                if (inside && content[i + 1] === "\"") {
                    current += "\"";
                    i += 1;
                } else {
                    inside = !inside;
                }
                continue;
            }
            if (char === "," && !inside) {
                row.push(current);
                current = "";
                continue;
            }
            if ((char === "\n" || char === "\r") && !inside) {
                if (char === "\r" && content[i + 1] === "\n") i += 1;
                row.push(current);
                if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
                row = [];
                current = "";
                continue;
            }
            current += char;
        }
        row.push(current);
        if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
        return rows;
    }

    function initCatalogo() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const tbody = document.getElementById("catalogo-body");
        const filtroTipo = document.getElementById("filtro-tipo");
        const filtroStatus = document.getElementById("filtro-status");
        const form = document.getElementById("catalogo-form");
        let editingId = null;

        function render() {
            const list = getJson(STORAGE_KEYS.catalogo, []);
            const filtered = list.filter((item) => filtroTipo.value === "todos" || item.tipo === filtroTipo.value)
                .filter((item) => filtroStatus.value === "todos" || item.status === filtroStatus.value);
            tbody.innerHTML = "";
            filtered.forEach((item) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${escapeHtml(item.produtoId)}</td>
                    <td>${escapeHtml(item.nome)}</td>
                    <td>${escapeHtml(item.tipo)}</td>
                    <td>${formatMoney(item.valor)}</td>
                    <td>${item.prazo}</td>
                    <td><span class="status ${item.status === "ativo" ? "status-ativo" : "status-inativo"}">${escapeHtml(item.status)}</span></td>
                    <td>
                        <button class="btn btn-ghost" data-action="edit">Editar</button>
                        <button class="btn ${item.status === "ativo" ? "btn-danger" : "btn-success"}" data-action="toggle">${item.status === "ativo" ? "Desativar" : "Ativar"}</button>
                        <button class="btn btn-danger" data-action="delete">Deletar</button>
                        <button class="btn btn-ghost" data-action="clone">Clonar</button>
                    </td>
                `;
                tr.querySelector("[data-action='edit']").addEventListener("click", () => {
                    editingId = item.produtoId;
                    document.getElementById("prod-nome").value = item.nome;
                    document.getElementById("prod-descricao").value = item.descricao || "";
                    document.getElementById("prod-tipo").value = item.tipo;
                    document.getElementById("prod-valor").value = item.valor;
                    document.getElementById("prod-prazo").value = item.prazo;
                    document.getElementById("prod-status").checked = item.status === "ativo";
                    openModal("modal-catalogo");
                });
                tr.querySelector("[data-action='toggle']").addEventListener("click", () => {
                    const arr = getJson(STORAGE_KEYS.catalogo, []);
                    const idx = arr.findIndex((c) => c.produtoId === item.produtoId);
                    if (idx === -1) return;
                    const before = { ...arr[idx] };
                    arr[idx].status = arr[idx].status === "ativo" ? "inativo" : "ativo";
                    setJson(STORAGE_KEYS.catalogo, arr);
                    recordAudit({ acao: `${arr[idx].status === "ativo" ? "ativar" : "desativar"}_produto`, recurso: "catalogo", recursoId: item.produtoId, descricao: `${item.nome} alterado`, detalhes: { antes: before, depois: arr[idx] } });
                    render();
                });
                tr.querySelector("[data-action='delete']").addEventListener("click", () => {
                    if (!window.confirm("Deseja deletar produto?")) return;
                    const arr = getJson(STORAGE_KEYS.catalogo, []);
                    const found = arr.find((c) => c.produtoId === item.produtoId);
                    setJson(STORAGE_KEYS.catalogo, arr.filter((c) => c.produtoId !== item.produtoId));
                    recordAudit({ acao: "deletar_produto", recurso: "catalogo", recursoId: item.produtoId, descricao: `${item.nome} removido`, detalhes: { antes: found, depois: null } });
                    render();
                });
                tr.querySelector("[data-action='clone']").addEventListener("click", () => {
                    const arr = getJson(STORAGE_KEYS.catalogo, []);
                    const clone = { ...item, produtoId: nextId("prod", arr, "produtoId"), nome: `${item.nome} (Clone)`, dataCriacao: new Date().toISOString() };
                    arr.push(clone);
                    setJson(STORAGE_KEYS.catalogo, arr);
                    recordAudit({ acao: "clonar_produto", recurso: "catalogo", recursoId: clone.produtoId, descricao: `${item.nome} clonado`, detalhes: { antes: item, depois: clone } });
                    render();
                });
                tbody.appendChild(tr);
            });
            if (!filtered.length) tbody.innerHTML = "<tr><td colspan='7' class='muted'>Nenhum item encontrado.</td></tr>";
        }

        document.getElementById("btn-novo-produto").addEventListener("click", () => {
            editingId = null;
            form.reset();
            document.getElementById("prod-status").checked = true;
            openModal("modal-catalogo");
        });
        document.querySelectorAll("[data-close-modal]").forEach((btn) => btn.addEventListener("click", () => closeModal(btn.dataset.closeModal)));
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const list = getJson(STORAGE_KEYS.catalogo, []);
            const payload = {
                nome: document.getElementById("prod-nome").value.trim(),
                descricao: document.getElementById("prod-descricao").value.trim(),
                tipo: document.getElementById("prod-tipo").value,
                valor: asNumber(document.getElementById("prod-valor").value),
                prazo: asNumber(document.getElementById("prod-prazo").value),
                status: document.getElementById("prod-status").checked ? "ativo" : "inativo"
            };
            if (!editingId) {
                const novo = { produtoId: nextId("prod", list, "produtoId"), ...payload, dataCriacao: new Date().toISOString() };
                list.push(novo);
                setJson(STORAGE_KEYS.catalogo, list);
                recordAudit({ acao: "criar_produto", recurso: "catalogo", recursoId: novo.produtoId, descricao: `${novo.nome} criado`, detalhes: { antes: null, depois: novo } });
            } else {
                const idx = list.findIndex((p) => p.produtoId === editingId);
                if (idx !== -1) {
                    const before = { ...list[idx] };
                    list[idx] = { ...list[idx], ...payload };
                    setJson(STORAGE_KEYS.catalogo, list);
                    recordAudit({ acao: "editar_produto", recurso: "catalogo", recursoId: editingId, descricao: `${list[idx].nome} atualizado`, detalhes: { antes: before, depois: list[idx] } });
                }
            }
            closeModal("modal-catalogo");
            render();
        });
        [filtroTipo, filtroStatus].forEach((el) => el.addEventListener("change", render));

        document.getElementById("btn-exportar-csv").addEventListener("click", () => {
            const list = getJson(STORAGE_KEYS.catalogo, []);
            const lines = ["produtoId,nome,descricao,tipo,valor,prazo,status"].concat(list.map((item) => [
                item.produtoId, item.nome, item.descricao, item.tipo, item.valor, item.prazo, item.status
            ].map(csvEscape).join(",")));
            const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "catalogo.csv";
            a.click();
            URL.revokeObjectURL(a.href);
        });

        document.getElementById("input-import-csv").addEventListener("change", async (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const content = await file.text();
            const rows = parseCsv(content);
            if (rows.length < 2) return;
            const headers = rows[0];
            const list = getJson(STORAGE_KEYS.catalogo, []);
            for (let i = 1; i < rows.length; i += 1) {
                const values = rows[i];
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx] ?? "";
                });
                list.push({
                    produtoId: row.produtoId || nextId("prod", list, "produtoId"),
                    nome: row.nome || "Produto importado",
                    descricao: row.descricao || "",
                    tipo: row.tipo === "recorrente" ? "recorrente" : "setup",
                    valor: asNumber(row.valor),
                    prazo: asNumber(row.prazo),
                    status: row.status === "inativo" ? "inativo" : "ativo",
                    dataCriacao: new Date().toISOString()
                });
            }
            setJson(STORAGE_KEYS.catalogo, list);
            recordAudit({ acao: "importar_catalogo", recurso: "catalogo", recursoId: "csv", descricao: `${rows.length - 1} itens importados`, detalhes: { antes: null, depois: { total: rows.length - 1 } } });
            render();
        });
        render();
    }

    function filterByGlobals(items, filters) {
        return items.filter((item) => {
            const date = new Date(item.dataInicio || item.dataCriacao || item.timestamp || Date.now());
            if (filters.inicio) {
                const start = new Date(filters.inicio);
                if (date < start) return false;
            }
            if (filters.fim) {
                const end = new Date(filters.fim);
                end.setHours(23, 59, 59, 999);
                if (date > end) return false;
            }
            if (filters.cliente && filters.cliente !== "todos" && item.clientId !== filters.cliente && item.nomeCliente !== filters.cliente) return false;
            if (filters.status && filters.status !== "todos" && item.status !== filters.status) return false;
            if (filters.modalidade && filters.modalidade !== "todos" && item.modalidade !== filters.modalidade) return false;
            return true;
        });
    }

    function downloadPseudoPdf(name, content) {
        const blob = new Blob([content], { type: "application/pdf" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function initRelatorios() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const clientes = getJson(STORAGE_KEYS.clientes, []);
        const projetos = getJson(STORAGE_KEYS.projetos, []);
        const atividades = getJson("helpdesk_atividades", []);
        const tabs = document.querySelectorAll(".tab-btn");
        const panels = document.querySelectorAll(".tab-panel");
        const clienteSelect = document.getElementById("filtro-cliente");
        clienteSelect.innerHTML = `<option value="todos">Todos</option>${clientes.map((c) => `<option value="${escapeHtml(c.clientId)}">${escapeHtml(c.razaoSocial)}</option>`).join("")}`;

        tabs.forEach((tab) => tab.addEventListener("click", () => {
            tabs.forEach((btn) => btn.classList.remove("active"));
            panels.forEach((panel) => panel.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        }));

        const delayFilter = document.getElementById("filtro-atraso");
        delayFilter.addEventListener("change", render);
        ["filtro-inicio", "filtro-fim", "filtro-cliente", "filtro-status", "filtro-modalidade"].forEach((id) => document.getElementById(id).addEventListener("change", render));

        function render() {
            const filters = {
                inicio: document.getElementById("filtro-inicio").value,
                fim: document.getElementById("filtro-fim").value,
                cliente: document.getElementById("filtro-cliente").value,
                status: document.getElementById("filtro-status").value,
                modalidade: document.getElementById("filtro-modalidade").value
            };

            const projetosFiltrados = filterByGlobals(projetos, filters);
            const clientesFiltrados = filterByGlobals(clientes.map((c) => ({ ...c, dataInicio: c.dataCriacao })), filters);
            const atividadesFiltradas = filterByGlobals(atividades, filters).filter((item) => {
                const diasAtraso = asNumber(item.diasAtraso);
                const f = delayFilter.value;
                if (f === "noprazo") return diasAtraso <= 0;
                if (f === "lt7") return diasAtraso > 0 && diasAtraso < 7;
                if (f === "gt7") return diasAtraso >= 7;
                return true;
            });

            document.getElementById("rel-clientes-body").innerHTML = clientesFiltrados.map((item) => {
                const p = projetosFiltrados.filter((proj) => proj.clientId === item.clientId && proj.status !== "encerrado");
                const valor = projetosFiltrados.filter((proj) => proj.clientId === item.clientId).reduce((acc, proj) => acc + sumProjetoValor(proj), 0);
                return `<tr><td>${escapeHtml(item.razaoSocial)}</td><td>${escapeHtml(item.cnpj || "-")}</td><td>${escapeHtml(item.email || "-")}</td><td>${escapeHtml(item.telefone || "-")}</td><td>${p.length}</td><td>${formatMoney(valor)}</td><td>${escapeHtml(item.status)}</td></tr>`;
            }).join("") || "<tr><td colspan='7' class='muted'>Sem dados</td></tr>";
            document.getElementById("tot-clientes").textContent = clientesFiltrados.length;
            document.getElementById("tot-clientes-valor").textContent = formatMoney(projetosFiltrados.reduce((acc, p) => acc + sumProjetoValor(p), 0));

            document.getElementById("rel-projetos-body").innerHTML = projetosFiltrados.map((item) => `
                <tr><td>${escapeHtml(item.id || "-")}</td><td>${escapeHtml(item.titulo || "-")}</td><td>${escapeHtml(item.nomeCliente || "-")}</td><td>${escapeHtml(item.gestorEmail || "-")}</td><td>${escapeHtml(item.status || "-")}</td><td>${asNumber(item.percentualConclusao)}%</td><td>${formatDate(item.dataInicio)}</td><td>${formatDate(item.dataFimPrevisto)}</td><td>${formatMoney(sumProjetoValor(item))}</td></tr>
            `).join("") || "<tr><td colspan='9' class='muted'>Sem dados</td></tr>";
            const mediaConcl = projetosFiltrados.length ? Math.round(projetosFiltrados.reduce((acc, p) => acc + asNumber(p.percentualConclusao), 0) / projetosFiltrados.length) : 0;
            document.getElementById("tot-projetos").textContent = projetosFiltrados.length;
            document.getElementById("tot-projetos-valor").textContent = formatMoney(projetosFiltrados.reduce((acc, p) => acc + sumProjetoValor(p), 0));
            document.getElementById("tot-projetos-conclusao").textContent = `${mediaConcl}%`;

            const financeBody = {};
            projetosFiltrados.forEach((item) => {
                const key = item.clientId || item.nomeCliente || "Sem cliente";
                if (!financeBody[key]) financeBody[key] = { cliente: item.nomeCliente || key, setup: 0, recorrente: 0, total: 0, pago: 0, devido: 0 };
                financeBody[key].setup += asNumber(item.valorSetup);
                financeBody[key].recorrente += asNumber(item.valorRecorrente);
                financeBody[key].total += sumProjetoValor(item);
                if (item.status === "encerrado") financeBody[key].pago += sumProjetoValor(item);
                else financeBody[key].devido += sumProjetoValor(item);
            });
            const financeRows = Object.values(financeBody);
            document.getElementById("rel-financeiro-body").innerHTML = financeRows.map((item) => `
                <tr><td>${escapeHtml(item.cliente)}</td><td>${formatMoney(item.setup)}</td><td>${formatMoney(item.recorrente)}</td><td>${formatMoney(item.total)}</td><td>${formatMoney(item.pago)}</td><td>${formatMoney(item.devido)}</td></tr>
            `).join("") || "<tr><td colspan='6' class='muted'>Sem dados</td></tr>";
            document.getElementById("tot-fin-receita").textContent = formatMoney(financeRows.reduce((acc, item) => acc + item.total, 0));
            document.getElementById("tot-fin-media").textContent = formatMoney(financeRows.length ? financeRows.reduce((acc, item) => acc + item.total, 0) / financeRows.length : 0);

            const now = new Date();
            const months = [];
            for (let i = 5; i >= 0; i -= 1) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push({ key: getMonthKey(d), label: d.toLocaleDateString("pt-BR", { month: "short" }), value: 0 });
            }
            projetosFiltrados.forEach((item) => {
                const month = months.find((m) => m.key === getMonthKey(item.dataFimReal || item.dataFimPrevisto || item.dataInicio));
                if (month) month.value += sumProjetoValor(item);
            });
            mountLineChart(document.getElementById("chart-financeiro"), months);

            document.getElementById("rel-atividades-body").innerHTML = atividadesFiltradas.map((item) => `
                <tr><td>${escapeHtml(item.projetoId || "-")}</td><td>${escapeHtml(item.titulo || "-")}</td><td>${escapeHtml(item.ator || item.atorEmail || "-")}</td><td>${escapeHtml(item.status || "-")}</td><td>${formatDate(item.dataPrevista)}</td><td>${asNumber(item.diasAtraso)}</td></tr>
            `).join("") || "<tr><td colspan='6' class='muted'>Sem dados</td></tr>";
            const concluido = atividadesFiltradas.filter((a) => a.status === "finalizada").length;
            const pct = atividadesFiltradas.length ? Math.round((concluido / atividadesFiltradas.length) * 100) : 0;
            document.getElementById("tot-atividades").textContent = atividadesFiltradas.length;
            document.getElementById("tot-atividades-conclusao").textContent = `${pct}%`;
        }

        document.querySelectorAll("[data-download-pdf]").forEach((btn) => btn.addEventListener("click", () => {
            const scope = btn.dataset.downloadPdf;
            const section = document.getElementById(scope);
            downloadPseudoPdf(`relatorio-${scope}`, section.textContent || "");
        }));
        render();
    }

    function initConfiguracoes() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const empresaForm = document.getElementById("empresa-form");
        const modalidadeForm = document.getElementById("modalidade-form");
        const empresa = getJson(STORAGE_KEYS.empresa, {});
        Object.entries(empresa).forEach(([key, value]) => {
            const input = document.getElementById(`empresa-${key}`);
            if (input) input.value = value || "";
        });

        function renderModalidades() {
            const list = getJson(STORAGE_KEYS.modalidades, []);
            const body = document.getElementById("modalidades-body");
            body.innerHTML = "";
            list.forEach((item, idx) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${escapeHtml(item)}</td>
                    <td>
                        <button class="btn btn-ghost" data-action="up">↑</button>
                        <button class="btn btn-ghost" data-action="down">↓</button>
                        <button class="btn btn-ghost" data-action="edit">Editar</button>
                        <button class="btn btn-danger" data-action="delete">Deletar</button>
                    </td>
                `;
                tr.querySelector("[data-action='up']").addEventListener("click", () => {
                    if (idx === 0) return;
                    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
                    setJson(STORAGE_KEYS.modalidades, list);
                    renderModalidades();
                });
                tr.querySelector("[data-action='down']").addEventListener("click", () => {
                    if (idx === list.length - 1) return;
                    [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
                    setJson(STORAGE_KEYS.modalidades, list);
                    renderModalidades();
                });
                tr.querySelector("[data-action='edit']").addEventListener("click", () => {
                    const novo = prompt("Novo nome da modalidade:", item);
                    if (!novo) return;
                    list[idx] = novo.trim();
                    setJson(STORAGE_KEYS.modalidades, list);
                    recordAudit({ acao: "editar_modalidade", recurso: "configuracao", recursoId: `modalidade-${idx}`, descricao: `Modalidade atualizada: ${novo}`, detalhes: { antes: item, depois: novo } });
                    renderModalidades();
                });
                tr.querySelector("[data-action='delete']").addEventListener("click", () => {
                    if (!window.confirm("Deseja remover modalidade?")) return;
                    const before = list[idx];
                    list.splice(idx, 1);
                    setJson(STORAGE_KEYS.modalidades, list);
                    recordAudit({ acao: "deletar_modalidade", recurso: "configuracao", recursoId: `modalidade-${idx}`, descricao: "Modalidade removida", detalhes: { antes: before, depois: null } });
                    renderModalidades();
                });
                body.appendChild(tr);
            });
        }

        empresaForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const before = getJson(STORAGE_KEYS.empresa, {});
            const next = {
                razaoSocial: document.getElementById("empresa-razaoSocial").value.trim(),
                cnpj: document.getElementById("empresa-cnpj").value.trim(),
                email: document.getElementById("empresa-email").value.trim(),
                telefone: document.getElementById("empresa-telefone").value.trim(),
                endereco: document.getElementById("empresa-endereco").value.trim(),
                website: document.getElementById("empresa-website").value.trim()
            };
            setJson(STORAGE_KEYS.empresa, next);
            recordAudit({ acao: "editar_dados_empresa", recurso: "configuracao", recursoId: "empresa", descricao: "Dados da empresa atualizados", detalhes: { antes: before, depois: next } });
            alert("Dados salvos.");
        });

        modalidadeForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const value = document.getElementById("nova-modalidade").value.trim();
            if (!value) return;
            const list = getJson(STORAGE_KEYS.modalidades, []);
            list.push(value);
            setJson(STORAGE_KEYS.modalidades, list);
            recordAudit({ acao: "criar_modalidade", recurso: "configuracao", recursoId: `modalidade-${list.length}`, descricao: `Modalidade criada: ${value}`, detalhes: { antes: null, depois: value } });
            modalidadeForm.reset();
            renderModalidades();
        });

        document.getElementById("btn-teste-email").addEventListener("click", () => alert("Teste de email simulado com sucesso."));
        document.getElementById("btn-teste-linkedin").addEventListener("click", () => alert("Autenticação LinkedIn simulada com sucesso."));
        document.getElementById("btn-backup").addEventListener("click", () => {
            const payload = {};
            for (let i = 0; i < localStorage.length; i += 1) {
                const key = localStorage.key(i);
                payload[key] = localStorage.getItem(key);
            }
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "bpi-backup.json";
            a.click();
            URL.revokeObjectURL(a.href);
            recordAudit({ acao: "backup_dados", recurso: "configuracao", recursoId: "backup", descricao: "Backup executado", detalhes: { antes: null, depois: { keys: Object.keys(payload).length } } });
        });
        document.getElementById("input-restore").addEventListener("change", async (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const content = await file.text();
            const data = JSON.parse(content);
            const allowed = [
                STORAGE_KEYS.clientes,
                STORAGE_KEYS.colaboradores,
                STORAGE_KEYS.projetos,
                STORAGE_KEYS.catalogo,
                STORAGE_KEYS.auditoria,
                STORAGE_KEYS.modalidades,
                STORAGE_KEYS.empresa,
                "helpdesk_atividades",
                "helpdesk_propostas",
                "helpdesk_escopo",
                "helpdesk_emails"
            ];
            allowed.forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(data, key)) localStorage.setItem(key, data[key]);
            });
            recordAudit({ acao: "restore_dados", recurso: "configuracao", recursoId: "restore", descricao: "Restore executado", detalhes: { antes: null, depois: { keys: Object.keys(data).length } } });
            alert("Backup restaurado.");
            window.location.reload();
        });
        renderModalidades();
    }

    function initAuditoria() {
        const session = requireAuth();
        if (!session) return;
        bindTopBar();
        const body = document.getElementById("auditoria-body");
        const filters = ["audit-inicio", "audit-fim", "audit-admin", "audit-acao"];
        filters.forEach((id) => document.getElementById(id).addEventListener("change", render));

        function render() {
            const list = getJson(STORAGE_KEYS.auditoria, []).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const inicio = document.getElementById("audit-inicio").value;
            const fim = document.getElementById("audit-fim").value;
            const admin = document.getElementById("audit-admin").value;
            const acao = document.getElementById("audit-acao").value;
            const filtered = list.filter((item) => {
                const date = new Date(item.timestamp);
                if (inicio && date < new Date(inicio)) return false;
                if (fim) {
                    const end = new Date(fim);
                    end.setHours(23, 59, 59, 999);
                    if (date > end) return false;
                }
                if (admin && admin !== "todos" && item.adminEmail !== admin) return false;
                if (acao && acao !== "todos" && !item.acao.startsWith(acao)) return false;
                return true;
            });
            body.innerHTML = "";
            filtered.forEach((item) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${formatDate(item.timestamp)}</td>
                    <td>${escapeHtml(item.adminEmail || "-")}</td>
                    <td>${escapeHtml(item.acao)}</td>
                    <td>${escapeHtml(item.recurso)}</td>
                    <td>${escapeHtml(item.descricao)}</td>
                    <td><button class="btn btn-ghost">Expandir</button></td>
                `;
                tr.querySelector("button").addEventListener("click", () => {
                    const detail = document.createElement("tr");
                    detail.innerHTML = `<td colspan="6"><pre>${escapeHtml(JSON.stringify(item.detalhes, null, 2))}</pre></td>`;
                    tr.insertAdjacentElement("afterend", detail);
                    tr.querySelector("button").disabled = true;
                });
                body.appendChild(tr);
            });
            if (!filtered.length) body.innerHTML = "<tr><td colspan='6' class='muted'>Sem registros.</td></tr>";
            const admins = [...new Set(list.map((item) => item.adminEmail).filter(Boolean))];
            const select = document.getElementById("audit-admin");
            const current = select.value;
            select.innerHTML = `<option value="todos">Todos</option>${admins.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}`;
            if (admins.includes(current)) select.value = current;
        }
        render();
    }

    function pageInit() {
        ensureSeeds();
        const page = document.body.dataset.page;
        if (page === "login") return initLogin();
        if (page === "dashboard") return initDashboard();
        if (page === "clientes") return initClientes();
        if (page === "colaboradores") return initColaboradores();
        if (page === "catalogo") return initCatalogo();
        if (page === "relatorios") return initRelatorios();
        if (page === "configuracoes") return initConfiguracoes();
        if (page === "auditoria") return initAuditoria();
    }

    window.BPIAdminPanel = {
        logout,
        requireAuth,
        getSession
    };
    document.addEventListener("DOMContentLoaded", pageInit);
})();
