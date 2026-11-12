
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve website files from this project folder
app.use(express.static(__dirname));

// Connect to SQLite database
const db = new Database(path.join(__dirname, "pet_adoption.db"));

// Create adoption requests table
db.exec(`
    CREATE TABLE IF NOT EXISTS adoption_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        contact TEXT NOT NULL,
        pet_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Create contact messages table
db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        contact TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Create pets table
db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        breed TEXT NOT NULL,
        age TEXT NOT NULL,
        location TEXT NOT NULL,
        image TEXT NOT NULL
    )
`);

// Insert sample pets only when the table is empty
const petCount = db.prepare(
    "SELECT COUNT(*) AS total FROM pets"
).get();

if (petCount.total === 0) {
    const insertPet = db.prepare(`
        INSERT INTO pets (name, type, breed, age, location, image)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const initialPets = [
        ["Bruno", "Dog", "Labrador Retriever", "2 Years", "Mumbai, Maharashtra", "images/bruno.jpg"],
        ["Milo", "Cat", "Persian", "1 Year", "Thane, Maharashtra", "images/milo.jpg"],
        ["Coco", "Bird", "Indian Ringneck Parakeet", "1.5 Years", "Navi Mumbai, Maharashtra", "images/coco.jpg"],
        ["Max", "Dog", "Golden Retriever", "2 Months", "Pune, Maharashtra", "images/max.jpg"],
        ["Kitty", "Cat", "Indian Domestic Shorthair", "8 Months", "Mumbai, Maharashtra", "images/kitty.jpg"],
        ["Buddy", "Dog", "Beagle", "1 Year", "Nashik, Maharashtra", "images/buddy.jpg"],
        ["Bella", "Cat", "Siamese", "2 Years", "Thane, Maharashtra", "images/bella.jpg"],
        ["Rio", "Bird", "Budgerigar", "1 Year", "Pune, Maharashtra", "images/rio.jpg"]
    ];

    const insertMany = db.transaction((pets) => {
        for (const pet of pets) {
            insertPet.run(...pet);
        }
    });

    insertMany(initialPets);
}

// API: Get pets from database
app.get("/api/pets", (req, res) => {
    try {
        const pets = db.prepare(
            "SELECT * FROM pets ORDER BY id"
        ).all();

        res.json({
            success: true,
            pets: pets
        });
    } catch (error) {
        console.error("Pets database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load pets from database."
        });
    }
});

// API: Save adoption request
app.post("/api/adoptions", (req, res) => {
    const { name, email, contact, pet_name, reason } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof contact !== "string" || !contact.trim() ||
        typeof pet_name !== "string" || !pet_name.trim() ||
        typeof reason !== "string" || !reason.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO adoption_requests
            (name, email, contact, pet_name, reason)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            name.trim(),
            email.trim(),
            contact.trim(),
            pet_name.trim(),
            reason.trim()
        );

        res.status(201).json({
            success: true,
            message: "Adoption request saved successfully!",
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error("Adoption database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not save adoption request."
        });
    }
});

// API: Save contact message
app.post("/api/contact", (req, res) => {
    const { name, email, contact, message } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof contact !== "string" || !contact.trim() ||
        typeof message !== "string" || !message.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO contact_messages
            (name, email, contact, message)
            VALUES (?, ?, ?, ?)
        `).run(
            name.trim(),
            email.trim(),
            contact.trim(),
            message.trim()
        );

        res.status(201).json({
            success: true,
            message: "Contact message saved successfully!",
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error("Contact database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not save contact message."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Pet Adoption Website running at http://localhost:${PORT}`);
});
