const express = require("express");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

// Trust Vercel's proxy for secure headers
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b5qeanx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let cachedClient = null;

async function connectDB() {
  if (cachedClient) return cachedClient;
  await client.connect();
  cachedClient = client;
  return cachedClient;
}

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary setup
const createCloudinaryStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
  });
};

const doctorsUpload = multer({ storage: createCloudinaryStorage("Doctorimage") });
const HealthPackageUpload = multer({ storage: createCloudinaryStorage("HealthPackageImage") });
const upload = multer({ storage: createCloudinaryStorage("department") });
const ReviewUpload = multer({ storage: createCloudinaryStorage("ReviewerImage") });

// --- API ROUTES ---

app.get("/all-doctors", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const doctors = await dbClient.db("trishal_medical_center").collection("doctors").find({}).toArray();
    res.send(doctors);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/doctors", doctorsUpload.single("file"), async (req, res) => {
  try {
    const dbClient = await connectDB();
    const { name, speciality } = req.body;
    // req.file.path-এ ক্লাউডিনারির পার্মানেন্ট সিকিউর URL চলে আসে
    const imageUrl = req.file ? req.file.path : "";
    const result = await dbClient.db("trishal_medical_center").collection("doctors").insertOne({ name, speciality, imageUrl });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/doctor/:id", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const result = await dbClient.db("trishal_medical_center").collection("doctors").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-health-package", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const packages = await dbClient.db("trishal_medical_center").collection("healthpackagecollection").find({}).toArray();
    res.send(packages);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/healthpackage", HealthPackageUpload.single("file"), async (req, res) => {
  try {
    const dbClient = await connectDB();
    const { package_name, package_rate } = req.body;
    const imageUrl = req.file ? req.file.path : "";
    const result = await dbClient.db("trishal_medical_center").collection("healthpackagecollection").insertOne({ package_name, package_rate, imageUrl });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/package/:id", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const result = await dbClient.db("trishal_medical_center").collection("healthpackagecollection").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-department", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const departments = await dbClient.db("trishal_medical_center").collection("department").find({}).toArray();
    res.send(departments);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/department", upload.single("file"), async (req, res) => {
  try {
    const dbClient = await connectDB();
    const { dept_name, description } = req.body;
    const imageUrl = req.file ? req.file.path : "";
    const result = await dbClient.db("trishal_medical_center").collection("department").insertOne({ dept_name, description, imageUrl });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/department/:id", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const result = await dbClient.db("trishal_medical_center").collection("department").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/users/:email", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const result = await dbClient.db("trishal_medical_center").collection("users").updateOne(
      { email: req.params.email },
      { $set: req.body },
      { upsert: true }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/service", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const services = await dbClient.db("trishal_medical_center").collection("services").find({}).toArray();
    res.send(services);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/appoinment", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const appoinment = req.body;
    const appoinmentCollection = dbClient.db("trishal_medical_center").collection("appoinment");
    
    const checkAppionment = {
      treatmentId: appoinment.treatmentId,
      department: appoinment.department,
      name: appoinment.name,
      date: appoinment.date,
      patients_email: appoinment.patients_email,
      patients_name: appoinment.patients_name,
    };

    const existAppoinment = await appoinmentCollection.findOne(checkAppionment);
    if (existAppoinment) {
      return res.send({ success: false, appoinment: existAppoinment });
    }

    const appoinmentResult = await appoinmentCollection.insertOne(appoinment);
    return res.send({ success: true, appoinmentResult });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/availableservices", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const db = dbClient.db("trishal_medical_center");
    const date = req.query.date || "Dec 8, 2023";
    const availAbleServices = await db.collection("services").find().toArray();
    const bookingAppoinments = await db.collection("appoinment").find({ date }).toArray();

    availAbleServices.forEach((availAbleService) => {
      const BookedAppoinments = bookingAppoinments.filter(
        (bk) => bk.department === availAbleService.dept_name
      );
      const booked = BookedAppoinments.map((b) => b.slot);
      const available = availAbleService.slots.filter((as) => !booked.includes(as));
      availAbleService.slots = available;
    });

    res.send(availAbleServices);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/booking-appoinment", async (req, res) => {
  try {
    const dbClient = `of` + await connectDB(); // keeps connection pattern consistent
    // simplified lookup
    const dbClientRef = await connectDB();
    const appointments = await dbClientRef.db("trishal_medical_center").collection("appoinment")
      .find({ patients_email: req.query.patients_email }).toArray();
    res.send(appointments);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-review", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const reviews = await dbClient.db("trishal_medical_center").collection("reviewcollection").find({}.toString() === "" ? {} : {}).toArray();
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/review", ReviewUpload.single("file"), async (req, res) => {
  try {
    const dbClient = await connectDB();
    const { reviewer_name, review_details } = req.body;
    const imageUrl = req.file ? req.file.path : "";
    const result = await dbClient.db("trishal_medical_center").collection("reviewcollection").insertOne({ reviewer_name, review_details, imageUrl });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/delete-review/:id", async (req, res) => {
  try {
    const dbClient = await connectDB();
    const result = await dbClient.db("trishal_medical_center").collection("reviewcollection").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello FROM TRISHAL MEDICAL CENTER World!");
});

// Local development server listener
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Correct Vercel-native Express app export
module.exports = app;