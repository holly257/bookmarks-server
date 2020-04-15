const app = require('../src/app')
require('dotenv').config()
const knex = require('knex')
const service = require('../src/bookmarks-service')
const { makeTestData } = require('./testData')
const { expect } = require('chai')

describe('bookmarks.router', () => {
    let db
    before('db connected',() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db',() => db.destroy())
    beforeEach('cleanup', () => db('bookmark_list').truncate())

    context('testing with data', () => {
        const testData = makeTestData()
        
        beforeEach(() => {
            return db.into('bookmark_list').insert(testData)
        })
        it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
            return supertest(app)
                .get('/bookmarks')
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(200, testData)
        })
        it('GET /bookmarks/:id responds with 200 and the correct bookmark object', () => {
            const bookmarkID = 2
            const bookmarkSelected = testData[bookmarkID - 1]
            return supertest(app)
                .get(`/bookmarks/${bookmarkID}`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(200, bookmarkSelected)
        })
    })

    context('testing bookmarks-service without data', () => {
        it('GET /bookmarks responds 200 and an empty list', () => {
            return supertest(app)
                .get('/bookmarks')
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(200, [])
        })
        it('GET /bookmarks/:id responds with 404', () => {
            const id = 22737842
            return supertest(app)
                .get(`/bookmarks/${id}`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(404, { error: { 
                    message: `Bookmark doesn't exist`
                } })
        })
    })
})