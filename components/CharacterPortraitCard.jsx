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
      vitalidadeMax: state.vitalidadeMax || 0,
      almaAtual: state.almaAtual || 0,
      almaMax: state.almaMax || 0,
      defesa: state.defesa || 0
    });

    // Listener para mudanças nos stats
    const handleStatsChange = () => {
      const newState = SkillEngine.getState();
      setStats({
        vitalidadeAtual: newState.vitalidadeAtual || 0,
        vitalidadeMax: newState.vitalidadeMax || 0,
        almaAtual: newState.almaAtual || 0,
        almaMax: newState.almaMax || 0,
        defesa: newState.defesa || 0
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
          <label>Vida:</label>
          <div className="portrait-stat-bar">
            <div 
              className="portrait-stat-fill vida-fill" 
              style={{ width: `${(stats.vitalidadeAtual / stats.vitalidadeMax) * 100}%` }}
            ></div>
            <span className="portrait-stat-text">{stats.vitalidadeAtual} / {stats.vitalidadeMax}</span>
          </div>
        </div>

        <div className="portrait-stat-item">
          <label>Éter:</label>
          <div className="portrait-stat-bar">
            <div 
              className="portrait-stat-fill eter-fill" 
              style={{ width: `${(stats.almaAtual / stats.almaMax) * 100}%` }}
            ></div>
            <span className="portrait-stat-text">{stats.almaAtual} / {stats.almaMax}</span>
          </div>
        </div>

        <div className="portrait-stat-item">
          <label>Sanidade:</label>
          <div className="portrait-stat-bar">
            <div 
              className="portrait-stat-fill sanidade-fill" 
              style={{ width: '100%' }}
            ></div>
            <span className="portrait-stat-text">0 / 100</span>
          </div>
        </div>

        <div className="portrait-stat-item">
          <label>Defesa:</label>
          <div className="portrait-stat-bar">
            <div className="portrait-stat-fill defesa-fill" style={{ width: '100%' }}></div>
            <span className="portrait-stat-text">{stats.defesa} / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
