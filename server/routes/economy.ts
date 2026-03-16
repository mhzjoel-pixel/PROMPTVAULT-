import express from 'express';
import { db } from '../db/database'; // Assuming a database helper exists
import { verifyOnChainReceipt } from '../services/economy/receiptVerifier';

const router = express.Router();

/**
 * @route POST /api/economy/webhook
 * @desc Webhook for on-chain payment confirmation
 * @env RECEIVER_WALLET={{RECEIVING_WALLET}}
 */
router.post('/webhook', async (req, res) => {
  const { transactionId, userId, itemId, amount, currency, receipt } = req.body;

  try {
    // 1. Verify receipt with on-chain SDK or provider
    const isValid = await verifyOnChainReceipt(receipt, transactionId, amount);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid transaction receipt' });
    }

    // 2. Record purchase in DB
    const purchaseId = await db.run(
      `INSERT INTO purchases (user_id, item_id, amount, currency, transaction_id, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'))`,
      [userId, itemId, amount, currency, transactionId]
    );

    // 3. Unlock content (e.g., add to user's vault)
    await db.run(
      `INSERT INTO user_vault (user_id, prompt_id) VALUES (?, ?)`,
      [userId, itemId]
    );

    res.json({ success: true, purchaseId });
  } catch (error) {
    console.error('Payment Webhook Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/economy/history/:userId
 * @desc Get purchase history for a user
 */
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const history = await db.all(
    `SELECT p.*, pr.title 
     FROM purchases p 
     JOIN prompts pr ON p.item_id = pr.id 
     WHERE p.user_id = ? 
     ORDER BY p.created_at DESC`,
    [userId]
  );
  res.json(history);
});

export default router;
