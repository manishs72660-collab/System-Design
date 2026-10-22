const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'db_error' });
  }
});

module.exports = app;