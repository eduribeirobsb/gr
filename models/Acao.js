const db = require('../database');

class Acao {
  static salvar(dados, callback) {
    const { risco_id, tipo, descricao, responsavel, situacao } = dados;
    const data_atualizacao = new Date().toISOString();
    db.run(
      `INSERT INTO acoes (risco_id, tipo, descricao, responsavel, situacao, data_atualizacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [risco_id, tipo, descricao, responsavel, situacao, data_atualizacao],
      function (err) {
        callback(err, this.lastID);
      }
    );
  }

  static listarPorRisco(risco_id, callback) {
    db.all(`SELECT * FROM acoes WHERE risco_id = ?`, [risco_id], callback);
  }
}

module.exports = Acao;
