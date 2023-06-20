const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../Frontend/public/uploads')));

// Initialize SQLite database
let db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create Users table
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS Users (ID INTEGER PRIMARY KEY AUTOINCREMENT, Username TEXT NOT NULL, Email TEXT NOT NULL UNIQUE, Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
});

// Create Blueprints table
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS Blueprints (ID INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT NOT NULL, BlueprintString TEXT NOT NULL, Image TEXT NOT NULL, DateOfUpload TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UserID INTEGER NOT NULL, FOREIGN KEY (UserID) REFERENCES Users(ID))");
});

// Set up multer storage for blueprint image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.get('/blueprints', (req, res) => {
    db.all('SELECT Blueprints.*, Users.Username FROM Blueprints INNER JOIN Users ON Blueprints.UserID = Users.ID', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('An error occurred while fetching blueprint data.');
        }

        const blueprints = rows.map(row => ({
            id: row.ID,
            title: row.Title,
            blueprintString: row.BlueprintString,
            image: row.Image,
            dateOfUpload: row.DateOfUpload,
            userId: row.UserID,
            username: row.Username
        }));

        res.json(blueprints);
    });
});


// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Serve blueprint-detail.html
app.get('/blueprints/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/blueprint-detail.html'));
});

// Serve blueprint detail JSON data
app.get('/api/blueprints/:id', (req, res) => {
    const blueprintId = req.params.id;

    db.get('SELECT Blueprints.*, Users.Username FROM Blueprints INNER JOIN Users ON Blueprints.UserID = Users.ID WHERE Blueprints.ID = ?', [blueprintId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('An error occurred while retrieving the blueprint details.');
        }

        if (!row) {
            return res.status(404).json({ error: 'Blueprint not found.' });
        }

        const blueprint = {
            id: row.ID,
            title: row.Title,
            blueprintString: row.BlueprintString,
            image: row.Image,
            dateOfUpload: row.DateOfUpload,
            userId: row.UserID,
            username: row.Username
        };

        res.json(blueprint);
    });
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is up and running on port ${port}`));
