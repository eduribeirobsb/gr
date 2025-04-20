const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./banco.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contratos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_pa TEXT NOT NULL,
    numero_contrato TEXT NOT NULL,
    unidade TEXT NOT NULL,
    objeto TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS riscos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER NOT NULL,
    risco TEXT NOT NULL,
    causa TEXT NOT NULL,
    consequencia TEXT NOT NULL,
    impacto INTEGER NOT NULL,
    probabilidade INTEGER NOT NULL,
    nri INTEGER NOT NULL,
    data_registro TEXT NOT NULL,
    fase TEXT,
    alterado_por TEXT,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS acoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    risco_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    situacao TEXT NOT NULL,
    data_atualizacao TEXT,
    alterado_por TEXT,
    FOREIGN KEY (risco_id) REFERENCES riscos(id)
  )`);
});

module.exports = db;
