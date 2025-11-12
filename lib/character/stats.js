// Gerenciamento de Atributos e Perícias do personagem
const STORAGE_KEY = 'character_stats_v1';

// Valores padrão
const DEFAULT_ATRIBUTOS = {
  "AGILIDADE": 0,
  "CARISMA": 0,
  "CONHECIMENTO": 0,
  "ESPÍRITO": 2,
  "FORÇA": 0,
  "FORTITUDE": 1,
  "PERCEPÇÃO": 0,
};

const DEFAULT_PERICIAS = {
  "ARCANISMO": { qtd: 1, bonusFixo: 0, perito: false },
  "CIÊNCIAS": { qtd: 0, bonusFixo: 0, perito: false },
  "CULINÁRIA": { qtd: 0, bonusFixo: 0, perito: false },
  "DIPLOMACIA": { qtd: 0, bonusFixo: 0, perito: false },
  "DESTREZA": { qtd: 0, bonusFixo: 0, perito: false },
  "FURTIVIDADE": { qtd: 0, bonusFixo: 0, perito: false },
  "FULGOR": { qtd: 2, bonusFixo: 0, perito: true },
  "INVESTIGAÇÃO": { qtd: 0, bonusFixo: 0, perito: false },
  "INTELIGÊNCIA": { qtd: 0, bonusFixo: 0, perito: false },
  "INTUIÇÃO": { qtd: 0, bonusFixo: 0, perito: false },
  "INICIATIVA": { qtd: 0, bonusFixo: 0, perito: false },
  "LUTA": { qtd: 0, bonusFixo: 0, perito: false },
  "MENTE": { qtd: 1, bonusFixo: 0, perito: false },
  "MEDICINA": { qtd: 0, bonusFixo: 0, perito: false },
  "OBSERVAÇÃO": { qtd: 0, bonusFixo: 0, perito: false },
  "PONTARIA": { qtd: 0, bonusFixo: 0, perito: false },
  "REFLEXO": { qtd: 0, bonusFixo: 0, perito: false },
  "SOBREVIVÊNCIA": { qtd: 0, bonusFixo: 0, perito: false },
  "SORTE": { qtd: 0, bonusFixo: 0, perito: false },
  "TÉCNICA": { qtd: 0, bonusFixo: 0, perito: false },
  "VIGOR": { qtd: 0, bonusFixo: 0, perito: false },
  "VONTADE": { qtd: 3, bonusFixo: 12, perito: true },
};

class CharacterStats {
  static getState() {
    // Verifica se está no navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {
        atributos: { ...DEFAULT_ATRIBUTOS },
        pericias: { ...DEFAULT_PERICIAS }
      };
    }
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          atributos: { ...DEFAULT_ATRIBUTOS, ...(parsed.atributos || {}) },
          pericias: { ...DEFAULT_PERICIAS, ...(parsed.pericias || {}) }
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar stats do personagem:', e);
    }
    return {
      atributos: { ...DEFAULT_ATRIBUTOS },
      pericias: { ...DEFAULT_PERICIAS }
    };
  }

  static setState(updates) {
    // Verifica se está no navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {
        atributos: { ...DEFAULT_ATRIBUTOS },
        pericias: { ...DEFAULT_PERICIAS }
      };
    }
    
    const current = this.getState();
    const newState = {
      atributos: { ...current.atributos, ...(updates.atributos || {}) },
      pericias: { ...current.pericias, ...(updates.pericias || {}) }
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      // Dispara evento para sincronização
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('character_stats_changed', { detail: newState }));
      }
    } catch (e) {
      console.error('Erro ao salvar stats do personagem:', e);
    }
    
    return newState;
  }

  static updateAtributo(nome, valor) {
    const state = this.getState();
    state.atributos[nome] = Math.max(0, parseInt(valor) || 0);
    return this.setState({ atributos: state.atributos });
  }

  static updatePericia(nome, campo, valor) {
    const state = this.getState();
    if (!state.pericias[nome]) {
      state.pericias[nome] = { qtd: 0, bonusFixo: 0, perito: false };
    }
    
    if (campo === 'qtd' || campo === 'bonusFixo') {
      state.pericias[nome][campo] = Math.max(0, parseInt(valor) || 0);
    } else if (campo === 'perito') {
      state.pericias[nome][campo] = !!valor;
    }
    
    return this.setState({ pericias: state.pericias });
  }

  // Métodos para compatibilidade com formato antigo
  static getAtributos() {
    return this.getState().atributos;
  }

  static getPericiaQtd() {
    const state = this.getState();
    const result = {};
    Object.keys(state.pericias).forEach(nome => {
      result[nome] = state.pericias[nome].qtd;
    });
    return result;
  }

  static getPericiaBonusFixo() {
    const state = this.getState();
    const result = {};
    Object.keys(state.pericias).forEach(nome => {
      result[nome] = state.pericias[nome].bonusFixo;
    });
    return result;
  }

  static getPericiaPerito() {
    const state = this.getState();
    const result = {};
    Object.keys(state.pericias).forEach(nome => {
      result[nome] = state.pericias[nome].perito;
    });
    return result;
  }
}

// Exporta para uso em módulos ES6
export default CharacterStats;

// Exporta para uso global (window)
if (typeof window !== 'undefined') {
  window.CharacterStats = CharacterStats;
}
