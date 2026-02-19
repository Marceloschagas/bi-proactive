const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Banco de dados SQLite Blindado
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS bi_data (id TEXT PRIMARY KEY, content TEXT)");
});

app.post('/api/save/:type', (req, res) => {
    const { type } = req.params;
    db.run("INSERT OR REPLACE INTO bi_data (id, content) VALUES (?, ?)", [type, JSON.stringify(req.body)], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ status: "Salvo com sucesso!" });
    });
});

app.get('/api/load', (req, res) => {
    db.all("SELECT * FROM bi_data", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        const data = {};
        rows.forEach(row => data[row.id] = JSON.parse(row.content));
        res.json(data);
    });
});

app.listen(process.env.PORT || 3000);