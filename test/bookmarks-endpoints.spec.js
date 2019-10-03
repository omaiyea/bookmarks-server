const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmark Endpoints', function(){
    let db
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db('bookmarks').truncate())
    afterEach('cleanup', () => db('bookmarks').truncate())

    describe('GET /bookmark', () => {
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmark', () => {
                return db
                 .into('bookmarks')
                 .insert(testBookmarks)
            })

            it('GET /bookmark responds with 200 and all of the articles', () => {
                return supertest(app)
                 .get('/bookmark')
                 .expect(200, testBookmarks)
            })
        })

        context('Given there are no bookmarks in the database', () => {
            it('GET /bookmark responds with 200 and an empty object', () => {
                return supertest(app)
                 .get('/bookmark')
                 .expect(200, [])
            })
        })
    })

    describe('GET /bookmark/:bookmarkId', () => {
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmark', () => {
                return db
                 .into('bookmarks')
                 .insert(testBookmarks)
            })

            it('GET /bookmark/:bookmarkId responds with 200 and the queried bookmark', () => {
                const third = 3;
                const thirdItem = testBookmarks[third - 1];
                return supertest(app)
                 .get(`/bookmark/${third}`)
                 .expect(200, thirdItem)
            })
        })

        context('Given there are no bookmarks in the database', () => {
            it('GET /bookmark/bookmarkId responds with a 400 error', () => {
                const thirdItemIndex = 77;
                return supertest(app)
                 .get(`/bookmark/${thirdItemIndex}`)
                 .expect(404)
            })
        })
    })

    describe(`POST /bookmark`, () => {
        it('POST /bookmark responds with 201 and the newly stored bookmark', () => {
            const newBookmark = {
                title: 'Bookmark 1', 
                url: 'https://google.com', 
                description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non. Adipisci, pariatur. Molestiae, libero esse hic adipisci autem neque?', 
                rating: '4.44'
            }
            return supertest(app)
             .post(`/bookmark/`)
             .send(newBookmark)
             .expect(201)
             .expect( res => {
                 expect(res.body.title).to.eql(newBookmark.title)
                 expect(res.body.url).to.eql(newBookmark.url)
                 expect(res.body.description).to.eql(newBookmark.description)
                 expect(res.body.rating).to.eql(newBookmark.rating)
             })
        })
    })
})