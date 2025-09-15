export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowlist = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const corsOk = allowlist.length === 0 || allowlist.includes(origin) || origin === '';

  const setCors = () => {
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Origin', corsOk ? (origin || '*') : 'null');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-light-key');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  };

  if (req.method === 'OPTIONS') {
    setCors();
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    setCors();
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  setCors();

  const API_KEY = process.env.LIGHT_API_KEY || '';
  if (API_KEY) {
    // Chave agora é opcional: só bloqueia se o cliente enviar uma chave diferente
    const key = req.headers['x-light-key'];
    if (typeof key !== 'undefined' && key !== API_KEY) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!WEBHOOK_URL) return res.status(500).json({ error: 'missing_webhook' });

  try {
    const data = typeof req.body === 'string' ? (JSON.parse(req.body || '{}')) : (req.body || {});

    // ---------- Construção aprimorada do embed ----------
    const d20Info = data.d20 || {};
    const d20Val = typeof d20Info.value === 'number' ? d20Info.value : undefined;
    let color = 0x00b5d8; // padrão (ciano)
    let destaque = '';
    if (typeof d20Val === 'number') {
      if (d20Val === 20) { color = 0x10b981; destaque = '✅ Crítico'; }
      else if (d20Val === 1) { color = 0xef4444; destaque = '❌ Falha Crítica'; }
      else if (d20Val >= 15) { color = 0x3b82f6; destaque = '✔ Alto'; }
      else if (d20Val <= 5) { color = 0xf59e0b; destaque = '⚠ Baixo'; }
    }

    const title = `Teste: ${data.pericia || '—'} + ${data.atributo || '—'}`;

    // ===== Novo formato simplificado =====
    // Paleta e helpers ANSI
    const ANSI = {
      reset: '\u001b[0m',
      red: (n) => `\u001b[31m${n}\u001b[0m`,
      green: (n) => `\u001b[32m${n}\u001b[0m`,
    };
    const colorNum = (n, faces) => {
      if (typeof n !== 'number') return String(n);
      if (n === 1) return ANSI.red(n);
      if (faces && n === faces) return ANSI.green(n);
      return String(n);
    };

    // d20 (com vantagem/desvantagem) -> Xd20 [a, b, c] com escolhido sublinhado
    let d20Expr = '';
    if (data.d20 && Array.isArray(data.d20.rolls)) {
      const rolls = data.d20.rolls.slice();
      const qty = rolls.length || 1;
      const chosen = typeof d20Val === 'number' ? d20Val : null;
      const rollsFmt = rolls.map(v => {
        const isMin = v === 1;
        const isMax = v === 20;
        const isChosen = qty > 1 && chosen !== null && v === chosen; // só sublinha se múltiplas rolagens
        // Monta lista de códigos (underline + cor) em uma única sequência ANSI
        const codes = [];
        if (isChosen) codes.push(4); // underline
        if (isMin) codes.push(31); else if (isMax) codes.push(32); // cores
        if (codes.length) return `\u001b[${codes.join(';')}m${v}\u001b[0m`;
        return String(v);
      }).join(', ');
  d20Expr = `${qty}d20[${rollsFmt}]`;
  if (!d20Expr && chosen !== null) d20Expr = `1d20[${chosen}]`;
    }

    // Atributo: só se qty > 0
    let atribExpr = '';
    if (data.atributoDice && (data.atributoDice.qty||0) > 0) {
      const faces = data.atributoDice.faces || 6;
      const rolls = (data.atributoDice.rolls||[]).map(v => colorNum(v, faces)).join(', ');
  atribExpr = `${data.atributoDice.qty}d${faces}[${rolls}]`;
    }

    // Perícia: só se qty > 0
    let periciaExpr = '';
    if (data.periciaDice && (data.periciaDice.qty||0) > 0) {
      const faces = data.periciaDice.faces || 10;
      const rolls = (data.periciaDice.rolls||[]).map(v => colorNum(v, faces)).join(', ');
  periciaExpr = `${data.periciaDice.qty}d${faces}[${rolls}]`;
    }

    // Bônus agregado (fixo + adicional ou inferido)
    let bonusTotal = 0;
    if (data.bonusFixo) bonusTotal += data.bonusFixo;
    if (data.bonusAdicional) bonusTotal += data.bonusAdicional;
    // Inferência se não informado explicitamente
    const somaBase = (typeof d20Val === 'number' ? d20Val : 0) + (data.atributoDice?.sum||0) + (data.periciaDice?.sum||0);
    if (!bonusTotal && data.total && somaBase && (data.total - somaBase) !== 0) {
      bonusTotal = data.total - somaBase;
    }
    const bonusExpr = bonusTotal ? `Bônus [${bonusTotal}]` : '';

    // Monta a linha final
    const RESET = '\u001b[0m';
    const COLOR_TOTAL = '\u001b[38;5;39m';
    const parts = [d20Expr, atribExpr, periciaExpr, bonusExpr].filter(Boolean);
    const fullExpr = `${COLOR_TOTAL}${data.total ?? '—'}${RESET} ⟵ ${parts.join(' + ')}`;
    const codeBlock = '```ansi\n' + fullExpr + '\n```';

    // Sem fields agora; tudo está na descrição
    const fields = [];

    const embed = {
      title,
      description: codeBlock,
      color,
      fields,
    };

    const payload = { username: 'LIGHT', embeds: [embed] };

    const resp = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return res.status(500).json({ error: 'discord_error', status: resp.status, body: txt });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal' });
  }
}