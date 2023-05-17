const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Initialize SQLite database
let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQLite database.');
});

// Create Users table
db.run('CREATE TABLE Users(username TEXT PRIMARY KEY, password TEXT NOT NULL)', [], (err) => {
    if (err) {
        console.error(err.message);
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run(`INSERT INTO Users(username, password) VALUES(?, ?)`, [username, password], function (err) {
        if (err) {
            return res.status(400).send({ error: err.message });
        }
        res.status(201).send({ message: 'User registered successfully' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(400).send({ error: err.message });
        }
        if (!row || row.password !== password) {
            return res.status(400).send({ error: 'Login failed! Check your credentials' });
        }
        const token = jwt.sign({ username: row.username }, 'secretkey', { expiresIn: '1h' });
        res.send({ message: 'User logged in successfully', token });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is up and running on port ${port}`));
