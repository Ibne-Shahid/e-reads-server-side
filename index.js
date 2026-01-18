const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eqwoetz.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const db = client.db('e_books')
        const booksCollection = db.collection('books')
        const ordersCollection = db.collection('orders')

        app.get('/books', async (req, res) => {

            const email = req.query.email

            const query = {}
            if (email) {
                query.sellerEmail = email
            }

            const cursor = booksCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/topBooks', async (req, res) => {
            const cursor = booksCollection.find().limit(6)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/books/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await booksCollection.findOne(query)
            res.send(result)
        })

        app.post('/books', async (req, res) => {
            const newBookData = req.body
            const { title, shortDescription, fullDescription, price, priority, relevantField, imageUrl, sellerEmail, sellerUsername, category } = newBookData
            const newFood = {
                title,
                shortDescription,
                fullDescription,
                price,
                date: new Date().toISOString().slice(0, 10),
                priority,
                relevantField,
                imageUrl,
                sellerEmail,
                sellerUsername,
                category
            }

            const result = await booksCollection.insertOne(newFood)
            res.send(result)
        })

        app.delete('/books/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await booksCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/orders', async (req, res)=>{
            const newOrderData = req.body
            const {foodId, foodName, price, imageUrl, relevantField, category, sellerEmail, customerEmail } = newOrderData

            const newOrder = {
                foodId, foodName, price, imageUrl, relevantField, category, sellerEmail, customerEmail,
                date: new Date().toISOString().slice(0, 10)
            }

            const result = await ordersCollection.insertOne(newOrder)
            res.send(result)
        })

        app.get('/orders', async (req, res)=>{
            const email = req.query.email

            const query = {}
            if (email) {
                query.customerEmail = email
            }

            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('E-Books server is running.')
})

app.listen(port, () => {
    console.log(`E-books server is running on port: ${port}`)
})