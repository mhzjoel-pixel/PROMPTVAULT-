import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vault.db");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    username TEXT,
    bio TEXT,
    world_id_nullifier TEXT UNIQUE,
    is_human INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    creator_address TEXT,
    title TEXT,
    description TEXT,
    content TEXT,
    price REAL,
    category TEXT,
    tags TEXT,
    model_compatibility TEXT, -- e.g., 'GPT-4, Claude 3, Midjourney'
    prompt_type TEXT, -- e.g., 'Text-to-Image', 'Code Generation', 'Creative Writing'
    license_type TEXT DEFAULT 'Standard',
    rating REAL DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    token_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(creator_address) REFERENCES users(address)
  );

  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    curator_address TEXT,
    is_staff_pick INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(curator_address) REFERENCES users(address)
  );

  CREATE TABLE IF NOT EXISTS collection_prompts (
    collection_id TEXT,
    prompt_id TEXT,
    PRIMARY KEY(collection_id, prompt_id),
    FOREIGN KEY(collection_id) REFERENCES collections(id),
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
  );

  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_address TEXT,
    prompt_id TEXT,
    activity_type TEXT, -- 'view', 'search', 'purchase'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_address) REFERENCES users(address),
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
  );

  CREATE TABLE IF NOT EXISTS ownership (
    owner_address TEXT,
    prompt_id TEXT,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(owner_address, prompt_id),
    FOREIGN KEY(owner_address) REFERENCES users(address),
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    prompt_id TEXT,
    buyer_address TEXT,
    seller_address TEXT,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prompt_id) REFERENCES prompts(id),
    FOREIGN KEY(buyer_address) REFERENCES users(address),
    FOREIGN KEY(seller_address) REFERENCES users(address)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    user_address TEXT,
    prompt_id TEXT,
    score INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_address, prompt_id),
    FOREIGN KEY(user_address) REFERENCES users(address),
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_address TEXT,
    prompt_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_address, prompt_id),
    FOREIGN KEY(user_address) REFERENCES users(address),
    FOREIGN KEY(prompt_id) REFERENCES prompts(id)
  );

  -- Seed Data
  INSERT OR IGNORE INTO users (address, username) VALUES ('0x71C...3921', 'Satoshi_GPT');
  INSERT OR IGNORE INTO users (address, username) VALUES ('0xStaff', 'PromptVault_Staff');

  INSERT OR IGNORE INTO prompts (id, creator_address, title, description, content, price, category, tags, model_compatibility, prompt_type, license_type, rating, sales_count, token_id)
  VALUES (
    'p_seed_1', 
    '0x71C...3921', 
    'Neural-Architect V2', 
    'A specialized prompt for generating complex architectural blueprints with structural integrity checks.', 
    'Act as a senior structural engineer...', 
    0.12, 
    'Technical', 
    'architecture,blueprint,engineering',
    'GPT-4, Claude 3',
    'Technical Specification',
    'Standard',
    4.8,
    12,
    'TKN_ARCH_001'
  );
  INSERT OR IGNORE INTO prompts (id, creator_address, title, description, content, price, category, tags, model_compatibility, prompt_type, license_type, rating, sales_count, token_id)
  VALUES (
    'p_seed_2', 
    '0x71C...3921', 
    'Cyberpunk Worldbuilder', 
    'Generates deep lore, character backstories, and atmospheric descriptions for cyberpunk RPG settings.', 
    'Create a dystopian city called...', 
    0.05, 
    'Creative', 
    'cyberpunk,rpg,lore,storytelling',
    'GPT-4, GPT-3.5',
    'Creative Writing',
    'Commercial',
    4.5,
    45,
    'TKN_CYBER_99'
  );
  INSERT OR IGNORE INTO prompts (id, creator_address, title, description, content, price, category, tags, model_compatibility, prompt_type, license_type, rating, sales_count, token_id)
  VALUES (
    'p_seed_3', 
    '0x71C...3921', 
    'Python Optimization Pro', 
    'Refactor and optimize Python code for maximum performance and readability.', 
    'Optimize the following Python code...', 
    0.08, 
    'Code', 
    'python,optimization,coding',
    'GPT-4, Claude 3, Gemini Pro',
    'Code Generation',
    'Standard',
    4.9,
    8,
    'TKN_PY_OPT'
  );

  INSERT OR IGNORE INTO collections (id, title, description, curator_address, is_staff_pick)
  VALUES ('c_staff_1', 'Staff Picks: Engineering Marvels', 'The most precise prompts for technical and engineering tasks.', '0xStaff', 1);

  INSERT OR IGNORE INTO collection_prompts (collection_id, prompt_id) VALUES ('c_staff_1', 'p_seed_1');
  INSERT OR IGNORE INTO collection_prompts (collection_id, prompt_id) VALUES ('c_staff_1', 'p_seed_3');
  INSERT OR IGNORE INTO ownership (owner_address, prompt_id) VALUES ('0x71C...3921', 'p_seed_1');
  INSERT OR IGNORE INTO ownership (owner_address, prompt_id) VALUES ('0x71C...3921', 'p_seed_2');
  INSERT OR IGNORE INTO ownership (owner_address, prompt_id) VALUES ('0x71C...3921', 'p_seed_3');
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // API Routes
  app.get("/api/prompts", (req, res) => {
    const { search, category, minPrice, maxPrice, license, sort, model, type, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = "FROM prompts WHERE 1=1";
    const params: any[] = [];

    if (search) {
      baseQuery += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category && category !== 'All') {
      baseQuery += " AND category = ?";
      params.push(category);
    }

    if (model && model !== 'All') {
      baseQuery += " AND model_compatibility LIKE ?";
      params.push(`%${model}%`);
    }

    if (type && type !== 'All') {
      baseQuery += " AND prompt_type = ?";
      params.push(type);
    }

    if (minPrice) {
      baseQuery += " AND price >= ?";
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      baseQuery += " AND price <= ?";
      params.push(parseFloat(maxPrice as string));
    }

    if (license && license !== 'All') {
      baseQuery += " AND license_type = ?";
      params.push(license);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const { total } = db.prepare(countQuery).get(...params) as { total: number };

    let query = `SELECT * ${baseQuery}`;
    switch (sort) {
      case 'newest':
        query += " ORDER BY created_at DESC";
        break;
      case 'popular':
        query += " ORDER BY sales_count DESC";
        break;
      case 'highest_rated':
        query += " ORDER BY rating DESC";
        break;
      case 'price_low':
        query += " ORDER BY price ASC";
        break;
      case 'price_high':
        query += " ORDER BY price DESC";
        break;
      default:
        query += " ORDER BY created_at DESC";
    }

    query += " LIMIT ? OFFSET ?";
    const prompts = db.prepare(query).all(...params, limitNum, offset);
    
    res.json({
      prompts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  });

  app.get("/api/collections", (req, res) => {
    const collections = db.prepare("SELECT * FROM collections ORDER BY is_staff_pick DESC, created_at DESC").all();
    res.json(collections);
  });

  app.get("/api/collections/:id", (req, res) => {
    const collection = db.prepare("SELECT * FROM collections WHERE id = ?").get(req.params.id);
    if (!collection) return res.status(404).json({ error: "Collection not found" });
    
    const prompts = db.prepare(`
      SELECT p.* FROM prompts p
      JOIN collection_prompts cp ON p.id = cp.prompt_id
      WHERE cp.collection_id = ?
    `).all(req.params.id);
    
    res.json({ ...collection, prompts });
  });

  app.get("/api/recommendations", (req, res) => {
    const { address } = req.query;
    
    if (!address) {
      // Return popular prompts if no user address provided
      const popular = db.prepare("SELECT * FROM prompts ORDER BY sales_count DESC LIMIT 6").all();
      return res.json(popular);
    }

    // Simple recommendation logic: find prompts in categories the user has interacted with
    const userInterests = db.prepare(`
      SELECT DISTINCT p.category FROM user_activity ua
      JOIN prompts p ON ua.prompt_id = p.id
      WHERE ua.user_address = ?
      LIMIT 3
    `).all(address) as { category: string }[];

    if (userInterests.length === 0) {
      const popular = db.prepare("SELECT * FROM prompts ORDER BY sales_count DESC LIMIT 6").all();
      return res.json(popular);
    }

    const categories = userInterests.map(i => i.category);
    const placeholders = categories.map(() => '?').join(',');
    
    const recommendations = db.prepare(`
      SELECT * FROM prompts 
      WHERE category IN (${placeholders})
      AND id NOT IN (SELECT prompt_id FROM ownership WHERE owner_address = ?)
      ORDER BY rating DESC, sales_count DESC
      LIMIT 6
    `).all(...categories, address);

    res.json(recommendations);
  });

  app.post("/api/activity", (req, res) => {
    const { address, prompt_id, type } = req.body;
    if (!address || !prompt_id || !type) return res.status(400).json({ error: "Missing fields" });
    
    try {
      db.prepare("INSERT INTO user_activity (user_address, prompt_id, activity_type) VALUES (?, ?, ?)")
        .run(address, prompt_id, type);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to record activity" });
    }
  });

  app.get("/api/prompts/:id", (req, res) => {
    const prompt = db.prepare("SELECT * FROM prompts WHERE id = ?").get(req.params.id);
    if (!prompt) return res.status(404).json({ error: "Prompt not found" });
    res.json(prompt);
  });

  app.post("/api/users/register", (req, res) => {
    const { address, username } = req.body;
    try {
      db.prepare("INSERT OR IGNORE INTO users (address, username) VALUES (?, ?)").run(address, username);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/prompts/mint", (req, res) => {
    const { id, creator_address, title, description, content, price, category, tags, model_compatibility, prompt_type, license_type, token_id } = req.body;
    try {
      db.prepare(`
        INSERT INTO prompts (id, creator_address, title, description, content, price, category, tags, model_compatibility, prompt_type, license_type, token_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, creator_address, title, description, content, price, category, tags, model_compatibility, prompt_type, license_type, token_id);
      
      // Creator also owns it initially
      db.prepare("INSERT OR IGNORE INTO ownership (owner_address, prompt_id) VALUES (?, ?)").run(creator_address, id);
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mint prompt" });
    }
  });

  app.post("/api/prompts/buy", async (req, res) => {
    const { prompt_id, buyer_address, seller_address, amount, transaction_id, payload } = req.body;
    try {
      // Verify the transaction with Worldcoin's API if credentials are provided
      if (process.env.WLD_APP_ID && process.env.WLD_DEVELOPER_KEY) {
        try {
          const verifyRes = await fetch(`https://developer.worldcoin.org/api/v2/minikit/transaction/${transaction_id}?app_id=${process.env.WLD_APP_ID}`, {
            headers: { 'Authorization': `Bearer ${process.env.WLD_DEVELOPER_KEY}` }
          });
          
          const contentType = verifyRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const verifyData = await verifyRes.json();
            if (verifyData.status !== 'success') {
              return res.status(400).json({ error: 'Payment verification failed', details: verifyData });
            }
          } else {
            const text = await verifyRes.text();
            console.error('Worldcoin transaction verification returned non-JSON:', text.slice(0, 100));
            if (!verifyRes.ok) {
              return res.status(verifyRes.status).json({ error: 'Payment verification service error' });
            }
          }
        } catch (verifyErr) {
          console.error('Worldcoin verification error:', verifyErr);
        }
      }

      const transaction = db.transaction(() => {
        // Update ownership
        db.prepare("DELETE FROM ownership WHERE prompt_id = ? AND owner_address = ?").run(prompt_id, seller_address);
        db.prepare("INSERT OR IGNORE INTO ownership (owner_address, prompt_id) VALUES (?, ?)").run(buyer_address, prompt_id);
        
        // Update sales count
        db.prepare("UPDATE prompts SET sales_count = sales_count + 1 WHERE id = ?").run(prompt_id);

        // Record transaction
        db.prepare(`
          INSERT INTO transactions (id, prompt_id, buyer_address, seller_address, amount)
          VALUES (?, ?, ?, ?, ?)
        `).run(transaction_id, prompt_id, buyer_address, seller_address, amount);
      });
      
      transaction();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Transaction failed" });
    }
  });

  app.post("/api/prompts/:id/rate", (req, res) => {
    const { user_address, score, comment } = req.body;
    const prompt_id = req.params.id;

    try {
      // Check if user owns the prompt
      const ownership = db.prepare("SELECT * FROM ownership WHERE owner_address = ? AND prompt_id = ?").get(user_address, prompt_id);
      if (!ownership) {
        return res.status(403).json({ error: "You must own the prompt to rate it" });
      }

      const transaction = db.transaction(() => {
        // Insert or update rating
        db.prepare(`
          INSERT INTO ratings (user_address, prompt_id, score, comment)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_address, prompt_id) DO UPDATE SET score = excluded.score, comment = excluded.comment
        `).run(user_address, prompt_id, score, comment);

        // Recalculate average rating
        const stats = db.prepare("SELECT AVG(score) as avg_score FROM ratings WHERE prompt_id = ?").get(prompt_id) as { avg_score: number };
        db.prepare("UPDATE prompts SET rating = ? WHERE id = ?").run(stats.avg_score, prompt_id);
      });

      transaction();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to submit rating" });
    }
  });

  app.get("/api/prompts/:id/reviews", (req, res) => {
    const reviews = db.prepare(`
      SELECT r.*, u.username FROM ratings r
      JOIN users u ON r.user_address = u.address
      WHERE r.prompt_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);
    res.json(reviews);
  });

  app.get("/api/users/:address/vault", (req, res) => {
    const ownedPrompts = db.prepare(`
      SELECT p.* FROM prompts p
      JOIN ownership o ON p.id = o.prompt_id
      WHERE o.owner_address = ?
    `).all(req.params.address);
    res.json(ownedPrompts);
  });

  app.get("/api/users/:address/favorites", (req, res) => {
    const favoritePrompts = db.prepare(`
      SELECT p.* FROM prompts p
      JOIN favorites f ON p.id = f.prompt_id
      WHERE f.user_address = ?
    `).all(req.params.address);
    res.json(favoritePrompts);
  });

  app.post("/api/favorites", (req, res) => {
    const { address, prompt_id } = req.body;
    if (!address || !prompt_id) return res.status(400).json({ error: "Missing fields" });
    
    try {
      db.prepare("INSERT OR IGNORE INTO favorites (user_address, prompt_id) VALUES (?, ?)")
        .run(address, prompt_id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:prompt_id", (req, res) => {
    const { address } = req.query;
    const { prompt_id } = req.params;
    if (!address || !prompt_id) return res.status(400).json({ error: "Missing fields" });
    
    try {
      db.prepare("DELETE FROM favorites WHERE user_address = ? AND prompt_id = ?")
        .run(address, prompt_id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove from favorites" });
    }
  });

  app.post("/api/verify-world-id", async (req, res) => {
    const { proof, address } = req.body;
    
    try {
      const appId = process.env.WLD_APP_ID || 'app_staging_123';
      
      // Verify the proof with Worldcoin's API
      const verifyRes = await fetch(`https://developer.worldcoin.org/api/v1/verify/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...proof, 
          action: process.env.WLD_ACTION_ID || 'verify_human' 
        })
      });

      let verifyData: any = {};
      const contentType = verifyRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        verifyData = await verifyRes.json();
      } else {
        const text = await verifyRes.text();
        console.error('World ID verification returned non-JSON:', text.slice(0, 100));
      }

      // In production, we strictly check verifyRes.ok
      // In development/staging, we might allow mock proofs
      if (verifyRes.ok || (process.env.NODE_ENV !== 'production' && !process.env.WLD_APP_ID)) {
        db.prepare("UPDATE users SET is_human = 1, world_id_nullifier = ? WHERE address = ?")
          .run(proof.nullifier_hash || `null_${Date.now()}`, address);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "World ID verification failed", details: verifyData });
      }
    } catch (err) {
      console.error('World ID verification error:', err);
      res.status(500).json({ error: "Internal server error during World ID verification" });
    }
  });

  app.get("/api/users/:address", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(req.params.address);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/verify", async (req, res) => {
    const { content } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following AI prompt for quality, safety, and effectiveness. Provide a score from 0-100 and a brief verification status. Return JSON: { "score": number, "status": string, "feedback": string }. Prompt: ${content}`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
