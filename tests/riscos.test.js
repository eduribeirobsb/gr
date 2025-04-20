const request = require('supertest');
const app = require('../app');
const db = require('../database');

beforeAll(done => {
  db.run(
    `INSERT INTO contratos (numero_pa, numero_contrato, unidade, objeto) 
     VALUES ('12345/2024', '001/2024', 'Unidade Teste', 'Objeto Teste')`,
    function () {
      global.contratoIdInserido = this.lastID;
      done();
    }
  );
});

test('POST /riscos/salvar deve redirecionar para ações se NRI >= 8', async () => {
  const res = await request(app)
    .post('/riscos/salvar')
    .send({
      contrato_id: global.contratoIdInserido,
      risco: 'Teste',
      causa: 'Causa',
      consequencia: 'Consequência',
      impacto: 4, // 4 * 2 = 8
      probabilidade: 2,
      fase: 'Planejamento'
    });

  expect(res.status).toBe(302);
  expect(res.header.location).toMatch(/\/riscos\/acoes\//);
});
