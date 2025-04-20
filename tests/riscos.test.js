const request = require('supertest');
const app = require('../app'); 
const db = require('../database');

let contratoId;

// Antes de todos os testes, cria um contrato de teste
beforeAll(done => {
  db.run(
    `INSERT INTO contratos (numero_pa, numero_contrato, unidade, objeto) 
     VALUES ('12345/2025', '001/2025', 'Unidade Teste', 'Objeto Teste')`,
    function (err) {
      if (err) {
        console.error("Erro ao inserir contrato de teste:", err.message);
        done(err);
      } else {
        contratoId = this.lastID;
        console.log("Contrato de teste criado com ID:", contratoId);
        
        // Vamos verificar a estrutura da tabela riscos
        db.all("PRAGMA table_info(riscos)", [], (err, rows) => {
          if (err) console.error("Erro ao verificar tabela:", err);
          console.log("Estrutura da tabela riscos:", rows);
          done();
        });
      }
    }
  );
});


afterAll(done => {
  db.run(`DELETE FROM contratos WHERE id = ?`, [contratoId], err => {
    if (err) console.warn("Erro ao limpar dados de teste:", err.message);
    db.close(done);
  });
});

test('POST /riscos/salvar deve redirecionar para ações se NRI >= 8', async () => {
  console.log("Tentando enviar risco com contrato_id:", contratoId);
  
 
  const agent = request.agent(app);
  

  const dadosEnvio = {
    contrato_id: contratoId,
    risco: "Teste",
    causa: "Teste causa",
    consequencia: "Teste consequência",
    impacto: 4, 
    probabilidade: 2,
    fase: "Planejamento"
  };
  
  console.log("Dados completos a enviar:", dadosEnvio);
  
 
  console.log("Estrutura SQL esperada:");
  console.log(`INSERT INTO riscos (contrato_id, risco, causa, consequencia, impacto, probabilidade, nri, data_registro, fase, alterado_por)`);
  
  // Tenta fazer a requisição
  const res = await agent
    .post('/riscos/salvar')
    .redirects(0)
    .send(dadosEnvio);

  console.log("RESPOSTA:", res.status);
  
  if (res.status !== 302) {
    console.error("Erro - status não é 302, corpo da resposta:", res.text);
    
    
    if (res.status === 500) {
      
      db.all("SELECT * FROM riscos WHERE contrato_id = ?", [contratoId], (err, rows) => {
        if (err) console.error("Erro ao verificar riscos:", err);
        console.log("Riscos encontrados para este contrato:", rows);
      });
    }
  }

  expect(res.status).toBe(302);
  expect(res.headers.location).toMatch(/\/riscos\/acoes\//);
});