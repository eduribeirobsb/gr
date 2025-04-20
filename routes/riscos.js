const express = require('express');
const router = express.Router();
const db = require('../database');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');

// Gerenciar riscos
router.get('/gerenciar/:id', (req, res) => {
  const contratoId = req.params.id;
  db.get('SELECT * FROM contratos WHERE id = ?', [contratoId], (err, contrato) => {
    if (err || !contrato) return res.send('Contrato não encontrado');
    db.all('SELECT * FROM riscos WHERE contrato_id = ?', [contratoId], (err, riscos) => {
      if (err) return res.send('Erro ao buscar riscos');
      res.render('riscos', { contrato, riscos, contratoId });
    });
  });
});

// Cadastrar risco (formulário)
router.get('/cadastrar/:contratoId', (req, res) => {
  const contratoId = req.params.contratoId;
  db.get('SELECT * FROM contratos WHERE id = ?', [contratoId], (err, contrato) => {
    if (err || !contrato) return res.send('Contrato não encontrado');
    res.render('cadastrar_risco', { contratoId, contrato });
  });
});

// Salvar risco
router.post('/salvar', (req, res) => {
  const { contrato_id, risco, causa, consequencia, impacto, probabilidade, fase } = req.body;
  const nri = impacto * probabilidade;
  const data = new Date().toISOString();
  const usuario = req.session.usuario || 'desconhecido';

  const sql = `
    INSERT INTO riscos (contrato_id, risco, causa, consequencia, impacto, probabilidade, nri, data_registro, fase, alterado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [contrato_id, risco, causa, consequencia, impacto, probabilidade, nri, data, fase, usuario], function (err) {
    if (err) return res.send('Erro ao salvar risco');
    if (nri >= 8) {
      res.redirect('/riscos/acoes/' + this.lastID);
    } else {
      res.redirect('/riscos/gerenciar/' + contrato_id);
    }
  });
});

// Editar risco
router.get('/editar/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM riscos WHERE id = ?', [id], (err, risco) => {
    if (err || !risco) return res.send('Risco não encontrado');
    res.render('editar_risco', { risco });
  });
});

// Atualizar risco
router.post('/atualizar/:id', (req, res) => {
  const id = req.params.id;
  const { risco, causa, consequencia, impacto, probabilidade, contrato_id, fase } = req.body;
  const nri = impacto * probabilidade;
  const data = new Date().toISOString();
  const usuario = req.session.usuario || 'desconhecido';

  const sql = `
    UPDATE riscos
    SET risco = ?, causa = ?, consequencia = ?, impacto = ?, probabilidade = ?, nri = ?, data_registro = ?, fase = ?, alterado_por = ?
    WHERE id = ?
  `;

  db.run(sql, [risco, causa, consequencia, impacto, probabilidade, nri, data, fase, usuario, id], function (err) {
    if (err) return res.send('Erro ao atualizar risco');
    res.redirect('/riscos/gerenciar/' + contrato_id);
  });
});

// Formulário para ações
router.get('/acoes/:riscoId', (req, res) => {
  const riscoId = req.params.riscoId;
  db.get('SELECT * FROM riscos WHERE id = ?', [riscoId], (err, risco) => {
    if (err || !risco) return res.send('Risco não encontrado');
    db.get('SELECT * FROM contratos WHERE id = ?', [risco.contrato_id], (err, contrato) => {
      if (err || !contrato) return res.send('Contrato não encontrado');
      db.all('SELECT * FROM acoes WHERE risco_id = ?', [riscoId], (err, acoes) => {
        if (err) return res.send('Erro ao buscar ações');
        res.render('acoes', { risco, contrato, acoes });
      });
    });
  });
});

// Visualizar ações (somente leitura)
router.get('/acoes/ver/:riscoId', (req, res) => {
  const riscoId = req.params.riscoId;
  db.get('SELECT * FROM riscos WHERE id = ?', [riscoId], (err, risco) => {
    if (err || !risco) return res.send('Risco não encontrado');
    db.get('SELECT * FROM contratos WHERE id = ?', [risco.contrato_id], (err, contrato) => {
      if (err || !contrato) return res.send('Contrato não encontrado');
      db.all('SELECT * FROM acoes WHERE risco_id = ?', [riscoId], (err, acoes) => {
        if (err) return res.send('Erro ao buscar ações');
        res.render('acoes_ver', { risco, contrato, acoes });
      });
    });
  });
});

// Salvar ação
router.post('/acoes/salvar', (req, res) => {
  const { risco_id, tipo, descricao, responsavel, situacao } = req.body;
  const data = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO acoes (risco_id, tipo, descricao, responsavel, situacao, data_atualizacao)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [risco_id, tipo, descricao, responsavel, situacao, data], function (err) {
    if (err) return res.send('Erro ao salvar ação');
    res.redirect('/riscos/acoes/' + risco_id);
  });
});

// Gerar relatório PDF
router.get('/relatorio/:contratoId', (req, res) => {
  const contratoId = req.params.contratoId;
  db.get('SELECT * FROM contratos WHERE id = ?', [contratoId], (err, contrato) => {
    if (err || !contrato) return res.send('Contrato não encontrado');
    db.all('SELECT * FROM riscos WHERE contrato_id = ?', [contratoId], (err, riscos) => {
      if (err) return res.send('Erro ao buscar riscos');

      const riscosComAcoes = [];

      const buscarAcoes = (index) => {
        if (index >= riscos.length) {
          const filePath = path.join(__dirname, '../views/relatorio_pdf.ejs');
          ejs.renderFile(filePath, { contrato, riscos: riscosComAcoes }, (err, html) => {
            if (err) return res.send('Erro ao gerar HTML do relatório');
            pdf.create(html, { format: 'A4' }).toStream((err, stream) => {
              if (err) return res.send('Erro ao gerar PDF');
              res.setHeader('Content-Type', 'application/pdf');
              stream.pipe(res);
            });
          });
          return;
        }

        const risco = riscos[index];
        db.all('SELECT * FROM acoes WHERE risco_id = ?', [risco.id], (err, acoes) => {
          risco.acoes = acoes || [];
          riscosComAcoes.push(risco);
          buscarAcoes(index + 1);
        });
      };

      buscarAcoes(0);
    });
  });
});

module.exports = router;
