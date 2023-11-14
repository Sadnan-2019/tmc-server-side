const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require("mongodb");

const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`;


app.get('/', (req, res) => {
  res.send('Hello FROM TRISHAL MEDICAL CENTER World!')
})

app.listen(port, () => {
  console.log(`TRISHAL MEDICAL CENTER listening on port ${port}`)
})