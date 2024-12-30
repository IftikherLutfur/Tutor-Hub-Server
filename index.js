const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const TutorReview = client.db("TutorHub").collection('tutorReviews')
    const courseCollection = client.db("TutorHub").collection('course')


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
    app.post('/tutorReview', async (req, res) => {
      const rivew = req.body
      const insertTutorReview = await TutorReview.insertOne(rivew)
      res.send(insertTutorReview)
    })
    //   app.post('/tutorReview', (req, res) => {
    //     const { message } = req.body;
    //     console.log('Review received:', message);
    //     res.status(200).json({ success: true, message: 'Review submitted successfully!' });
    // });

    app.post('/coursePost', async (req, res) => {
      const post = req.body;
      const coursePost = await courseCollection.insertOne(post)
      res.send(coursePost)
    })

    app.get('/getTutor', async (req, res) => {
      const getTutor = req.body;
      const result = await tutorCollection.find().toArray()
      res.send(result)
    })

    app.get('/getStudent', async (req, res) => {
      try {
        const result = await studentCollection.find().toArray(); // Fetch all students
        res.status(200).send(result); // Send back the result with a 200 status
      } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).send({ error: "Internal Server Error" }); // Handle errors
      }
    });

    app.get('/getTutorReview', async (req, res) => {
      const getTutorReviews = await TutorReview.find().toArray()
      res.send(getTutorReviews)
    })

    app.get('/aboutUs', async (req, res) => {
      const result = await aboutUsCollection.find().toArray()
      res.send(result)

    })
    app.get('/getCourse', async (req, res) => {
      const getTheCourseData = await courseCollection.find().toArray()
      res.send(getTheCourseData)
    })

    app.get('/getCourse/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const findIndividualCourse = await courseCollection.findOne(query)
      res.send(findIndividualCourse)
    })

    app.patch('/studentUpdate/:id', async (req, res) => {
      console.log("Received PATCH request at /studentUpdate/:id"); // Debugging log

      const id = req.params.id;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }

      const filter = { _id: new ObjectId(id) };
      const updateStudent = {
        $set: { role: role }
      };

      try {
        const result = await studentCollection.updateOne(filter, updateStudent);
        if (result.modifiedCount > 0) {
          return res.json({ modifiedCount: result.modifiedCount });
        } else {
          return res.status(404).json({ message: "Student not found or no changes made" });
        }
      } catch (error) {
        console.error("Error updating student:", error);
        return res.status(500).json({ message: "Error updating student" });
      }
    });

    // Course Update
    app.patch('/updateCourse/:id', async (req, res) => {
      console.log("Received PATCH request at /updateCourse/:id"); // Debugging log

      const id = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const filter = { _id: new ObjectId(id) };
      const updateCourse = {
        $set: { status: status }
      };

      try {
        const result = await courseCollection.updateOne(filter, updateCourse);
        if (result.modifiedCount > 0) {
          return res.json({ modifiedCount: result.modifiedCount });
        } else {
          return res.status(404).json({ message: "Course not found or no changes made" });
        }
      } catch (error) {
        console.error("Error updating course:", error);
        return res.status(500).json({ message: "Error updating course" });
      }
    });


    // Tutor Update
    app.patch('/tutorUpdate/:id', async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      if (!role) {
        return res.status(404).json({ message: "Role is required" })
      }
      const filter = { _id: new ObjectId(id) }
      const updateTutor = {
        $set: { role: role }
      }

      try {
        const result = await tutorCollection.updateOne(filter, updateTutor)
        if (result.modifiedCount > 0) {
          res.json({ modifiedCount: result.modifiedCount })
        }
        else {
          res.status(404).json({ messahe: "Tutor not found and no change made" })
        }
      } catch (error) {
        console.error("Error updating student", error)
        return res.status(500).json({ message: "Error updating tutor" })
      }


    })

    app.delete('/studentDelete/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await studentCollection.deleteOne(filter);
        if (result.deletedCount > 0) {
          console.log("Successfully deleted document with ID:", id);
          res.json({ deletedCount: result.deletedCount });
        } else {
          console.log("No document found with the specified ID.");
          res.status(404).json({ message: "Student not found" });
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Error deleting student" });
      }
    });

    app.delete("/deleteCourse/:id", async (req, res) => {


      try {
        const id = req.params.id
        const courseDelete = await courseCollection.deleteOne({ _id: new ObjectId(id) });
        if(courseDelete.deletedCount>0){
          console.log("Successfully deleted the course with ID", id);
          res.json({deletedCount: courseDelete.deletedCount}) 
        }
        else{
          console.log("No course with the specified id")
          res.status(404).json({message:"Error deleting course"})
        }
      } catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
      }
    });

    app.delete('/tutorDelete/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const tutorDelete = await tutorCollection.deleteOne({ _id: new ObjectId(id) })
        if (tutorDelete.deletedCount > 0) {
          console.log("Succcessfully deleted the tuotr with ID", id);
          res.json({ deletedCount: tutorDelete.deletedCount })
        }
        else {
          console.log("No tutor find with the specified id");
          res.status(404).json({ message: "Error deleting tutor" })
        }

      } catch (error) {
        console.error("Error deleting tutor", error);
        res.status(500).json({ message: "Error Deleting the tutor" })
      }
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Tutor Hub is on")
})

app.listen(port, () => {
  console.log(`Hello World ${port}`)
})
