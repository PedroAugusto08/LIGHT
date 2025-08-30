// --- Controle de blocos disponíveis e inputs ---
document.addEventListener('DOMContentLoaded', function() {
    const almaInput = document.getElementById('alma');
    const inputs = [
        document.getElementById('dano'),
        document.getElementById('defesa'),
        document.getElementById('vitalidade'),
        document.getElementById('duracao')
    ];
    const blocosInfo = document.getElementById('blocos-info');

    function getMaxBlocos() {
        const alma = parseInt(almaInput.value) || 0;
        return Math.floor(alma / 2);
    }

    function updateBlocos() {
        const max = getMaxBlocos();
        const valores = inputs.map(inp => parseInt(inp.value) || 0);
        const soma = valores.reduce((a, b) => a + b, 0);
        blocosInfo.textContent = `Blocos disponíveis: ${max - soma} / ${max}`;

        // Limitar cada input para não ultrapassar o total
        inputs.forEach((inp, idx) => {
            const outros = soma - valores[idx];
            inp.max = Math.max(0, max - outros);
            // Se já atingiu o máximo, só permite realocação
            if (soma >= max && valores[idx] === 0) {
                inp.disabled = true;
            } else {
                inp.disabled = false;
            }
        });
    }

    almaInput.addEventListener('input', function() {
        // Zera blocos se alma mudar
        inputs.forEach(inp => inp.value = 0);
        updateBlocos();
    });
    inputs.forEach(inp => {
        inp.addEventListener('input', updateBlocos);
    });
    updateBlocos();
});
// script.js

// Rola 'qtd' dados de 'faces' lados. Retorna { total, rolls: [...] }
function rolarDado(qtd, faces) {
    let total = 0;
    let rolls = [];
    for (let i = 0; i < qtd; i++) {
        let roll = Math.floor(Math.random() * faces) + 1;
        rolls.push(roll);
        total += roll;
    }
    return { total, rolls };
}

// Teste de eficiência: vontadePts × d12, espiritoPts × d6, 1d20, bônus fixo +12, shift por blocos extras
function rollEficiência(vontadePts, espiritoPts, blocosExtras) {
    const d20 = rolarDado(1, 20);
    const vontade = rolarDado(Math.max(0, vontadePts), 12);
    const espirito = rolarDado(Math.max(0, espiritoPts), 6);
    const fixedBonus = 12;
    // totalRoll INCLUI +12 fixo
    const totalRoll = d20.total + vontade.total + espirito.total + fixedBonus;

    // shift: a cada 2 blocos extras, DT aumenta +1
    const shift = Math.floor(Math.max(0, blocosExtras) / 2);

    // thresholds ajustados por shift
    const t1 = 20 + shift;
    const t2 = 40 + shift;
    const t3 = 60 + shift;
    const t4 = 90 + shift;

    let faixa = "Normal", efMul = 1.0;
    if (totalRoll <= t1) { faixa = "-30%"; efMul = 0.7; }
    else if (totalRoll <= t2) { faixa = "Normal"; efMul = 1.0; }
    else if (totalRoll <= t3) { faixa = "+10%"; efMul = 1.1; }
    else if (totalRoll <= t4) { faixa = "+20%"; efMul = 1.2; }
    else { faixa = "+30%"; efMul = 1.3; }

    return {
        totalRoll,
        parts: {
            d20: d20.rolls[0],
            vontade,
            espirito,
            fixedBonus
        },
        shift,
        faixa,
        efMul
    };
}

// Md → multiplicador de Dano
// Mh → multiplicador de Defesa e HP
// Mt → multiplicador de Duração
const multiplicadores = {
    "Projétil":   { Md: 1.25, Mh: 1.0,  Mt: 0.75 },
    "Padrão":     { Md: 1.5,  Mh: 1.25, Mt: 1.0 },
    "Pesado":     { Md: 1.75, Mh: 1.5,  Mt: 1.0 },
    "Área":       { Md: 2.0,  Mh: 1.5,  Mt: 1.0 },
    "Colossal":   { Md: 1.25, Mh: 2.0,  Mt: 0.75 },
    "Estrutura":  { Md: 1.0,  Mh: 2.0,  Mt: 1.75 }
};

