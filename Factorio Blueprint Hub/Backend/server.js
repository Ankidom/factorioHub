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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Handle blueprint upload
app.post('/blueprints', upload.single('blueprintImage'), (req, res) => {
    const { username, email, blueprintTitle, blueprintString } = req.body;
    const { filename } = req.file;

    if (!username || !email || !blueprintTitle || !blueprintString || !filename) {
        return res.status(400).send('Please fill in all required fields.');
    }

    // Insert user if not already exists
    db.run(
        'INSERT OR IGNORE INTO Users (Username, Email) VALUES (?, ?)',
        [username, email],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).send('An error occurred while processing the request.');
            }

            // Get the inserted/updated user ID
            const userId = this.lastID;

            // Insert blueprint
            db.run(
                'INSERT INTO Blueprints (Title, BlueprintString, Image, UserID) VALUES (?, ?, ?, ?)',
                [blueprintTitle, blueprintString, filename, userId],
                function (err) {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send(`uploadBlueprint.html?success=false&message=${encodeURIComponent(err.message)}`);                    }

                    res.redirect(`/uploadBlueprint.html?success=true&message=${encodeURIComponent('Blueprint uploaded successfully!')}`);

                }
            );
        }
    );
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is up and running on port ${port}`));
