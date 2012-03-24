
/**
 * Module dependencies.
 */

var express = require('express'),
    _       = require('underscore'),
    redis   = require('redis'),
    client  = redis.createClient();

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'a7sdf897uhicxs89f87w3ruih' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// App functions

var alphabet = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
function generateID(callback) {
  var last_id = client.get('last_id', function(err, last_id) {
    console.log(last_id);

    if(!last_id) {
      callback('a');
    } else {
      var last_index = _.indexOf(alphabet, last_id[last_id.length - 1]);
      var next_index = last_index + 1;
      var new_index = "";

      if(next_index >= alphabet.length) {
        new_id = last_id + alphabet[0];   
      } else {
        new_id = last_id.substr(0, last_id.length - 1) + alphabet[next_index];
      }

      callback(new_id);
    }
  });
}

// Routes

app.get('/api/new', function(req, res) {
  res.render('index');
});

app.post('/api/new', function(req, res) {
  generateID(function(id) {
    client.set('last_id', id, redis.print);
    client.set('url:' + id, req.body.url);

    res.json({ success: true, url: "http://sndbx.in/" + id });
  });
});

app.get('/:id', function(req, res) {
  client.get('url:' + req.params.id, function(err, url) {
    if(url) {
      res.redirect(url);
    } else {
      res.redirect("http://thesandbox.me");
    }
  });
});

app.get('/', function(req, res) {
  res.redirect('http://thesandbox.me');
});

var port = process.env.PORT || 5000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

