const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
require('dotenv').config(); 
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin:["http://localhost:5173"],
    credentials:true
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

     app.post('/tutorInfo', async (req,res)=>{
      const tutor = req.body;
      const query = {email: tutor.email}
      const existingTutor = await tutorCollection.findOne(query)
      if(existingTutor){
        return res.send({message:"This email is existing" , insertedId: null} )
      }
      else{
        const insertTutor = await tutorCollection.insertOne(tutor)
        res.send(insertTutor)
      }
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


app.get('/', (req,res)=>{
    res.send("Tutor Hub is on")
})

app.listen(port,()=>{
    console.log(`Hello World ${port}`)
})
