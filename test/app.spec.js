const app = require('../src/app')

describe('App', () => {
    it('GET / responds with 200 containing "Hello world"', () => {
        return supertest(app)
            .get('/bookmarks')
            .set({ Authorization: 'Bearer b1e66383-3f8b-4d6e-8143-42a446443e5c'})
            .expect(200)
    })
})