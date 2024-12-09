const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("THIS IS ROOT");
});

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.b4uwa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // * DB collections Starts

    const upcomingEventCollection = client
      .db("shrlDB")
      .collection("upcomingEvents");
    const scrollingTextCollection = client
      .db("shrlDB")
      .collection("scrollingText");
    const eventsCollection = client.db("shrlDB").collection("events");
    const teamMembersCollection = client.db("shrlDB").collection("teamMembers");

    // * DB collections End

    //*  Upcoming Events Starts

    app.post("/upcoming-events", async (req, res) => {
      const neWEvent = req.body;
      // console.log(neWEvent);
      const result = await upcomingEventCollection.insertOne(neWEvent);
      res.send(result);
    });

    app.get("/upcoming-events", async (req, res) => {
      const result = await upcomingEventCollection.find().toArray();
      res.send(result);
    });

    app.get("/upcoming-events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await upcomingEventCollection.findOne(query);
      res.send(result);
    });

    app.delete("/upcoming-events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await upcomingEventCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/upcoming-events/:id", async (req, res) => {
      const id = req.params.id;
      const updateEvent = req.body;
      // console.log(updateEvent);
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const event = {
        $set: {
          heading: updateEvent.heading,
          date: updateEvent.date,
          time: updateEvent.time,
          venue: updateEvent.venue,
          facilitators: updateEvent.facilitators,
          photo: updateEvent.photo,
        },
      };

      const result = await upcomingEventCollection.updateOne(
        query,
        event,
        options
      );

      res.send(result);
    });
    //*  Upcoming Events End

    //* Scrolling Text Start

    app.post("/scrolling", async (req, res) => {
      const text = req.body;
      const result = await scrollingTextCollection.insertOne(text);
      res.send(result);
    });

    app.get("/scrolling", async (req, res) => {
      const result = await scrollingTextCollection.find().toArray();
      res.send(result);
    });

    app.get("/scrolling/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await scrollingTextCollection.findOne(query);
      res.send(result);
    });

    app.delete("/scrolling/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await scrollingTextCollection.deleteOne(query);
      res.send(result);
    });

    //* Scrolling Text End

    // * Events Starts

    app.post("/events", async (req, res) => {
      const event = req.body;
      event.createdAt = new Date();
      const result = await eventsCollection.insertOne(event);
      res.send(result);
    });
    app.get("/events", async (req, res) => {
      const result = await eventsCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray(); // Sort by createdAt descending
      res.send(result);
    });

    app.get("/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(query);
      res.send(result);
    });
    app.delete("/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.deleteOne(query);
      res.send(result);
    });

    // * Events End

    // * Team Members Starts

    app.get("/members", async (req, res) => {
      const result = await teamMembersCollection.find().toArray();
      res.send(result);
    });

    app.get("/member/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teamMembersCollection.findOne(query);
      res.send(result);
    });

    // * Team Members End

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running on port", port);
});
