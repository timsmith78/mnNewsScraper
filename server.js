// Setup database
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mnNewsScraper')
const db = require('./models')

// Setup web server
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const PORT = process.env.PORT || 8090

// Setup handlebars
const hbs = require('express-handlebars')
app.engine('handlebars', hbs({ defaultLayout: "main" }))
app.set('view engine', 'handlebars')

// Import and activate routes
const routes = require('./controller/controller.js')
app.use(routes)

// Start server
app.listen(PORT, () => {
    console.log(`Server listening to http://localhost:${PORT}`)
})