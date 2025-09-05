// --- Testes Interativos ---

// Atributos (rodados com d6 sempre)
const ATRIBUTOS = {
  "AGILIDADE": 0,
  "CARISMA": 0,
  "CONHECIMENTO": 0,
  "ESPÍRITO": 2,
  "FORÇA": 0,
  "FORTITUDE": 1,
  "PERCEPÇÃO": 0,
};

// Perícias
// Quantidade de dados por perícia (ajuste conforme seu personagem)
const PERICIAS_QTD = {
  "ARCANISMO": 1,
  "CIÊNCIAS": 0,
  "CULINÁRIA": 0,
  "DIPLOMACIA": 0,
  "DESTREZA": 0,
  "FURTIVIDADE": 0,
  "FULGOR": 2,
  "INVESTIGAÇÃO": 0,
  "INTELIGÊNCIA": 0,
  "INTUIÇÃO": 0,
  "INICIATIVA": 0,
  "LUTA": 0,
  "MENTE": 1,
  "MEDICINA": 0,
  "OBSERVAÇÃO": 0,
  "PONTARIA": 0,
  "REFLEXO": 0,
  "SOBREVIVÊNCIA": 0,
  "SORTE": 0,
  "TÉCNICA": 0,
  "VIGOR": 0,
  "VONTADE": 3,
};

// Bônus fixo por perícia (opcional)
const PERICIAS_BONUS_FIXO = {
  "ARCANISMO": 0,
  "CIÊNCIAS": 0,
  "CULINÁRIA": 0,
  "DIPLOMACIA": 0,
  "DESTREZA": 0,
  "FURTIVIDADE": 0,
  "FULGOR": 0,
  "INVESTIGAÇÃO": 0,
  "INTELIGÊNCIA": 0,
  "INTUIÇÃO": 0,
  "INICIATIVA": 0,
  "LUTA": 0,
  "MENTE": 0,
  "MEDICINA": 0,
  "OBSERVAÇÃO": 0,
  "PONTARIA": 0,
  "REFLEXO": 0,
  "SOBREVIVÊNCIA": 0,
  "SORTE": 0,
  "TÉCNICA": 0,
  "VIGOR": 0,
  "VONTADE": 12,
};

// Utilitário para rolagem de dados
function rolar(qtd, faces) {
  let total = 0; let rolls = [];
  for (let i = 0; i < qtd; i++) {
    const r = Math.floor(Math.random() * faces) + 1;
    rolls.push(r); total += r;
  }
  return { total, rolls };
}

// Rola d20 com vantagens/desvantagens: vantagens => rola N+1 d20 e pega o maior; desvantagens => rola N+1 e pega o menor.
function rolarD20ComMod(vantagens, desvantagens) {
  const n = Math.max(0, vantagens|0) + Math.max(0, desvantagens|0) + 1;
  const r = rolar(n, 20);
  if (desvantagens > vantagens) {
    // pega o menor
    const menor = Math.min(...r.rolls);
    return { escolha: menor, rolls: r.rolls, tipo: 'desvantagem' };
  } else if (vantagens > desvantagens) {
    // pega o maior
    const maior = Math.max(...r.rolls);
    return { escolha: maior, rolls: r.rolls, tipo: 'vantagem' };
  } else {
    return { escolha: r.rolls[0], rolls: r.rolls, tipo: 'normal' };
  }
}

// Popula selects ao carregar a aba
document.addEventListener('DOMContentLoaded', () => {
  const selPericia = document.getElementById('teste-pericia');
  const selAtributo = document.getElementById('teste-atributo');
  if (selPericia && selPericia.options.length === 0) {
    Object.keys(PERICIAS_BONUS_FIXO).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p; opt.textContent = p; selPericia.appendChild(opt);
    });
  }
  if (selAtributo && selAtributo.options.length === 0) {
    Object.keys(ATRIBUTOS).forEach(a => {
      const opt = document.createElement('option');
      opt.value = a; opt.textContent = a; selAtributo.appendChild(opt);
    });
  }
});

// Helper: URL do backend (prioriza window -> querystring -> localStorage -> padrão '/api/discord')
function getBackendUrl() {
  const normalize = (u) => {
    if (!u || typeof u !== 'string') return '';
    const s = u.trim();
    if (!s) return '';
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    // permite salvar "api/discord" e normaliza para "/api/discord"
    return '/' + s;
  };

  // 1) window override (ex.: window.LIGHT_BACKEND_URL = 'https://...')
  if (typeof window !== 'undefined' && window.LIGHT_BACKEND_URL) {
    const v = normalize(window.LIGHT_BACKEND_URL);
    if (v) return v;
  }

  // 2) querystring (?backend=... ou ?api=...)
  try {
    const usp = new URLSearchParams(window.location.search);
    const q = usp.get('backend') || usp.get('api');
    const v = normalize(q);
    if (v) return v;
  } catch (_) {}

  // 3) localStorage override
  try {
    const saved = normalize(localStorage.getItem('LIGHT_BACKEND_URL'));
    if (saved) return saved;
  } catch (_) {}

  // 4) padrão: relativo (funciona no Vercel)
  return '/api/discord';
}

