const cheerio = require('cheerio')
const request = require('request')
const mongoose = require('mongoose')

const db = require('./models')

mongoose.connect('mongodb://localhost/mnNewsScraper')
var mndb = mongoose.connection
mndb.on('error', console.error.bind(console, 'cxn error'))
mndb.once('open', () => {console.log('cxn success')})

// Grab mprnews.org
request('https://mprnews.org', (err, response, html) => {
    // Check for errors
    if (err) {
        console.error('Error loading MPR news website!!')
        throw (err)
    }
    if (response && response.statusCode !== 200) {
        console.error(`Unsuccessful response from MPR news. Code ${response.statusCode}`)
        process.exit(-1)
    }
    
    // Load the html into cheerio for scraping
    const $ = cheerio.load(html)
    $('article').each((i, elem) => {
        let entry = {}
        entry.title = $(elem).children('a').children('h2').text().trim()
        entry.link = $(elem).children('a').attr('href')
        entry.summary = $(elem).children('a').children('div.details').children('p').text().trim()
        if ((entry.title !== '') &&
            (entry.link !== '') &&
            (entry.summary !== '')) {
            db.Article.create(entry).then( newEntry => {
                console.log(newEntry)
            }).catch( err => {
                console.error(err)
            })
        }
    })
})