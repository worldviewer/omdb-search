var express = require('express');
var request = require('request');
var app = express();
var db = require('./models');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');

app.set('view engine', 'ejs');

// This defines req.session
app.use(session({
	secret: "I'm a very secret thing",
	resave: false,
	save: {
		uninitialize: true
	}
}));

app.use('/', function(req, res, next) {
	req.login = function(user) {
		req.session.userId = user.id;
	};

	req.currentUser = function() {
		return db.User.find(req.session.userId)
				 .then(function(dbUser) {
				 	req.user = dbUser;
				 	return dbUser;
				 });
	};

	req.logout = function() {
		req.session.userId = null;
		req.user = null;
	};

	next();
});

app.use(methodOverride("_method"));

// bodyParser returns a function with req, res, next;
// All middleware has its own next built into it, but
// when we create our own middleware functions, we have
// explicitly call next();
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));

app.get('/', function(req,res) {
	res.render('index', {title: "My title"});
});

app.get('/login', function(req, res) {
	req.currentUser().then(function(user) {
		if (user) {
			res.redirect('user/profile');
		} else {
			res.render('user/login');
		}
	})
});

app.get('/signup', function(req, res) {
	res.render('user/signup');
});

app.get('/profile', function(req, res) {
	req.currentUser().then(function(dbUser) {
		if (dbUser) {
			res.render('user/profile', {ejsUser: dbUser});
		} else {
			res.redirect('/login');
		}
	});
});

app.post('/login', function(req, res) {
	var user = req.body;

	db.User.authenticate(user.email, user.password)
	.then(function(dbUser) {
		if (dbUser) {
			req.login(dbUser);
			res.redirect('/profile');
		} else {
			res.redirect('/login');
		}
	});
});

app.post('/signup', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	db.User.createSecure(email, password)
	.then(function(dbUser) {
		res.redirect('/profile');
	});
});

app.delete('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
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
		res.render('search', {movies: [], noMovies: true});
	}
});

app.listen(3000, function() {
	console.log('Listening on port 3000');
});
