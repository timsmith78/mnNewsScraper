// Setup scraper
const cheerio = require('cheerio')
const request = require('request')

// Include express router
const express = require('express')
const router = express.Router()

// Get database
const db = require('../models')

// Render page
function renderPage(res) {
    console.log("rendering")
    db.Article.find({}, (err, data) => {
        if (err) throw err
        let hbsObj = {
            articles: data
        }
        res.render('index', hbsObj)
    })
}

// Update db recursively, checking for duplicates
function updateArticleDb(articleList, res) {
    if (articleList.length === 0) {
        renderPage(res)
    }
    const entry = articleList.pop()
    db.Article.find({ link: entry.link }).then(data => {
        console.log(data.length)
        if (data.length === 0) {
            console.log('Creating article')
            db.Article.create(entry).then(result => {
                updateArticleDb(articleList, res)
            })
        } else {
            // If we get here, it was a duplicate, just go to the next
            updateArticleDb(articleList, res)
        }
    }).catch(err => {return})
}

// Grab mprnews.org headlines
router.get('/', (req, res) => {
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
        let rawScrapeList = []
        $('article').each((i, elem) => {
            let entry = {}
            entry.title = $(elem).children('a').children('h2').text().trim()
            entry.link = $(elem).children('a').attr('href')
            entry.summary = $(elem).children('a').children('div.details').children('p').text().trim()
            if ((entry.title !== '') &&
                (entry.link !== '') &&
                (entry.summary !== '')) {
                rawScrapeList.push(entry)
            }

        })
        updateArticleDb(rawScrapeList, res)

    })


})


module.exports = router
