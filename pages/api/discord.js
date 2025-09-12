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

    // Blocos de rolagens formatados em estilo tabela monospace dentro de code block
    const rows = [];
    if (data.d20) rows.push(`d20 ${`(${data.d20.mode||'normal'})`.padEnd(11)}: ${JSON.stringify(data.d20.rolls||[])}`.trim());
    if (data.atributoDice) rows.push(`${(data.atributo||'ATR').slice(0,12).padEnd(12)} ${(data.atributoDice.qty||0)}d${data.atributoDice.faces||''}: ${JSON.stringify(data.atributoDice.rolls||[])}`);
    if (data.periciaDice) rows.push(`${(data.pericia||'PER').slice(0,12).padEnd(12)} ${(data.periciaDice.qty||0)}d${data.periciaDice.faces||''}: ${JSON.stringify(data.periciaDice.rolls||[])}`);
    // Exibe bônus fixo e adicional separadamente se existirem
    if (data.bonusFixo) rows.push(`Bonus Fixo       : +${data.bonusFixo}`);
    if (data.bonusAdicional) rows.push(`Bonus Adic.      : +${data.bonusAdicional}`);
    // Retrocompatibilidade: se veio só 'bonus' (antigo significado = adicional)
    if (!data.bonusAdicional && !data.bonusFixo && data.bonus) rows.push(`Bonus            : +${data.bonus}`);
    const codeBlock = rows.length ? '```txt\n' + rows.join('\n') + '\n```' : '';

    const footerParts = [];
    footerParts.push(`Vant ${data.vantagens||0}/Desv ${data.desvantagens||0}`);
    if (data.perito) footerParts.push('Perito');
    footerParts.push(new Date(data.timestamp || Date.now()).toLocaleString('pt-BR'));

    const fields = [
      { name: 'Total', value: `${data.total ?? '—'}`, inline: true },
      { name: 'Perícia', value: data.pericia || '—', inline: true },
      { name: 'Atributo', value: data.atributo || '—', inline: true },
    ];
    if (destaque) fields.unshift({ name: 'Resultado', value: destaque, inline: true });

    // Campo de detalhes das somas (mantém compacto)
    if (data.atributoDice || data.periciaDice) {
      const detalLines = [];
      if (data.d20) detalLines.push(`d20 = **${d20Val ?? '?'}**`);
  if (data.atributoDice) detalLines.push(`${data.atributo} = **${data.atributoDice.sum || 0}**`);
  if (data.periciaDice) detalLines.push(`${data.pericia} = **${data.periciaDice.sum || 0}**`);
  if (data.bonusFixo) detalLines.push(`Bônus Fixo = **${data.bonusFixo}**`);
  if (data.bonusAdicional) detalLines.push(`Bônus Adic. = **${data.bonusAdicional}**`);
  // Retrocompatibilidade: campo antigo 'bonus'
  if (!data.bonusAdicional && !data.bonusFixo && data.bonus) detalLines.push(`Bônus = **${data.bonus}**`);
      fields.push({ name: 'Componentes', value: detalLines.join(' + '), inline: false });
    }

    const embed = {
      title,
      description: codeBlock,
      color,
      timestamp: data.timestamp || new Date().toISOString(),
      fields,
      footer: { text: 'LIGHT • Testes • ' + footerParts.join(' • ') }
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