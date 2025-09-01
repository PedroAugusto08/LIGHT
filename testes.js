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
  "VONTADE": 0,
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

// Lógica do formulário de Testes
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('testsForm');
  const saida = document.getElementById('resultadoTeste');
  if (!form || !saida) return;

  form.addEventListener('submit', () => {
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
  });
});
