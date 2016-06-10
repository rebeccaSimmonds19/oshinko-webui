var express = require("express");
var http = require("http");
var app = express();

var oshinko_rest_location = process.env.OPENSHIFT_OSHINKO_REST || '10.16.40.63';
var oshinko_rest_port = process.env.OPENSHIFT_OSHINKO_REST_PORT || '80';

app.configure(function() {
    app.use(express.logger());
    app.set('views', __dirname + '/app');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/app'));
    app.use(app.router);
    app.engine('html', require('ejs').renderFile);
});

var fetchResponse = function(request, response, options, body) {
    var req = http.request(options, function(res) {
        var content = '';
        res.on('data', function(chunk) {
            content += chunk;
        });
        res.on('end', function() {
            console.log(content);
            response.send(content);
        });
    })
    if (body != null) {
        req.write(body);
    }
    req.on('error', function(error) {
        console.log(error);
        console.log("Request status code is: " + request.statusCode);
        response.status(400); // this might be a lie
        response.send(error);
    });
    req.end();
};

app.get('/', function(request, response) {
    response.render('index.html')
});

app.get('/api/clusters', function(request, response) {
    var options = {
        host: oshinko_rest_location,
        port: oshinko_rest_port,
        path: '/clusters',
        method: 'GET'
    };
    fetchResponse(request, response, options, null);
});

app.get('/api/clusters/:id', function(request, response) {
    var options = {
        host: oshinko_rest_location,
        port: oshinko_rest_port,
        path: '/clusters',
        method: 'GET'
    };
    console.log("Fetching for id: " + request.params.id);
    fetchResponse(request, response, options, null);
});

app.post('/api/clusters', function(request, response) {
    var options = {
        host: oshinko_rest_location,
        port: oshinko_rest_port,
        path: '/clusters',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var jsonBody = JSON.stringify(request.body);
    console.log("Request body: " + jsonBody);
    fetchResponse(request, response, options, jsonBody);
});

app.put('/api/clusters/:id', function(request, response) {
    var options = {
        host: oshinko_rest_location,
        port: oshinko_rest_port,
        path: '/clusters/' + request.params.id,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var jsonBody = JSON.stringify(request.body);
    console.log("Request body: " + jsonBody);
    fetchResponse(request, response, options, jsonBody);
});

app.delete('/api/clusters/:id', function(request, response) {
    var options = {
        host: oshinko_rest_location,
        port: oshinko_rest_port,
        path: '/clusters/' + request.params.id,
        method: 'DELETE'
    };
    console.log("Performing delete for id: " + request.params.id);
    fetchResponse(request, response, options, null);
});

app.get('/oshinko-rest-location', function(request, response) {
    response.send(oshinko_rest_location)
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);
});