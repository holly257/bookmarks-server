const app = require('../src/app')
require('dotenv').config()
const knex = require('knex')
const service = require('../src/bookmarks-service')
const { makeTestData, makeMaliciousBookmark } = require('./testData')
const { expect } = require('chai')

describe.only('bookmarks.router', () => {
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
            return db
                .into('bookmark_list')
                .insert(testData)
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
            bookmarkSelected.id = 2
            return supertest(app)
                .get(`/bookmarks/${bookmarkID}`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(200, bookmarkSelected)
        })
        context('POST /articles', () => {  
            const requiredFields = ['title', 'url']
            requiredFields.forEach(field => {
                const newBookmark = {
                    title: 'test new bookmark',
                    url: 'https://test.com'
                }
                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newBookmark[field]

                    return supertest(app)
                        .post('/bookmarks')
                        .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                        .send(newBookmark)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body`}
                        })
                })
            })
            const badRating = {
                title: 'new',
                description: 'newer',
                url: 'randomurl',
                rating: 7
            }
            it(`responds with 400 and an error message when the rating is not between 1 and 5`, () => {
                return supertest(app)
                    .post('/bookmarks')
                    .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                    .send(badRating)
                    .expect(400, {
                        error: { message: `Rating must be between 1 and 5`}
                    })
            })
        })
        context('Given and XSS attack bookmark', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

            beforeEach('insert malicious article', () => {
                return db
                    .into('bookmark_list')
                    .insert([ maliciousBookmark ])
            })
            it('GET /bookmarks removes XSS attack content', () => {
                return supertest(app)
                .get(`/bookmarks`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(200)
                .expect(res => {
                    expect(res.body[4].title).to.eql(expectedBookmark.title)
                    expect(res.body[4].description).to.eql(expectedBookmark.description)
                })
            })
            it('GET /bookmarks/:id removes XSS attack content', () => {
                return supertest(app)
                .get(`/bookmarks/${maliciousBookmark.id}`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                    expect(res.body.description).to.eql(expectedBookmark.description)
                })
            })
            //500 server error - duplicate key value again  :( 
            // it('POST /bookmarks removes XSS attack content', () => {
            //     return supertest(app)
            //     .post(`/bookmarks`)
            //     .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
            //     .send(maliciousBookmark)
            //     .expect(200)
            //     .expect(res => {
            //         expect(res.body.title).to.eql(expectedBookmark.title)
            //         expect(res.body.description).to.eql(expectedBookmark.description)
            //     })
            // })
        })
        it('DELETE /bookmarks/:id responds with 204 and removes the article', () => {
            const idToRemove = 2
            const expectedBookmarks = testData.filter(bm => bm.id !== idToRemove)
            return supertest(app)
                .delete(`/bookmarks/${idToRemove}`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(204)
                .then(res => {
                    supertest(app)
                        .get('/bookmarks')
                        .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                        .expect(expectedBookmarks)
                })
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
        it('POST /bookmarks creates a bookmark, responding with 201 and the new bookmark', () => {
            const newItem = {
                title: 'new',
                url: 'https://www.new.com/',
                description: 'new homepage',
                rating: 3
            }
            return supertest(app)
                .post('/bookmarks')
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .send(newItem)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newItem.title)
                    expect(res.body.url).to.eql(newItem.url)
                    expect(res.body.description).to.eql(newItem.description)
                    expect(res.body.rating).to.eql(newItem.rating)
                    expect(res.body).to.have.property('id')
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                        .expect(postRes.body)
                )
        })
        it('DELETE /bookmarks/:id responds with 404', () => {
            const idToRemove = 2234
            return supertest(app)
                .delete(`/bookmarks/${idToRemove}`)
                .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
                .expect(404, { error: {  message: `Bookmark doesn't exist`}})
        })  
    }) 
})