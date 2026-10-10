const express = require("express");
const serverless = require('serverless-http');
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b5qeanx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Optimized MongoDB Client for Serverless
let client = null;
let dbInstance = null;

async function connectDB() {
  if (dbInstance) {
    return dbInstance;
  }
  
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    await client.connect();
    dbInstance = client.db("trishal_medical_center");
    console.log("Database connected successfully");
    return dbInstance;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

// Middleware to attach db safely
app.use(async (req, res, next) => {
  try {
    req.db = await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// Helper function to generate dynamic base URL (works for both Localhost and Vercel Live)
const getBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

// --- MULTER & IMAGE STORAGE SETUP ---
const storageE = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Doctorimage");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const doctorsUpload = multer({ storage: storageE });

app.get("/imagesdoctor/:filename", function (req, res) {
  var filename = req.params.filename;
  res.sendFile(__dirname + "/Doctorimage/" + filename);
});

// --- ROUTES ---

app.get("/", (req, res) => {
  res.send("Hello FROM TRISHAL MEDICAL CENTER World!");
});

// 1. Doctors
app.post("/doctors", doctorsUpload.single("file"), async (req, res) => {
  try {
    const { name, speciality } = req.body;
    const baseUrl = getBaseUrl(req);
    const imageUrl = `${baseUrl}/imagesdoctor/${req.file ? req.file.filename : ''}`;
    const doctorsCollection = req.db.collection("doctors");
    const saveDoctors = await doctorsCollection.insertOne({ name, speciality, imageUrl });
    res.send(saveDoctors);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/doctor/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const deleteDoctor = await req.db.collection("doctors").deleteOne(query);
    res.send(deleteDoctor);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-doctors", async (req, res) => {
  try {
    const doctors = await req.db.collection("doctors").find({}).toArray();
    res.send(doctors);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 2. Health Packages
const HealthPackage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "HealthPackageImage");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const HealthPackageUpload = multer({ storage: HealthPackage });

app.get("/imagespackage/:filename", function (req, res) {
  var filename = req.params.filename;
  res.sendFile(__dirname + "/HealthPackageImage/" + filename);
});

app.post("/healthpackage", HealthPackageUpload.single("file"), async (req, res) => {
  try {
    const { package_name, package_rate } = req.body;
    const baseUrl = getBaseUrl(req);
    const imageUrl = `${baseUrl}/imagespackage/${req.file ? req.file.filename : ''}`;
    const collection = req.db.collection("healthpackagecollection");
    const saveHealthPackage = await collection.insertOne({ package_name, package_rate, imageUrl });
    res.send(saveHealthPackage);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-health-package", async (req, res) => {
  try {
    const allHealthPackage = await req.db.collection("healthpackagecollection").find({}).toArray();
    res.send(allHealthPackage);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/package/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const deletePackage = await req.db.collection("healthpackagecollection").deleteOne(query);
    res.send(deletePackage);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 3. Departments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/images/:filename", function (req, res) {
  var filename = req.params.filename;
  res.sendFile(__dirname + "/image/" + filename);
});

app.post("/department", upload.single("file"), async (req, res) => {
  try {
    const { dept_name, description } = req.body;
    const baseUrl = getBaseUrl(req);
    const imageUrl = `${baseUrl}/images/${req.file ? req.file.filename : ''}`;
    const collection = req.db.collection("department");
    const saveDepartment = await collection.insertOne({ dept_name, description, imageUrl });
    res.send(saveDepartment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/department/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const deleteDepartment = await req.db.collection("department").deleteOne(query);
    res.send(deleteDepartment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-department", async (req, res) => {
  try {
    const allDepartment = await req.db.collection("department").find({}).toArray();
    res.send(allDepartment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 4. Users
app.put("/users/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await req.db.collection("users").updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 5. Services & Appointments
app.get("/service", async (req, res) => {
  try {
    const services = await req.db.collection("services").find({}).toArray();
    res.send(services);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/appoinment", async (req, res) => {
  try {
    const appoinment = req.body;
    const appointmentCollection = req.db.collection("appoinment");
    const checkAppionment = {
      treatmentId: appoinment.treatmentId,
      department: appoinment.department,
      name: appoinment.name,
      date: appoinment.date,
      patients_email: appoinment.patients_email,
      patients_name: appoinment.patients_name,
    };

    const existAppoinment = await appointmentCollection.findOne(checkAppionment);
    if (existAppoinment) {
      return res.send({ success: false, appoinment: existAppoinment });
    }
    const appoinmentResult = await appointmentCollection.insertOne(appoinment);
    return res.send({ success: true, appoinmentResult });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/availableservices", async (req, res) => {
  try {
    const date = req.query.date || "Dec 8, 2023";
    const serviceCollection = req.db.collection("services");
    const appointmentCollection = req.db.collection("appoinment");

    const availAbleServices = await serviceCollection.find().toArray();
    const BookingDate = { date: date };
    const bookingAppoinments = await appointmentCollection.find(BookingDate).toArray();

    availAbleServices.forEach((availAbleService) => {
      const BookedAppoinments = bookingAppoinments.filter(
        (bk) => bk.department === availAbleService.dept_name
      );
      const booked = BookedAppoinments.map((b) => b.slot);
      const available = availAbleService.slots.filter(
        (as) => !booked.includes(as)
      );
      availAbleService.slots = available;
    });
    res.send(availAbleServices);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/booking-appoinment", async (req, res) => {
  try {
    const patients_email = req.query.patients_email;
    const patients_appoinment = await req.db.collection("appoinment")
      .find({ patients_email })
      .toArray();
    res.send(patients_appoinment);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 6. Reviews
const ReviewImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ReviewerImage");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const ReviewUpload = multer({ storage: ReviewImage });

app.get("/imagesreview/:filename", function (req, res) {
  var filename = req.params.filename;
  res.sendFile(__dirname + "/ReviewerImage/" + filename);
});

app.post("/review", ReviewUpload.single("file"), async (req, res) => {
  try {
    const { reviewer_name, review_details } = req.body;
    const baseUrl = getBaseUrl(req);
    const imageUrl = `${baseUrl}/imagesreview/${req.file ? req.file.filename : ''}`;
    const saveReview = await req.db.collection("reviewcollection").insertOne({
      reviewer_name,
      review_details,
      imageUrl,
    });
    res.send(saveReview);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-review", async (req, res) => {
  try {
    const reviews = await req.db.collection("reviewcollection").find({}).toArray();
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/delete-review/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const deleteReview = await req.db.collection("reviewcollection").deleteOne(query);
    res.send(deleteReview);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Local Development Fallback Listener
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`TRISHAL MEDICAL CENTER listening on port ${port}`);
  });
}

// EXPORT FOR VERCEL USING serverless-http
module.exports = serverless(app);