/*******************************************************************************
 * tviz server
 *
 * 
 *
 *
*******************************************************************************/
// This is a quick hack to fix the backward-incompatible change in node 0.7
// which moves the exists method from path to fs.
var fs = require('fs')
if (typeof fs.exists == 'function') {
    // node 0.7.x
} else {
    // node < 0.6.x
    var path = require('path');
    fs.exists = path.exists; 
}


var app     = require('http').createServer(handler),
    io      = require('socket.io').listen(app),
    url     = require("url"),
    path    = require("path"),
    mime    = require('mime'),
    mongo   = require('mongodb'),
    config  = require('./config'),
    tlog    = require('./lib/tlog').tlog;



app.listen(config.server.port);

function handler (request, response) {
    tlog.debug("http connection");

    var uri = url.parse(request.url).pathname,
        filename = path.join(config.app_root, config.server.web_directory, uri);
  
  tlog.debug("Requested - " + filename);
  
  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      tlog.debug("file: " + filename + " type : " + mime.lookup(file));

      response.writeHead(200, {
          'Content-Type': mime.lookup(filename)
      });
      response.write(file, "binary");
      response.end();
    });
  });
}


// Create MongoDB instances and connect to the Mongo server
var Server      = mongo.Server,
    Db          = mongo.Db,
    mongoServer = new Server(
        config.mongodb.database_server,
        config.mongodb.database_port,
        config.mongodb.database_options
    );

var db = new Db(config.mongodb.database_name, mongoServer);

db.open(function(err, db) {
        if(!err) {
            //self.emit('db_connected');
            tlog.debug('Connected to database');
        } else {
            //self.emit('db_connect_error', err);
            console.log('db_connect_error');
        }
    });


io.sockets.on('connection', function (socket) {
    tlog.debug("socket connection");
    socket.emit('started', { data: "TEST" });
    
	var ErrorMap = {
		'no-error'     : 0,
		'no-data'      : 1,
		'no-timestamp' : 2
	}	
	
    socket.on('get-result', function (data) {
		tlog.debug("Received request <<get_result>>");
		//console.log("");
		//console.log(data);
		
		var _query = {"processed":false};
		
		for (var d in data)
			_query[d] = data[d];
		
		console.log(_query);
		
		db.collection(config.mongodb.collections.raw, function(err, collection) {
			var t = collection.find(_query).toArray(function(err, items) {
				console.log("pruning results");
				var prunedItems = [];
				for (var i = 0; i < items.length; i++){
					d = new Date(items[i].data.created_at);
					prunedItems.push({
						i: items[i].data.id,
						t: d.getTime(),
						g: items[i].data.geo
					});
				}
				console.log("sending results");
				socket.emit('result', prunedItems);
			});
		});
      
    });
	
	/**
	 * req-time-sync
	 *
	 * Handle time syncronization requests
	 *
	 * data parameter
	 *   ts : Timestamp when the message was sent (used for latency calulation).
	 *        This should be the normal microsecond timestamp.
	 * 
	 * return object
	 *   ts   : Server time in microseconds,
	 *	 tco  : Estimated one way latency
     #   tzo  : Server timezone offset, in minutes
	*/
	socket.on('req-time-sync', function(data){
		tlog.debug("Received request <<req-time-sync>>");
		
		// Validate data
		if (typeof data == 'undefined') {
			socket.emit('error', ErrorMap['no-data']);
			return;
		}
		if (typeof data.ts == 'undefined') {
			socket.emit('error', ErrorMap['no-timestamp']);
			return;
		}
		
		var serverDate = new Date();
		var serverTime = Date.now();
		
		// Estimate the client-server latency by taking the difference between
		// the time the request was received and sent by the client
		var estLatency = serverTime - data.ts;
		
		socket.emit('res-time-sync', {
			ts   : serverTime,
			tco  : estLatency,
			tzo  : serverDate.getTimezoneOffset()
		});
	});
});
