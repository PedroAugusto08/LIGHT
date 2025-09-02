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
- **Testes Interativos**: Sistema completo de rolagens com atributos, perícias e modificadores
- **Sistema de Favoritos**: Salve e execute rapidamente configurações de teste frequentes

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
├── style.css          # Estilos globais e layout responsivo
├── teste.css          # Estilos específicos da aba Testes
├── script.js          # Lógica de cálculo e controle (Forja/Histórico)
├── testes.js          # Sistema de testes interativos e favoritos
└── README.md          # Esta documentação
```

## Estrutura do Código

### HTML (index.html)
- **Sistema de Abas**: Navegação entre "Forja", "Testes" e "Histórico de Construtos"
- **Formulário Principal**: Inputs para estilo, alma extra e distribuição de blocos
- **Interface Híbrida**: Campos numéricos + sliders + barras de blocos clicáveis para cada atributo
- **Área de Resultados**: Exibição dos stats calculados e detalhes das rolagens
- **Histórico Interativo**: Cards expansíveis com botão "Reforjar" e "Limpar histórico"
- **Sistema de Testes**: Formulário para rolagens com atributos, perícias e modificadores
- **Painel de Favoritos**: Lista persistente de configurações de teste salvas

### CSS (style.css)
- **Layout Responsivo**: Flex containers que se adaptam a diferentes telas
- **Sistema de Abas**: Estilização da navegação e conteúdo
- **Cards Visuais**: Containers com sombras e bordas arredondadas
- **Controles Híbridos**: Estilização de sliders e barras de blocos clicáveis
- **Animações Suaves**: Transições para expand/collapse de cards e hover effects
- **Tema Escuro**: Paleta de cores consistente com variáveis CSS

### CSS (teste.css)
- **Layout de Testes**: Formulário em coluna única com painel de favoritos à direita
- **Estilos de Favoritos**: Cards de favoritos com botões de ação integrados
- **Visual Responsivo**: Adaptação para diferentes tamanhos de tela
- **Micro-interações**: Efeitos hover e transições suaves

### JavaScript (script.js)
Responsável pela lógica da aba Forja e Histórico de Construtos.

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

### JavaScript (testes.js)
Responsável pelo sistema de testes interativos e gerenciamento de favoritos.

#### Principais Funções

##### `rolar(qtd, faces)`
Função utilitária para simulação de dados.
- **Parâmetros**: 
  - `qtd`: quantidade de dados
  - `faces`: número de faces do dado
- **Retorno**: `{ total: number, rolls: number[] }`
- **Uso**: Base para todos os testes de atributos e perícias

##### `rolarD20ComMod(vantagens, desvantagens)`
Rola d20 com sistema de vantagens/desvantagens.
- **Parâmetros**:
  - `vantagens`: número de vantagens (rola dados extras, pega o maior)
  - `desvantagens`: número de desvantagens (rola dados extras, pega o menor)
- **Retorno**: `{ escolha: number, rolls: number[], tipo: string }`
- **Tipos**: 'normal', 'vantagem', 'desvantagem'

##### Sistema de Favoritos
Conjunto de funções para persistência de configurações de teste:
- **`carregarFavoritos()`**: Recupera lista do localStorage
- **`salvarFavoritos(lista)`**: Persiste lista (máx. 50 itens)
- **`renderFavoritos()`**: Atualiza interface visual
- **`adicionarFavorito(cfg)`**: Adiciona nova configuração (evita duplicatas)
- **`executarFavorito(index)`**: Preenche formulário e executa teste automaticamente

#### Constantes de Configuração

##### Atributos (ATRIBUTOS)
Sistema de atributos com valores configuráveis (rolados com d6):
```javascript
{
  "AGILIDADE": 0,
  "CARISMA": 0,
  "CONHECIMENTO": 0,
  "ESPÍRITO": 2,
  "FORÇA": 0,
  "FORTITUDE": 1,
  "PERCEPÇÃO": 0
}
```

##### Perícias (PERICIAS_QTD)
Quantidade de dados por perícia (d10 normal, d12 se perito):
```javascript
{
  "ARCANISMO": 1,
  "FULGOR": 2,
  "MENTE": 1,
  "VONTADE": 3,
  // ... outras perícias
}
```

##### Bônus Fixos (PERICIAS_BONUS_FIXO)
Bônus numérico adicional por perícia (opcional):
```javascript
{
  "ARCANISMO": 0,
  "VONTADE": 12,
  // ... configurável por perícia
}
```

#### Fórmula de Teste
```
Total = d20 (com vant/desv) + Atributo (N×d6) + Perícia (N×d10/d12) + Bônus Fixo + Bônus Adicional
```

## Sistema de Testes Interativos

### Funcionalidades
- **Seleção de Perícia/Atributo**: Dropdowns organizados alfabeticamente
- **Modo Perito**: Checkbox que muda dados de perícia de d10 para d12
- **Vantagens/Desvantagens**: Sistema de múltiplos d20 (pega maior/menor)
- **Bônus Adicional**: Campo livre para modificadores situacionais
- **Resultado Detalhado**: Breakdown completo de todas as rolagens

### Interface de Favoritos
- **Painel Lateral**: Lista persistente à direita do formulário
- **Ações Rápidas**: Botões "Rolar" e "Remover" para cada favorito
- **Informações Compactas**: Perícia, atributo, modo perito e modificadores
- **Execução Automática**: Favoritos preenchem formulário e executam teste
- **Prevenção de Duplicatas**: Evita favoritos idênticos consecutivos

## Sistema de Favoritos

### Estrutura de Dados
```javascript
// localStorage key: 'testesFavoritos'
[
  {
    pericia: "ARCANISMO",
    atributo: "AGILIDADE", 
    perito: true,
    vantagens: 0,
    desvantagens: 1,
    bonusAdicional: 2
  }
]
```

### Características
- **Persistência**: Dados salvos automaticamente no localStorage
- **Limite**: Máximo 50 favoritos (remove mais antigos automaticamente)
- **Deduplicação**: Evita salvar favoritos idênticos em sequência
- **Interface Visual**: Cards com informações resumidas e botões de ação
- **Execução Rápida**: Um clique para executar teste completo

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

### localStorage - Persistência de Dados

#### Histórico de Construtos
O histórico salva automaticamente construtos completos com limite de 20 entradas:

```javascript
// Estrutura dos dados salvos
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

