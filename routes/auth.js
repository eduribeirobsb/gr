const express = require('express');
const router = express.Router();

// usuários fixos
const usuarios = {
  adm: '123456',
  ser: '123456'
};

// tela de login
router.get('/', (req, res) => {
  res.render('login', { mensagem: null });
});

// autenticar
router.post('/', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuarios[usuario] && usuarios[usuario] === senha) {
    req.session.usuario = usuario;
    res.redirect('/contratos');
  } else {
    res.render('login', { mensagem: 'Usuário ou senha inválidos.' });
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
