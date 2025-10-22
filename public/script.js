// Guard contra execução múltipla em ambiente Next (Fast Refresh, re-montagem)
(function(){
if (window.__LIGHT_SCRIPT_CORE_LOADED__) return; // já rodou
window.__LIGHT_SCRIPT_CORE_LOADED__ = true;

// --- Abas ---
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.style.display = 'none');
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).style.display = 'flex';
        });
    });
    // Exibe a aba inicial
    document.getElementById('tab-forja').style.display = 'flex';
});

// --- Histórico de Alma Gasta ---
// entrada: { data, alma, params: {...}, results: {...} }
function salvarHistoricoConstruto(entry) {
    try {
        let hist = JSON.parse(localStorage.getItem('historicoAlma') || '[]');
        if (!Array.isArray(hist)) hist = [];
        hist.push(entry);
        // Limite máximo de 20 (remove os mais antigos)
        if (hist.length > 20) {
            hist = hist.slice(-20);
        }
        localStorage.setItem('historicoAlma', JSON.stringify(hist));
    } catch (e) {
        console.error('Erro ao salvar histórico:', e);
    }
}

function renderizarHistorico() {
    const hist = JSON.parse(localStorage.getItem('historicoAlma') || '[]');
    const listDiv = document.getElementById('historico-list');
    const totalDiv = document.getElementById('historico-total');
    const clearBtn = document.getElementById('limparHistoricoBtn');
    if (!listDiv || !totalDiv) return;
    if (!Array.isArray(hist) || hist.length === 0) {
        listDiv.innerHTML = '<em>Nenhum construto registrado ainda.</em>';
        totalDiv.textContent = '';
        if (clearBtn) clearBtn.disabled = true;
        return;
    }

    // Monta cards
    listDiv.innerHTML = '';
    let soma = 0;
    hist.forEach((item, i) => {
        const idx = i + 1;
        const alma = item.alma ?? item.results?.almaTotal ?? 0;
        soma += alma;
        const data = item.data || '';
        const params = item.params || {};
        const results = item.results || {};

        const card = document.createElement('div');
        card.className = 'history-card';

        const header = document.createElement('div');
        header.className = 'history-header';
        header.innerHTML = `
            <span class="history-title">Construto #${idx} — <strong>${alma}</strong> de Alma</span>
            <span class="history-date">${data}</span>
            <span class="history-caret" aria-hidden="true"></span>
        `;

        const body = document.createElement('div');
        body.className = 'history-body';

        // Conteúdo do body (principais infos)
        const estilo = results.estilo || params.estilo || '-';
        const dano = results.danoFinal ?? '-';
        const def = results.defesaFinal ?? '-';
        const hp = results.hpFinal ?? '-';
        const dur = results.duracaoFinal ?? '-';
        const efData = results.resultadoEf;
        const ef = efData && typeof efData.totalRoll === 'number'
            ? `${efData.faixa} (x${efData.efMul}) — Total: ${efData.totalRoll}`
            : '-';

        body.innerHTML = `
            <div class="history-grid">
                <div><strong>Estilo:</strong> ${estilo}</div>
                <div><strong>Alma total:</strong> ${alma}</div>
                <div><strong>Dano:</strong> ${dano}</div>
                <div><strong>Defesa:</strong> ${def}</div>
                <div><strong>HP:</strong> ${hp}</div>
                <div><strong>Duração:</strong> ${dur} turno(s)</div>
                <div><strong>Eficiência:</strong> ${ef}</div>
            </div>
            <div class="history-actions">
                <button class="reforjar-btn" data-index="${i}">Reforjar</button>
            </div>
        `;

        header.addEventListener('click', () => {
            card.classList.toggle('open');
        });

        card.appendChild(header);
        card.appendChild(body);
        listDiv.appendChild(card);
    });

    totalDiv.textContent = `Total de Alma Gasta: ${soma}`;
    if (clearBtn) clearBtn.disabled = false;

    // Ligações dos botões Reforjar
    listDiv.querySelectorAll('.reforjar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            reforjarConstruto(index);
        });
    });
}

