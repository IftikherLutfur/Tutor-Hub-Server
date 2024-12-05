const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hyx8zzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const tutorCollection = client.db("TutorHub").collection('tutorInfo')
    const studentCollection = client.db("TutorHub").collection('studentInfo')
    const aboutUsCollection = client.db("TutorHub").collection('AboutUs')


    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JSON_WEB_TOKEN, { expiresIn: "24h" })
      // console.log(token);
      res.send({ token })

    })

    

    app.post('/tutorInfo', async (req, res) => {
      const tutor = req.body;
      const query = { email: tutor.email }
      const existingTutor = await tutorCollection.findOne(query)
      if (existingTutor) {
        return res.send({ message: "This email is existing", insertedId: null })
      }
      else {
        const insertTutor = await tutorCollection.insertOne(tutor)
        res.send(insertTutor)
      }
    })

    app.post("/studentInfo", async (req, res) => {
      const student = req.body
      const query = { email: student.email }
      const existingStudent = await studentCollection.findOne(query)
      if (existingStudent) {
        return res.send({ message: "User already exist", insertedId: null })
      }
      else {
        const insertStudent = await studentCollection.insertOne(student)
        res.send(insertStudent)
      }
    })

    app.get('/getTutor', async (req, res) => {
      const getTutor = req.body;
      const result = await tutorCollection.find().toArray()
      res.send(result)
    })

    app.get('/aboutUs', async (req, res)=>{
      const result = await aboutUsCollection.find().toArray()
      res.send(result)

    })

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Tutor Hub is on")
})

app.listen(port, () => {
  console.log(`Hello World ${port}`)
})
