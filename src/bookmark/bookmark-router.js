const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')
const bookmarkRouter = express.Router()
const bookmarksStore = require('../store')
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})
bookmarkRouter
    .route('/bookmarks') 
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
            res.json(bookmarks.map(serializeBookmark))
    })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
      const { title, url, description, rating } = req.body
      const newBookmark = { title, url, description, rating }

      for (const [key, value] of Object.entries(newBookmark)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      }
       
      BookmarksService.insertBookmark(
         req.app.get('db'),
         newBookmark
       )
         .then(bookmark => {
           res
             .status(201)
             .location(`/bookmarks/${bookmark.id}`)
             .json(serializeBookmark(bookmark))
         })
        .catch(next)
    })

    bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .all((req, res, next) => {
      const { bookmark_id } = req.params
      BookmarksService.getById(req.app.get('db'), bookmark_id)
        .then(bookmark => {
          if (!bookmark) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res.status(404).json({
              error: { message: `Bookmark Not Found` }
            })
          }
          res.bookmark = bookmark
          next()
        })
        .catch(next)
  
    })
    .get((req, res) => {
      res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
      // TODO: update to use db
      const { bookmark_id } = req.params
      BookmarksService.deleteBookmark(
        req.app.get('db'),
        bookmark_id
      )
        .then(numRowsAffected => {
          logger.info(`Card with id ${bookmark_id} deleted.`)
          res.status(204).end()
        })
        .catch(next)
    })
module.exports = bookmarkRouter