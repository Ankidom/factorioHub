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
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

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

// Create Tags table
// Create Tags table and populate it with predefined tags
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS Tags (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)");

    const predefinedTags = ['Factory', 'Automation', 'Power', 'Transportation', 'Defense'];

    // Loop through the predefined tags and insert them into the Tags table if they don't already exist
    predefinedTags.forEach(tag => {
        db.get('SELECT ID FROM Tags WHERE Name = ?', [tag], (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }

            if (!row) {
                db.run('INSERT INTO Tags (Name) VALUES (?)', [tag], function (err) {
                    if (err) {
                        console.error(err.message);
                    }
                });
            }
        });
    });
});


// Create Blueprint_Tag table
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS Blueprint_Tag (BlueprintID INTEGER NOT NULL, TagID INTEGER NOT NULL, PRIMARY KEY (BlueprintID, TagID), FOREIGN KEY (BlueprintID) REFERENCES Blueprints(ID), FOREIGN KEY (TagID) REFERENCES Tags(ID))");
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
app.post('/blueprints', upload.single('blueprintImage'), (req, res) => {
    const { username, email, blueprintTitle, blueprintString, tags } = req.body;
    const { filename } = req.file;
    if (!username || !email || !blueprintTitle || !blueprintString || !filename || !tags) {
        return res.status(400).send('Please fill in all required fields and select at least one tag.');
    }

    const selectedTags = JSON.parse(tags);
    if (!Array.isArray(selectedTags) || selectedTags.length === 0) {
        return res.status(400).send('Please select at least one tag.');
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

            let userId = this.lastID;

            // If no new user was inserted, get the existing user ID
            if (this.changes === 0) {
                db.get('SELECT ID FROM Users WHERE Email = ?', [email], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).send('An error occurred while processing the request.');
                    }

                    userId = row.ID;
                    console.log('Inserting Tag:', selectedTags); // Gebruik selectedTags in plaats van tagId

                    insertBlueprint(res, userId, blueprintTitle, blueprintString, filename, selectedTags);
                });
            } else {
                insertBlueprint(res, userId, blueprintTitle, blueprintString, filename, selectedTags);
            }
        }
    );
});



// Create function for blueprint insertion
function insertBlueprint(res, userId, blueprintTitle, blueprintString, filename, selectedTags) {

    // Insert blueprint
    db.run(
        'INSERT INTO Blueprints (Title, BlueprintString, Image, UserID) VALUES (?, ?, ?, ?)',
        [blueprintTitle, blueprintString, filename, userId],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).send(`uploadBlueprint.html?success=false&message=${encodeURIComponent(err.message)}`);
            }

            // Get the inserted blueprint ID
            const blueprintId = this.lastID;

            // Insert tags for the blueprint
            const insertStatement = db.prepare(
                'INSERT INTO Blueprint_Tag (BlueprintID, TagID) VALUES (?, ?)'
            );

            console.log('selectedTags:', selectedTags);

            selectedTags.forEach(tagId => {
                console.log('Processing tagId:', tagId);

                insertStatement.run(blueprintId, tagId, function (err) {
                    if (err) {
                        console.error('Error inserting tagId:', err.message);
                        return res.status(500).send(`uploadBlueprint.html?success=false&message=${encodeURIComponent(err.message)}`);
                    }

                    console.log('Successfully inserted tagId:', tagId);
                });
            });

            insertStatement.finalize();

            res.redirect(`/uploadBlueprint.html?success=true&message=${encodeURIComponent('Blueprint uploaded successfully!')}`);
        }
    );
}

app.get('/blueprints', (req, res) => {
    db.all('SELECT Blueprints.*, Users.Username, Tags.ID as TagID, Tags.Name as TagName FROM Blueprints INNER JOIN Users ON Blueprints.UserID = Users.ID LEFT JOIN Blueprint_Tag ON Blueprints.ID = Blueprint_Tag.BlueprintID LEFT JOIN Tags ON Blueprint_Tag.TagID = Tags.ID', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('An error occurred while fetching blueprint data.');
        }
        // Group blueprints by ID, mapping each group to an object that represents a blueprint with an array of its tags
        const groupedBlueprints = rows.reduce((acc, row) => {
            if (!acc[row.ID]) {
                acc[row.ID] = {
                    id: row.ID,
                    title: row.Title,
                    blueprintString: row.BlueprintString,
                    image: row.Image,
                    dateOfUpload: row.DateOfUpload,
                    userId: row.UserID,
                    username: row.Username,
                    tags: []
                };
            }

            // Add the tag to the blueprint if it exists
            if (row.TagID) {
                acc[row.ID].tags.push({ id: row.TagID, name: row.TagName });
            }

            return acc;
        }, {});

        // Convert the grouped blueprints object to an array
        const blueprints = Object.values(groupedBlueprints);

        res.json(blueprints);
    });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Serve blueprint-detail.html
app.get('/blueprint-detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/blueprint-detail.html'));
});

// Serve blueprint-detail.html
app.get('/blueprint-detail', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/blueprint-detail.html'));
});

// Serve blueprint-detail.html
app.get('/blueprint-detail', (req, res) => {
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

app.delete('/api/blueprints/:id', (req, res) => {
    const blueprintId = req.params.id;

    db.run('DELETE FROM Blueprints WHERE ID = ?', [blueprintId], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('An error occurred while deleting the blueprint.');
        }

        res.status(200).send('Blueprint successfully deleted');
    });
});


app.put('/api/blueprints/:id', (req, res) => {
    const id = req.params.id;
    const { title, blueprintString } = req.body;

    db.run(`UPDATE Blueprints SET Title = ?, BlueprintString = ? WHERE ID = ?`,
        [title, blueprintString, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Blueprint updated successfully.' });
        }
    );
});

// Serve available tags
app.get('/available-tags', (req, res) => {
    db.all('SELECT * FROM Tags', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('An error occurred while fetching available tags.');
        }

        const tags = rows.map(row => ({ id: row.ID, name: row.Name }));

        res.json(tags);
    });
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is up and running on port ${port}`));
