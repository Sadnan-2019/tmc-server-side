const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello FROM TRISHAL MEDICAL CENTER World!')
})

app.listen(port, () => {
  console.log(`TRISHAL MEDICAL CENTER listening on port ${port}`)
})