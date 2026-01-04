const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.use('/dashboard', express.static(publicPath));

const pool = new Pool({
    connectionString: "postgres://lumariq:lumariq@localhost:5432/dispatch"
});

const SECRET = "LUMARIQ_BONE_DEEP_SECRET_2026";
let clients = [];

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    clients.push(res);
    req.on('close', () => clients = clients.filter(c => c !== res));
});

function broadcast(type, payload) {
    clients.forEach(c => c.write(`data: ${JSON.stringify({ type, payload })}\n\n`));
}

// 💱 L3 LIQUIDITY ORACLE
app.get('/api/v1/fx-rate/:pair', async (req, res) => {
    const { pair } = req.params;
    const rates = { 'NGN_GHS': 0.015, 'GHS_NGN': 66.67, 'ZAR_NGN': 52.40 };
    const rate = rates[pair.toUpperCase()] || 1.0;
    res.json({ pair: pair.toUpperCase(), rate, timestamp: new Date() });
});

// 🚀 L2 SMART ROUTING ENGINE
app.get('/api/v1/route/:regionId', async (req, res) => {
    const { regionId } = req.params;
    const neighbors = { 'AF-NGA': ['AF-GHA', 'AF-BEN'], 'AF-ZAF': ['AF-NAM', 'AF-BOT'] };
    try {
        const status = await pool.query('SELECT locked FROM regional_locks WHERE region_id = $1', [regionId]);
        if (status.rows[0]?.locked) {
            const potential = neighbors[regionId] || [];
            const recovery = await pool.query(
                'SELECT region_id FROM regional_locks WHERE region_id = ANY($1) AND locked = false LIMIT 1', [potential]
            );
            return res.json({ status: 'REROUTED', original: regionId, suggested: recovery.rows[0]?.region_id || 'OFFLINE' });
        }
        res.json({ status: 'DIRECT', original: regionId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/force-toggle', async (req, res) => {
    const { regionId, lockStatus } = req.body;
    try {
        await pool.query('UPDATE regional_locks SET locked = $1, reason = $2, updated_at = NOW() WHERE region_id = $3', 
            [lockStatus, 'ADMIN_OVERRIDE', regionId]);
        broadcast('ADMIN_OVERRIDE', { regionId, status: lockStatus ? 'LOCKED' : 'ACTIVE' });
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin/grid-status', async (req, res) => {
    const result = await pool.query('SELECT * FROM regional_locks ORDER BY region_id ASC');
    res.json(result.rows);
});

app.listen(3001, () => console.log('🛰️ L5 SUPREME GRID ONLINE | FX ORACLE ENABLED'));
