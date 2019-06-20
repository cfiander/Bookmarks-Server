const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const BookmarksService = require('./bookmarks-service')
const bookmarkRouter = express.Router()
const bookmarksStore = require('../store')
const bodyParser = express.json()

// const serializeBookmark = bookmark => ({
//     id: bookmark.id,
//     title: bookmark.title,
//     url: bookmark.url,
//     description: bookmark.description,
//     rating: Number(bookmark.rating),
//   })

bookmarkRouter
    .route('/bookmarks') 
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
            res.json(bookmarks)
    })
            .catch(next)
    })
    // .post(bodyParser, (req, res) => {
    //     const { title, url, description, rating } = req.body;
    //     if (!title) {
    //         logger.error('Title is required');
    //         return res 
    //           .status(400)
    //           .send('Invalid data');
    //       }
    //     if(!url) {
    //         logger.error(`Content is required`);
    //         return res
    //           .status(400)
    //           .send('Invalid data');
    //     }  
    //     const id = uuid();
  
    //     const bookmark = {
    //       id,
    //       title,
    //       url,
    //       description,
    //       rating
    //     };
        
    //     bookmarks.push(bookmark);
      
    //     logger.info(`Bookmark with id ${id} created`);
      
    //     res
    //       .status(201)
    //       .location(`http://localhost:8000/bookmarks/${id}`)
    //       .json(bookmark);
    // })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req,res,next) => {
        const db = req.app.get('db');
        const { id } = req.params;
        if (!id) {
          logger.error('No ID given');
          return res.status(400).send('Invalid data');
        }
        BookmarksService.getById(db, id)
          .then(bm=>{
            if(!bm){
              logger.error(`No bookmark found with id ${id}`);
              return res.status(404).send('Bookmark not found');
            }
            return res.status(200).json(bm);
          })
          .catch(next);
      });
    // .delete((req, res) => {
    //     const { id } = req.params;

    //     const bookmarkIndex = bookmarks.findIndex(c => c.id == id);

    //     if (bookmarkIndex === -1) {
    //         logger.error(`Bookmark with id ${id} not found.`);
    //         return res
    //           .status(404)
    //           .send('Not found');
    //     }
        
    //     bookmarks.splice(bookmarkIndex
    //         , 1);
  
    //     logger.info(`Bookmark with id ${id} deleted.`);
      
    //     res
    //       .status(204)
    //       .end();   
    // })

module.exports = bookmarkRouter