require('dotenv').config();

const express = require('express');
const xss = require('xss');
const uuid = require('uuid/v4'); //generate uuids for new bookmark ids
const logger = require('../logger');
const { bookmarks } = require('../store');

const bookmarkRouter = express.Router(); 
const bodyParser = express.json(); //to parse json in POST endpoint
const BookmarksService = require('./bookmarks-service')

const serializeBookmark = bookmark => ({ 
    id: bookmark.id,
    title: xss(bookmark.title),
    url: xss(bookmark.url),
    description: xss(bookmark.description),
    rating: xss(bookmark.rating)
})

bookmarkRouter
 .route('/bookmark')
 .get((req, res, next) => {
     const knexInstance = req.app.get('db')
     BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmark => {
          res.json(bookmark.map(serializeBookmark))
      })
      .catch(next)
  })
  
 .post(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const knexInstance = req.app.get('db');

    if(!title){
        logger.error(`Title is required`);
        return res.status(404).send(`Not valid`);
    }
    if(!url){
        logger.error(`Url is required`);
        return res.status(404).send(`Not valid`);
    }
    if(!rating){
        logger.error(`Rating is required`);
        return res.status(404).send(`Not valid`);
    }

    const newBookmark = { title, url, description, rating}

    BookmarksService.insertBookmark(knexInstance, newBookmark)
     .then(bookmark => 
        res
         .status(201)
         .location(`/bookmark/${bookmark.id}`)
         .json(serializeBookmark(newBookmark)))
     .catch(next)
  });

bookmarkRouter
 .route('/bookmark/:id')
 .get((req, res, next) => {
     const knexInstance = req.app.get('db')
     BookmarksService.getBookmarkById(knexInstance, req.params.id)
      .then(bookmark => {
          if(!bookmark){
              return res.status(404).json({
                  error: { message: `Bookmark doesn't exist`}
              })
          }
          res.json(serializeBookmark(bookmark))
        })
      .catch(next)
})
.delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id == id);
    
    if(bookmarkIndex === -1){
        logger.error(`Bookmark with ${id} not found.`);
        return res.status(404).send('Bookmark not found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with ${id} was deleted.`);
    res.status(204).end();
});

 module.exports = bookmarkRouter;