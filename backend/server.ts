import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();
app.use(express.json({ limit: '64kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 60 }));

const WorldIdResponse = z.object({
  protocol_version: z.number(),
  nonce: z.string(),
  action: z.string(),
  responses: z.array(z.object({
    nullifier_hash: z.string(),
    proof: z.string(),
    merkle_root: z.string(),
    verification_level: z.string(),
  })).min(1),
  signal: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

app.post('/verify-world-id', async (req, res) => {
  const body = WorldIdResponse.parse(req.body);
  const rpId = process.env.WORLD_ID_RP_ID;
  if (!rpId) return res.status(500).json({ error: 'WORLD_ID_RP_ID is required' });
  if (body.action !== process.env.WORLD_ID_ACTION) return res.status(400).json({ error: 'unexpected action' });

  const response = await fetch(`https://developer.world.org/api/v4/verify/${rpId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || result.success === false) return res.status(400).json(result);

  res.json({ ok: true, nullifierHash: body.responses[0].nullifier_hash, verification: result });
});

app.get('/events', (_req, res) => res.json({ events: [] }));
app.post('/create-event', (_req, res) => res.status(501).json({ error: 'submit signed admin transaction to AttendXCore.createEvent' }));
app.post('/stake', (_req, res) => res.status(501).json({ error: 'client calls AttendXCore.stake after World ID verification' }));
app.post('/claim-reward', (_req, res) => res.status(501).json({ error: 'client calls AttendXCore.claimReward' }));
app.get('/user/:wallet', (req, res) => res.json({ wallet: req.params.wallet, totalStaked: '0', rewardsClaimed: '0' }));

app.listen(Number(process.env.PORT || 4000), () => console.log('AttendX API listening'));
