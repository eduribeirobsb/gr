const express = require('express');
const router = express.Router();
const Contrato = require('../models/Contrato');

router.get('/', (req, res) => {
  Contrato.listar((err, contratos) => {
    res.render('contratos', { contratos });
  });
});

router.post('/salvar', (req, res) => {
  Contrato.salvar(req.body, () => {
    res.redirect('/contratos');
  });
});

module.exports = router;
