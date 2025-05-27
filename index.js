const express = require("express");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
// const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b5qeanx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//  mongodb+srv://trishal_medical_center:<db_password>@cluster0.b5qeanx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

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
    const serviceCollection = client
      .db("trishal_medical_center")
      .collection("services");
    const appoinmentCollection = client
      .db("trishal_medical_center")
      .collection("appoinment");
    const usersCollection = client
      .db("trishal_medical_center")
      .collection("users");
    const doctorsCollection = client
      .db("trishal_medical_center")
      .collection("doctors");
    const departmentCollection = client
      .db("trishal_medical_center")
      .collection("department");
    const HealthPackageCollection = client
      .db("trishal_medical_center")
      .collection("healthpackagecollection");
    const ReviewCollection = client
      .db("trishal_medical_center")
      .collection("reviewcollection");

    // app.post("/doctors", async (req, res) => {
    //   const newDoctors = req.body;
    //   const saveDoctor = await doctorsCollection.insertOne(newDoctors);
    //   res.send(saveDoctor);
    // });

    // /post doctor

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

    app.post("/doctors", doctorsUpload.single("file"), async (req, res) => {
      const { name, speciality } = req.body;
      const imageUrl = `http://localhost:5000/imagesdoctor/${req.file.filename}`;
      console.log(imageUrl);
      const saveDoctors = await doctorsCollection.insertOne({
        name,
        speciality,
        imageUrl,
      });

      res.send(saveDoctors);
    });

    ////post doctor

    //delete doctor

    app.delete("/doctor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deleteDoctor = await doctorsCollection.deleteOne(query);
      res.send(deleteDoctor);
    });
    //delete doctor

    //get all doctor
    app.get("/all-doctors", async (req, res) => {
      const query = {};
      const doctors = doctorsCollection.find(query);
      const allDoctors = await doctors.toArray();
      res.send(allDoctors);
    });
    //get all doctor

    //PostHealthPackage

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

    app.post(
      "/healthpackage",
      HealthPackageUpload.single("file"),
      async (req, res) => {
        const { package_name, package_rate } = req.body;
        const imageUrl = `http://localhost:5000/imagespackage/${req.file.filename}`;
        console.log(imageUrl);
        const saveHealthPackage = await HealthPackageCollection.insertOne({
          package_name,
          package_rate,
          imageUrl,
        });

        res.send(saveHealthPackage);
      }
    );

    //PostHealthPackage
    //get all package

    app.get("/all-health-package", async (req, res) => {
      const query = {};
      const healthpackage = HealthPackageCollection.find(query);
      const allHealthPackage = await healthpackage.toArray();
      res.send(allHealthPackage);
    });

    //get all package

    //delete package

    app.delete("/package/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deletePacage = await HealthPackageCollection.deleteOne(query);
      res.send(deletePacage);
    });
    //delete package

    //post department

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
      const { dept_name, description } = req.body;
      const imageUrl = `http://localhost:5000/images/${req.file.filename}`;
      console.log(imageUrl);
      const saveDepartment = await departmentCollection.insertOne({
        dept_name,
        description,
        imageUrl,
      });

      res.send(saveDepartment);
    });
    //post department

    //delete department
    app.delete("/department/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deleteDepartment = await departmentCollection.deleteOne(query);
      res.send(deleteDepartment);
    });
    //delete pepartment

    //get department
    app.get("/all-department", async (req, res) => {
      const query = {};
      const department = departmentCollection.find(query);
      const allDepartment = await department.toArray();
      res.send(allDepartment);
    });
    //get department

    // put user
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //put user
    // {

    // }
    //get service
    app.get("/service", async (req, res) => {
      const query = {};
      const service = serviceCollection.find(query);
      const services = await service.toArray();
      res.send(services);
    });
    //get service
    //post appoinment
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

      console.log(checkAppionment);
      const existAppoinment = await appoinmentCollection.findOne(
        checkAppionment
      );
      console.log(existAppoinment);

      if (existAppoinment) {
        return res.send({ success: false, appoinment: existAppoinment });
      }
      const appoinmentResult = await appoinmentCollection.insertOne(appoinment);
      return res.send({ success: true, appoinmentResult });
    });

    //post appoinment
    //get all service
    app.get("/availableservices", async (req, res) => {
      const date = req.query.date || "Dec 8, 2023";
      //1 fisrt step get all services
      const availAbleServices = await serviceCollection.find().toArray();

      //2 get the booking of the day
      const BookingDate = { date: date };
      const bookingAppoinments = await appoinmentCollection
        .find(BookingDate)
        .toArray();

      ///3 FOR EACH SERVICS FIND BOOKING

      availAbleServices.forEach((availAbleService) => {
        const BookedAppoinments = bookingAppoinments.filter(
          (bk) => bk.department === availAbleService.dept_name
        );
        // console.log(BookedAppoinments)

        // bookde doctor
        const BookedDoctor = bookingAppoinments.filter(
          (db) => db.name === availAbleService.doctor_name
        );
        // console.log(BookedDoctor)
        // bookde slot
        const booked = BookedAppoinments.map((b) => b.slot);
        // bookde doctor
        // const bookedDoctor = BookedDoctor.map(ad=> ad.name);
        // console.log(bookedDoctor)
        // availAbleService.booked=BookedAppoinments.map(s=> s.slot)

        const available = availAbleService.slots.filter(
          (as) => !booked.includes(as)
        );
        availAbleService.slots = available;
        // availAbleService.doctor_name=bookedDoctor;

        // const availableDoctor= availAbleService.doctor_name.map(bb=>!bookedDoctor.includes(bb))
        // availAbleService.doctor_name = availableDoctor;
      });
      res.send(availAbleServices);
    });

    app.get("/booking-appoinment", async (req, res) => {
      const patients_email = req.query.patients_email;
      const patients_email_query = { patients_email: patients_email };
      const patients_appoinment = await appoinmentCollection
        .find(patients_email_query)
        .toArray();
      res.send(patients_appoinment);
    });

    /// post review

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
      const { reviewer_name, review_details } = req.body;
      const imageUrl = `http://localhost:5000/imagesreview/${req.file.filename}`;
      console.log(imageUrl);
      const saveReview = await ReviewCollection.insertOne({
        reviewer_name,
        review_details,
        imageUrl,
      });

      res.send(saveReview);
    });

    //get all-review

    app.get("/all-review", async (req, res) => {
      const query = {};
      const review = ReviewCollection.find(query);
      const reviews = await review.toArray();
      res.send(reviews);
    });

    //delete review
    app.delete("/delete-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deleteReview = await ReviewCollection.deleteOne(query);
      res.send(deleteReview);
    });

    // review

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
