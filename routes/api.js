/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function(app, routesReady) {
    MongoClient.connect(MONGODB_CONNECTION_STRING, {
        useNewUrlParser: true
    }, function(err, client) {
        if (err) {
            console.log(err);
        } else {
            var books = client.db('cloud').collection('books');
            app.route('/api/books')
                .get(function(req, res) {
                    books.find({})
                        .project({
                            comments: 0
                        })
                        .toArray(function(err, doc) {
                            err ? res.json('error') : res.json(doc);
                        });
                    //response will be array of book objects
                    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
                })

                .post(function(req, res) {
                    var title = req.body.title;
                    if (typeof title == 'string' && title) {
                        books.insertOne({
                            title: req.body.title,
                            commentcount: 0,
                            comments: []
                        }, function(err, doc) {
                            if (err) {
                                res.json('error');
                            } else {
                                var result = { ...doc.ops[0] };
                                delete result.commentcount;
                                res.json(result);
                            }
                        });
                    } else {
                        res.status(200).type('text').send('missing title');
                    }
                    //response will contain new book object including atleast _id and title
                })

                .delete(function(req, res) {
                    books.deleteMany({}, function(err, doc) {
                        err ? res.json('error') : res.status(200).type('text').send('complete delete successful');
                    });
                    //if successful response will be 'complete delete successful'
                });



            app.route('/api/books/:id')
                .get(function(req, res) {
                    var bookid = req.params.id;
                    if (bookid.length >= 12) {
                        books.find({
                                _id: ObjectId(bookid)
                            })
                            .project({
                                commentcount: 0
                            })
                            .toArray(function(err, doc) {
                                if (err) {
                                    res.json('error');
                                } else if (!doc.length) {
                                    res.status(200).type('text').send('no book exists');
                                } else {
                                    res.json(doc[0]);
                                }
                            });
                    } else {
                        res.status(200).type('text').send('no book exists');
                    }
                    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
                })

                .post(function(req, res) {
                    var bookid = req.params.id;
                    var comment = req.body.comment;
                    if (bookid.length >= 12) {
                        books.findOneAndUpdate({
                                _id: ObjectId(bookid)
                            }, {
                                $push: {
                                    comments: {
                                        $each: [comment],
                                        $position: 0
                                    }
                                },
                                $inc: {
                                    commentcount: 1
                                }
                            }, {
                                returnOriginal: false,
                                projection: {
                                    commentcount: 0
                                }
                            },
                            function(err, doc) {
                                if (err) {
                                    res.json('error');
                                } else if (doc.value === null) {
                                    res.status(200).type('text').send('no book exists');
                                } else {
                                    res.json(doc.value);
                                }
                            });
                    } else {
                        res.status(200).type('text').send('no book exists');
                    }
                    //json res format same as .get
                })

                .delete(function(req, res) {
                    var bookid = req.params.id;
                    if (bookid.length >= 12) {
                        books.deleteOne({
                            _id: ObjectId(bookid)
                        }, function(err, doc) {
                            err ? res.json('error') : res.status(200).type('text').send('delete successful');
                        });
                    } else {
                        res.status(200).type('text').send('no book exists');
                    }
                    //if successful response will be 'delete successful'
                });
        }
        routesReady();
    });

};

