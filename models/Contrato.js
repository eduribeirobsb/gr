const db = require('../database');

class Contrato {
  static salvar(dados, callback) {
    const { numero_pa, numero_contrato, unidade, objeto } = dados;
    db.run(
      `INSERT INTO contratos (numero_pa, numero_contrato, unidade, objeto) VALUES (?, ?, ?, ?)`,
      [numero_pa, numero_contrato, unidade, objeto],
      function (err) {
        callback(err, this.lastID);
      }
    );
  }

  static listar(callback) {
    db.all(`SELECT * FROM contratos`, [], callback);
  }
}

module.exports = Contrato;
