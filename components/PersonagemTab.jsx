import React, { useEffect, useState } from 'react';
import SkillEngine from '../lib/skills/engine';

export default function PersonagemTab() {
  const [state, setState] = useState(SkillEngine.getState());

  useEffect(() => {
    setState(SkillEngine.getState());
    
    // Sincronização com mudanças externas no localStorage
    const syncFromStorage = () => {
      setState(SkillEngine.getState());
    };
    window.addEventListener('storage', syncFromStorage);
    
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

  // Porcentagens para as barras
  const vitPercent = state.maxVitalidade > 0 ? (state.vitalidadeAtual / state.maxVitalidade) * 100 : 0;
  const almaPercent = state.almaMax > 0 ? (state.alma / state.almaMax) * 100 : 0;

  return (
    <div className="personagem-container">
      <h1 className="personagem-title">Status do Personagem</h1>
      
      <div className="status-section">
        <div className="stat-card">
          <div className="stat-header">
            <label>Vitalidade</label>
            <span className="stat-values">{state.vitalidadeAtual} / {state.maxVitalidade}</span>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar vida-bar" style={{ width: `${Math.min(100, vitPercent)}%` }}></div>
          </div>
          <div className="stat-inputs">
            <div className="input-group">
              <label>Atual</label>
              <input 
                type="number" 
                min={0} 
                max={state.maxVitalidade}
                value={state.vitalidadeAtual} 
                onChange={(e) => updateField('vitalidadeAtual')(Number(e.target.value))} 
              />
            </div>
            <div className="input-group">
              <label>Máxima</label>
              <input 
                type="number" 
                min={1} 
                value={state.maxVitalidade} 
                onChange={(e) => updateField('maxVitalidade')(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <label>Alma</label>
            <span className="stat-values">{state.alma} / {state.almaMax}</span>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar alma-bar" style={{ width: `${Math.min(100, almaPercent)}%` }}></div>
          </div>
          <div className="stat-inputs">
            <div className="input-group">
              <label>Atual</label>
              <input 
                type="number" 
                min={0} 
                max={state.almaMax}
                value={state.alma} 
                onChange={(e) => updateField('alma')(Number(e.target.value))} 
              />
            </div>
            <div className="input-group">
              <label>Máxima</label>
              <input 
                type="number" 
                min={0} 
                value={state.almaMax} 
                onChange={(e) => updateField('almaMax')(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <label>Defesa Base</label>
            <span className="stat-values">{state.defesaBase}</span>
          </div>
          <div className="stat-inputs single-input">
            <input 
              type="number" 
              min={0} 
              value={state.defesaBase} 
              onChange={(e) => updateField('defesaBase')(Number(e.target.value))} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
