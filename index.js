const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b5qeanx.mongodb.net/?retryWrites=true&w=majority`;
// "mongodb+srv://trishal_medical_center:<password>@cluster0.b5qeanx.mongodb.net/?retryWrites=true&w=majority"
// const uri =
//   `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`;

console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("trishal_medical_center").collection("services");

    app.get("/service", async(req,res)=>{
       const query={};
       const cursor = serviceCollection.find(query);
       const services = await cursor.toArray();
       res.send(services)
    })


    console.log("database conneted");


  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello FROM TRISHAL MEDICAL CENTER World!");
});

app.listen(port, () => {
  console.log(`TRISHAL MEDICAL CENTER listening on port ${port}`);
});