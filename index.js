const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();

const app = express();
// middleware

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.quaequt.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  // console.log(req.headers)
  if (!authHeader) {
      return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];
  console.log(token)

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    console.log(decoded)
      if (err) {
        console.log("error from verify jwt");
          return res.status(403).send({ message: 'forbidden access' })
      }
      req.decoded = decoded;
      next();
  })

}

async function run(){
  try{
    const productsCollection = client.db("justLikeNew").collection("products");
    const bookingsCollection = client.db("justLikeNew").collection("bookings");
    const usersCollection = client.db("justLikeNew").collection("users");

    // app.get("/products" , async(req,res)=>{
    //   const query = {}
    //   const options = await productsCollection.find(query).toArray();
    //   res.send(options);
    // })

    app.get("/category/:name" , async(req,res)=>{
      const name = req.params.name;
      const query = {name:name}
      const options = await productsCollection.find(query).toArray();
      res.send(options);
    })

    // modal er data save krlam database e
    
    app.post("/bookings",async(req,res)=>{
      const booking = req.body;
      // console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    })

    // my order e dekahnor jonno aita 

    app.get("/bookings",verifyJWT,async(req,res)=>{
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
        
        if (email !== decodedEmail) {
            return res.status(403).send({ message: 'forbidden access' });
        }
      const query = {email:email};
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    })


    // user k post krte aita use mane user database e save
    app.post("/users",async(req,res)=>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // USER THAKLE TOKEN DIBO
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      
      if (user) {
          const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '9d' })
          return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: '' })
      
  });

  // for all user
  app.get("/users",async(req,res)=>{
    const query = {}
    const users = await usersCollection.find(query).toArray()
    res.send(users);
  })

   // check user is admin or not
   app.get("/users/admin/:email", async(req,res)=>{
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query);
    res.send({isAdmin: user?.role === "admin"});
  })

  // check user is seller or not
  app.get("/users/seller/:email", async(req,res)=>{
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query);
    res.send({isSeller: user?.role === "Seller"});
  })

  // check user is buyer or not
  app.get("/users/buyer/:email", async(req,res)=>{
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query);
    res.send({isBuyer: user?.role === "Buyer"});
  })

  // products data send to the server
  app.post("/products",async(req,res)=>{
    const product = req.body;
    const result = await productsCollection.insertOne(product)
    res.send(result);
  })

  // try for find seller product by using email
  app.get("/products", async(req,res)=>{
    const email = req.query.email;
      const query = { email };
      const user = await productsCollection.findOne(query);
      res.send(user);
  })
  }
  finally{

  }
}

run().catch(console.log)



app.get("/",async(req,res) =>{
    res.send("just like new is running!")
})

app.listen(port,()=> console.log(`just like new is running on port ${port}`))