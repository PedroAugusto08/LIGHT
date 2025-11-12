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
  // Removido: teste rápido de ataque (ataque agora acontece com construtos na aba Forja)

  const defesaTotal = useMemo(() => SkillEngine.getDefesaTotal(), [state.almaMax, state.defesaBase, state.insano.activeRounds]);

  useEffect(() => {
    setState(SkillEngine.getState());
    
    // Listener para sincronizar quando o localStorage mudar externamente (ex: ataque consumiu Fúria)
    const syncFromStorage = () => {
      setState(SkillEngine.getState());
    };
    window.addEventListener('storage', syncFromStorage);
    
    // Listener customizado para mudanças na mesma aba/janela
    const syncLocal = (e) => {
      if (e.detail === 'skills_state_changed') {
        setState(SkillEngine.getState());
      }
    };
    window.addEventListener('skills_state_changed', syncLocal);
    
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('skills_state_changed', syncLocal);
    };
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
    if (!res.ok) {
      setLastMsg(res.reason);
    } else {
      setState(res.state);
      setLastMsg('Fúria Ancestral armada para o próximo ataque.');
      
      // Abrir modal estilizado
      if (typeof window !== 'undefined' && window.createModal) {
        const modalContent = window.createModal('⚔️ Fúria Ancestral');
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 4em; margin-bottom: 16px;">⚔️</div>
            <h2 style="color: var(--accent); margin-bottom: 16px; font-size: 1.8em;">Fúria Ancestral Ativada!</h2>
            <p style="font-size: 1.05em; margin-bottom: 20px; line-height: 1.6; color: var(--muted); font-style: italic;">
              "Ao canalizar a força de seus ancestrais, você transforma sua próxima ofensiva em pura destruição."
            </p>
            <div style="background: var(--surface-2); padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent); margin: 20px 0;">
              <h3 style="color: var(--accent); margin-bottom: 16px; font-size: 1.3em;">Efeitos do Próximo Ataque:</h3>
              <ul style="text-align: left; list-style: none; padding: 0;">
                <li style="padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 1.1em;">
                  💥 <strong style="color: #ef4444;">+100% de dano</strong> (dano dobrado)
                </li>
                <li style="padding: 12px 0; font-size: 1.1em;">
                  🎯 <strong style="color: var(--accent);">+15 de soma fixa</strong> no teste de acerto
                </li>
              </ul>
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3); margin-top: 16px;">
              <p style="color: #fca5a5; font-size: 0.95em; margin: 0;">
                ⚠️ <strong>Custo:</strong> 15 Alma | A Fúria será consumida automaticamente no próximo ataque.
              </p>
            </div>
          </div>
        `;
      }
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

  // Sem simulador de ataque aqui

  return (
    <div className="main-flex">
      {/* Coluna esquerda: formulário de estado e ações */}
      <div className="container">
        <h2 style={{textAlign:'center', marginBottom: 6}}>Habilidades</h2>
        <p style={{color:'var(--muted)', fontSize:'0.95em', marginBottom: 16, textAlign:'center'}}>
          Gerencie suas habilidades ativas e seus efeitos em combate.
        </p>

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

        {/* Removido bloco de Testes rápidos — ataque */}
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