#### Favoritos de Testes
Sistema de persistência para configurações de teste frequentes:

```javascript
// localStorage key: 'testesFavoritos'
[
  {
    pericia: "ARCANISMO",
    atributo: "AGILIDADE",
    perito: true,
    vantagens: 0,
    desvantagens: 1,
    bonusAdicional: 2
  }
]
```

### Funcionalidades do Histórico:
- **Cards Expansíveis**: Clique no cabeçalho para ver detalhes
- **Informações Completas**: Estilo, parâmetros, resultados e teste de eficiência
- **Botão "Reforjar"**: Restaura exatamente o mesmo construto
- **Botão "Limpar"**: Remove todo o histórico com confirmação
- **Limite Automático**: Mantém apenas os 20 construtos mais recentes
- **Total Acumulado**: Soma de toda Alma gasta historicamente

### Funcionalidades dos Favoritos:
- **Persistência Automática**: Salvamento imediato no localStorage
- **Interface Intuitiva**: Cards com informações resumidas
- **Execução Rápida**: Botão "Rolar" preenche formulário e executa
- **Gerenciamento Simples**: Botão "Remover" para limpeza
- **Prevenção de Spam**: Evita favoritos idênticos consecutivos
- **Limite Inteligente**: Máximo 50 itens (remove mais antigos)

## Boas Práticas

### Para Usuários
1. **Planeje a distribuição**: Considere o estilo do construto antes de alocar blocos
2. **Use a interface híbrida**: Combine campos numéricos, sliders e barras clicáveis
3. **Aproveite a realocação**: Quando no limite, redistribua blocos entre atributos
4. **Explore o histórico**: Use "Reforjar" para repetir construtos bem-sucedidos
5. **Monitore o total**: Acompanhe o gasto acumulado de Alma
6. **Configure atributos e perícias**: Edite as constantes em `testes.js` para seu personagem
7. **Use favoritos**: Salve combinações de teste frequentes para execução rápida
8. **Organize seus testes**: Configure vantagens/desvantagens conforme a situação

### Para Desenvolvedores
1. **Modularização**: Funções separadas para cálculo, interface e persistência
2. **Sincronização de Estado**: Controles híbridos com eventos coordenados
3. **Validação Inteligente**: Limites dinâmicos com realocação automática
4. **Persistência Rica**: Histórico completo com parâmetros e resultados
5. **Responsividade**: Layout que funciona em desktop e mobile
6. **Performance**: Uso eficiente do localStorage e DOM
7. **Separação de Responsabilidades**: `script.js` para Forja, `testes.js` para Testes
8. **CSS Modular**: Estilos globais e específicos em arquivos separados
9. **Configurabilidade**: Constantes editáveis para atributos e perícias
10. **UX Consistente**: Padrões visuais uniformes entre abas

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

- [ ] ~~Campos dedicados para Vontade e Espírito no formulário~~ ✅ **Implementado na aba Testes**
- [ ] ~~Sistema de templates/presets de construtos~~ ✅ **Favoritos implementados**
- [ ] Exportação do histórico para arquivo JSON/CSV
- [ ] Importação de construtos salvos
- [ ] ~~Modo escuro~~ ✅ **Implementado**
- [ ] Calculadora de custos de evolução
- [ ] ~~Sistema de favoritos para construtos~~ ✅ **Sistema de favoritos para testes**
- [ ] Comparação lado a lado de construtos
- [ ] Gráficos de distribuição de stats
- [ ] Interface para edição de atributos/perícias sem editar código
- [ ] Sistema de tags/categorias para favoritos
- [ ] Importação/exportação de configurações de personagem
- [ ] Histórico de testes (similar ao histórico de construtos)
- [ ] Calculadora de probabilidades para testes