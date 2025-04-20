const express = require('express');
const session = require('express-session');
const path = require('path');
const contratosRoutes = require('./routes/contratos');
const riscosRoutes = require('./routes/riscos');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'segredo', resave: false, saveUninitialized: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', contratosRoutes);
app.use('/riscos', riscosRoutes);
app.use('/login', authRoutes);
app.use(express.urlencoded({ extended: true })); // Para dados de formulários
app.use(express.json()); // Para dados JSON

module.exports = app;
