const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Frontend')));


// Initialize SQLite database
let db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create Users table
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS Users (ID INTEGER PRIMARY KEY AUTOINCREMENT, Username TEXT NOT NULL, Email TEXT NOT NULL UNIQUE, Password TEXT NOT NULL, Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
});



app.post('/register', function(req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    // Sla de gebruiker op in de database
    db.run("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)", [username, email, password], function(err) {
        if (err) {
            // Stuur een error bericht als er iets misgaat
            res.status(500).send("Error registering user");
        } else {
            // Stuur een succesbericht als het goed gaat
            res.send("User registered successfully");
        }
    });
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is up and running on port ${port}`));
