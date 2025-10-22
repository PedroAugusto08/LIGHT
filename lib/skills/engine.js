// Skill Engine: estado e lógica das habilidades com persistência em localStorage
// API principal exportada abaixo. Não interfere em fluxo existente.

const STORAGE_KEY = 'skills_state_v1';

const defaultState = Object.freeze({
  alma: 30, // recurso atual
  maxVitalidade: 100, // Vitalidade Máxima (do personagem)
  defesaBase: 10, // Defesa base (antes de bônus temporários)
  insano: {
    activeRounds: 0, // rodadas restantes do efeito ativo
    cooldownRounds: 0, // rodadas restantes de recarga
  },
  furyPrimed: false, // se o próximo ataque está marcado
});

// Util: safe localStorage
function loadState() {
  if (typeof window === 'undefined') return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return { ...defaultState };
  }
}

function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function normalizeState(state) {
  const s = { ...defaultState, ...state };
  s.alma = toIntNonNeg(s.alma);
  s.maxVitalidade = Math.max(1, toIntNonNeg(s.maxVitalidade) || 1);
  s.defesaBase = toIntNonNeg(s.defesaBase);
  s.insano = {
    activeRounds: toIntNonNeg(state?.insano?.activeRounds) || 0,
    cooldownRounds: toIntNonNeg(state?.insano?.cooldownRounds) || 0,
  };
  s.furyPrimed = Boolean(state?.furyPrimed);
  return s;
}

function toIntNonNeg(n) {
  const v = Number.parseInt(n, 10);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

// Dice helpers
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollNdM(n, m) {
  let total = 0;
  for (let i = 0; i < n; i++) total += rollDie(m);
  return total;
}

// 1dX + add
function roll1dXPlus(x, add = 0) {
  return rollDie(x) + add;
}

// Engine singleton
const SkillEngine = (() => {
  let _state = loadState();

  function getState() {
    return { ..._state, insano: { ..._state.insano } };
  }

  function setState(partial) {
    _state = normalizeState({ ..._state, ...partial });
    saveState(_state);
    return getState();
  }

  function replaceState(newState) {
    _state = normalizeState(newState);
    saveState(_state);
    return getState();
  }

  function resetState() {
    _state = { ...defaultState };
    saveState(_state);
    return getState();
  }

  // Regras: Insano & Forte
  // Passivo: -25% dano físico recebido
  function applyPassiveIncomingPhysicalReduction(damage) {
    const dmg = Math.max(0, Math.floor(damage * 0.75));
    return dmg;
  }

  // Bônus de Defesa enquanto ativo: +1/4 da Alma atual (dinâmico)
  function getAdditionalDefense() {
    if (_state.insano.activeRounds > 0) {
      return Math.floor(_state.alma * 0.25);
    }
    return 0;
  }

  // Ativar Insano & Forte (custo 15 Alma): duração 1d6; ao terminar recarga 1d10+2
  function activateInsano() {
    const s = getState();
    if (s.insano.activeRounds > 0) return { ok: false, reason: 'Já está ativo.' };
    if (s.insano.cooldownRounds > 0) return { ok: false, reason: 'Em recarga.' };
    if (s.alma < 15) return { ok: false, reason: 'Alma insuficiente.' };

    const duration = rollDie(6); // 1d6
    _state.alma = Math.max(0, s.alma - 15);
    _state.insano.activeRounds = duration;
    saveState(_state);
    return { ok: true, duration, state: getState() };
  }

  // Avançar rodada: decrementa duração/recarga
  function advanceRound() {
    const prev = getState();
    let enteredCooldown = null;

    if (_state.insano.activeRounds > 0) {
      _state.insano.activeRounds -= 1;
      if (_state.insano.activeRounds <= 0) {
        _state.insano.activeRounds = 0;
        const cd = roll1dXPlus(10, 2); // 1d10 + 2
        _state.insano.cooldownRounds = cd;
        enteredCooldown = cd;
      }
    } else if (_state.insano.cooldownRounds > 0) {
      _state.insano.cooldownRounds = Math.max(0, _state.insano.cooldownRounds - 1);
    }

    saveState(_state);
    const curr = getState();
    return {
      state: curr,
      changes: {
        insanoActiveDelta: curr.insano.activeRounds - prev.insano.activeRounds,
        insanoCooldownDelta: curr.insano.cooldownRounds - prev.insano.cooldownRounds,
        enteredCooldown,
      },
    };
  }

  // Evento de defesa/bloqueio recebido:
  // - Aplica passivo (-25%) no dano físico
  // - Se bloqueio bem-sucedido: cura 1d8+2 de Alma
  // - Se Insano ativo: qualquer bloqueio causa 1d4% da Vitalidade Máxima do ALVO como dano direto
  function processIncomingPhysical({ damage, isBlockSuccess = false, targetMaxVitalidade }) {
    const before = getState();
    const damageAfter = applyPassiveIncomingPhysicalReduction(damage);

    let almaHeal = 0;
    if (isBlockSuccess) {
      almaHeal = roll1dXPlus(8, 2); // 1d8 + 2
      _state.alma = Math.max(0, before.alma + almaHeal);
    }

    let extraDirectDamageToTarget = 0;
    if (_state.insano.activeRounds > 0 && Number.isFinite(targetMaxVitalidade)) {
      const percent = rollDie(4); // 1 a 4 %
      extraDirectDamageToTarget = Math.floor((targetMaxVitalidade * percent) / 100);
    }

    saveState(_state);

    return {
      damageAfter,
      almaHeal,
      extraDirectDamageToTarget,
      state: getState(),
    };
  }

  // Fúria Ancestral (custo 15 Alma): marca próximo ataque
  function armFuria() {
    const s = getState();
    if (s.furyPrimed) return { ok: false, reason: 'Já está armada.' };
    if (s.alma < 15) return { ok: false, reason: 'Alma insuficiente.' };
    _state.alma = Math.max(0, s.alma - 15);
    _state.furyPrimed = true;
    saveState(_state);
    return { ok: true, state: getState() };
  }

  // Aplicar no próximo ataque: +100% dano (+15 fixo) e consome a marca, se houver.
  // baseDamage: número do dano calculado antes do multiplicador;
  // fixedSum: somatório fixo (ex.: bônus planos) antes do +15
  function processOutgoingAttack({ baseDamage, fixedSum = 0 }) {
    const s = getState();
    let damage = baseDamage;
    let sum = fixedSum;
    let consumed = false;

    if (s.furyPrimed) {
      damage = Math.floor(damage * 2); // +100%
      sum = sum + 15;
      _state.furyPrimed = false;
      consumed = true;
    }

    saveState(_state);
    return { damage, fixedSum: sum, consumed, state: getState() };
  }

  // Helper público: calcular Defesa total atual (base + bônus temporário)
  function getDefesaTotal() {
    return _state.defesaBase + getAdditionalDefense();
  }

  return {
    getState,
    setState,
    replaceState,
    resetState,

    // Insano & Forte
    activateInsano,
    advanceRound,
    getAdditionalDefense,
    applyPassiveIncomingPhysicalReduction,
    processIncomingPhysical,

    // Fúria Ancestral
    armFuria,
    processOutgoingAttack,

    // Outros
    getDefesaTotal,
  };
})();

export default SkillEngine;