// Limpar histórico
document.addEventListener('DOMContentLoaded', () => {
    const clearBtn = document.getElementById('limparHistoricoBtn');
    if (!clearBtn) return;
    clearBtn.addEventListener('click', () => {
        let hist = JSON.parse(localStorage.getItem('historicoAlma') || '[]');
        if (!Array.isArray(hist) || hist.length === 0) return;
        const ok = confirm('Tem certeza que deseja limpar todo o histórico de construtos?');
        if (!ok) return;
        localStorage.removeItem('historicoAlma');
        renderizarHistorico();
    });
});

function reforjarConstruto(index) {
    const hist = JSON.parse(localStorage.getItem('historicoAlma') || '[]');
    if (!Array.isArray(hist) || !hist[index]) return;
    const entry = hist[index];
    const params = entry.params || {};

    // Preenche formulário e aplica alocações
    const estiloSel = document.getElementById('estilo');
    const almaExtraInput = document.getElementById('almaExtra');
    const danoInp = document.getElementById('dano');
    const defInp = document.getElementById('defesa');
    const vitInp = document.getElementById('vitalidade');
    const durInp = document.getElementById('duracao');

    if (estiloSel && params.estilo) estiloSel.value = params.estilo;
    if (almaExtraInput && typeof params.almaExtra === 'number') almaExtraInput.value = params.almaExtra;

    // Dispara atualização para recalcular limites e barras
    almaExtraInput && almaExtraInput.dispatchEvent(new Event('input'));

    if (typeof params.blocosDano === 'number') danoInp.value = params.blocosDano;
    if (typeof params.blocosDefesa === 'number') defInp.value = params.blocosDefesa;
    if (typeof params.blocosVitalidade === 'number') vitInp.value = params.blocosVitalidade;
    if (typeof params.blocosDuracao === 'number') durInp.value = params.blocosDuracao;

    // Dispara inputs para sincronizar sliders/barras
    ;[danoInp, defInp, vitInp, durInp].forEach(inp => inp && inp.dispatchEvent(new Event('input')));

    // Vontade/Espírito (se existirem campos)
    const vontadeField = document.getElementById('vontade');
    const espiritoField = document.getElementById('espirito');
    if (vontadeField && typeof params.vontadePts === 'number') vontadeField.value = params.vontadePts;
    if (espiritoField && typeof params.espiritoPts === 'number') espiritoField.value = params.espiritoPts;

    // Troca para aba Forja
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(b => b.classList.remove('active'));
    const forjaBtn = document.querySelector('.tab-btn[data-tab="forja"]');
    forjaBtn && forjaBtn.classList.add('active');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(p => p.style.display = 'none');
    const forjaPane = document.getElementById('tab-forja');
    if (forjaPane) forjaPane.style.display = 'flex';

    // Submete o formulário para refazer os cálculos e salvar novamente no histórico
    const form = document.getElementById('forgeForm');
    if (form) form.dispatchEvent(new Event('submit'));
}

