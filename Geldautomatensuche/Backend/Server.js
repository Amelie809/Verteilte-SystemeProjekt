import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

// Verbindung zur SQLite-Datenbank
const db = await open({
  filename: "DatenbankProjektVS2.db",
  driver: sqlite3.Database
});

// API-Endpunkt: Geldautomaten abrufen
app.get("/api/atms", async (req, res) => {
  const search = `%${req.query.search || ""}%`;
  const rows = await db.all(
    "SELECT * \n" +
    "FROM Geldautomat\n" +
    "WHERE stadt LIKE ? \n" +
    "   OR bank LIKE ? \n" +
    "   OR name LIKE ?;",
    search, search, search
  );
  res.json(rows);
});

// Server starten
app.listen(3000, () => console.log("Server läuft auf http://localhost:3000"));
