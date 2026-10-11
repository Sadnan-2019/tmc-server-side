const express = require("express");
const serverless = require("serverless-http");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

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

async function run() {
  try {
    await client.connect();

    const serviceCollection = client.db("trishal_medical_center").collection("services");
    const appoinmentCollection = client.db("trishal_medical_center").collection("appoinment");
    const usersCollection = client.db("trishal_medical_center").collection("users");
    const doctorsCollection = client.db("trishal_medical_center").collection("doctors");
    const departmentCollection = client.db("trishal_medical_center").collection("department");
    const HealthPackageCollection = client.db("trishal_medical_center").collection("healthpackagecollection");
    const reviewCollection = client.db("trishal_medical_center").collection("reviewcollection");

    // Helper to ensure /tmp subdirectories exist for Vercel
    const ensureDir = (dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    };

    // 1. Doctors Upload
    const doctorDir = path.join("/tmp", "Doctorimage");
    ensureDir(doctorDir);
    const storageE = multer.diskStorage({
      destination: (req, file, cb) => cb(null, doctorDir),
      filename: (req, file, cb) => cb(null, file.originalname),
    });
    const doctorsUpload = multer({ storage: storageE });

    app.get("/imagesdoctor/:filename", (req, res) => {
      res.sendFile(path.join(doctorDir, req.params.filename));
    });

    app.post("/doctors", doctorsUpload.single("file"), async (req, res) => {
      const { name, speciality } = req.body;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/imagesdoctor/${req.file.filename}`;

      const saveDoctors = await doctorsCollection.insertOne({ name, speciality, imageUrl });
      res.send(saveDoctors);
    });

    app.delete("/doctor/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const deleteDoctor = await doctorsCollection.deleteOne(query);
      res.send(deleteDoctor);
    });

    app.get("/all-doctors", async (req, res) => {
      const allDoctors = await doctorsCollection.find({}).toArray();
      res.send(allDoctors);
    });

    // 2. Health Package Upload
    const packageDir = path.join("/tmp", "HealthPackageImage");
    ensureDir(packageDir);
    const HealthPackage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, packageDir),
      filename: (req, file, cb) => cb(null, file.originalname),
    });
    const HealthPackageUpload = multer({ storage: HealthPackage });

    app.get("/imagespackage/:filename", (req, res) => {
      res.sendFile(path.join(packageDir, req.params.filename));
    });

    app.post("/healthpackage", HealthPackageUpload.single("file"), async (req, res) => {
      const { package_name, package_rate } = req.body;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/imagespackage/${req.file.filename}`;

      const saveHealthPackage = await HealthPackageCollection.insertOne({ package_name, package_rate, imageUrl });
      res.send(saveHealthPackage);
    });

    app.get("/all-health-package", async (req, res) => {
      const allHealthPackage = await HealthPackageCollection.find({}).toArray();
      res.send(allHealthPackage);
    });

    app.delete("/package/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const deletePacage = await HealthPackageCollection.deleteOne(query);
      res.send(deletePacage);
    });

    // 3. Department Upload
    const deptDir = path.join("/tmp", "image");
    ensureDir(deptDir);
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, deptDir),
      filename: (req, file, cb) => cb(null, file.originalname),
    });
    const upload = multer({ storage: storage });

    app.get("/images/:filename", (req, res) => {
      res.sendFile(path.join(deptDir, req.params.filename));
    });

    app.post("/department", upload.single("file"), async (req, res) => {
      const { dept_name, description } = req.body;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/images/${req.file.filename}`;

      const saveDepartment = await departmentCollection.insertOne({ dept_name, description, imageUrl });
      res.send(saveDepartment);
    });

    app.delete("/department/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const deleteDepartment = await departmentCollection.deleteOne(query);
      res.send(deleteDepartment);
    });

    app.get("/all-department", async (req, res) => {
      const allDepartment = await departmentCollection.find({}).toArray();
      res.send(allDepartment);
    });

    // Users & Services
    app.put("/users/:email", async (req, res) => {
      const filter = { email: req.params.email };
      const updateDoc = { $set: req.body };
      const result = await usersCollection.updateOne(filter, updateDoc, { upsert: true });
      res.send(result);
    });

    app.get("/service", async (req, res) => {
      const services = await serviceCollection.find({}).toArray();
      res.send(services);
    });

    app.post("/appoinment", async (req, res) => {
      const appoinment = req.body;
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
    });

    app.get("/availableservices", async (req, res) => {
      const date = req.query.date || "Dec 8, 2023";
      const availAbleServices = await serviceCollection.find().toArray();
      const bookingAppoinments = await appoinmentCollection.find({ date }).toArray();

      availAbleServices.forEach((availAbleService) => {
        const BookedAppoinments = bookingAppoinments.filter(
          (bk) => bk.department === availAbleService.dept_name
        );
        const booked = BookedAppoinments.map((b) => b.slot);
        const available = availAbleService.slots.filter((as) => !booked.includes(as));
        availAbleService.slots = available;
      });

      res.send(availAbleServices);
    });

    app.get("/booking-appoinment", async (req, res) => {
      const patients_appoinment = await appoinmentCollection
        .find({ patients_email: req.query.patients_email })
        .toArray();
      res.send(patients_appoinment);
    });

    // 4. Review Upload
    const reviewDir = path.join("/tmp", "ReviewerImage");
    ensureDir(reviewDir);
    const ReviewImage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, reviewDir),
      filename: (req, file, cb) => cb(null, file.originalname),
    });
    const ReviewUpload = multer({ storage: ReviewImage });

    app.get("/imagesreview/:filename", (req, res) => {
      res.sendFile(path.join(reviewDir, req.params.filename));
    });

    app.post("/review", ReviewUpload.single("file"), async (req, res) => {
      const { reviewer_name, review_details } = req.body;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/imagesreview/${req.file.filename}`;

      const saveReview = await reviewCollection.insertOne({ reviewer_name, review_details, imageUrl });
      res.send(saveReview);
    });

    app.get("/all-review", async (req, res) => {
      try {
        const reviews = await reviewCollection.find({}).toArray();
        res.send(reviews);
      } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.delete("/delete-review/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const deleteReview = await reviewCollection.deleteOne(query);
      res.send(deleteReview);
    });

    console.log("database connected");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello FROM TRISHAL MEDICAL CENTER World!");
});

// Export only the serverless handler for Vercel
module.exports = serverless(app);