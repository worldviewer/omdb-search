var express = require('express');
var request = require('request');

var app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req,res) {
	res.render('index', {title: "My title"});
});

// There are, technically speaking, two slightly different
// ways to create the routes.  One consideration is that we
// don't want a /movie/new route to collide with a search on
// a movie with title 'new' in the name.

// When there's a variable number of parameters, it's not
// ideal to solve that with routes; query parameters is
// better for that situation.

// Path: http://localhost:3000/movie?imdbID=<someID>
// BETTER SOLUTION ...
app.get('/movie', function(req, res) {
//	var imdbID = req.query.imdbID;
//	request(Put API request here for imdbID, function() {
	var imdbID = req.query.imdbID;
	console.log(imdbID);

	var url = 'http://www.omdbapi.com?i='+imdbID;

	if (imdbID) {
		console.log('\n/movie route:');
		request(url, function(err, resp, body) {
			console.log('\nin request');
			if(!err && resp.statusCode === 200) {
				var jsonData = JSON.parse(body);
				console.log('\nin if');
				console.log(jsonData);
				res.render('movie', {movie: jsonData.Search});
			}
		});
	} else {
		console.log("Did not receive imdbID!");
		res.render('movie', {movie: {Title: "No Title!",
									 Plot: "No Plot!"}});
	}
});

// Path: http://localhost:3000/movie/<someimdbID>
// app.get('movie/:imdbID', function(req, res) {
// 	var imdbID = req.params.imdbID;
// 	request(API request using imdbID, function(req, res) {
//
// 	});
// });

// Use a GET here instead of POST since we are getting
// information.  GET is RESTful.  This is also useful because
// we can subsequently bookmark the page ...
app.get('/search', function(req, res) {
	var movieSearch = req.query.q;
	var urlEndpoint = 'http://www.omdbapi.com?s='+movieSearch;

	if (movieSearch) {
		request(urlEndpoint, function(err, resp, body) {
			if(!err && resp.statusCode === 200) {
				var jsonData = JSON.parse(body);
				console.log('\n');
				console.log(jsonData);
				if (jsonData.Search) {
					res.render('search', {movies: jsonData.Search, noMovies: false});
				} else {
					res.render('search', {movies: [], noMovies: true});
				}
			}
		});
	} else {
		res.render('search', {movies: []});
	}
});

app.get('', function(req, res) {

});

app.post('')

app.listen(3000, function() {
	console.log('Listening on port 3000');
});
