# LIGHT

## Visão Geral

O **LIGHT** (Luminar Integrado para Gestão de Habilidades e Testes) é uma aplicação web para calcular estatísticas de construtos mágicos em um sistema de RPG. A aplicação permite criar construtos com diferentes estilos, alocar blocos de recursos e calcular automaticamente dano, defesa, HP e duração baseados em rolagens de dados e multiplicadores específicos.

### Funcionalidades Principais:
- **Criação de Construtos**: 6 estilos diferentes (Projétil, Padrão, Pesado, Área, Colossal, Estrutura)
- **Interface Híbrida de Blocos**: Controles numéricos + sliders + barras de blocos clicáveis sincronizados
- **Sistema de Blocos Inteligente**: Alocação limitada com realocação automática baseada na Alma Extra
- **Rolagens Automáticas**: Simulação de dados (2d6, 1d10, 1d12, 1d20) para cálculos
- **Teste de Eficiência**: Sistema complexo que pode modificar os resultados finais
- **Histórico Avançado**: Cards expansíveis com parâmetros, resultados e função "Reforjar" (máx. 20 entradas)

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
- **Interface Híbrida**: Campos numéricos + sliders + barras de blocos clicáveis para cada atributo
- **Área de Resultados**: Exibição dos stats calculados e detalhes das rolagens
- **Histórico Interativo**: Cards expansíveis com botão "Reforjar" e "Limpar histórico"

### CSS (style.css)
- **Layout Responsivo**: Flex containers que se adaptam a diferentes telas
- **Sistema de Abas**: Estilização da navegação e conteúdo
- **Cards Visuais**: Containers com sombras e bordas arredondadas
- **Controles Híbridos**: Estilização de sliders e barras de blocos clicáveis
- **Animações Suaves**: Transições para expand/collapse de cards e hover effects

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

##### `salvarHistoricoConstruto(entry)`
Salva um construto completo no histórico (parâmetros + resultados).
- **Parâmetros**: `{ data, alma, params, results }`
- **Limite**: Máximo 20 entradas (remove as mais antigas)

##### `renderizarHistorico()`
Renderiza cards expansíveis do histórico com animações.
- **Funcionalidades**: Expand/collapse, botão "Reforjar", total de Alma

##### `reforjarConstruto(index)`
Restaura parâmetros de um construto do histórico no formulário.
- **Ações**: Preenche campos, sincroniza controles, troca para aba Forja, recalcula

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

A aplicação implementa uma **interface híbrida inteligente** que oferece três formas sincronizadas de alocar blocos:

### 1. Campo Numérico
- Digite diretamente o número de blocos desejados
- Validação automática contra limites disponíveis

### 2. Slider (Barra Deslizante)
- Arraste para ajustar a quantidade
- Sincronizado em tempo real com o campo numérico

### 3. Barra de Blocos Clicáveis
- Visualização em "chips" individuais
- Clique para definir rapidamente a quantidade
- Estados visuais: vazio, preenchido, desabilitado

### Características do Sistema:
- **Cálculo automático** de blocos disponíveis baseado na Alma Extra
- **Limite global inteligente**: Soma dos blocos não pode exceder o máximo
- **Realocação dinâmica**: Quando no limite, só permite redistribuir entre atributos
- **Sincronização total**: Mudança em qualquer controle atualiza os outros
- **Feedback visual**: Blocos restantes exibidos em tempo real
- **Responsividade**: Barras com scroll horizontal para muitos blocos

## Persistência de Dados

### localStorage - Histórico Avançado
O histórico salva automaticamente construtos completos com limite de 20 entradas:

```javascript
// Estrutura dos dados salvos (nova versão)
{
  historicoAlma: [
    {
      data: "01/09/2025 14:30:22",
      alma: 16,
      params: {
        estilo: "Padrão",
        almaExtra: 10,
        blocosDano: 2,
        blocosDefesa: 1,
        // ... outros parâmetros
      },
      results: {
        danoFinal: 23,
        defesaFinal: 8,
        hpFinal: 12,
        // ... outros resultados calculados
        resultadoEf: {
          totalRoll: 45,
          faixa: "+10%",
          efMul: 1.1
        }
      }
    }
  ]
}
```

### Funcionalidades do Histórico:
- **Cards Expansíveis**: Clique no cabeçalho para ver detalhes
- **Informações Completas**: Estilo, parâmetros, resultados e teste de eficiência
- **Botão "Reforjar"**: Restaura exatamente o mesmo construto
- **Botão "Limpar"**: Remove todo o histórico com confirmação
- **Limite Automático**: Mantém apenas os 20 construtos mais recentes
- **Total Acumulado**: Soma de toda Alma gasta historicamente

## Boas Práticas

### Para Usuários
1. **Planeje a distribuição**: Considere o estilo do construto antes de alocar blocos
2. **Use a interface híbrida**: Combine campos numéricos, sliders e barras clicáveis
3. **Aproveite a realocação**: Quando no limite, redistribua blocos entre atributos
4. **Explore o histórico**: Use "Reforjar" para repetir construtos bem-sucedidos
5. **Monitore o total**: Acompanhe o gasto acumulado de Alma

### Para Desenvolvedores
1. **Modularização**: Funções separadas para cálculo, interface e persistência
2. **Sincronização de Estado**: Controles híbridos com eventos coordenados
3. **Validação Inteligente**: Limites dinâmicos com realocação automática
4. **Persistência Rica**: Histórico completo com parâmetros e resultados
5. **Responsividade**: Layout que funciona em desktop e mobile
6. **Performance**: Uso eficiente do localStorage e DOM

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

- [ ] Campos dedicados para Vontade e Espírito no formulário
- [ ] Sistema de templates/presets de construtos
- [ ] Exportação do histórico para arquivo JSON/CSV
- [ ] Importação de construtos salvos
- [ ] Modo escuro
- [ ] Calculadora de custos de evolução
- [ ] Sistema de favoritos para construtos
- [ ] Comparação lado a lado de construtos
- [ ] Gráficos de distribuição de stats