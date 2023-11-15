const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

const port = 5000;

//midleware
var cors = require('cors');
app.use(cors());
app.use(express.json());//req.body undifined solved
app.use(fileUpload());
const stripe = require('stripe')('sk_test_51OCHE2SI11d9OCz0WpIWZYF8f2pKZ4RELZqyDxKFscR7vOqY8PxerKGJDwRxtycw00lro4XUsdfDjZPKQwSxRvt500aK83SGrg');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://shadiptomojumder:Shadipto58k@cluster0.fmco2ha.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const database = client.db('Final_Project');
        const productCollection = database.collection('Products');
        const usersCollection = database.collection('users');
        const bookingCollection = database.collection('Bookings');

        // user get
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productCollection.find(query).toArray();
            //console.log(users);
            res.send(products)
        })

        // POST USER DATA TO DATABASE
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })
        // GET USER FROM DATABASE
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            //console.log(users);
            res.send(users)
        })

        // MAKE ADMIN
        app.put('/users/admin:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);

            res.send(result)
        })

        // REMOVE ADMIN
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updatedDoc = req.body;
            console.log(updatedDoc, id);
            const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedDoc });
            // console.log(usersCollection)
            res.send(result)
        })



        // way-1 POST PRODUCT DATA TO DATABASE 
        // app.post('/products', async (req, res) => {
        //     const productData = req.body;
        //     //console.log(product);

        //     const photo = req.files.image.data;
        //     const photoData = photo.toString('base64');
        //     const photoBuffer = Buffer.from(photoData, 'base64');
        //     //console.log(photoBuffer);

        //     const product = {
        //         ...productData,
        //         image: photoBuffer
        //     }
        //     //console.log(product);

        //     const result = await productCollection.insertOne(product);
        //     res.send(result)
        // })

        // way-2 POST PRODUCT DATA TO DATABASE
        app.post('/products', async (req, res) => {
            const productData = req.body;
            //console.log(productData);
            const result = await productCollection.insertOne(productData);
            res.send(result)
        })

        // specific CATEGORY DATA
        app.get('/products/:category', async (req, res) => {
            //console.log('specific user hit');
            const category = req.params.category;
            //console.log(category);
            const query = { category: category }
            //console.log(query);
            const result = await productCollection.find(query).toArray();
            //console.log(result);
            res.send(result)
        })

        // specific CATEGORY DATA
        app.get('/products/:name', async (req, res) => {
            console.log('specific product hit');
            const name = req.params.name;
            console.log(name);
            const query = { name: name }
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })

        //CHECK ADMIN VIA EMAIL
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === "admin" })

        })

        //CHECK ADMIN VIA EMAIL
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            //console.log(email);
            const query = { email };
            const user = await usersCollection.findOne(query);

            res.send({ isBuyer: user?.role === 'buyer' })

        })

        // POST BOOKINGS DATA TO DATABASE
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            //console.log(bookings);
            const result = await bookingCollection.insertOne(bookings);
            res.send(result)
        })
        // Get single booking data for payment
        app.get('/bookings', async (req, res) => {
            const query = {};
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
        })

        // Get single booking data for payment
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };

            const result = await bookingCollection.findOne(query);

            res.send(result)

        })

        // Payment integration
        app.post("/create-payment-intent", async (req, res) => {
            const order = req.body;
            console.log(order.productPrice);
            const price = parseFloat(order.productPrice);
            console.log(price);
            const ammount = price * 100;
            console.log(ammount);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: ammount,
                currency: "usd",
                payment_method_types: [
                    "card"
                ],

            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })




    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})