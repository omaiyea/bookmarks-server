const express = require('express');
const uuid = require('uuid/v4'); //generate uuids for new bookmark ids
const logger = require('../logger');
const { bookmarks } = require('../store');

const bookmarkRouter = express.Router(); 
const bodyParser = express.json(); //to parse json in POST endpoint

bookmarkRouter
 .route('/bookmark')
 .get((req, res) => {
     res.json(bookmarks)
  })
 .post(bodyParser, (req, res) => {
    const { title, book } = req.body;

    if(!title){
        logger.error(`Title is required`);
        return res.status(404).send(`Not valid`);
    }
    if(!book){
        logger.error(`Book is required`);
        return res.status(404).send(`Not valid`);
    }

    const id = uuid();

    const newBookmark = {
        id, 
        title,
        book
    };

    bookmarks.push(newBookmark);

    logger.info(`Bookmark with id ${id} created`);

    res
     .status(201)
     .location(`http://localhost:8000/bookmark/${id}`)
     .json({newBookmark});
  });

bookmarkRouter
.route('/bookmark/:id')
.get((req, res) => {
    res.send(bookmarks);
});

 module.exports = bookmarkRouter;