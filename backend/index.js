const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let dataStore = [];

app.post('/data', (req, res) => {
  const { sensor, state } = req.body;

  if (!sensor || !state) {
    return res.status(400).send({ error: 'Lipsesc datele' });
  }

  const record = {
    sensor,
    state,
    timestamp: new Date()
  };

  dataStore.push(record);
  console.log('Date primite:', record);
  res.send({ status: 'ok' });
});

app.get('/data', (req, res) => {
  res.json(dataStore.slice(-10)); // ultimele 10
});

app.listen(3000, () => {
  console.log('✅ Backend live pe http://localhost:3000');
});
