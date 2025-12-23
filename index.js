
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// job_portal
// Pi8elTCWbRN9yE7J


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://job_portal:Pi8elTCWbRN9yE7J@cluster0.qiaxbve.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database collections (will be initialized after connection)
let jobsCollection;
let applicationsCollection;

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Initialize database collections
    jobsCollection = client.db('careerCode').collection('jobs');
    applicationsCollection = client.db('careerCode').collection('applications');

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Don't close on error - let the server start and handle errors in routes
  }
}

// Start MongoDB connection
run().catch(console.dir);

// jobs api
//get multiple
app.get('/jobs', async (req, res) => {
  try {
    if (!jobsCollection) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const email = req.query.email;
    const query = {};
    if (email) {
      query.hr_email = email;
    }
    const cursor = jobsCollection.find();
    const result = await cursor.toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
});



// could be done but should not be done.
// app.get('/jobsByEmailAddress', async (req, res) => {
//   const email = req.query.email;
//   const query = { hr_email: email }
//   const result = await jobsCollection.find(query).toArray();
//   res.send(result);
// })

// could be done
app.get('/jobsByEmailAddress', async (req, res) => {
  const email = req.query.email;
  const query = { hr_email: email }
})

//get single find
app.get('/jobs/:id', async (req, res) => {
  try {
    if (!jobsCollection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    const query = { _id: new ObjectId(id) };
    const result = await jobsCollection.findOne(query);
    if (!result) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job', message: error.message });
  }
});

app.post('/jobs', async (req, res) => {
  const newJob = req.body;
  console.log(newJob);
  const result = await jobsCollection.insertOne(newJob);
  res.send(result);
})

// job applications related apis
app.get('/applications', async (req, res) => {
  try {
    if (!applicationsCollection || !jobsCollection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const query = {
      applicant: email
    };
    const result = await applicationsCollection.find(query).toArray();

    // bad way to aggregate data
    for (const application of result) {
      const jobId = application.jobId;
      if (jobId && ObjectId.isValid(jobId)) {
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobsCollection.findOne(jobQuery);
        if (job) {
          application.company = job.company;
          application.title = job.title;
          application.company_logo = job.company_logo;
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications', message: error.message });
  }
});

// app.get('/applications/:id', () =>{})
app.get('/applications/job/:job_id', async (req, res) => {
  const job_id = req.params.job_id;
  console.log(job_id);
  const query = { jobId: job_id }
  const result = await applicationsCollection.find(query).toArray();
  res.send(result);
})



app.post('/applications', async (req, res) => {
  try {
    if (!applicationsCollection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const application = req.body;
    console.log(application);
    const result = await applicationsCollection.insertOne(application);
    res.json(result);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running  on port ${port}`)
})


