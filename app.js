const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// Configurações básicas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessão
app.use(session({
  secret: 'segredo_super_simples',
  resave: false,
  saveUninitialized: true
}));

// Middleware para passar o usuário logado às views
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario;
  next();
});

// Rotas
const authRoutes = require('./routes/auth');
const riscosRoutes = require('./routes/riscos');
const contratosRoutes = require('./routes/contratos');

app.use('/login', authRoutes);
app.use('/riscos', riscosRoutes);
app.use('/contratos', contratosRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Exporta para uso em server.js e testes
module.exports = app;
