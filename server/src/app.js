const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/reviewer', require('./routes/reviewerRoutes'));

module.exports = app;