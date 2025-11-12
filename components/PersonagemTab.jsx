import React, { useEffect, useState } from 'react';
import SkillEngine from '../lib/skills/engine';

export default function PersonagemTab() {
  const [state, setState] = useState(SkillEngine.getState());
  const [editingField, setEditingField] = useState(null);

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

  const updateField = (field, val) => {
    const next = SkillEngine.setState({ [field]: val });
    setState(next);
  };

  const adjustValue = (field, delta) => {
    const currentValue = state[field] || 0;
    let newValue = currentValue + delta;
    
    // Limites específicos por campo
    if (field === 'vitalidadeAtual') {
      newValue = Math.max(0, Math.min(newValue, state.maxVitalidade));
    } else if (field === 'alma') {
      newValue = Math.max(0, Math.min(newValue, state.almaMax));
    } else if (field === 'maxVitalidade' || field === 'almaMax' || field === 'defesaBase') {
      newValue = Math.max(0, newValue);
    }
    
    updateField(field, newValue);
  };

  const restoreAll = () => {
    const next = SkillEngine.setState({ 
      vitalidadeAtual: state.maxVitalidade,
      alma: state.almaMax
    });
    setState(next);
  };

  // Porcentagens para as barras
  const vitPercent = state.maxVitalidade > 0 ? (state.vitalidadeAtual / state.maxVitalidade) * 100 : 0;
  const almaPercent = state.almaMax > 0 ? (state.alma / state.almaMax) * 100 : 0;
  
  // Verifica se está crítico
  const isCritical = vitPercent < 25 && vitPercent > 0;
  const isLowVit = vitPercent < 50 && vitPercent >= 25;

  return (
    <div className="personagem-container">
      <h1 className="personagem-title">Status do Personagem</h1>
      
      <div className={`status-card-unified ${isCritical ? 'critical' : ''}`}>
        {/* Vitalidade */}
        <div className="stat-row">
          <div className="stat-row-header">
            <span className="stat-icon vida-icon">❤️</span>
            <span className="stat-label">Vitalidade</span>
            <div className="stat-value-display">
              <span 
                className="stat-value-num editable" 
                onClick={() => setEditingField('vitalidadeAtual')}
                title="Clique para editar"
              >
                {editingField === 'vitalidadeAtual' ? (
                  <input 
                    type="number"
                    className="inline-edit"
                    value={state.vitalidadeAtual}
                    onChange={(e) => updateField('vitalidadeAtual', Number(e.target.value))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    autoFocus
                    min={0}
                    max={state.maxVitalidade}
                  />
                ) : state.vitalidadeAtual}
              </span>
              <span className="stat-separator">/</span>
              <span 
                className="stat-value-num editable" 
                onClick={() => setEditingField('maxVitalidade')}
                title="Clique para editar"
              >
                {editingField === 'maxVitalidade' ? (
                  <input 
                    type="number"
                    className="inline-edit"
                    value={state.maxVitalidade}
                    onChange={(e) => updateField('maxVitalidade', Number(e.target.value))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    autoFocus
                    min={1}
                  />
                ) : state.maxVitalidade}
              </span>
            </div>
          </div>
          <div className="stat-bar-container">
            <div className={`stat-bar vida-bar ${isLowVit ? 'low' : ''}`} style={{ width: `${Math.min(100, vitPercent)}%` }}></div>
          </div>
          <div className="stat-controls">
            <button className="stat-btn" onClick={() => adjustValue('vitalidadeAtual', -5)} title="Diminuir 5">-5</button>
            <button className="stat-btn" onClick={() => adjustValue('vitalidadeAtual', -1)} title="Diminuir 1">-1</button>
            <button className="stat-btn" onClick={() => adjustValue('vitalidadeAtual', 1)} title="Aumentar 1">+1</button>
            <button className="stat-btn" onClick={() => adjustValue('vitalidadeAtual', 5)} title="Aumentar 5">+5</button>
          </div>
        </div>

        {/* Alma */}
        <div className="stat-row">
          <div className="stat-row-header">
            <span className="stat-icon alma-icon">💙</span>
            <span className="stat-label">Alma</span>
            <div className="stat-value-display">
              <span 
                className="stat-value-num editable" 
                onClick={() => setEditingField('alma')}
                title="Clique para editar"
              >
                {editingField === 'alma' ? (
                  <input 
                    type="number"
                    className="inline-edit"
                    value={state.alma}
                    onChange={(e) => updateField('alma', Number(e.target.value))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    autoFocus
                    min={0}
                    max={state.almaMax}
                  />
                ) : state.alma}
              </span>
              <span className="stat-separator">/</span>
              <span 
                className="stat-value-num editable" 
                onClick={() => setEditingField('almaMax')}
                title="Clique para editar"
              >
                {editingField === 'almaMax' ? (
                  <input 
                    type="number"
                    className="inline-edit"
                    value={state.almaMax}
                    onChange={(e) => updateField('almaMax', Number(e.target.value))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    autoFocus
                    min={0}
                  />
                ) : state.almaMax}
              </span>
            </div>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar alma-bar" style={{ width: `${Math.min(100, almaPercent)}%` }}></div>
          </div>
          <div className="stat-controls">
            <button className="stat-btn" onClick={() => adjustValue('alma', -5)} title="Diminuir 5">-5</button>
            <button className="stat-btn" onClick={() => adjustValue('alma', -1)} title="Diminuir 1">-1</button>
            <button className="stat-btn" onClick={() => adjustValue('alma', 1)} title="Aumentar 1">+1</button>
            <button className="stat-btn" onClick={() => adjustValue('alma', 5)} title="Aumentar 5">+5</button>
          </div>
        </div>

        {/* Defesa Base */}
        <div className="stat-row defense-row">
          <div className="stat-row-header">
            <span className="stat-icon defense-icon">🛡️</span>
            <span className="stat-label">Defesa Base</span>
            <div className="stat-value-display">
              <span 
                className="stat-value-num editable single" 
                onClick={() => setEditingField('defesaBase')}
                title="Clique para editar"
              >
                {editingField === 'defesaBase' ? (
                  <input 
                    type="number"
                    className="inline-edit"
                    value={state.defesaBase}
                    onChange={(e) => updateField('defesaBase', Number(e.target.value))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    autoFocus
                    min={0}
                  />
                ) : state.defesaBase}
              </span>
            </div>
          </div>
        </div>

        {/* Botão Restaurar */}
        <div className="stat-actions">
          <button className="restore-btn" onClick={restoreAll}>
            ✨ Restaurar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
