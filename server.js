// ======================================
// BI PRO ACTIVE - API SERVER
// ======================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ======================================
// 1️⃣ GARANTE QUE A PASTA /data EXISTE
// ======================================
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log("📁 Pasta /data criada com sucesso.");
}

// ======================================
// 2️⃣ CONFIGURA O BANCO SQLITE
// ======================================
const dbPath = path.join(dataDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Erro ao conectar no banco:", err.message);
    } else {
        console.log("✅ Banco conectado em:", dbPath);
    }
});

// Cria tabela se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS bi_data (
            id TEXT PRIMARY KEY,
            content TEXT
        )
    `);
});

// ======================================
// 3️⃣ ROTA PARA SALVAR DADOS
// ======================================
app.post('/api/save/:type', (req, res) => {
    const { type } = req.params;
    const content = JSON.stringify(req.body);

    db.run(
        "INSERT OR REPLACE INTO bi_data (id, content) VALUES (?, ?)",
        [type, content],
        function (err) {
            if (err) {
                console.error("Erro ao salvar:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                message: "Dados salvos com sucesso ✅"
            });
        }
    );
});

// ======================================
// 4️⃣ ROTA PARA CARREGAR DADOS
// ======================================
app.get('/api/load', (req, res) => {
    db.all("SELECT * FROM bi_data", [], (err, rows) => {
        if (err) {
            console.error("Erro ao carregar:", err.message);
            return res.status(500).json({ error: err.message });
        }

        const data = {};
        rows.forEach(row => {
            try {
                data[row.id] = JSON.parse(row.content);
            } catch (parseError) {
                data[row.id] = row.content;
            }
        });

        res.json(data);
    });
});

// ======================================
// 5️⃣ ROTA DE STATUS
// ======================================
app.get('/', (req, res) => {
    res.send("🚀 API BI Pro Active Online");
});

// ======================================
// INICIA SERVIDOR
// ======================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