document.addEventListener('DOMContentLoaded', function() {
    renderizarHistorico();
    // Atualiza histórico ao abrir aba
    const histBtn = document.querySelector('.tab-btn[data-tab="historico"]');
    if (histBtn) {
        histBtn.addEventListener('click', renderizarHistorico);
    }
});
// --- Controle de blocos disponíveis e inputs ---
document.addEventListener('DOMContentLoaded', function() {
    const almaExtraInput = document.getElementById('almaExtra');
    const inputs = [
        document.getElementById('dano'),
        document.getElementById('defesa'),
        document.getElementById('vitalidade'),
        document.getElementById('duracao')
    ];
    const sliders = [
        document.getElementById('danoSlider'),
        document.getElementById('defesaSlider'),
        document.getElementById('vitalidadeSlider'),
        document.getElementById('duracaoSlider'),
    ];
    const bars = [
        document.getElementById('danoBar'),
        document.getElementById('defesaBar'),
        document.getElementById('vitalidadeBar'),
        document.getElementById('duracaoBar'),
    ];
    const blocosInfo = document.getElementById('blocos-info');

    function getMaxBlocos() {
        const almaExtra = parseInt(almaExtraInput.value) || 0;
        return Math.floor(almaExtra / 2);
    }

    function sumValues() {
        const valores = inputs.map(inp => parseInt(inp.value) || 0);
        return valores.reduce((a, b) => a + b, 0);
    }

    function clampAllocation(idx, desired) {
        const max = getMaxBlocos();
        const currentValues = inputs.map(inp => parseInt(inp.value) || 0);
        const others = sumValues() - currentValues[idx];
        const allowed = Math.max(0, Math.min(desired, max - others));
        return allowed;
    }

    function renderBars(max) {
        bars.forEach((bar, i) => {
            if (!bar) return;
            // padrão: até 10 slots; escala conforme o 'max'
            bar.innerHTML = '';
            if (max <= 0) {
                // Célula placeholder única quando não há slots disponíveis
                bar.style.gridTemplateColumns = `repeat(1, 22px)`;
                return; // nothing to render when no slots available
            }
            // Garante que o CSS controle o layout (grid que quebra); remove qualquer override inline
            bar.style.gridTemplateColumns = '';
            // Reinicia posição de scroll anterior por precaução
            bar.scrollLeft = 0;
            const slots = max;
            const val = parseInt(inputs[i].value) || 0;
            const valoresAll = inputs.map(inp => parseInt(inp.value) || 0);
            const somaAll = valoresAll.reduce((a,b)=>a+b,0);
            const outros = somaAll - val;
            const allowedMaxValue = val + Math.max(0, max - outros);
            for (let s = 0; s < slots; s++) {
                const chip = document.createElement('div');
                let cls = 'block-chip';
                if (s < val) cls += ' filled';
                if ((s+1) > allowedMaxValue) cls += ' disabled';
                chip.className = cls;
                chip.dataset.slot = s + 1; // quantidade intencional indexada a partir de 1
                // O handler de clique tentará definir o valor deste atributo para chip.dataset.slot
                chip.addEventListener('click', () => {
                    const current = parseInt(inputs[i].value) || 0;
                    let desired = parseInt(chip.dataset.slot);
                    // Toggle down if clicking the same filled slot
                    if (desired === current) desired = desired - 1;
                    const allowed = clampAllocation(i, desired);
                    inputs[i].value = allowed;
                    sliders[i].value = allowed;
                    updateBlocos();
                });
                bar.appendChild(chip);
            }
        });
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

        // Atualiza sliders sincronizados e seus limites
        sliders.forEach((sl, idx) => {
            if (!sl) return;
            const outros = soma - valores[idx];
            sl.max = Math.max(0, max - outros) + valores[idx]; // permite diminuir e aumentar até o limite
            sl.value = valores[idx];
            // Desabilita criação além do teto; permite apenas realocação (via redução primeiro)
            const shouldDisable = (soma >= max && valores[idx] === 0);
            sl.disabled = shouldDisable;
            sl.classList.toggle('disabled', shouldDisable);
        });

    // Renderiza os chips e o estado filled
        renderBars(max);
    }

    almaExtraInput.addEventListener('input', function() {
        // Zera blocos se alma mudar
        inputs.forEach(inp => inp.value = 0);
        sliders.forEach(sl => sl && (sl.value = 0));
        updateBlocos();
    });
    inputs.forEach((inp, idx) => {
        inp.addEventListener('input', () => {
            const desired = parseInt(inp.value) || 0;
            const allowed = clampAllocation(idx, desired);
            if (allowed !== desired) inp.value = allowed;
            sliders[idx].value = allowed;
            updateBlocos();
        });
    });
    sliders.forEach((sl, idx) => {
        if (!sl) return;
        sl.addEventListener('input', () => {
            const desired = parseInt(sl.value) || 0;
            const allowed = clampAllocation(idx, desired);
            inputs[idx].value = allowed;
            if (allowed !== desired) sl.value = allowed;
            updateBlocos();
        });
    });
    updateBlocos();
});

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
    // totalRoll INCLUI o bônus fixo +12
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
    almaExtra,
    blocosDano,
    blocosDefesa,
    blocosVitalidade,
    blocosDuracao,
    vontadePts,
    espiritoPts,
    } = params;

    // Cálculo dos blocos EXTRAS a partir da Alma Extra (base = 6)
    // O campo agora é almaExtra, e a alma total é 6 + almaExtra
    const almaTotal = 6 + (parseInt(almaExtra) || 0);
    const blocosExtras = Math.floor((parseInt(almaExtra) || 0) / 2);

  // Para compatibilidade, caso o usuário informe um número de blocos "manualmente",
  // você pode querer somar blocosExtras + blocosDano etc. Aqui blocosDano é o que o usuário alocou.
  const { Md, Mh, Mt } = multiplicadores[estilo] || multiplicadores["Padrão"];

