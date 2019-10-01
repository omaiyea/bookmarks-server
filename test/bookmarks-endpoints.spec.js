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
    this.afterEach('cleanup', () => db('bookmarks').truncate())

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
})