const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
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

    app.post("/doctors", async (req, res) => {
      const newDoctors = req.body;
      const saveDoctor = await doctorsCollection.insertOne(newDoctors);
      res.send(saveDoctor);
    });

    app.delete("/doctor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteDoctor = await doctorsCollection.deleteOne(query);
      res.send(deleteDoctor);
    });

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
    // {

    // }

    app.get("/service", async (req, res) => {
      const query = {};
      const service = serviceCollection.find(query);
      const services = await service.toArray();
      res.send(services);
    });
    app.get("/all-doctors", async (req, res) => {
      const query = {};
      const doctors = doctorsCollection.find(query);
      const allDoctors = await doctors.toArray();
      res.send(allDoctors);
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

    // app.get("/all-booking", async (req, res) => {
    //   const patients_email = req.query.patients_email;
    //   const query = {patients_email : patients_email};
    //   const service = appoinmentCollection.find(query);
    //   const services = await service.toArray();
    //   res.send(services);
    // });

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
