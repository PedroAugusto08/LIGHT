# LIGHT

## Visão Geral

O **LIGHT** (Luminar Integrado para Gestão de Habilidades e Testes) é uma aplicação web para calcular estatísticas de construtos mágicos em um sistema de RPG. A aplicação permite criar construtos com diferentes estilos, alocar blocos de recursos e calcular automaticamente dano, defesa, HP e duração baseados em rolagens de dados e multiplicadores específicos.

### Funcionalidades Principais:
- **Criação de Construtos**: 6 estilos diferentes (Projétil, Padrão, Pesado, Área, Colossal, Estrutura)
- **Sistema de Blocos**: Alocação limitada de blocos baseada na Alma Extra gasta
- **Rolagens Automáticas**: Simulação de dados (2d6, 1d10, 1d12, 1d20) para cálculos
- **Teste de Eficiência**: Sistema complexo que pode modificar os resultados finais
- **Histórico Persistente**: Armazenamento local do total de Alma gasta em todos os construtos

## Instalação/Execução

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Não requer servidor - funciona localmente

### Como Executar
1. Clone ou baixe os arquivos do projeto
2. Abra o arquivo `index.html` diretamente no navegador

### Estrutura de Arquivos
```
LIGHT/
├── index.html          # Interface principal com abas
├── style.css          # Estilos e layout responsivo
├── script.js          # Lógica de cálculo e controle
└── README.md          # Esta documentação
```

## Estrutura do Código

### HTML (index.html)
- **Sistema de Abas**: Navegação entre "Forjar Construto" e "Histórico de Alma"
- **Formulário Principal**: Inputs para estilo, alma extra e distribuição de blocos
- **Área de Resultados**: Exibição dos stats calculados e detalhes das rolagens

### CSS (style.css)
- **Layout Responsivo**: Flex containers que se adaptam a diferentes telas
- **Sistema de Abas**: Estilização da navegação e conteúdo
- **Cards Visuais**: Containers com sombras e bordas arredondadas

### JavaScript (script.js)

#### Principais Funções

##### `rolarDado(qtd, faces)`
Simula rolagens de dados.
- **Parâmetros**: 
  - `qtd`: quantidade de dados
  - `faces`: número de faces do dado
- **Retorno**: `{ total: number, rolls: number[] }`
- **Exemplo**: `rolarDado(2, 6)` → `{ total: 9, rolls: [4, 5] }`

##### `rollEficiência(vontadePts, espiritoPts, blocosExtras)`
Calcula o teste de eficiência do construto.
- **Parâmetros**:
  - `vontadePts`: pontos em Vontade (cada ponto = 1d12)
  - `espiritoPts`: pontos em Espírito (cada ponto = 1d6)
  - `blocosExtras`: blocos extras para calcular shift de dificuldade
- **Retorno**: Objeto com total, faixa de eficiência e multiplicador
- **Faixas**:
  - ≤ 20+shift: -30% (0.7x)
  - ≤ 40+shift: Normal (1.0x)
  - ≤ 60+shift: +10% (1.1x)
  - ≤ 90+shift: +20% (1.2x)
  - > 90+shift: +30% (1.3x)

##### `calcularStats(params)`
Função principal que calcula todas as estatísticas do construto.
- **Parâmetros**: Objeto com todas as configurações do construto
- **Retorno**: Objeto completo com stats finais e dados intermediários

#### Multiplicadores por Estilo

| Estilo     | Md (Dano) | Mh (Def/HP) | Mt (Duração) |
|------------|-----------|-------------|--------------|
| Projétil   | 1.25      | 1.0         | 0.75         |
| Padrão     | 1.5       | 1.25        | 1.0          |
| Pesado     | 1.75      | 1.5         | 1.0          |
| Área       | 2.0       | 1.5         | 1.0          |
| Colossal   | 1.25      | 2.0         | 0.75         |
| Estrutura  | 1.0       | 2.0         | 1.75         |

