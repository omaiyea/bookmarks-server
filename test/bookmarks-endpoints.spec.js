const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('Bookmark Endpoints', function(){
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
                 .get('/api/bookmark')
                 .expect(200, testBookmarks)
            })
        })

        context('Given there are no bookmarks in the database', () => {
            it('GET /bookmark responds with 200 and an empty object', () => {
                return supertest(app)
                 .get('/api/bookmark')
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
                 .get(`/api/bookmark/${third}`)
                 .expect(200, thirdItem)
            })
        })

        context('Given there are no bookmarks in the database', () => {
            it('GET /bookmark/bookmarkId responds with a 400 error', () => {
                const thirdItemIndex = 77;
                return supertest(app)
                 .get(`/api/bookmark/${thirdItemIndex}`)
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
             .post(`/api/bookmark/`)
             .send(newBookmark)
             .expect(201)
             .expect( res => {
                 expect(res.body.title).to.eql(newBookmark.title)
                 expect(res.body.url).to.eql(newBookmark.url)
                 expect(res.body.description).to.eql(newBookmark.description)
                 expect(res.body.rating).to.eql(newBookmark.rating)
             })
        })
        it('POST /bookmark responds with 404 when post data is not in the right format', () => {
            const misformatBookmark = {
                title: 'Misformatted Bookmark',
                url: 'https://google.com',
                description: 'test desc',
                rating: 'text not num'
            }

            return supertest(app)
             .post(`/api/bookmark/`)
             .send(misformatBookmark)
             .expect(404, `Not valid`)
        })
    })

   describe(`DELETE bookmarks endpoint`, () => {
        const testBookmarks = makeBookmarksArray()

        beforeEach('insert bookmark', () => {
            return db
             .into('bookmarks')
             .insert(testBookmarks)
        })

        it('deletes a given bookmark succesfully', () => {
            const secondId = 2;
            const removedBookmarks = testBookmarks.filter(bookmark => bookmark.id === secondId)

            return supertest(app)
             .delete(`/api/bookmark/${secondId}`)
             .expect(204)
        })
    })

    describe(`PATCH bookmarks endpoint`, () => {
        const testBookmarks = makeBookmarksArray()

        beforeEach('insert bookmark', () => {
            return db.into('bookmarks').insert(testBookmarks)
        })

        it('updates a new bookmark succesfully', () => {
            const idToUpdate = 2;
            const updatedBookmark = {
                title: 'updated title',
                url: 'updated url', 
                description: 'updated desc', 
                rating: '5.55'
            }
            const expectedBookmark = {
                ...testBookmarks[idToUpdate - 1],
                ...updatedBookmark
            }

            return supertest(app)
             .patch(`/api/bookmark/${idToUpdate}`)
             .send(updatedBookmark)
             .expect(204)
             .then(res => supertest(app)
              .get(`/api/bookmark/${idToUpdate}`)
              .expect(expectedBookmark))
        })

        it(`responds with 400 when no required fields are supplied`, () => {
            const idToUpdate = 2
            return supertest(app)
             .patch(`/api/bookmark/${idToUpdate}`)
             .send({irrelevantField: 'foo'})
             .expect(400, { error: { message: `Request body must contain either 'title', 'url', 'description', or 'rating'`}})
        })

        it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updatedBookmark = {
                title: 'updated bookmark'
            }
            const expectedBookmark = {
                ...testBookmarks[idToUpdate - 1],
                ...updatedBookmark
            }

            return supertest(app)
             .patch(`/api/bookmark/${idToUpdate}`)
             .send({
                 ...updatedBookmark,
                 fieldToIgnore: 'should not be in GET response'
             })
             .expect(204)
             .then(res => supertest(app)
              .get(`/api/bookmark/${idToUpdate}`)
              .expect(expectedBookmark))
        })
    })
})