// --- DANO (separado para o momento do ataque)
// Agora NÃO rolamos dano na forja. Apenas definimos a "receita" do dano.
// Receita: grupos de 2d6 (2 base + blocosDano), multiplicador Md e um bônus de Luz estático (1d10%) definido na forja.
const diceGroups2d6 = 2 + Math.max(0, blocosDano);
const bonusLuz = rolarDado(1, 10); // percentual 1..10, fixado na forja
const bonusLuzPercent = bonusLuz.total;

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
// Forja usa Vontade + Espírito para eficiência (HP/Duração). Não se aplica ao dano aqui.
const resultadoEf = rollEficiência(vontadePts || 0, espiritoPts || 0, blocosExtras);
const efMul = resultadoEf.efMul;

// --- Aplicar eficiência (em floats)
// Atenção: eficiência NÃO é aplicada ao dano na forja (agora fica para o ataque).
let hpFinalFloat = hpAntesEficienciaFloat * efMul;
let duracaoFinalFloat = duracaoAntesEficienciaFloat * efMul;

// --- Arredondar apenas uma vez, no final
let hpFinal = Math.round(hpFinalFloat);
let duracaoFinal = Math.round(duracaoFinalFloat);
let defesaFinal = Math.round(defesaFloat); // DEF não usa eficiência, mas arredondamos o resultado final

  return {
    estilo,
    almaExtra,
    almaTotal,
    blocosExtras,
    blocosDano,
    blocosDefesa,
    blocosVitalidade,
    blocosDuracao,
    vontadePts,
    espiritoPts,
    Md,
        bonusLuz: bonusLuz.rolls[0],
        danoRecipe: { diceGroups2d6, Md, bonusLuzPercent },
    defesaFinal,
    hpAntesEficienciaFloat,
    hpFinal,
    duracaoAntesEficienciaFloat,
    duracaoFinal,
    resultadoEf,
  };
}

