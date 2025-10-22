import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import SkillEngine from '../lib/skills/engine';

// UI simples, auto-contida. Para usar, importe e coloque <SkillsWidget /> em qualquer página.
// Não interfere no fluxo atual.

function NumberField({ label, value, onChange, min = 0 }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
      <span>{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #444', background: '#0b0b0b', color: '#eaeaea' }}
      />
    </label>
  );
}

function Pill({ children, tone = 'neutral' }) {
  const colors = {
    neutral: ['#222', '#999'],
    success: ['#0f3', '#040'],
    warn: ['#ffb400', '#663c00'],
    danger: ['#e0565b', '#5a1d20'],
    info: ['#4db2ff', '#003b66'],
  };
  const [bg, fg] = colors[tone] || colors.neutral;
  return (
    <span style={{ background: bg, color: fg, padding: '2px 8px', borderRadius: 999, fontSize: 12, border: '1px solid #333' }}>
      {children}
    </span>
  );
}

const SkillsWidget = () => {
  const [state, setState] = useState(SkillEngine.getState());
  const [lastMsg, setLastMsg] = useState(null);
  // Estados de teste rápido
  const [testDamageIn, setTestDamageIn] = useState(50);
  const [testVitMaxAlvo, setTestVitMaxAlvo] = useState(200);
  const [testBlockSuccess, setTestBlockSuccess] = useState(true);
  const [lastInRes, setLastInRes] = useState(null);
  const [testBaseDamage, setTestBaseDamage] = useState(100);
  const [testFixedSum, setTestFixedSum] = useState(0);
  const [lastOutRes, setLastOutRes] = useState(null);

  const defesaTotal = useMemo(() => SkillEngine.getDefesaTotal(), [state.alma, state.defesaBase, state.insano.activeRounds]);

  useEffect(() => {
    // sincronia inicial do estado
    setState(SkillEngine.getState());
  }, []);

  const updateField = (field) => (val) => {
    const next = SkillEngine.setState({ [field]: val });
    setState(next);
  };

  function onActivateInsano() {
    const res = SkillEngine.activateInsano();
    if (!res.ok) {
      setLastMsg({ tone: 'warn', text: res.reason });
    } else {
      setState(res.state);
      setLastMsg({ tone: 'success', text: `Insano & Forte ativado por ${res.duration} rodada(s).` });
    }
  }

  function onAdvanceRound() {
    const res = SkillEngine.advanceRound();
    setState(res.state);
    if (res.changes.enteredCooldown) {
      setLastMsg({ tone: 'info', text: `Insano & Forte terminou. Recarga: ${res.changes.enteredCooldown} rodada(s).` });
    } else {
      setLastMsg({ tone: 'neutral', text: 'Rodada avançada.' });
    }
  }

  function onArmFuria() {
    const res = SkillEngine.armFuria();
    if (!res.ok) {
      setLastMsg({ tone: 'warn', text: res.reason });
    } else {
      setState(res.state);
      setLastMsg({ tone: 'success', text: 'Fúria Ancestral armada para o próximo ataque.' });
    }
  }

  function onTestIncoming() {
    const res = SkillEngine.processIncomingPhysical({
      damage: Number(testDamageIn) || 0,
      isBlockSuccess: Boolean(testBlockSuccess),
      targetMaxVitalidade: Number(testVitMaxAlvo) || 0,
    });
    setState(res.state);
    setLastInRes(res);
    setLastMsg({ tone: 'neutral', text: 'Teste: dano físico recebido processado.' });
  }

  function onTestOutgoing() {
    const res = SkillEngine.processOutgoingAttack({
      baseDamage: Number(testBaseDamage) || 0,
      fixedSum: Number(testFixedSum) || 0,
    });
    setState(res.state);
    setLastOutRes(res);
    setLastMsg({ tone: res.consumed ? 'info' : 'neutral', text: res.consumed ? 'Fúria consumida no ataque.' : 'Ataque normal (Fúria não estava armada).' });
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Módulo de Habilidades</div>

      <div style={styles.grid}>
        <NumberField label="Alma atual" value={state.alma} onChange={updateField('alma')} />
        <NumberField label="Vitalidade Máxima" value={state.maxVitalidade} onChange={updateField('maxVitalidade')} min={1} />
        <NumberField label="Defesa base" value={state.defesaBase} onChange={updateField('defesaBase')} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={styles.btn} onClick={onActivateInsano}>Ativar Insano & Forte (-15 Alma)</button>
        <button style={styles.btn} onClick={onAdvanceRound}>Avançar Rodada</button>
        <button style={styles.btn} onClick={onArmFuria}>Armar Fúria Ancestral (-15 Alma)</button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Pill tone={state.insano.activeRounds > 0 ? 'success' : 'neutral'}>
          Insano ativo: {state.insano.activeRounds}r
        </Pill>
        <Pill tone={state.insano.cooldownRounds > 0 ? 'info' : 'neutral'}>
          Recarga: {state.insano.cooldownRounds}r
        </Pill>
        <Pill tone={state.furyPrimed ? 'danger' : 'neutral'}>
          Fúria: {state.furyPrimed ? 'ARMADA' : '—'}
        </Pill>
        <Pill tone="neutral">Defesa total: {defesaTotal}</Pill>
        <Pill tone="neutral">Bônus defesa: {defesaTotal - state.defesaBase}</Pill>
      </div>

      <div style={styles.hint}>
        Passivos: Dano físico recebido -25%. Bloqueio bem-sucedido: cura 1d8+2 Alma.
      </div>

      {lastMsg && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <Pill tone={lastMsg.tone}>{lastMsg.text}</Pill>
        </div>
      )}

      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: 'pointer' }}>Integração rápida (APIs) e testes</summary>
        <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>
          <ul style={{ paddingLeft: 18 }}>
            <li>processIncomingPhysical({`{ damage, isBlockSuccess, targetMaxVitalidade }`}) → {`{ damageAfter, almaHeal, extraDirectDamageToTarget }`}</li>
            <li>processOutgoingAttack({`{ baseDamage, fixedSum }`}) → {`{ damage, fixedSum, consumed }`}</li>
            <li>getAdditionalDefense() → bônus dinâmico enquanto Insano ativo.</li>
          </ul>

          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #333', display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Testes rápidos</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 6, alignItems: 'end' }}>
              <NumberField label="Dano recebido" value={testDamageIn} onChange={setTestDamageIn} />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                <span>Bloqueio bem-sucedido?</span>
                <select value={testBlockSuccess ? '1' : '0'} onChange={(e) => setTestBlockSuccess(e.target.value === '1')} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #444', background: '#0b0b0b', color: '#eaeaea' }}>
                  <option value="1">Sim</option>
                  <option value="0">Não</option>
                </select>
              </label>
              <NumberField label="Vit. Máx. do alvo" value={testVitMaxAlvo} onChange={setTestVitMaxAlvo} min={0} />
              <button style={styles.btn} onClick={onTestIncoming}>Simular bloqueio</button>
            </div>

            {lastInRes && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                <Pill tone="neutral">Dano após passivo: {lastInRes.damageAfter}</Pill>
                <Pill tone={lastInRes.almaHeal > 0 ? 'success' : 'neutral'}>Cura de Alma: {lastInRes.almaHeal}</Pill>
                <Pill tone={lastInRes.extraDirectDamageToTarget > 0 ? 'danger' : 'neutral'}>Dano direto ao alvo: {lastInRes.extraDirectDamageToTarget}</Pill>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, alignItems: 'end' }}>
              <NumberField label="Dano base do ataque" value={testBaseDamage} onChange={setTestBaseDamage} />
              <NumberField label="Soma fixa" value={testFixedSum} onChange={setTestFixedSum} />
              <button style={styles.btn} onClick={onTestOutgoing}>Simular ataque</button>
            </div>

            {lastOutRes && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                <Pill tone="neutral">Dano final: {lastOutRes.damage}</Pill>
                <Pill tone="neutral">Soma fixa final: {lastOutRes.fixedSum}</Pill>
                <Pill tone={lastOutRes.consumed ? 'info' : 'neutral'}>Fúria consumida? {lastOutRes.consumed ? 'Sim' : 'Não'}</Pill>
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 1000,
    width: 320,
    background: 'rgba(10,10,10,0.92)',
    backdropFilter: 'blur(6px)',
    border: '1px solid #333',
    borderRadius: 12,
    boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
    padding: 12,
    color: '#eaeaea',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial, sans-serif',
  },
  header: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    marginBottom: 10,
  },
  btn: {
    padding: '8px 10px',
    background: '#1a1a1a',
    color: '#eaeaea',
    border: '1px solid #444',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
  },
  hint: { fontSize: 11, color: '#aaa', marginTop: 8 },
};

// Export com no-SSR para evitar acesso a window no lado do servidor
export default dynamic(() => Promise.resolve(SkillsWidget), { ssr: false });