// --------- Favoritos ---------
const FAVORITOS_KEY = 'testesFavoritos';

function carregarFavoritos() {
  try {
    const raw = localStorage.getItem(FAVORITOS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function salvarFavoritos(lista) {
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify(lista.slice(0, 50)));
}

function renderFavoritos() {
  const box = document.getElementById('favoritos-list');
  const vazio = document.getElementById('favoritos-vazio');
  if (!box) return;
  const lista = carregarFavoritos();
  box.innerHTML = '';
  if (vazio) vazio.style.display = lista.length ? 'none' : 'block';
  lista.forEach((f, idx) => {
    const el = document.createElement('div');
    el.className = 'favorito-item';
    const peritoTxt = f.perito ? 'Perito' : 'Comum';
    el.innerHTML = `
      <div>
        <div><strong>${f.pericia}</strong> + <strong>${f.atributo}</strong></div>
        <div class="favorito-meta">d20 (${f.vantagens}V/${f.desvantagens}D) • ${peritoTxt} • Bônus ${f.bonusAdicional}</div>
      </div>
      <div class="favorito-actions">
        <button class="btn run" data-i="${idx}">Rolar</button>
        <button class="btn del" data-i="${idx}">Remover</button>
      </div>`;
    box.appendChild(el);
  });
  // bind actions
  box.querySelectorAll('.btn.run').forEach(b => b.addEventListener('click', () => executarFavorito(parseInt(b.dataset.i))));
  box.querySelectorAll('.btn.del').forEach(b => b.addEventListener('click', () => removerFavorito(parseInt(b.dataset.i))));
}

function adicionarFavorito(cfg) {
  const lista = carregarFavoritos();
  // evita favoritos idênticos consecutivos
  const last = lista[lista.length - 1];
  const str = JSON.stringify(cfg);
  if (!last || JSON.stringify(last) !== str) {
    lista.push(cfg);
    salvarFavoritos(lista);
  }
  renderFavoritos();
}

function removerFavorito(index) {
  const lista = carregarFavoritos();
  if (index >= 0 && index < lista.length) {
    lista.splice(index, 1);
    salvarFavoritos(lista);
  }
  renderFavoritos();
}

function executarFavorito(index) {
  const lista = carregarFavoritos();
  const f = lista[index];
  if (!f) return;
  // Preenche o formulário e envia
  const pSel = document.getElementById('teste-pericia');
  const aSel = document.getElementById('teste-atributo');
  const chk = document.getElementById('teste-perito');
  const vIn = document.getElementById('teste-vantagens');
  const dIn = document.getElementById('teste-desvantagens');
  const bIn = document.getElementById('teste-bonus');
  if (pSel) pSel.value = f.pericia;
  if (aSel) aSel.value = f.atributo;
  if (chk) chk.checked = !!f.perito;
  if (vIn) vIn.value = f.vantagens|0;
  if (dIn) dIn.value = f.desvantagens|0;
  if (bIn) bIn.value = f.bonusAdicional|0;
  const form = document.getElementById('testsForm');
  if (form) form.dispatchEvent(new Event('submit'));
}

// Lógica do formulário de Testes
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('testsForm');
  const saida = document.getElementById('resultadoTesteContent') || document.getElementById('resultadoTeste');
  const addFavBtn = document.getElementById('addFavoritoBtn');
  if (!form || !saida) return;

  // Render inicial de favoritos
  renderFavoritos();

  form.addEventListener('submit', async (e) => {
    // evita reload da página
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const pericia = document.getElementById('teste-pericia').value;
    const atributo = document.getElementById('teste-atributo').value;
    const perito = document.getElementById('teste-perito').checked;
    const vantagens = parseInt(document.getElementById('teste-vantagens').value) || 0;
    const desvantagens = parseInt(document.getElementById('teste-desvantagens').value) || 0;
    const bonusAdicional = parseInt(document.getElementById('teste-bonus').value) || 0;

    // d20 com vantagem/desvantagem
    const d20 = rolarD20ComMod(vantagens, desvantagens);

    // Atributo: d6
    const rAtrib = rolar(ATRIBUTOS[atributo] || 0, 6);

    // Perícia: d12 se perito, senão d10
  const facesPericia = perito ? 12 : 10;
  // Respeita explicitamente 0 como valor válido; só usa 1 quando a perícia não estiver definida
  const qtdPericia = (pericia in PERICIAS_QTD) ? PERICIAS_QTD[pericia] : 1;
  const rPericia = rolar(qtdPericia, facesPericia); // N dados de perícia

    // Bônus fixo específico da perícia + bônus adicional inserido
    const bonusFixo = PERICIAS_BONUS_FIXO[pericia] || 0;

    const total = d20.escolha + rAtrib.total + rPericia.total + bonusFixo + bonusAdicional;

    // Render da saída detalhada
    const det = [];
    det.push(`<strong>d20 (${d20.tipo})</strong>: [${d20.rolls.join(', ')}] ⇒ <strong>${d20.escolha}</strong>`);
    det.push(`<strong>${atributo}</strong> (${(ATRIBUTOS[atributo]||0)}d6): [${rAtrib.rolls.join(', ')}] = <strong>${rAtrib.total}</strong>`);
  det.push(`<strong>${pericia}</strong> (${qtdPericia}×${perito ? 'd12' : 'd10'}): [${rPericia.rolls.join(', ')}] = <strong>${rPericia.total}</strong>`);
    if (bonusFixo) det.push(`<strong>Bônus fixo da perícia</strong>: +${bonusFixo}`);
    if (bonusAdicional) det.push(`<strong>Bônus adicional</strong>: +${bonusAdicional}`);

  saida.innerHTML = `
      <div class="result-container">
        <div class="result-main">
          <strong>Perícia:</strong> ${pericia}<br>
          <strong>Atributo:</strong> ${atributo}<br>
          <strong>Total do Teste:</strong> ${total}
        </div>
        <div class="result-details">
          ${det.map(li => `<div style='margin:4px 0;'>${li}</div>`).join('')}
        </div>
      </div>
    `;
  // título agora é estático no HTML

  // Envio assíncrono para Discord via backend
  try {
    const payload = {
      pericia,
      atributo,
      total,
      d20: { mode: d20.tipo, value: d20.escolha, rolls: d20.rolls },
      atributoDice: { qty: (ATRIBUTOS[atributo]||0), faces: 6, rolls: rAtrib.rolls, sum: rAtrib.total },
      periciaDice: { qty: qtdPericia, faces: facesPericia, rolls: rPericia.rolls, sum: rPericia.total },
      bonus: bonusAdicional,
      vantagens,
      desvantagens,
      perito,
      timestamp: new Date().toISOString()
    };
  const backendUrl = getBackendUrl();
  try { console.debug('LIGHT: usando backend', backendUrl); } catch(_) {}
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    try {
      const apiKey = localStorage.getItem('LIGHT_API_KEY');
      if (apiKey) headers['x-light-key'] = apiKey;
    } catch (_) {}
    if (backendUrl) {
      const tryPost = async (url) => {
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            mode: 'cors',
            redirect: 'follow',
            cache: 'no-store',
          });
          if (!resp.ok) {
            console.warn('LIGHT: envio Discord falhou', url, resp.status);
          }
          return resp;
        } catch (err) {
          console.warn('LIGHT: erro de rede ao enviar para', url, err);
          return null;
        }
      };

      // tentativa 1: URL resolvida pelo helper
      let resp = await tryPost(backendUrl);
      // fallback se 404/405
      if (!resp || resp.status === 404 || resp.status === 405) {
        const fb1 = '/api/discord';
        if (backendUrl !== fb1) {
          resp = await tryPost(fb1);
        }
      }
      // fallback 2: absoluto no mesmo host
      if (!resp || resp.status === 404 || resp.status === 405) {
        try {
          const fb2 = (window.location && window.location.origin ? window.location.origin : '') + '/api/discord';
          if (fb2 && backendUrl !== fb2) {
            resp = await tryPost(fb2);
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  });

  // Adicionar aos favoritos
  if (addFavBtn) {
    addFavBtn.addEventListener('click', () => {
      const cfg = {
        pericia: document.getElementById('teste-pericia').value,
        atributo: document.getElementById('teste-atributo').value,
        perito: document.getElementById('teste-perito').checked,
        vantagens: parseInt(document.getElementById('teste-vantagens').value) || 0,
        desvantagens: parseInt(document.getElementById('teste-desvantagens').value) || 0,
        bonusAdicional: parseInt(document.getElementById('teste-bonus').value) || 0,
      };
      adicionarFavorito(cfg);
    });
  }
});
