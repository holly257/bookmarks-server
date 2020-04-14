require('dotenv').config()
const knex = require('knex')
const service = require('../src/bookmarks-service')
const { makeTestData } = require('./testData')
const { expect } = require('chai')

describe('bookmarks-service', () => {
    let db
    before('db connected',() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })
    after('disconnect from db',() => db.destroy())
    beforeEach('cleanup', () => db('bookmark_list').truncate())

    context('testing bookmarks-service with data', () => {
        const testData = makeTestData()
        
        beforeEach(() => {
            return db.into('bookmark_list').insert(testData)
        })

        it('returns all bookmarks from getAllBookmarks()', () => {
            return service.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql(testData)
                })
        })
        it('gets specific bookmark by id', () => {
            const bookmarkID = 2
            const selectedBookmark = testData[bookmarkID - 1]
            return service.getById(db, bookmarkID)
                .then(actual => {
                    expect(actual).to.eql(selectedBookmark)
                })
        })
        it('deletes selected item by id', () => {
            const itemId = 2
            return service.deleteBookmark(db, itemId)
                .then(() => service.getAllBookmarks(db))
                .then(actual => {
                    const expected = testData.filter(item => item.id !== itemId)
                    expect(actual).to.eql(expected)                       
                }) 
        })
        it('updates item selected by id', () => {
            const updateId = 3
            const newInfo = {
                id: 3,
                title: 'Twitter',
                url: 'https://twitter.com/',
                description: 'Twitter Homepage',
                rating: 3
            }
            return service.updateItem(db, updateId, newInfo)
            .then(() => service.getById(db, updateId))
            .then(actual => {
                expect(actual).to.eql({
                    id: updateId,
                    ...newInfo
                })
            })  
        })
    })

    context('testing bookmarks-service without data', () => {
        it('returns an empty array from getAllBookmarks()', () => {
            return service.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
        it('adds new bookmark to the array and gives it an id', () => {
            const newItem = {
                id: 1,
                title: 'Other',
                url: 'https://www.other.com/',
                description: 'Other homepage',
                rating: 3
            }
            return service.addBookmark(db, newItem)
                .then(actual => {
                    expect(actual).to.eql(newItem)
                })
        }) 
    })
})