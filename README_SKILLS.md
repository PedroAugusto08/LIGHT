# Módulo de Habilidades (plugável)

Este módulo adiciona um motor de habilidades com estado persistente em `localStorage`, UI simples e funções para integrar os efeitos às suas rolagens/ataques.

Não altera nenhum arquivo existente. Você escolhe onde importar e renderizar.

## Arquivos

- `lib/skills/engine.js`: lógica e estado das habilidades.
- `components/HabilidadesTab.jsx`: aba de UI dentro da página principal para controlar/visualizar o estado e rodar testes rápidos.

## Habilidades

Insano & Forte
- Passivo (sempre ativo):
  - Dano físico recebido: -25%.
  - Bloqueio bem-sucedido: cura 1d8+2 de Alma.
- Ativo (custo 15 Alma):
  - Duração: 1d6 rodadas.
  - Todo bloqueio (falho ou sucesso): causa 1d4% da Vitalidade Máxima do alvo como dano direto.
  - +1/4 da Alma atual como Defesa adicional (dinâmico enquanto durar).
  - Ao terminar: entra em recarga por 1d10+2 rodadas.

Fúria Ancestral (custo 15 Alma)
- Marca o próximo ataque: +100% de dano e +15 na soma fixa. Consome após usar.

## Uso (UI)

Agora a interface vive em uma aba dedicada dentro da página principal:

- Abra a aplicação e clique na aba "Habilidades" (barra superior de abas).
- Lá você controla o estado (Alma, Vitalidade, Defesa), ativa/desativa efeitos e roda testes rápidos.

## Uso (APIs para integrar às rolagens)

Importe o engine (para integrar no seu fluxo fora da aba, se desejar):

```js
import SkillEngine from '../lib/skills/engine';
```

- Dano físico recebido (aplicar passivo, cura em bloqueio e possível dano direto ao alvo se Insano ativo):

```js
const res = SkillEngine.processIncomingPhysical({
  damage: danoBaseRecebido,
  isBlockSuccess: trueOrFalse,
  targetMaxVitalidade: vitalidadeMaxDoAlvo, // necessário para o 1d4% quando Insano ativo
});
// res = { damageAfter, almaHeal, extraDirectDamageToTarget, state }
```

- Próximo ataque (aplica Fúria Ancestral se estiver armada):

```js
const out = SkillEngine.processOutgoingAttack({ baseDamage, fixedSum });
// out = { damage, fixedSum, consumed, state }
```

- Defesa adicional dinâmica do Insano ativo:

```js
const bonusDef = SkillEngine.getAdditionalDefense();
const defesaTotal = SkillEngine.getDefesaTotal();
```

- Controles de estado/rodadas:

```js
SkillEngine.activateInsano(); // custo 15 Alma, duração 1d6
SkillEngine.advanceRound();   // avança 1 rodada (duração/recarga)
SkillEngine.armFuria();       // marca o próximo ataque (custo 15 Alma)
```

## Observações

- O estado persiste em `localStorage` usando a chave `skills_state_v1`.
- A Defesa adicional do Insano é recalculada dinamicamente com base na Alma atual; se a Alma variar durante a duração, o bônus acompanha.
- As funções do engine são stateful (lêem/escrevem no estado persistido). Caso prefira, você pode ler o estado, aplicar só os cálculos desejados e sobrescrever valores com `setState/replaceState`.
- Nenhum limite máximo de Alma foi imposto; ajuste conforme sua regra de mesa, se necessário.
