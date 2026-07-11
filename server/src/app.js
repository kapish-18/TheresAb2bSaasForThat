const express = require('express');
const cors = require('cors');
const problemRoutes = require('./routes/problems');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/problems', problemRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something broke on our end.' });
});

module.exports = app;
