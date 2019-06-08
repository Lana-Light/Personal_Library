/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function() {
  const app = express.Router();
  return MongoClient.connect(MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
  }).then(
    client => {
      const books = client.db('cloud').collection('books');
      app
        .route('/api/books')
        .get(function(req, res) {
          books
            .find({})
            .project({
              comments: 0,
            })
            .toArray()
            .then(doc => res.json(doc), err => res.json('error'));
          //response will be array of book objects
          //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        })

        .post(function(req, res) {
          const title = req.body.title;
          if (typeof title == 'string' && title) {
            books
              .insertOne({
                title,
                commentcount: 0,
                comments: [],
              })
              .then(
                doc => {
                  const result = { ...doc.ops[0] };
                  delete result.commentcount;
                  res.json(result);
                },
                err => res.json('error')
              );
          } else {
            res
              .status(200)
              .type('text')
              .send('missing title');
          }
          //response will contain new book object including atleast _id and title
        })

        .delete(function(req, res) {
          books.deleteMany({}).then(
            doc =>
              res
                .status(200)
                .type('text')
                .send('complete delete successful'),
            err => res.json('error')
          );
          //if successful response will be 'complete delete successful'
        });

      app
        .route('/api/books/:id')
        .get(function(req, res) {
          try {
            const bookid = ObjectId(req.params.id);
            books
              .findOne(
                {
                  _id: bookid,
                },
                {
                  projection: {
                    commentcount: 0,
                  },
                }
              )
              .then(
                doc =>
                  doc
                    ? res.json(doc)
                    : res
                        .status(200)
                        .type('text')
                        .send('no book exists'),
                err => res.json('error')
              );
          } catch (e) {
            res
              .status(200)
              .type('text')
              .send('no book exists');
          }
          //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        })

        .post(function(req, res) {
          const comment = req.body.comment;
          try {
            const bookid = ObjectId(req.params.id);
            books
              .findOneAndUpdate(
                {
                  _id: bookid,
                },
                {
                  $push: {
                    comments: {
                      $each: [comment],
                      $position: 0,
                    },
                  },
                  $inc: {
                    commentcount: 1,
                  },
                },
                {
                  returnOriginal: false,
                  projection: {
                    commentcount: 0,
                  },
                }
              )
              .then(
                doc =>
                  doc.value
                    ? res.json(doc.value)
                    : res
                        .status(200)
                        .type('text')
                        .send('no book exists'),
                err => res.json('error')
              );
          } catch (e) {
            res
              .status(200)
              .type('text')
              .send('no book exists');
          }

          //json res format same as .get
        })

        .delete(function(req, res) {
          try {
            const bookid = ObjectId(req.params.id);
            books
              .deleteOne({
                _id: ObjectId(bookid),
              })
              .then(
                doc =>
                  res
                    .status(200)
                    .type('text')
                    .send('delete successful'),
                err => res.json('error')
              );
          } catch (e) {
            res
              .status(200)
              .type('text')
              .send('no book exists');
          }
          //if successful response will be 'delete successful'
        });
      return app;
    },
    err => console.log(err)
  );
};