// Calcula os stats do construto, integrando eficiência
function calcularStats(params) {
  const {
    estilo,
    alma,
    blocosDano,
    blocosDefesa,
    blocosVitalidade,
    blocosDuracao,
    vontadePts,
    espiritoPts,
  } = params;

  // Cálculo dos blocos EXTRAS a partir da Alma acima do custo base (base = 6)
  // Regras: Base = 6 de Alma por ativação; X = Alma adicional; B = floor(X / 2)
  const blocosExtras = Math.floor(Math.max(0, (alma || 0) - 6) / 2);

  // Para compatibilidade, caso o usuário informe um número de blocos "manualmente",
  // você pode querer somar blocosExtras + blocosDano etc. Aqui blocosDano é o que o usuário alocou.
  const { Md, Mh, Mt } = multiplicadores[estilo] || multiplicadores["Padrão"];

// --- DANO: 2d6 base + blocosDano × 2d6
let baseDano = 0;
let rollsDano = [];

// Bloco base
let rBase = rolarDado(2, 6);
baseDano += rBase.total;
rollsDano.push({ type: 'base', rolls: rBase.rolls, total: rBase.total });

// Blocos alocados
for (let i = 0; i < Math.max(0, blocosDano); i++) {
    let r = rolarDado(2, 6);
    baseDano += r.total;
    rollsDano.push({ type: 'bloco', rolls: r.rolls, total: r.total });
}

// Aplica multiplicador Md (float)
let danoMultiplicado = baseDano * Md; // ex: 23 * 1.25 = 28.75

// Bônus de Luz: 1d10% (não arredondar agora)
let bonusLuz = rolarDado(1, 10); // percent 1..10
let bonusLuzPercent = bonusLuz.total;
let danoComBonusFloat = danoMultiplicado * (1 + (bonusLuzPercent / 100)); // float, ex: 29.325

// --- DEF: base 3 + 3 por bloco alocado (arredondar no final)
const baseDEF = 3;
let defBaseTotal = baseDEF + Math.max(0, blocosDefesa) * 3;
let defesaFloat = defBaseTotal * Mh; // float

// --- HP: base 6 + 6 por bloco alocado (float)
const baseHP = 6;
let hpAntesEficienciaFloat = (baseHP + Math.max(0, blocosVitalidade) * 6) * Mh;

// --- Duração: base 1 + 1 por bloco (float)
const baseDur = 1;
let duracaoAntesEficienciaFloat = (baseDur + Math.max(0, blocosDuracao)) * Mt;

// --- Teste de eficiência (usa blocosExtras para shift)
const resultadoEf = rollEficiência(vontadePts || 0, espiritoPts || 0, blocosExtras);
const efMul = resultadoEf.efMul;

// --- Aplicar eficiência (em floats)
let danoFinalFloat = danoComBonusFloat * efMul;
let hpFinalFloat = hpAntesEficienciaFloat * efMul;
let duracaoFinalFloat = duracaoAntesEficienciaFloat * efMul;

// --- Arredondar apenas uma vez, no final
let danoFinal = Math.round(danoFinalFloat);
let hpFinal = Math.round(hpFinalFloat);
let duracaoFinal = Math.round(duracaoFinalFloat);
let defesaFinal = Math.round(defesaFloat); // DEF não usa eficiência, mas arredondamos o resultado final

  return {
    estilo,
    alma,
    blocosExtras,
    blocosDano,
    blocosDefesa,
    blocosVitalidade,
    blocosDuracao,
    vontadePts,
    espiritoPts,
    rollsDano,
    baseDano,
    Md,
    bonusLuz: bonusLuz.rolls[0],
    danoMultiplicado,
    danoFinalFloat,
    defesaFinal,
    hpAntesEficienciaFloat,
    hpFinal,
    duracaoAntesEficienciaFloat,
    duracaoFinal,
    resultadoEf,
    danoFinal,
  };
}

