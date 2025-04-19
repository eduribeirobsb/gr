const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: 'segredo_super_simples',
  resave: false,
  saveUninitialized: true
}));
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario;
  next();
});
app.get('/', (req, res) => {
  res.redirect('/login');
});

const contratosRoutes = require('./routes/contratos');
const riscosRoutes = require('./routes/riscos');
const authRoutes = require('./routes/auth');

app.use('/contratos', contratosRoutes);
app.use('/riscos', riscosRoutes);
app.use('/login', authRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
