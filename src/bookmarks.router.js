const express = require('express')
const bookmarkRouter = express.Router()
const bookmarksService = require('./bookmarks-service')
const logger = require('./logger')
const uuid = require('uuid/v4')
const jsonParser = express.json()
const xss = require('xss')

const sanitizeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    rating: bookmark.rating,
    description: xss(bookmark.description) 
})

bookmarkRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        bookmarksService.getAllBookmarks(db)
            .then(bookmarks => {
                //need to make this sanitize too
                res.json(bookmarks.map(sanitizeBookmark))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const newBookmark = { title, url, description, rating }
        
        for(const [key, value] of Object.entries(newBookmark)) {
            if ( value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        if(rating > 5 || rating < 1) {
            return res.status(400).json({
                error: { message: `Rating must be between 1 and 5`}
            })
        }

        bookmarksService.addBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                res
                    .status(201)
                    .json(sanitizeBookmark(bookmark))
            })
            .catch(next)
    })
    

bookmarkRouter
    .route('/:id')
    .all( (req, res, next) => {
        bookmarksService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(bookmark => {
                if(!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist`}
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(sanitizeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        bookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarkRouter

//test is hanging and not finishing on its own
//post test with data?
//post xss test ^ same error