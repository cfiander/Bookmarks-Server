const knex = require('knex')
const {makeBookmarksArray} = require('./bookmarks.fixtures')
const app = require('../src/app')
// TODO: remove when updating POST and DELETE
const store = require('../src/store')

describe.only('Bookmarks Endpoints', function() {
    let db
    
    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
      })
    
  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())

  after('disconnect from db', () => db.destroy())

  
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and all of the articles', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks)
      })
    })

    context(`Given no articles`, () => {
          it(`responds with 200 and an empty list`, () => {
          return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200, [])
        })
     })
  
  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = store.bookmarks[1]
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
})

  describe('GET /bookmarks/:id', () => {
    context(`Given no bookmarks`, () => {
      it(`responds 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .get(`/bookmarks/123`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Bookmark Not Found` }
          })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2
        const expectedBookmark = testBookmarks[bookmarkId - 1]
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark)
      })
    })
  })
  describe.only(`POST /bookmakrs`, () => {
   it(`creates a bookmark, responding with 201 and the new article`,  function() {
    const newBookmark = {
        title: 'test-title',
        url: 'https://test.com',
        description: 'test description',
        rating: 1,
      }   
    return supertest(app)
    .post(`/bookmarks`)
    .send(newBookmark)
    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    .expect(201)
    .expect(res => {
      expect(res.body.title).to.eql(newBookmark.title)
      expect(res.body.url).to.eql(newBookmark.url)
      expect(res.body.description).to.eql(newBookmark.description)
      expect(res.body.rating).to.eql(newBookmark.rating)
      expect(res.body.id).to.be.a('string')
    })
    .then(res => {
      expect(store.bookmarks[store.bookmarks.length - 1]).to.eql(res.body)
    })
 })
})
})
