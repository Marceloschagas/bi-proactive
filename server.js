const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. GARANTE QUE A PASTA DE DADOS EXISTE (Caminho para o Volume)
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

// 2. CONECTA AO BANCO DE DADOS DENTRO DA PASTA BLINDADA
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS bi_data (id TEXT PRIMARY KEY, content TEXT)");
    console.log("Banco de dados pronto e blindado em: " + dbPath);
});

// 3. ROTA PARA SALVAR (UPLOAD)
app.post('/api/save/:type', (req, res) => {
    const { type } = req.params;
    const content = JSON.stringify(req.body);
    
    db.run("INSERT OR REPLACE INTO bi_data (id, content) VALUES (?, ?)", [type, content], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "Dados salvos no volume persistente!" });
    });
});

// 4. ROTA PARA CARREGAR (LOAD)
app.get('/api/load', (req, res) => {
    db.all("SELECT * FROM bi_data", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const data = {};
        rows.forEach(row => data[row.id] = JSON.parse(row.content));
        res.json(data);
    });
});

// 5. ROTA DE STATUS
app.get('/', (req, res) => res.send("API BI Pro Active Online ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));