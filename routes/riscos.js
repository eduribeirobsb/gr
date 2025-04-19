const express = require('express');
const router = express.Router();
const db = require('../database');
const Risco = require('../models/Risco');
const Acao = require('../models/Acao');
const pdf = require('html-pdf');
const requireLogin = require('../middlewares/auth');

// Cadastro de risco
router.get('/cadastrar/:id', requireLogin, (req, res) => {
  const contratoId = req.params.id;
  db.get(`SELECT * FROM contratos WHERE id = ?`, [contratoId], (err, contrato) => {
    if (err || !contrato) return res.send('Contrato não encontrado.');
    Risco.listarPorContrato(contratoId, (err, riscos) => {
      if (err) return res.send('Erro ao buscar riscos.');
      res.render('riscos', { contratoId, contrato, riscos });
    });
  });
});

router.post('/salvar', requireLogin, (req, res) => {
  req.body.alterado_por = req.session.usuario;
  Risco.salvar(req.body, (err, riscoId, nri) => {
    if (nri >= 8) {
      res.redirect(`/riscos/acoes/${riscoId}`);
    } else {
      res.redirect(`/riscos/cadastrar/${req.body.contrato_id}`);
    }
  });
});

// Ações
router.get('/acoes/:riscoId', requireLogin, (req, res) => {
  const riscoId = req.params.riscoId;
  db.get(`SELECT * FROM riscos WHERE id = ?`, [riscoId], (err, risco) => {
    if (err || !risco) return res.send('Risco não encontrado.');
    Acao.listarPorRisco(riscoId, (err, acoes) => {
      res.render('acoes', { riscoId, risco, acoes });
    });
  });
});

router.post('/acoes/salvar', requireLogin, (req, res) => {
  req.body.alterado_por = req.session.usuario;
  Acao.salvar(req.body, () => {
    res.redirect(`/riscos/acoes/${req.body.risco_id}`);
  });
});

// Edição de ação
router.get('/acoes/editar/:id', requireLogin, (req, res) => {
  const acaoId = req.params.id;
  db.get(`SELECT * FROM acoes WHERE id = ?`, [acaoId], (err, acao) => {
    if (err || !acao) return res.send('Ação não encontrada.');
    res.render('editar_acao', { acao });
  });
});

router.post('/acoes/editar/:id', requireLogin, (req, res) => {
  const { tipo, descricao, responsavel, situacao, risco_id } = req.body;
  const data_atualizacao = new Date().toISOString();
  db.run(
    `UPDATE acoes SET tipo = ?, descricao = ?, responsavel = ?, situacao = ?, data_atualizacao = ?, alterado_por = ? WHERE id = ?`,
    [tipo, descricao, responsavel, situacao, data_atualizacao, req.session.usuario, req.params.id],
    function (err) {
      if (err) return res.send('Erro ao atualizar ação.');
      res.redirect(`/riscos/acoes/${risco_id}`);
    }
  );
});

// Gerenciar riscos
router.get('/gerenciar/:contratoId', requireLogin, (req, res) => {
  const contratoId = req.params.contratoId;
  const atualizar = req.query.atualizar === 'true';
  Risco.listarPorContrato(contratoId, (err, riscos) => {
    if (err) return res.send('Erro ao carregar riscos.');
    if (atualizar && riscos.length > 0) {
      const now = new Date().toISOString();
      riscos.forEach(risco => {
        db.run(`UPDATE riscos SET data_registro = ? WHERE id = ?`, [now, risco.id]);
      });
    }
    res.render('gerenciar', { riscos, contratoId });
  });
});

// Editar risco
router.get('/editar/:id', requireLogin, (req, res) => {
  const riscoId = req.params.id;
  db.get(`SELECT * FROM riscos WHERE id = ?`, [riscoId], (err, risco) => {
    if (err || !risco) return res.send('Risco não encontrado.');
    res.render('editar_risco', { risco });
  });
});

router.post('/editar/:id', requireLogin, (req, res) => {
  const { risco, causa, consequencia, impacto, probabilidade } = req.body;
  const nri = impacto * probabilidade;
  const data_registro = new Date().toISOString();
  db.run(
    `UPDATE riscos SET risco = ?, causa = ?, consequencia = ?, impacto = ?, probabilidade = ?, nri = ?, data_registro = ?, alterado_por = ? WHERE id = ?`,
    [risco, causa, consequencia, impacto, probabilidade, nri, data_registro, req.session.usuario, req.params.id],
    function (err) {
      if (err) return res.send('Erro ao atualizar risco.');
      res.redirect(`/riscos/cadastrar/${req.body.contrato_id || req.params.id}`);
    }
  );
});

// Relatório HTML
router.get('/relatorio-html/:contratoId', requireLogin, async (req, res) => {
  const contratoId = req.params.contratoId;
  db.get(`SELECT * FROM contratos WHERE id = ?`, [contratoId], async (err, contrato) => {
    if (err || !contrato) return res.send('Contrato não encontrado.');
    Risco.listarPorContrato(contratoId, async (err, riscos) => {
      if (err) return res.send('Erro ao buscar riscos.');
      for (const risco of riscos) {
        risco.acoes = await new Promise(resolve => {
          Acao.listarPorRisco(risco.id, (err, acoes) => resolve(acoes || []));
        });
      }
      res.render('relatorio', { riscos, contrato });
    });
  });
});

// Relatório PDF
router.get('/relatorio-pdf/:contratoId', requireLogin, async (req, res) => {
  const contratoId = req.params.contratoId;
  db.get(`SELECT * FROM contratos WHERE id = ?`, [contratoId], async (err, contrato) => {
    if (err || !contrato) return res.send('Contrato não encontrado.');
    Risco.listarPorContrato(contratoId, async (err, riscos) => {
      if (err) return res.send('Erro ao buscar riscos.');
      for (const risco of riscos) {
        risco.acoes = await new Promise(resolve => {
          Acao.listarPorRisco(risco.id, (err, acoes) => resolve(acoes || []));
        });
      }
      res.render('relatorio', { riscos, contrato }, (err, html) => {
        if (err) return res.send('Erro ao renderizar o relatório.');
        const options = { format: 'A4', orientation: 'portrait', border: '10mm' };
        pdf.create(html, options).toBuffer((err, buffer) => {
          if (err) return res.send('Erro ao gerar PDF.');
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="relatorio_riscos_${contratoId}.pdf"`,
            'Content-Length': buffer.length
          });
          res.send(buffer);
        });
      });
    });
  });
});

module.exports = router;
