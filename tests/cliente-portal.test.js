const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function createStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    },
    removeItem(key) {
      map.delete(String(key));
    },
    clear() {
      map.clear();
    },
    key(index) {
      return Array.from(map.keys())[index] || null;
    },
    get length() {
      return map.size;
    }
  };
}

function loadPortalApi() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'assets/js/cliente-portal.js'), 'utf8');
  const localStorage = createStorage();
  const documentListeners = {};
  const context = {
    console,
    localStorage,
    Intl,
    Date,
    Math,
    JSON,
    setTimeout,
    clearTimeout,
    URL,
    encodeURIComponent,
    decodeURIComponent,
    Blob,
    FormData,
    location: {
      pathname: '/cliente/login.html',
      search: '',
      hash: '',
      href: 'http://localhost/cliente/login.html'
    },
    window: null,
    document: {
      addEventListener(event, callback) {
        documentListeners[event] = callback;
      },
      querySelectorAll() { return []; },
      getElementById() { return null; },
      body: { getAttribute() { return 'login'; } }
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(code, context);
  if (documentListeners.DOMContentLoaded) {
    documentListeners.DOMContentLoaded();
  }
  return { api: context.window.BPIClientePortalTest, localStorage };
}

test('aprovação na prova salva progresso concluído e gera certificado', () => {
  const { api } = loadPortalApi();
  api.ensureSeedData();

  const passed = api.saveQuizOutcome('cli-001', 'treino-001', 85);
  assert.equal(passed, true);

  const progress = api.getTrainingProgress('cli-001').find((item) => item.treinamentoId === 'treino-001');
  assert.equal(progress.status, 'concluido');
  assert.equal(progress.ultimoResultado, 85);

  const awards = api.getTrainingAwards('cli-001');
  assert.equal(awards.length, 1);
  assert.match(awards[0].numeroCertificado, /^CERT-\d{4}-\d{5}$/);
});

test('reprovação na prova mantém progresso e não gera certificado', () => {
  const { api } = loadPortalApi();
  api.ensureSeedData();

  const passed = api.saveQuizOutcome('cli-001', 'treino-002', 55);
  assert.equal(passed, false);

  const progress = api.getTrainingProgress('cli-001').find((item) => item.treinamentoId === 'treino-002');
  assert.equal(progress.status, 'em_andamento');
  assert.equal(progress.ultimoResultado, 55);

  const awards = api.getTrainingAwards('cli-001').filter((item) => item.treinamentoId === 'treino-002');
  assert.equal(awards.length, 0);
});
