import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();

app.use(express.json());

// Configurazione del database
const db = new sqlite3.Database('./Film_DB', (err) => {
    if (err) {
        console.error('Errore nella connessione al DB:', err.message);
    } else {
        console.log('Connesso al database SQLite.');

        // Creazione della tabella e inserimento dei dati
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS "Film" (
                    "titolo" TEXT NOT NULL,
                    "genere" TEXT NOT NULL,
                    "durata" INTEGER NOT NULL CHECK(durata > 0),
                    "prezzo" NUMERIC NOT NULL CHECK(prezzo >= 0),
                    "punteggio" INTEGER NOT NULL CHECK(punteggio > 0),
                    PRIMARY KEY("titolo")
                    );
            `);

            db.run(`
                INSERT OR IGNORE INTO "Film" ("titolo", "genere", "durata", "prezzo", "punteggio")
                    VALUES
                    ('Inception', 'Azione', 148, 2.99, 9),
                    ('Interstellar', 'Fantascienza', 169, 3.49, 9),
                    ('Il Re Leone', 'Animazione', 88, 2.99, 8),
                    ('Titanic', 'Romantico', 195, 3.99, 7),
                    ('Pulp Fiction', 'Crime', 154, 2.49, 9);
            `);
        });
    }
});

app.put("/film", (req, res) => {
    
    const db = new sqlite3.Database("Film_DB", (err) => {
        if (err) {
            console.error("Errore apertura DB:", err.message);
            return res.status(500).send(err.message);
        }
    });

    let stmt = db.prepare("INSERT INTO Film (titolo, genere, durata, prezzo, punteggio) VALUES (?,?,?,?,?);");

     // Gestiamo l'evento error dello statement
    stmt.on("error", (error) => {
        console.error("Errore Statement:", error.message);
        res.status(500).send(error.message);
        stmt.finalize((errFinalize) => {
            if (errFinalize) console.error("Errore Finalize:", errFinalize.message);
        });
        db.close((errClose) => {
            if (errClose) console.error("Errore Close:", errClose.message);
        });
    });

    const film = req.body;

    stmt.run(film.titolo, film.genere, film.durata, film.prezzo, film.punteggio, (err) => {
        if (err) {
            console.error("Errore Run:", err.message);
            res.status(500).send(err.message);
        } else {
            res.send("Prodotto inserito correttamente");
        }

        // Chiudiamo statement e database dopo aver inviato la risposta
        stmt.finalize((errFinalize) => {
            if (errFinalize) console.error("Errore Finalize:", errFinalize.message);
        });
        db.close((errClose) => {
            if (errClose) console.error("Errore Close:", errClose.message);
        });
    })

});

app.get("/film/:titolo_film", (req, res) => {
    const titoloFilm = req.params.titolo_film;

    // Apri il database
    const db = new sqlite3.Database("Film_DB", (err) => {
        if (err) {
            console.error("Errore apertura DB:", err.message);
            return res.status(500).send("Errore server.");
        }
    });

    // Esegui la query SQL con il parametro
    db.get("SELECT * FROM Film WHERE titolo = ?", [titoloFilm], (err, row) => {
        if (err) {
            console.error("Errore Query:", err.message);
            return res.status(500).send("Errore durante la ricerca.");
        }
        if (!row) {
            return res.status(404).send("Film non trovato.");
        }
        res.json(row); // Restituisci i dati del film
        db.close((closeErr) => {
            if (closeErr) {
                console.error("Errore chiusura DB:", closeErr.message);
            } else {
                console.log("Database chiuso correttamente.");
            }
        });
    });
});

app.get("/genre/:nome_genere", (req, res) => {
    const nomeGenere = req.params.nome_genere;

    // Apri il database
    const db = new sqlite3.Database("Film_DB", (err) => {
        if (err) {
            console.error("Errore apertura DB:", err.message);
            return res.status(500).send("Errore server.");
        }
    });

    // Esegui la query SQL con il parametro
    db.all("SELECT * FROM Film WHERE genere = ?", [nomeGenere], (err, rows) => {
        if (err) {
            console.error("Errore Query:", err.message);
            return res.status(500).send("Errore durante la ricerca.");
        }
        if (rows.length === 0) {
            return res.status(404).send("Nessun film trovato per questo genere.");
        }
        res.json(rows); // Restituisci tutti i film del genere richiesto
        db.close((closeErr) => {
            if (closeErr) {
                console.error("Errore chiusura DB:", closeErr.message);
            } else {
                console.log("Database chiuso correttamente.");
            }
        });
    });
});

app.get("/dur/:durata_massima", (req, res) => {
    const durataMassima = Number(req.params.durata_massima);

    // Apri il database
    const db = new sqlite3.Database("Film_DB", (err) => {
        if (err) {
            console.error("Errore apertura DB:", err.message);
            return res.status(500).send("Errore server.");
        }
    });

    // Esegui la query SQL con il parametro
    db.all("SELECT * FROM Film WHERE durata < ?", [durataMassima], (err, rows) => {
        if (err) {
            console.error("Errore Query:", err.message);
            return res.status(500).send("Errore durante la ricerca.");
        }
        if (rows.length === 0) {
            return res.status(404).send("Nessun film trovato al di sotto di questa durata.");
        }
        res.json(rows); // Restituisci tutti i film al di sotto della durata massima richiesta
        db.close((closeErr) => {
            if (closeErr) {
                console.error("Errore chiusura DB:", closeErr.message);
            } else {
                console.log("Database chiuso correttamente.");
            }
        });
    });
});



app.listen(3000, () => {
    console.log("Server in ascolto sulla porta 3000");
});