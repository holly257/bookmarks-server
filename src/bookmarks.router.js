const express = require('express')
const bookmarkRouter = express.Router()
const bookmarks = require('./store')
const logger = require('./logger')
const uuid = require('uuid/v4')

bookmarkRouter
    .route('/')
    .get((req, res) => {
        res
            .json(bookmarks)
    })
    .post((req, res) => {
        const { title, url, description, rating } = req.body

        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Invalid data');
        } 
        if (!url) {
            logger.error(`url is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (!description) {
            logger.error(`Description is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if (!rating) {
            logger.error(`Rating is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        const id = uuid()

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark)

        logger.info(`Card with id ${id} created`)

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })

bookmarkRouter
    .route('/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(mark => mark.id == id);

        if(!bookmark) {
            logger.error(`Card with id ${id} not found.`);
            return res
                .status(404)
                .send('Card Not Found')
        }
        res
            .json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(mark => mark.id == id)

        if (bookmarkIndex === -1) {
            logger.error(`List with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found');
        }

        console.log('index is ' + bookmarkIndex)
        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);
        res
            .status(204)
            .end();
    })

module.exports = bookmarkRouter