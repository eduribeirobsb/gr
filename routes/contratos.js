const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar todos os contratos
router.get('/', (req, res) => {
  db.all('SELECT * FROM contratos', [], (err, rows) => {
    if (err) return res.send('Erro ao buscar contratos');
    res.render('contratos', { contratos: rows });
  });
});

// Formulário novo contrato
router.get('/novo', (req, res) => {
  res.render('novo_contrato');
});

// Salvar contrato
router.post('/salvar', (req, res) => {
  const { numero_pa, numero_contrato, unidade, objeto } = req.body;
  const sql = 'INSERT INTO contratos (numero_pa, numero_contrato, unidade, objeto) VALUES (?, ?, ?, ?)';
  db.run(sql, [numero_pa, numero_contrato, unidade, objeto], err => {
    if (err) return res.send('Erro ao salvar contrato');
    res.redirect('/contratos');
  });
});

// Editar contrato
router.get('/editar/:id', (req, res) => {
  db.get('SELECT * FROM contratos WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.send('Contrato não encontrado');
    res.render('editar_contrato', { contrato: row });
  });
});

router.post('/editar/:id', (req, res) => {
  const { numero_pa, numero_contrato, unidade, objeto } = req.body;
  db.run('UPDATE contratos SET numero_pa = ?, numero_contrato = ?, unidade = ?, objeto = ? WHERE id = ?', 
    [numero_pa, numero_contrato, unidade, objeto, req.params.id],
    err => {
      if (err) return res.send('Erro ao atualizar contrato');
      res.redirect('/contratos');
    });
});

// Excluir contrato
router.get('/excluir/:id', (req, res) => {
  db.run('DELETE FROM contratos WHERE id = ?', [req.params.id], err => {
    if (err) return res.send('Erro ao excluir contrato');
    res.redirect('/contratos');
  });
});

module.exports = router;
