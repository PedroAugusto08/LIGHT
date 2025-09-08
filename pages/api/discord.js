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
  const key = req.headers['x-light-key'] || '';
    if (key !== API_KEY) return res.status(401).json({ error: 'unauthorized' });
  }

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!WEBHOOK_URL) return res.status(500).json({ error: 'missing_webhook' });

  try {
    const data = typeof req.body === 'string' ? (JSON.parse(req.body || '{}')) : (req.body || {});
    const title = `Teste: ${data.pericia || '—'} + ${data.atributo || '—'}`;
    const descLines = [];
    if (data.d20) descLines.push(`d20 (${data.d20.mode || 'normal'}): ${JSON.stringify(data.d20.rolls || [])} ⇒ ${data.d20.value || ''}`);
    if (data.atributoDice) descLines.push(`${data.atributo} (${data.atributoDice.qty || 0}×d${data.atributoDice.faces || ''}): ${JSON.stringify(data.atributoDice.rolls || [])} = ${data.atributoDice.sum || 0}`);
    if (data.periciaDice) descLines.push(`${data.pericia} (${data.periciaDice.qty || 0}×d${data.periciaDice.faces || ''}): ${JSON.stringify(data.periciaDice.rolls || [])} = ${data.periciaDice.sum || 0}`);
    descLines.push(`Bônus: ${data.bonus || 0}  |  Vant: ${data.vantagens || 0}  •  Desv: ${data.desvantagens || 0}`);

    const embed = {
      title,
      description: descLines.join('\n'),
      color: 0x00b5d8,
      timestamp: data.timestamp || new Date().toISOString(),
      fields: [
        { name: 'Total', value: `${data.total ?? '—'}`, inline: true },
        { name: 'Perícia', value: data.pericia || '—', inline: true },
        { name: 'Atributo', value: data.atributo || '—', inline: true }
      ],
      footer: { text: 'LIGHT • Testes' }
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