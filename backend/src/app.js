const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const genRoutes = require('./modules/gen/routes');
const stkRoutes = require('./modules/stk/routes');
const facRoutes = require('./modules/fac/routes');
const finRoutes = require('./modules/fin/routes');
const perRoutes = require('./modules/per/routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/gen', genRoutes);
app.use('/api/stk', stkRoutes);
app.use('/api/fac', facRoutes);
app.use('/api/fin', finRoutes);
app.use('/api/per', perRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'disconnected', message: err.message });
  }
});

app.use(errorHandler);

module.exports = app;
