const express = require('express');
    const { Pool } = require('pg');
    const cors = require('cors');

    const app = express();
    const port = process.env.PORT || 3000;

    // Configuração do CORS
    app.use(cors({
      origin: ['https://lucasteixeiratst.github.io', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type']
    }));
    app.use(express.json());

    // Conexão com o PostgreSQL (atualize a senha se necessário)
    const pool = new Pool({
      connectionString: 'postgresql://postgres:<NOVA_SENHA>@dpg-d0trh4u3jp1c73eu5atg-a.oregon-postgres.render.com/dbtrevo',
      ssl: { rejectUnauthorized: false }
    });

    // Teste de conexão com o banco
    app.get('/test-db', async (req, res) => {
      try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0].now });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // Listar serviços
    app.get('/servicos', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM servicos ORDER BY id');
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Criar serviço
    app.post('/servicos', async (req, res) => {
      const {
        id, endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
        data, equipe, matricula, ea, servicos, latitude, longitude
      } = req.body;
      try {
        const result = await pool.query(
          `INSERT INTO servicos (
            id, endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
            data, equipe, matricula, ea, servicos, latitude, longitude
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *`,
          [
            id, endereco, numero, bairro, tronco, chave, qtd, alimentador, obs,
            data, equipe, matricula, ea, servicos.join(', '), latitude, longitude
          ]
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    // Atualizar serviço
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

    // Excluir serviço
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

    // Rota padrão
    app.get('/', (req, res) => {
      res.json({ message: 'Backend do Cadastro de Serviços está rodando!' });
    });

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