// Formata a saída para exibição
function formatarSaida(stats) {
    const ef = stats.resultadoEf;
            // Dano detalhado
            let rolagemDano = `<strong>Dano:</strong><ul style='margin:6px 0 10px 18px;padding:0;'>`;
            stats.rollsDano.forEach((r, i) => {
                rolagemDano += `<li>${i === 0 ? 'Base' : 'Bloco ' + i}: <span style='color:#1976d2'>${r.rolls.join(' + ')}</span> = <strong>${r.total}</strong></li>`;
            });
            rolagemDano += `</ul>`;
            rolagemDano += `<div style='margin-bottom:6px;'>× <strong>Md</strong> (${stats.Md})<br>Bônus de Luz: <strong>${stats.bonusLuz}%</strong></div>`;

            // Teste de eficiência detalhado
            let rolagemEf = `<strong>Teste de Eficiência</strong><ul style='margin:6px 0 10px 18px;padding:0;'>`;
            rolagemEf += `<li>1d20: <span style='color:#1976d2'>${ef.parts.d20}</span></li>`;
            rolagemEf += `<li>Vontade (${stats.vontadePts}d12): <span style='color:#388e3c'>[${ef.parts.vontade.rolls.join(', ')}]</span> = <strong>${ef.parts.vontade.total}</strong></li>`;
            rolagemEf += `<li>Espírito (${stats.espiritoPts}d6): <span style='color:#fbc02d'>[${ef.parts.espirito.rolls.join(', ')}]</span> = <strong>${ef.parts.espirito.total}</strong></li>`;
            rolagemEf += `<li>Bônus fixo: <strong>+12</strong></li>`;
            rolagemEf += `<li>Total: <strong>${ef.totalRoll}</strong></li>`;
            rolagemEf += `<li>Shift: <strong>${ef.shift}</strong></li>`;
            rolagemEf += `<li>Faixa: <strong>${ef.faixa}</strong> (efMul=${ef.efMul})</li>`;
            rolagemEf += `</ul>`;

            let efeitoEf = `<em style='color:#888;'>(Eficiência aplicada em Dano, HP e Duração)</em>`;

            return `
            <div class="result-container">
                <div class="result-main">
                    <strong>Estilo:</strong> ${stats.estilo}<br>
                    <strong>Alma Gasta:</strong> ${stats.alma} (blocos extras gerados: ${stats.blocosExtras})<br>
                    <strong>Dano:</strong> ${stats.danoFinal} <br>
                    <strong>Defesa:</strong> ${stats.defesaFinal} <br>
                    <strong>HP:</strong> ${stats.hpFinal} <br>
                    <strong>Duração:</strong> ${stats.duracaoFinal} turno(s)<br>
                </div>
                <div class="result-details">
                    ${rolagemDano}
                    ${rolagemEf}
                    ${efeitoEf}
                </div>
            </div>
            `;
}

// Integração com formulário (assumindo ids existentes)
document.getElementById('forgeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const estilo = document.getElementById('estilo').value;
    const alma = parseInt(document.getElementById('alma').value) || 0;
    const blocosDano = parseInt(document.getElementById('dano').value) || 0;
    const blocosDefesa = parseInt(document.getElementById('defesa').value) || 0;
    const blocosVitalidade = parseInt(document.getElementById('vitalidade').value) || 0;
    const blocosDuracao = parseInt(document.getElementById('duracao').value) || 0;
    // Novos campos para eficiência
    const vontadePts = parseInt(document.getElementById('vontade')?.value) || 3;
    const espiritoPts = parseInt(document.getElementById('espirito')?.value) || 2;

    const stats = calcularStats({
        estilo, alma, blocosDano, blocosDefesa, blocosVitalidade, blocosDuracao,
        vontadePts, espiritoPts
    });
    document.getElementById('resultado').innerHTML = formatarSaida(stats);
});
