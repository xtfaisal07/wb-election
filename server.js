const express = require('express');
const path = require('path');
const cors = require('cors');
const resultsHandler = require('./api/results');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/results', resultsHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🗳️  WB Election Dashboard running at http://localhost:${PORT}`);
});
