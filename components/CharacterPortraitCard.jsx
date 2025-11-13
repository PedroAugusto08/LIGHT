import { useState, useEffect } from 'react';
import SkillEngine from '../lib/skills/engine';

export default function CharacterPortraitCard() {
  const [portraitUrl, setPortraitUrl] = useState('');
  const [stats, setStats] = useState({
    vitalidadeAtual: 0,
    vitalidadeMax: 0,
    almaAtual: 0,
    almaMax: 0,
    defesa: 0
  });

  useEffect(() => {
    // Carregar foto do localStorage
    const savedPortrait = localStorage.getItem('character_portrait');
    if (savedPortrait) {
      setPortraitUrl(savedPortrait);
    }

    // Carregar stats iniciais
    const state = SkillEngine.getState();
    setStats({
      vitalidadeAtual: state.vitalidadeAtual || 0,
      vitalidadeMax: state.maxVitalidade || 0,
      almaAtual: state.alma || 0,
      almaMax: state.almaMax || 0,
      defesa: state.defesaBase || 0
    });

    // Listener para mudanças nos stats
    const handleStatsChange = () => {
      const newState = SkillEngine.reloadState();
      setStats({
        vitalidadeAtual: newState.vitalidadeAtual || 0,
        vitalidadeMax: newState.maxVitalidade || 0,
        almaAtual: newState.alma || 0,
        almaMax: newState.almaMax || 0,
        defesa: newState.defesaBase || 0
      });
    };

    window.addEventListener('skills_state_changed', handleStatsChange);
    return () => window.removeEventListener('skills_state_changed', handleStatsChange);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        setPortraitUrl(url);
        localStorage.setItem('character_portrait', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    document.getElementById('portrait-upload').click();
  };

  return (
    <div className="character-portrait-card">
      <div className="portrait-container" onClick={handleImageClick}>
        {portraitUrl ? (
          <img src={portraitUrl} alt="Personagem" className="portrait-image" />
        ) : (
          <div className="portrait-placeholder">
            <span>Clique para adicionar foto</span>
          </div>
        )}
        <input
          type="file"
          id="portrait-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="portrait-stats">
        <div className="portrait-stat-item">
          <label>Vitalidade:</label>
          <div className="portrait-stat-bar">
            <div 
              className="portrait-stat-fill vitalidade-fill" 
              style={{ width: `${stats.vitalidadeMax > 0 ? (stats.vitalidadeAtual / stats.vitalidadeMax) * 100 : 0}%` }}
            ></div>
            <span className="portrait-stat-text">{stats.vitalidadeAtual} / {stats.vitalidadeMax}</span>
          </div>
        </div>

        <div className="portrait-stat-item">
          <label>Alma:</label>
          <div className="portrait-stat-bar">
            <div 
              className="portrait-stat-fill alma-fill" 
              style={{ width: `${stats.almaMax > 0 ? (stats.almaAtual / stats.almaMax) * 100 : 0}%` }}
            ></div>
            <span className="portrait-stat-text">{stats.almaAtual} / {stats.almaMax}</span>
          </div>
        </div>

        <div className="portrait-stat-item">
          <label>Defesa:</label>
          <div className="portrait-stat-value">
            {stats.defesa}
          </div>
        </div>
      </div>
    </div>
  );
}
