import React, { useEffect, useState } from 'react';
import CharacterStats from '../lib/character/stats';

export default function CharacterStatsManager() {
  const [charState, setCharState] = useState(CharacterStats.getState());
  const [activeTab, setActiveTab] = useState('atributos');

  useEffect(() => {
    // Sincronização com mudanças externas
    const syncStats = (e) => {
      if (e.detail) {
        setCharState(e.detail);
      } else {
        setCharState(CharacterStats.getState());
      }
    };
    
    window.addEventListener('character_stats_changed', syncStats);
    window.addEventListener('storage', () => setCharState(CharacterStats.getState()));
    
    return () => {
      window.removeEventListener('character_stats_changed', syncStats);
      window.removeEventListener('storage', () => setCharState(CharacterStats.getState()));
    };
  }, []);

  const updateAtributo = (nome, valor) => {
    const newState = CharacterStats.updateAtributo(nome, valor);
    setCharState(newState);
  };

  const updatePericia = (nome, campo, valor) => {
    const newState = CharacterStats.updatePericia(nome, campo, valor);
    setCharState(newState);
  };

  const atributosList = Object.keys(charState.atributos).sort();
  const periciasList = Object.keys(charState.pericias).sort();

  return (
    <div className="character-stats-manager">
      <div className="stats-tabs">
        <button 
          className={`stats-tab-btn ${activeTab === 'atributos' ? 'active' : ''}`}
          onClick={() => setActiveTab('atributos')}
        >
          📊 Atributos
        </button>
        <button 
          className={`stats-tab-btn ${activeTab === 'pericias' ? 'active' : ''}`}
          onClick={() => setActiveTab('pericias')}
        >
          ⚔️ Perícias
        </button>
      </div>

      {activeTab === 'atributos' && (
        <div className="stats-content">
          <div className="stats-grid">
            {atributosList.map(nome => (
              <div key={nome} className="stat-item">
                <label className="stat-item-label">{nome}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={charState.atributos[nome]}
                  onChange={(e) => updateAtributo(nome, e.target.value)}
                  className="stat-item-input"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pericias' && (
        <div className="stats-content">
          <div className="pericias-list">
            {periciasList.map(nome => {
              const pericia = charState.pericias[nome];
              return (
                <div key={nome} className="pericia-item">
                  <div className="pericia-header">
                    <span className="pericia-name">{nome}</span>
                    <label className="pericia-perito-toggle">
                      <input
                        type="checkbox"
                        checked={pericia.perito}
                        onChange={(e) => updatePericia(nome, 'perito', e.target.checked)}
                      />
                      <span className="toggle-text">Perito (d12)</span>
                    </label>
                  </div>
                  <div className="pericia-inputs">
                    <div className="pericia-input-group">
                      <label>Quantidade</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={pericia.qtd}
                        onChange={(e) => updatePericia(nome, 'qtd', e.target.value)}
                      />
                    </div>
                    <div className="pericia-input-group">
                      <label>Bônus Fixo</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={pericia.bonusFixo}
                        onChange={(e) => updatePericia(nome, 'bonusFixo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