// Formata a saída para exibição
function formatarSaida(stats) {
    const ef = stats.resultadoEf;
                        // Dano: agora rolado no momento do ataque
                        let rolagemDano = `<strong>Dano:</strong> <em>rolado no ataque</em><div style='margin:6px 0 10px 0;'>
                            Receita: <code>${stats.danoRecipe.diceGroups2d6}×(2d6)</code>
                            × <strong>Md</strong> (${stats.Md})
                            × <strong>(1 + ${stats.danoRecipe.bonusLuzPercent}% Luz)</strong>
                        </div>`;

            // Teste de eficiência detalhado
            let rolagemEf = `<strong>Teste de Eficiência</strong><ul style='margin:6px 0 10px 18px;padding:0;'>`;
            rolagemEf += `<li>1d20: <span style='color:#1976d2'>${ef.parts.d20}</span></li>`;
                        rolagemEf += `<li>Vontade (${stats.vontadePts}d12): <span style='color:#388e3c'>[${ef.parts.vontade.rolls.join(', ')}]</span> = <strong>${ef.parts.vontade.total}</strong></li>`;
                        if ((stats.espiritoPts|0) > 0) {
                            rolagemEf += `<li>Espírito (${stats.espiritoPts}d6): <span style='color:#fbc02d'>[${ef.parts.espirito.rolls.join(', ')}]</span> = <strong>${ef.parts.espirito.total}</strong></li>`;
                        }
            rolagemEf += `<li>Bônus fixo: <strong>+12</strong></li>`;
            rolagemEf += `<li>Total: <strong>${ef.totalRoll}</strong></li>`;
            rolagemEf += `<li>Shift: <strong>${ef.shift}</strong></li>`;
            rolagemEf += `<li>Faixa: <strong>${ef.faixa}</strong> (efMul=${ef.efMul})</li>`;
            rolagemEf += `</ul>`;

            let efeitoEf = `<em style='color:#888;'>(Eficiência aplicada em Dano, HP e Duração)</em>`;

                const ataqueBtnId = `btnAtacar_${Date.now()}`;
                return `
                <div class="result-container">
                    <div class="result-main">
                        <strong>Estilo:</strong> ${stats.estilo}<br>
                        <strong>Alma Extra:</strong> ${stats.almaExtra} (blocos extras gerados: ${stats.blocosExtras})<br>
                        <strong>Alma total gasta:</strong> ${stats.almaTotal}<br>
                        <strong>Dano:</strong> — (rolado no ataque) <br>
                        <strong>Defesa:</strong> ${stats.defesaFinal} <br>
                        <strong>HP:</strong> ${stats.hpFinal} <br>
                        <strong>Duração:</strong> ${stats.duracaoFinal} turno(s)<br>
                        <div style="margin-top:10px;">
                          <button type="button" class="reforjar-btn" id="${ataqueBtnId}">Atacar com este Construto (FULGOR + ESPÍRITO)</button>
                        </div>
                    </div>
                    <div class="result-details">
                        ${rolagemDano}
                        <hr class="section-divider">
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
    const almaExtra = parseInt(document.getElementById('almaExtra').value) || 0;
    const blocosDano = parseInt(document.getElementById('dano').value) || 0;
    const blocosDefesa = parseInt(document.getElementById('defesa').value) || 0;
    const blocosVitalidade = parseInt(document.getElementById('vitalidade').value) || 0;
    const blocosDuracao = parseInt(document.getElementById('duracao').value) || 0;
    // Novos campos para eficiência
    const vontadePts = parseInt(document.getElementById('vontade')?.value) || 3;
    const espiritoPts = parseInt(document.getElementById('espirito')?.value) || 2;

    const stats = calcularStats({
        estilo, almaExtra, blocosDano, blocosDefesa, blocosVitalidade, blocosDuracao,
        vontadePts, espiritoPts
    });
    const resEl = document.getElementById('resultadoContent') || document.getElementById('resultado');
    if (resEl) {
                resEl.innerHTML = formatarSaida(stats);
                // Bind do botão de ataque para este resultado
                        const btn = resEl.querySelector('button[id^="btnAtacar_"]');
                        if (btn) {
                            // Desabilita após o primeiro clique; só reativa ao forjar novamente (novo botão)
                            btn.addEventListener('click', function(){
                                executarAtaqueDoConstruto(stats, btn);
                            }, { once: true });
                        }
    }
    // Salvar histórico completo (params + results), limite 20 na função
    salvarHistoricoConstruto({
        data: new Date().toLocaleString(),
        alma: stats.almaTotal,
        params: { estilo, almaExtra, blocosDano, blocosDefesa, blocosVitalidade, blocosDuracao, vontadePts, espiritoPts },
        results: stats
    });
});

// --- Execução do ataque do construto ---
function executarAtaqueDoConstruto(stats, btnEl) {
    try {
        const { diceGroups2d6, Md, bonusLuzPercent } = stats.danoRecipe || {};
        if (!diceGroups2d6 || !Md) throw new Error('Receita de dano inválida/ausente. Reforje o construto.');
        const efMul = (stats && stats.resultadoEf && typeof stats.resultadoEf.efMul === 'number') ? stats.resultadoEf.efMul : 1.0;

        // Marca o botão como usado/indisponível a partir de agora
        if (btnEl) {
            try {
                btnEl.disabled = true;
                btnEl.style.opacity = '0.6';
                btnEl.style.cursor = 'not-allowed';
                btnEl.setAttribute('aria-disabled', 'true');
                btnEl.title = 'Ataque já executado para este construto';
                // feedback de ação
                const prevText = btnEl.textContent;
                if (prevText && !/executado/i.test(prevText)) {
                    btnEl.textContent = 'Ataque executado';
                }
            } catch(_) {}
        }

        // Rola dano base: N × (2d6)
        let base = 0; let detalhes = [];
        for (let i = 0; i < diceGroups2d6; i++) {
            const r = rolarDado(2, 6);
            base += r.total; detalhes.push(r.rolls.join(' + '));
        }
        // Multiplicador e bônus de luz
        const mult = Md;
        const luz = 1 + (Math.max(0, bonusLuzPercent|0) / 100);
        let danoFloat = base * mult * luz * efMul; // Eficiência influencia o DANO também
        let dano = Math.round(danoFloat);

        // Aplicar Fúria Ancestral se armada (usa localStorage do módulo de habilidades)
        // Regra correta: +100% no dano (×2) e +15 NO TESTE DE ATAQUE (não no dano)
        let furiaConsumida = false;
        try {
            const raw = localStorage.getItem('skills_state_v1');
            if (raw) {
                const s = JSON.parse(raw);
                if (s && s.furyPrimed) {
                    dano = Math.floor(dano * 2); // apenas dobra o dano
                    s.furyPrimed = false; // consome
                    localStorage.setItem('skills_state_v1', JSON.stringify(s));
                    furiaConsumida = true;
                }
            }
        } catch(_) {}

        // Teste de acerto automático (Perícia: FULGOR, Atributo: ESPÍRITO)
        let hitInfo = {
            d20: { roll: 0 },
            atributo: { nome: 'ESPÍRITO', qty: 0, faces: 6, rolls: [], total: 0 },
            pericia: { nome: 'FULGOR', qty: 1, faces: 10, rolls: [], total: 0, perito: false },
            bonusFixo: 0,
            furiaBonus: 0,
            total: 0
        };
        try {
            const rules = (typeof window !== 'undefined' && window.__LIGHT_RULES) ? window.__LIGHT_RULES : null;
            const ATR = rules && rules.ATRIBUTOS ? rules.ATRIBUTOS : {};
            const PQ = rules && rules.PERICIAS_QTD ? rules.PERICIAS_QTD : {};
            const PB = rules && rules.PERICIAS_BONUS_FIXO ? rules.PERICIAS_BONUS_FIXO : {};
            const PP = rules && rules.PERICIAS_PERITO ? rules.PERICIAS_PERITO : {};
            // Quantidades
            const qtdAtr = (ATR['ESPÍRITO'] ?? ATR['ESPIRITO'] ?? 0) | 0;
            // Se não houver mapeado, usa 1 como fallback conservador para perícia
            const qtdPer = (typeof PQ['FULGOR'] === 'number') ? PQ['FULGOR'] : 1;
            const bonusFixo = (PB['FULGOR']|0);
            // perito definido no mapa fixo (PERICIAS_PERITO)
            let perito = !!PP['FULGOR'];
            const facesPer = perito ? 12 : 10;

            const d20h = rolarDado(1, 20);
            const rAtr = rolarDado(Math.max(0, qtdAtr), 6);
            const rPer = rolarDado(Math.max(0, qtdPer), facesPer);
            let totalHit = d20h.total + rAtr.total + rPer.total + bonusFixo;
            let furiaBonus = 0;
            if (furiaConsumida) {
                furiaBonus = 15;
                totalHit += furiaBonus;
            }

            hitInfo = {
                d20: { roll: d20h.rolls[0] },
                atributo: { nome: 'ESPÍRITO', qty: qtdAtr, faces: 6, rolls: rAtr.rolls, total: rAtr.total },
                pericia: { nome: 'FULGOR', qty: qtdPer, faces: facesPer, rolls: rPer.rolls, total: rPer.total, perito },
                bonusFixo,
                furiaBonus,
                total: totalHit
            };
        } catch(_) {}

        // Render do resultado do ataque dentro do container de detalhes já existente (sem criar novo "card")
        const resEl = document.getElementById('resultadoContent') || document.getElementById('resultado');
        if (resEl) {
            const detailsList = resEl.querySelectorAll('.result-container .result-details');
            const detailsEl = detailsList[detailsList.length - 1] || resEl;

            // Teste de Acerto — mesma estrutura/cores do Teste de Eficiência
            const hitBadge = hitInfo.furiaBonus ? ` <span class="furia-badge" style="display:inline-flex;margin-left:6px;padding:2px 6px;border-radius:999px;font-size:.85em;color:var(--text);background:linear-gradient(90deg,#f59e0b 0,#f97316 100%)">(com Fúria)</span>` : '';
            const hitHtml = `
                <hr class="section-divider">
                <strong>Teste de Acerto</strong>${hitBadge}
                <ul style='margin:6px 0 10px 18px;padding:0;'>
                    <li>1d20: <span style='color:#1976d2'>${hitInfo.d20.roll}</span></li>
                    <li>Espírito (${hitInfo.atributo.qty}d6): <span style='color:#fbc02d'>[${hitInfo.atributo.rolls.join(', ')}]</span> = <strong>${hitInfo.atributo.total}</strong></li>
                    <li>Fulgor (${hitInfo.pericia.qty}×d${hitInfo.pericia.faces}${hitInfo.pericia.perito ? ' • perito' : ''}): <span style='color:#388e3c'>[${hitInfo.pericia.rolls.join(', ')}]</span> = <strong>${hitInfo.pericia.total}</strong></li>
                    ${hitInfo.bonusFixo ? `<li>Bônus fixo: <strong>+${hitInfo.bonusFixo}</strong></li>` : ''}
                    ${hitInfo.furiaBonus ? `<li>Bônus Fúria: <strong>+${hitInfo.furiaBonus}</strong></li>` : ''}
                    <li>Total: <strong>${hitInfo.total}</strong></li>
                </ul>`;

            // Rolagem do Ataque — organização passo a passo
            const subtotal = Math.round(base * mult * luz * efMul);
            const danoHtml = `
                <strong>Rolagem do Ataque</strong>
                <ul style='margin:6px 0 10px 18px;padding:0;'>
                    <li>Base (${diceGroups2d6}×2d6): [${detalhes.join('] + [')}] = <strong>${base}</strong></li>
                    <li>Md: <strong>× ${mult}</strong></li>
                    <li>Luz: <strong>× (1 + ${bonusLuzPercent}%)</strong></li>
                    <li>Eficiência: <strong>× ${efMul}</strong></li>
                    <li>Subtotal: <strong>${subtotal}</strong></li>
                    ${furiaConsumida ? `<li>Fúria Ancestral (no dano): <strong>×2</strong></li>` : ''}
                    <li>Resultado: <strong>${dano}</strong></li>
                </ul>`;

            const wrap = document.createElement('div');
            wrap.innerHTML = hitHtml + danoHtml;
            detailsEl.appendChild(wrap);
            try { wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(_) {}
        }
    } catch (err) {
        alert('Não foi possível executar o ataque: ' + (err && err.message ? err.message : err));
    }
}

// Caret interativo dos selects: marca wrapper como 'open' quando focado e remove ao desfocar
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.select-wrapper select').forEach(sel => {
        const wrap = sel.closest('.select-wrapper');
        if (!wrap) return;
        sel.addEventListener('focus', () => wrap.classList.add('open'));
        sel.addEventListener('blur', () => wrap.classList.remove('open'));
        // click no wrapper foca o select
        wrap.addEventListener('click', () => sel.focus());
    });
});

})();
