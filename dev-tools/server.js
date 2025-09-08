import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({
  origin: [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/, null],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-light-key']
}));

const API_KEY = process.env.LIGHT_API_KEY;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/discord', async (req, res) => {
  try {
    if (!WEBHOOK_URL) return res.status(500).json({ error: 'DISCORD_WEBHOOK_URL não configurada' });
    const key = req.get('x-light-key');
    if (!API_KEY || key !== API_KEY) return res.status(401).json({ error: 'unauthorized' });

    const data = req.body || {};
    const title = `Teste: ${data.pericia} + ${data.atributo}`;
    const desc =
      `d20 (${data?.d20?.mode || 'normal'}): ${JSON.stringify(data?.d20?.rolls || [])} ⇒ ${data?.d20?.value}\n` +
      `${data.atributo} (${data?.atributoDice?.qty}×d${data?.atributoDice?.faces}): ${JSON.stringify(data?.atributoDice?.rolls || [])} = ${data?.atributoDice?.sum || 0}\n` +
      `${data.pericia} (${data?.periciaDice?.qty}×d${data?.periciaDice?.faces}): ${JSON.stringify(data?.periciaDice?.rolls || [])} = ${data?.periciaDice?.sum || 0}\n` +
      `Bônus: ${data?.bonus || 0}  |  Vantagens: ${data?.vantagens || 0}  •  Desvantagens: ${data?.desvantagens || 0}  •  Perito: ${data?.perito ? 'Sim' : 'Não'}`;

    const embed = {
      title,
      description: desc,
      color: 0x00b5d8,
      timestamp: data.timestamp || new Date().toISOString(),
      fields: [
        { name: 'Total', value: `**${data.total}**`, inline: true },
        { name: 'Perícia', value: String(data.pericia || ''), inline: true },
        { name: 'Atributo', value: String(data.atributo || ''), inline: true },
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
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LIGHT webhook relay on http://localhost:${PORT}`));

app.get('/', (_req, res) => {
  res.status(200).send('LIGHT relay online. Use POST /api/discord ou GET /health.');
});