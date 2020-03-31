require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const winston = require('winston')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

// set up winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'info.log' })
    ]
});
  
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
}

// API handling middleware
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    next()
})

const bookmarks = [
    {
        title: 'github',
        url: 'https://github.com/',
        description: 'link to github',
        rating: '5'
    },
    {
        title: 'google',
        url: 'https://google.com/',
        description: 'link to google',
        rating: '4'
    }
]

app.get('/bookmarks', (req, res) => {
    res.send('Hello world')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app

// Write a route handler for the endpoint GET /bookmarks 
    // that returns a list of bookmarks
        //title, url, description, rating 
// Write a route handler for the endpoint GET /bookmarks/:id 
    // that returns a single bookmark with the given ID, 
    // return 404 Not Found if the ID is not valid
// Write a route handler for POST /bookmarks 
    // that accepts a JSON object representing a bookmark 
    // and adds it to the list of bookmarks after validation.
// Write a route handler for the endpoint DELETE /bookmarks/:id 
    // that deletes the bookmark with the given ID.