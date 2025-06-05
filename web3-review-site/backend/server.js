const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Database setup
const db = new sqlite3.Database('./projects.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        website TEXT,
        github TEXT,
        submitter TEXT,
        votes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// API Routes
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects ORDER BY votes DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects', (req, res) => {
    const { name, category, description, website, github, submitter } = req.body;
    
    db.run(
        "INSERT INTO projects (name, category, description, website, github, submitter) VALUES (?, ?, ?, ?, ?, ?)",
        [name, category, description, website, github, submitter],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Project added successfully' });
        }
    );
});

app.post('/api/vote/:id', (req, res) => {
    const projectId = req.params.id;
    const { voter } = req.body;
    
    db.run(
        "UPDATE projects SET votes = votes + 1 WHERE id = ?",
        [projectId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Vote recorded successfully' });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});