#### Fórmulas de Cálculo

**Blocos Disponíveis:**
```
blocos = floor(almaExtra / 2)
almaTotal = 6 + almaExtra
```

**Dano:**
```
1. Rolar 2d6 base + 2d6 por bloco de dano
2. Multiplicar por Md
3. Aplicar bônus de Luz (1d10%)
4. Aplicar multiplicador de eficiência
5. Arredondar resultado final
```

**Defesa:**
```
defesa = (3 + blocosDefesa × 3) × Mh
```

**HP:**
```
hp = (6 + blocosVitalidade × 6) × Mh × eficiência
```

**Duração:**
```
duração = (1 + blocosDuração) × Mt × eficiência
```

## Exemplos de Uso

### Exemplo 1: Construto Básico
```
Estilo: Padrão
Alma Extra: 10
Distribuição: 2 Dano, 1 Defesa, 1 Vitalidade, 1 Duração

Resultado:
- Blocos disponíveis: 5 (10÷2)
- Alma total gasta: 16 (6+10)
- Rolagens de dano: [3+4] + [2+5] = 14
- Dano final: ~23 (após multiplicadores)
```

### Exemplo 2: Construto de Área
```
Estilo: Área
Alma Extra: 20
Distribuição: 5 Dano, 3 Defesa, 2 Vitalidade

Resultado:
- Multiplicador de dano alto (2.0x)
- Boa defesa e HP
- Duração padrão
```

## Fluxograma de Execução

```
Usuário preenche formulário
          ↓
Validação de blocos disponíveis
          ↓
Cálculo das rolagens base
          ↓
Aplicação de multiplicadores de estilo
          ↓
Teste de eficiência (Vontade + Espírito)
          ↓
Aplicação do multiplicador de eficiência
          ↓
Arredondamento e exibição dos resultados
          ↓
Salvamento no histórico (localStorage)
```

## Sistema de Controle de Blocos

A aplicação implementa um sistema inteligente que:
- **Calcula automaticamente** blocos disponíveis baseado na Alma Extra
- **Limita a soma** dos blocos alocados ao máximo permitido
- **Permite realocação** entre diferentes atributos
- **Bloqueia inputs** quando o limite é atingido
- **Atualiza em tempo real** a exibição de blocos disponíveis

## Persistência de Dados

### localStorage
O histórico é salvo automaticamente no navegador:
```javascript
// Estrutura dos dados salvos
{
  historicoAlma: [
    { alma: 16, data: "01/09/2025 14:30:22" },
    { alma: 22, data: "01/09/2025 14:35:15" }
  ]
}
```

## Boas Práticas

### Para Usuários
1. **Planeje a distribuição**: Considere o estilo do construto antes de alocar blocos
2. **Teste diferentes configurações**: Use a realocação para otimizar
3. **Monitore o histórico**: Acompanhe o gasto total de Alma

### Para Desenvolvedores
1. **Modularização**: Funções separadas para cálculo, interface e persistência
2. **Validação**: Controle rigoroso dos inputs do usuário
3. **Responsividade**: Layout que funciona em desktop e mobile
4. **Performance**: Uso eficiente do localStorage e DOM

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Flexbox, Grid, animações e responsividade
- **JavaScript ES6+**: Módulos, arrow functions, destructuring
- **localStorage**: Persistência de dados no cliente

## Limitações Conhecidas

1. **Apenas cliente**: Não há sincronização entre dispositivos
2. **localStorage**: Limitado a ~5MB e pode ser limpo pelo usuário
3. **Navegador único**: Dados não são compartilhados entre navegadores

## Futuras Melhorias

- [ ] Sistema de salvamento/carregamento de construtos
- [ ] Exportação do histórico para arquivo
- [ ] Modo escuro
- [ ] Integração de novas habilidades
- [ ] Sistema de favoritos para construtos