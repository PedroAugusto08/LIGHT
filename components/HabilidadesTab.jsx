import React, { useEffect, useMemo, useState } from 'react';
import SkillEngine from '../lib/skills/engine';

export default function HabilidadesTab() {
  const [state, setState] = useState(SkillEngine.getState());
  const [lastMsg, setLastMsg] = useState(null);

  const defesaTotal = useMemo(() => SkillEngine.getDefesaTotal(), [state.almaMax, state.defesaBase, state.insano.activeRounds]);

  useEffect(() => {
    setState(SkillEngine.getState());
    
    // Listener para sincronizar quando o localStorage mudar externamente (ex: ataque consumiu Fúria)
    const syncFromStorage = () => {
      setState(SkillEngine.getState());
    };
    window.addEventListener('storage', syncFromStorage);
    
    // Listener customizado para mudanças na mesma aba/janela
    const syncLocal = () => {
      setState(SkillEngine.getState());
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
    // Verificar se tem Alma suficiente
    if (state.alma < 15) {
      setLastMsg('❌ Alma insuficiente! Necessário: 15 Alma');
      if (typeof window !== 'undefined' && window.createModal) {
        const modalContent = window.createModal('⚠️ Alma Insuficiente');
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 4em; margin-bottom: 16px;">⚠️</div>
            <h2 style="color: #ef4444; margin-bottom: 16px;">Alma Insuficiente</h2>
            <p style="font-size: 1.1em; line-height: 1.6;">
              Você precisa de <strong>15 Alma</strong> para ativar Insano & Forte.<br>
              Alma atual: <strong>${state.alma}</strong>
            </p>
          </div>
        `;
      }
      return;
    }

    const res = SkillEngine.activateInsano();
    if (!res.ok) {
      setLastMsg(res.reason);
    } else {
      setState(res.state);
      setLastMsg(`Insano & Forte ativado por ${res.duration} rodada(s).`);
      
      // Dispara eventos para sincronizar com outros componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skills_state_changed', { detail: res.state }));
        window.dispatchEvent(new Event('storage'));
      }
      
      // Abrir modal estilizado
      if (typeof window !== 'undefined' && window.createModal) {
        const defesaAdicional = Math.floor(res.state.almaMax / 4);
        const modalContent = window.createModal('💪 Insano & Forte');
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 4em; margin-bottom: 16px;">⚡</div>
            <h2 style="color: var(--accent); margin-bottom: 16px; font-size: 1.8em;">Insano & Forte Ativado!</h2>
            <p style="font-size: 1.05em; margin-bottom: 20px; line-height: 1.6; color: var(--muted); font-style: italic;">
              "Você libera sua força interior, tornando-se uma fortaleza inabalável."
            </p>
            <div style="background: var(--surface-2); padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent); margin: 20px 0;">
              <h3 style="color: var(--accent); margin-bottom: 16px; font-size: 1.3em;">Efeitos Ativos:</h3>
              <ul style="text-align: left; list-style: none; padding: 0;">
                <li style="padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 1.1em;">
                  ⏱️ <strong style="color: var(--accent);">Duração:</strong> ${res.duration} rodada(s)
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 1.1em;">
                  � <strong>Dano de Bloqueio:</strong> Todo bloqueio (falho ou bem-sucedido) causa 1d4% de Dano na Vitalidade Máxima do alvo.
                </li>
                <li style="padding: 12px 0; font-size: 1.1em;">
                  �️ <strong style="color: #10b981;">Defesa Adicional:</strong> ¼ da Alma Máxima passa a contar como Defesa adicional (+${defesaAdicional}).
                </li>
              </ul>
            </div>
            <div style="background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3); margin-top: 16px;">
              <p style="color: #6ee7b7; font-size: 0.95em; margin: 0;">
                ⚠️ <strong>Custo:</strong> 15 Alma | Use o botão "Testar Bloqueio" enquanto ativo para realizar bloqueios.
              </p>
            </div>
          </div>
        `;
      }
    }
  }

  function onAdvanceRound() {
    const res = SkillEngine.advanceRound();
    setState(res.state);
    if (res.changes.enteredCooldown) setLastMsg(`Insano & Forte terminou. Recarga: ${res.changes.enteredCooldown} rodada(s).`);
    else setLastMsg('Rodada avançada.');
    
    // Dispara eventos para sincronizar com outros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skills_state_changed', { detail: res.state }));
      window.dispatchEvent(new Event('storage'));
    }
  }

  function onArmFuria() {
    // Verificar se tem Alma suficiente
    if (state.alma < 15) {
      setLastMsg('❌ Alma insuficiente! Necessário: 15 Alma');
      if (typeof window !== 'undefined' && window.createModal) {
        const modalContent = window.createModal('⚠️ Alma Insuficiente');
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 4em; margin-bottom: 16px;">⚠️</div>
            <h2 style="color: #ef4444; margin-bottom: 16px;">Alma Insuficiente</h2>
            <p style="font-size: 1.1em; line-height: 1.6;">
              Você precisa de <strong>15 Alma</strong> para armar Fúria Ancestral.<br>
              Alma atual: <strong>${state.alma}</strong>
            </p>
          </div>
        `;
      }
      return;
    }

    const res = SkillEngine.armFuria();
    if (!res.ok) {
      setLastMsg(res.reason);
    } else {
      setState(res.state);
      setLastMsg('Fúria Ancestral armada para o próximo ataque.');
      
      // Dispara eventos para sincronizar com outros componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skills_state_changed', { detail: res.state }));
        window.dispatchEvent(new Event('storage'));
      }
      
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

  function onTestarBloqueio() {
    // Abrir modal interativo
    if (typeof window !== 'undefined' && window.createModal) {
      const modalContent = window.createModal('🛡️ Teste de Bloqueio');
      modalContent.innerHTML = `
        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 3em; margin-bottom: 12px;">🛡️</div>
            <h2 style="color: var(--accent); font-size: 1.6em;">Teste de Bloqueio</h2>
          </div>
          
          <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 1.1em;">
              <input type="checkbox" id="bloqueioMalSucedido" style="width: 18px; height: 18px; cursor: pointer;">
              <span>Bloqueio mal-sucedido?</span>
            </label>
          </div>

          <div id="danoSection" style="display: none; background: rgba(239, 68, 68, 0.05); padding: 16px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold;">
              Dano do ataque:
            </label>
            <input type="number" id="danoAtaque" min="0" value="0" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--background); color: var(--text); font-size: 1em; margin-bottom: 12px;">
            
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 1em;">
              <input type="checkbox" id="ataqueFisico" style="width: 18px; height: 18px; cursor: pointer;">
              <span>Ataque físico?</span>
            </label>
          </div>

          <button id="calcularBtn" style="width: 100%; padding: 14px; font-size: 1.1em; font-weight: bold; background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%); border: none; border-radius: 10px; color: white; cursor: pointer; margin-bottom: 16px;">
            Calcular Resultado
          </button>

          <div id="resultadoDiv" style="display: none;"></div>
        </div>
      `;

      // Adicionar event listeners
      const checkboxMalSucedido = modalContent.querySelector('#bloqueioMalSucedido');
      const danoSection = modalContent.querySelector('#danoSection');
      const calcularBtn = modalContent.querySelector('#calcularBtn');
      const resultadoDiv = modalContent.querySelector('#resultadoDiv');

      checkboxMalSucedido.addEventListener('change', (e) => {
        danoSection.style.display = e.target.checked ? 'block' : 'none';
      });

      calcularBtn.addEventListener('click', () => {
        // Buscar valores atuais
        const rules = window.__LIGHT_RULES || {};
        const ATR = rules.ATRIBUTOS || {};
        const fortitude = (ATR['FORTITUDE'] || 0);
        const defesaBase = state.defesaBase || 0;
        const defesaAdicional = Math.floor(state.almaMax / 4);
        
        // Rolar dados
        const d20 = Math.floor(Math.random() * 20) + 1;
        const d4 = Math.floor(Math.random() * 4) + 1;
        
        // Rolar 1d6 por ponto de Fortitude
        const fortitudeDice = [];
        let fortitudeTotal = 0;
        for (let i = 0; i < fortitude; i++) {
          const roll = Math.floor(Math.random() * 6) + 1;
          fortitudeDice.push(roll);
          fortitudeTotal += roll;
        }
        
        const totalBloqueio = d20 + fortitudeTotal + defesaBase + defesaAdicional;
        
        // Verificar se bloqueio foi mal-sucedido
        const malSucedido = checkboxMalSucedido.checked;
        
        let resultadoHTML = `
          <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: var(--accent); margin-bottom: 12px; font-size: 1.2em;">📊 Teste de Bloqueio</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                🎲 <strong>1d20:</strong> <span style="color: #1976d2; font-size: 1.2em;">${d20}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                💪 <strong>Fortitude (${fortitude}d6):</strong> +${fortitudeTotal}${fortitudeDice.length > 0 ? ` <span style="color: var(--muted); font-size: 0.9em;">[${fortitudeDice.join(', ')}]</span>` : ''}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                🛡️ <strong>Defesa Base:</strong> +${defesaBase}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                ⚡ <strong>Defesa Adicional (Insano):</strong> +${defesaAdicional}
              </li>
              <li style="padding: 12px 0; font-size: 1.3em; font-weight: bold;">
                📊 <strong>Total:</strong> <span style="color: var(--accent);">${totalBloqueio}</span>
              </li>
            </ul>
          </div>
          
          <div style="background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 16px;">
            <h3 style="color: #ef4444; margin-bottom: 12px; font-size: 1.2em;">💥 Dano no Alvo</h3>
            <p style="margin: 0; font-size: 1.1em;">
              O bloqueio causa <strong style="color: #ef4444; font-size: 1.3em;">${d4}%</strong> da Vitalidade Máxima do alvo como dano.
            </p>
            <p style="margin: 8px 0 0 0; color: var(--muted); font-size: 0.9em;">
              (Rolado 1d4 = ${d4})
            </p>
          </div>
        `;

        if (malSucedido) {
          const danoAtaque = parseFloat(modalContent.querySelector('#danoAtaque').value) || 0;
          const ataqueFisico = modalContent.querySelector('#ataqueFisico').checked;
          
          // Cálculos de redução
          let danoFinal = danoAtaque * 0.75; // Bloqueio mal-sucedido reduz para 3/4
          let explicacao = [`Dano base: ${danoAtaque}`, `Bloqueio mal-sucedido (×0.75): ${(danoAtaque * 0.75).toFixed(2)}`];
          
          if (ataqueFisico) {
            // Armadura Natural (Insano & Forte): -25%
            danoFinal = danoFinal * 0.75;
            explicacao.push(`Armadura Natural Insano (×0.75): ${(danoAtaque * 0.75 * 0.75).toFixed(2)}`);
          }
          
          // Armadura Eroques: -20%
          danoFinal = danoFinal * 0.8;
          explicacao.push(`Armadura Eroques (×0.8): ${(danoFinal).toFixed(2)}`);
          
          // Armadura Medalhão: -7
          const armaduraMedalhao = 7;
          danoFinal = Math.max(0, danoFinal - armaduraMedalhao);
          explicacao.push(`Armadura Medalhão (-7): ${danoFinal.toFixed(2)}`);
          
          const multiplicadorTotal = ataqueFisico ? 0.45 : 0.6;
          
          resultadoHTML += `
            <div style="background: rgba(239, 68, 68, 0.15); padding: 16px; border-radius: 10px; border: 2px solid rgba(239, 68, 68, 0.5);">
              <h3 style="color: #ef4444; margin-bottom: 12px; font-size: 1.3em;">⚔️ Dano Recebido</h3>
              
              <div style="margin-bottom: 12px;">
                <p style="margin: 0 0 8px 0; font-weight: bold;">Cálculo:</p>
                <ul style="list-style: none; padding: 0 0 0 12px; margin: 0; font-size: 0.95em;">
                  ${explicacao.map(e => `<li style="padding: 4px 0; color: var(--muted);">• ${e}</li>`).join('')}
                </ul>
              </div>
              
              <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 0.9em; color: var(--muted);">
                  Fórmula: X × ${multiplicadorTotal} - 7
                </p>
                <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #ef4444;">
                  ${Math.round(danoFinal)} de dano
                </p>
              </div>
            </div>
          `;
        } else {
          resultadoHTML += `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 16px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center;">
              <h3 style="color: #10b981; margin-bottom: 8px; font-size: 1.3em;">✅ Bloqueio Bem-Sucedido!</h3>
              <p style="margin: 0; font-size: 1.2em; font-weight: bold;">
                Nenhum dano recebido
              </p>
            </div>
          `;
        }

        resultadoDiv.innerHTML = resultadoHTML;
        resultadoDiv.style.display = 'block';
      });
    }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <button 
            type="button" 
            onClick={onActivateInsano}
            style={{
              padding: '14px 18px',
              fontSize: '1em',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(156, 39, 176, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(156, 39, 176, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.3em' }}>💪</span>
            <span>Ativar Insano & Forte</span>
            <span style={{ fontSize: '0.85em', opacity: 0.9 }}>(-15 Alma)</span>
          </button>

          <button 
            type="button" 
            onClick={onArmFuria}
            style={{
              padding: '14px 18px',
              fontSize: '1em',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.3em' }}>⚡</span>
            <span>Armar Fúria Ancestral</span>
            <span style={{ fontSize: '0.85em', opacity: 0.9 }}>(-15 Alma)</span>
          </button>

          <button 
            type="button" 
            onClick={onAdvanceRound}
            style={{
              padding: '12px 16px',
              fontSize: '0.95em',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(96, 125, 139, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(96, 125, 139, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(96, 125, 139, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.2em' }}>⏭️</span>
            <span>Avançar Rodada</span>
          </button>
        </div>

        {lastMsg && (
          <div style={{ marginTop: 8, color: 'var(--muted)' }}>{lastMsg}</div>
        )}

        {/* Teste de Bloqueio - Aparece apenas quando Insano & Forte está ativo */}
        {state.insano && state.insano.activeRounds > 0 && (
          <div style={{
            marginTop: 16,
            padding: '14px',
            background: 'rgba(156, 39, 176, 0.1)',
            border: '1px solid rgba(156, 39, 176, 0.3)',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, color: '#9c27b0', fontSize: '1.1em' }}>
                  🛡️ Bloqueio Ativo
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: 'var(--muted)' }}>
                  Rodadas restantes: {state.insano.activeRounds}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onTestarBloqueio}
              style={{ 
                width: '100%',
                padding: '10px',
                fontSize: '1em',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(156, 39, 176, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Bloqueio
            </button>
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
