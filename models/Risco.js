const db = require('../database');

class Risco {
  static salvar(dados, callback) {
    const { contrato_id, risco, causa, consequencia, impacto, probabilidade } = dados;
    const nri = impacto * probabilidade;
    const data_registro = new Date().toISOString();
    db.run(
      `INSERT INTO riscos (contrato_id, risco, causa, consequencia, impacto, probabilidade, nri, data_registro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contrato_id, risco, causa, consequencia, impacto, probabilidade, nri, data_registro],
      function (err) {
        callback(err, this.lastID, nri);
      }
    );
  }

  static listarPorContrato(contrato_id, callback) {
    db.all(`SELECT * FROM riscos WHERE contrato_id = ?`, [contrato_id], callback);
  }
}

module.exports = Risco;
