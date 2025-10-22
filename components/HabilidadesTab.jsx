import React, { useEffect, useMemo, useState } from 'react';
import SkillEngine from '../lib/skills/engine';

export default function HabilidadesTab() {
  const [state, setState] = useState(SkillEngine.getState());
  const [lastMsg, setLastMsg] = useState(null);

  // Testes rápidos
  const [testDamageIn, setTestDamageIn] = useState(50);
  const [testVitMaxAlvo, setTestVitMaxAlvo] = useState(200);
  const [testBlockSuccess, setTestBlockSuccess] = useState(true);
  const [lastInRes, setLastInRes] = useState(null);
  const [testBaseDamage, setTestBaseDamage] = useState(100);
  const [testFixedSum, setTestFixedSum] = useState(0);
  const [lastOutRes, setLastOutRes] = useState(null);

  const defesaTotal = useMemo(() => SkillEngine.getDefesaTotal(), [state.alma, state.defesaBase, state.insano.activeRounds]);

  useEffect(() => {
    setState(SkillEngine.getState());
  }, []);

  const updateField = (field) => (val) => {
    const next = SkillEngine.setState({ [field]: val });
    setState(next);
  };

  function onActivateInsano() {
    const res = SkillEngine.activateInsano();
    if (!res.ok) setLastMsg(res.reason);
    else {
      setState(res.state);
      setLastMsg(`Insano & Forte ativado por ${res.duration} rodada(s).`);
    }
  }

  function onAdvanceRound() {
    const res = SkillEngine.advanceRound();
    setState(res.state);
    if (res.changes.enteredCooldown) setLastMsg(`Insano & Forte terminou. Recarga: ${res.changes.enteredCooldown} rodada(s).`);
    else setLastMsg('Rodada avançada.');
  }

  function onArmFuria() {
    const res = SkillEngine.armFuria();
    if (!res.ok) setLastMsg(res.reason);
    else {
      setState(res.state);
      setLastMsg('Fúria Ancestral armada para o próximo ataque.');
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
  }

  function onTestOutgoing() {
    const res = SkillEngine.processOutgoingAttack({
      baseDamage: Number(testBaseDamage) || 0,
      fixedSum: Number(testFixedSum) || 0,
    });
    setState(res.state);
    setLastOutRes(res);
  }

  return (
    <div className="main-flex">
      {/* Coluna esquerda: formulário de estado e ações */}
      <div className="container">
        <h2 style={{textAlign:'center', marginBottom: 6}}>Habilidades</h2>
        <label>Alma atual</label>
        <input type="number" min={0} value={state.alma} onChange={(e)=>updateField('alma')(Number(e.target.value))} />

        <label>Vitalidade Máxima</label>
        <input type="number" min={1} value={state.maxVitalidade} onChange={(e)=>updateField('maxVitalidade')(Number(e.target.value))} />

        <label>Defesa base</label>
        <input type="number" min={0} value={state.defesaBase} onChange={(e)=>updateField('defesaBase')(Number(e.target.value))} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <button type="button" onClick={onActivateInsano}>Ativar Insano & Forte (-15 Alma)</button>
          <button type="button" onClick={onAdvanceRound}>Avançar Rodada</button>
          <button type="button" onClick={onArmFuria}>Armar Fúria Ancestral (-15 Alma)</button>
        </div>

        {lastMsg && (
          <div style={{ marginTop: 8, color: 'var(--muted)' }}>{lastMsg}</div>
        )}

        <hr className="section-divider" />
        <h3 className="result-heading">Testes rápidos — bloqueio</h3>
        <label>Dano recebido</label>
        <input type="number" min={0} value={testDamageIn} onChange={(e)=>setTestDamageIn(Number(e.target.value))} />

        <label>Bloqueio bem-sucedido?</label>
        <div>
          <label style={{ marginRight: 12 }}>
            <input type="radio" name="blk" checked={testBlockSuccess} onChange={()=>setTestBlockSuccess(true)} /> Sim
          </label>
          <label>
            <input type="radio" name="blk" checked={!testBlockSuccess} onChange={()=>setTestBlockSuccess(false)} /> Não
          </label>
        </div>

        <label>Vit. Máx. do alvo</label>
        <input type="number" min={0} value={testVitMaxAlvo} onChange={(e)=>setTestVitMaxAlvo(Number(e.target.value))} />

        <button type="button" onClick={onTestIncoming} style={{ marginTop: 8 }}>Simular bloqueio</button>

        {lastInRes && (
          <div style={{ marginTop: 8 }}>
            <div>Dano após passivo: <strong>{lastInRes.damageAfter}</strong></div>
            <div>Cura de Alma: <strong>{lastInRes.almaHeal}</strong></div>
            <div>Dano direto ao alvo: <strong>{lastInRes.extraDirectDamageToTarget}</strong></div>
          </div>
        )}

        <hr className="section-divider" />
        <h3 className="result-heading">Testes rápidos — ataque</h3>
        <label>Dano base do ataque</label>
        <input type="number" min={0} value={testBaseDamage} onChange={(e)=>setTestBaseDamage(Number(e.target.value))} />
        <label>Soma fixa</label>
        <input type="number" value={testFixedSum} onChange={(e)=>setTestFixedSum(Number(e.target.value))} />
        <button type="button" onClick={onTestOutgoing} style={{ marginTop: 8 }}>Simular ataque</button>

        {lastOutRes && (
          <div style={{ marginTop: 8 }}>
            <div>Dano final: <strong>{lastOutRes.damage}</strong></div>
            <div>Soma fixa final: <strong>{lastOutRes.fixedSum}</strong></div>
            <div>Fúria consumida? <strong>{lastOutRes.consumed ? 'Sim' : 'Não'}</strong></div>
          </div>
        )}
      </div>

      {/* Coluna direita: estado e indicadores */}
      <div className="result">
        <h2 className="card-title">Estado Atual</h2>
        <div className="result-col">
          <div className="result-heading">Insano & Forte</div>
          <div>Ativo por: <strong>{state.insano.activeRounds}</strong> rodada(s)</div>
          <div>Recarga: <strong>{state.insano.cooldownRounds}</strong> rodada(s)</div>
          <div className="result-heading">Fúria Ancestral</div>
          <div>Próximo ataque: <strong>{state.furyPrimed ? 'ARMADO' : '—'}</strong></div>
          <div className="result-heading">Defesa</div>
          <div>Defesa base: <strong>{state.defesaBase}</strong></div>
          <div>Bônus temporário: <strong>{defesaTotal - state.defesaBase}</strong></div>
          <div>Defesa total: <strong>{defesaTotal}</strong></div>
          <div className="result-heading">Passivos</div>
          <div>-25% de dano físico recebido; bloqueio bem-sucedido cura 1d8+2 de Alma.</div>
        </div>
      </div>
    </div>
  );
}
