'use strict'

// Dependencies

const express = require('express');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.get('/', home);
app.post('/searches', search);

function home(request, response) {
  response.render('pages/index');
}

function search(request, response) {
  const searchStr = request.body.search[0];
  const searchType = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if(searchType === 'title') {
    url += `+intitle:${searchStr}`;
  } else if (searchType === 'author') {
    url += `+inauthor:${searchStr}`;
  }

  return superagent.get(url)
    .then( result => {
      let books = result.body.items.map(book => new Book(book));
      response.render('pages/searches/show', {books});
    })
    .catch( err => {
      console.log('superagent error')
      return handleError(err, response);
    })
}

function Book(book) {
  console.log(book);
  this.title = book.volumeInfo.title || 'Title Missing';
  this.placeholderImage = book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.author = book.volumeInfo.authors || 'Author Unknown';
  this.description = book.volumeInfo.description || 'Description Missing';
}

function handleError (err, response) {
  console.error(err);
  response.render('pages/error', err);
}

app.listen( PORT, () => console.log(`APP is up on PORT:${PORT}`));
