const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do CORS para permitir requisições do frontend
app.use(cors());
app.use(express.json());

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://root:32676007@dpg-d0trh4u3jp1c73eu5atg-a.oregon-postgres.render.com/dbtrevo',
  ssl: { rejectUnauthorized: false } // Necessário para conexões externas no Render
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Endpoint para listar todos os serviços
app.get('/servicos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para criar um novo serviço
app.post('/servicos', async (req, res) => {
  const {
    endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
    data, equipe, matricula, ea, servicos, latitude, longitude
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO servicos (
        endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
        data, equipe, matricula, ea, servicos, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
        data, equipe, matricula, ea, servicos.join(', '), latitude, longitude
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint para atualizar um serviço
app.put('/servicos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
    data, equipe, matricula, ea, servicos, latitude, longitude
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE servicos SET
        endereco = $1, numero = $2, bairro = $3, tronco = $4, chave = $5,
        qtd = $6, alimentador = $7, obs = $8, data = $9, equipe = $10,
        matricula = $11, ea = $12, servicos = $13, latitude = $14, longitude = $15
      WHERE id = $16 RETURNING *`,
      [
        endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
        data, equipe, matricula, ea, servicos.join(', '), latitude, longitude, id
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint para excluir um serviço
app.delete('/servicos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM servicos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
