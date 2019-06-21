const knex = require('knex')
const {makeBookmarksArray, makeMaliciousBookmark} = require('./bookmarks.fixtures')
const app = require('../src/app')
// TODO: remove when updating POST and DELETE
const store = require('../src/store')

describe('Bookmarks Endpoints', function() {
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

  describe('GET /api/bookmarks', () => {
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks)
      })
    })

    context(`Given no bookmarks`, () => {
          it(`responds with 200 and an empty list`, () => {
          return supertest(app)
          .get('/api/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200, [])
        })
     })
     context(`Given an XSS attack bookmark`, () => {
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
  
        beforeEach('insert malicious bookmark', () => {
          return db
            .into('bookmarks')
            .insert([maliciousBookmark])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/bookmarks`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect(res => {
              expect(res.body[0].title).to.eql(expectedBookmark.title)
              expect(res.body[0].description).to.eql(expectedBookmark.description)
            })
        })
      })
    })
  
  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
      return supertest(app)
        .get('/api/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = store.bookmarks[1]
      return supertest(app)
        .get(`/api/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
})

  describe('GET /api/bookmarks/:id', () => {
    context(`Given no bookmarks`, () => {
      it(`responds 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .get(`/api/bookmarks/123`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Bookmark doesn't exist` }
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
          .get(`/api/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark)
      })  
    })
    context(`Given an XSS attack bookmark`, () => {
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
  
        beforeEach('insert malicious bookmark', () => {
          return db
            .into('bookmarks')
            .insert([maliciousBookmark])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/bookmarks/${maliciousBookmark.id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect(res => {
              expect(res.body.title).to.eql(expectedBookmark.title)
              expect(res.body.description).to.eql(expectedBookmark.description)
            })
        })
      })
  })
  describe('DELETE /api/bookmarks/:id', () => {
    context(`Given no bookmarks`, () => {
      it(`responds 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/bookmarks/123`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Bookmark doesn't exist` }
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

      it('removes the bookmark by ID from the store', () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove)
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/bookmarks`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmarks)
          )
      })
    })
  })
  describe(`POST /api/bookmarks`, () => {
   it(`creates a bookmark, responding with 201 and the new bookmark`,  function() {
    const newBookmark = {
        title: 'test-title',
        url: 'https://test.com',
        description: 'test description',
        rating: 1,
      }   
      return supertest(app)
      .post(`/api/bookmarks`)
      .send(newBookmark)
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(newBookmark.title)
        expect(res.body.url).to.eql(newBookmark.url)
        expect(res.body.description).to.eql(newBookmark.description)
        expect(res.body.rating).to.eql(newBookmark.rating)
        expect(res.body).to.have.property('id')
        expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
      })
      .then(res =>
        supertest(app)
          .get(`/api/bookmarks/${res.body.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(res.body)
      )
 })
 
 const requiredFields = ['title', 'url', 'description', 'rating']
  requiredFields.forEach(field => {
    const newBookmark = {
       title: 'Test new bookmark',
       url: 'Listicle.com',
       description: 'govna',
       rating: '5'
     }

     it(`responds with 400 and an error message when the '${field}' is missing`, () => {
       delete newBookmark[field]

       return supertest(app)
         .post('/api/bookmarks')
         .send(newBookmark)
         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
         .expect(400, {
           error: { message: `Missing '${field}' in request body` }
         })
     })
   })
})

describe(`PATCH /api/bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()
 
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })
      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must content either 'title', 'style' or 'content'`
            }
          })
       })
      it('responds with 204 and updates the bookmark', () => {
        const idToUpdate = 2
        const updateBookmark = {
          title: 'updated bookmark title',
          url: 'Interview',
          rating: 4,
        }
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        }
       return supertest(app)
         .patch(`/api/bookmarks/${idToUpdate}`)
         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(updateBookmark)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmark)
          )
      })
      it(`responds with 204 when updating only a subset of fields`, () => {
       const idToUpdate = 2
       const updateBookmark = {
         title: 'updated bookmarks title',
       }
       const expectedBookmark = {
         ...testBookmarks[idToUpdate - 1],
         ...updateBookmark
       }
 
       return supertest(app)
         .patch(`/api/bookmarks/${idToUpdate}`)
         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
         .send({
         ...updateBookmark,
           fieldToIgnore: 'should not be in GET response'
         })
         .expect(204)
         .then(res =>
           supertest(app)
             .get(`/api/bookmarks/${idToUpdate}`)
             .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
             .expect(expectedBookmark)
         )
     })
   })
    })
  })

