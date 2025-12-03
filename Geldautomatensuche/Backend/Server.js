import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();

app.use(cors({
  origin: "*", // oder: "http://localhost:63342"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Verbindung zur SQLite-Datenbank
const db = await open({
  filename: "DatenbankProjektVS3.db",
  driver: sqlite3.Database
});

// API-Endpunkt
app.get("/api/atms", async (req, res) => {
  const search = `%${req.query.search || ""}%`;
  const rows = await db.all(
    "SELECT * \n" +
    "FROM Geldautomat\n" +
    "WHERE stadt LIKE ? \n" +
    "   OR bank LIKE ? \n" +
    "   OR adresse LIKE ? \n" +
    "   OR CAST(postleitzahl AS TEXT) LIKE ? \n" +
    "   OR name LIKE ?;",
    search, search, search, search, search
  );
  res.json(rows);
});

// Server starten
app.listen(3000, () => console.log("Server läuft auf http://localhost:3000"));
