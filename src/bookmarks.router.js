const express = require('express')
const bookmarkRouter = express.Router()
const bookmarksService = require('./bookmarks-service')
const logger = require('./logger')
const uuid = require('uuid/v4')
const jsonParser = express.json()

bookmarkRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        bookmarksService.getAllBookmarks(db)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const newBookmark = { title, content, style }
        bookmarksService.addBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                res
                    .status(201)
                    .json(bookmark)
            })
            .catch(next)
    })
    

bookmarkRouter
    .route('/:id')
    .get((req, res, next) => {
        const db = req.app.get('db');
        bookmarksService.getById(db, req.params.id)
            .then(bookmark => {
                if(!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist`}
                    })
                }
                res.json(bookmark)
            })
            .catch(next)
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