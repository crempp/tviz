/*******************************************************************************
 * daneel miner
 *
 * Twitter mining module
 *
 * Requirements:
 *     - ntwitter [https://github.com/AvianFlu/ntwitter]
 *     - mongodb []
 *
 *
*******************************************************************************/

var config  = require('./config'),
    util    = require('util'),
    events  = require('events'),
    mongo   = require('mongodb'),
    twitter = require('ntwitter'),
    tlog     = require('./tlog').tlog;

/**
 * Miner
 *
 * The daneel miner object
*/
function Miner(options) {
    if(false === (this instanceof Miner)) {
        return new Miner();
    }
    
    tlog.notice("Initializing miner");
    
    var self = this;
    
    // default options
    this._options = {
        onlygeotweets : false,
        onlyseed      : false        
    }
    // Extend defaults
    for (var o in options)
        this._options[o] = options[o];
    
    // Create MongoDB instances and connect to the Mongo server
    var Server      = mongo.Server,
        Db          = mongo.Db,
        mongoServer = new Server(
            config.mongodb.database_server,
            config.mongodb.database_port,
            config.mongodb.database_options
        );
    
    // Create database instance
    this.db = new Db(config.mongodb.database_name, mongoServer);
    
    // Create Twitter instance
    this.twit = new twitter(config.twitter);
    
    events.EventEmitter.call(this);
}
util.inherits(Miner, events.EventEmitter);

/**
 * _dbConnect
 *
 * Connect to the database
*/
Miner.prototype._dbConnect = function(){
    var self = this;
    
    self.db.open(function(err, db) {
        if(!err) {
            self.emit('db_connected');
        } else {
            self.emit('db_connect_error', err);
        }
    });
}

/**
 * run
 *
 * Run the miner
 */
Miner.prototype.run = function(options) {
    var self = this;
    
    self.on('db_connected', function() {
        // Successfully connected
        tlog.info("Connected to database: ", config.mongodb.database_name)
        
        if (this._options.onlyseed) {
            tlog.debug("Just seeding");
            self.seed();
        } else {
            // Are there unprocessed data
            self.db.collection(config.mongodb.collections.raw, function(err, collection) {
                var t = collection.find({"processed":false})
                        .count(function(err, count){
                            if (count == 0)
                            {
                                tlog.debug("No processed data");
                                self.seed();
                            }
                            else
                            {
                                tlog.debug(count + " unprocessed processed data");
                                self.process();
                            }
                        });
            });
        }
    });
    
    self.on('db_connect_error', function(err){
        // Connection failed
        tlog.error("Failed to connect to " + config.mongodb.database_name + ": ", err);
        process.exit(1);
    });
    
    self.on('received_seed_data', function(data){
        var t = Object.create(Tweet);
        t.data = data;
        t.save(self.db);
        
    });
    
    self._dbConnect();
}

/**
 * seed
 *
 * Grab some data from the twitter stream to start the mining process.
 * 
 */
Miner.prototype.seed = function() {
    var self = this;

    tlog.debug("Seeding DB...");
    
    // The first option here is for a random sampling of tweets
    // The second option is for geographic regions. This option is supposed to only return
    // tweets that are geocoded but this does not seem to be true
    //self.twit.stream('statuses/sample', function(stream) {
    self.twit.stream('statuses/filter', {'locations':'0,-80,180,80,-180,-80,180,0'}, function(stream) {
        // console.log(self);
        console.log('1');
        stream.on('data', function (data) {
            console.log('2');
            if ( ! self._options.onlygeotweets ||
                 (self._options.onlygeotweets && data.geo ))
            {
                tlog.info("Tweet - " + data.id);
                self.emit('received_seed_data', data);
            } else {
                tlog.info("Skipping tweet - " + data.id);
            }
        });
        stream.on('end', function (response) {
            // Handle a disconnection
            tlog.info("Twitter API connection ended");
        });
        stream.on('destroy', function (response) {
            // Handle a 'silent' disconnection from Twitter, no end/error event fired
            tlog.info("Twitter API connection terminated");
            console.log(response);
        });
        stream.on('error', function (response) {
            // Handle a error
            //tlog.error("Twitter stream error - ", response);
            tlog.error("Twitter stream error - ");
            console.log(response);
        });
        
        // Disconnect stream after timeout
        setTimeout(stream.destroy, config.twitter_timeout);
    });
}

/**
 * process
 *
 * Process tweet data into graph data
 * 
 */
Miner.prototype.process = function() {
    var self = this;
    
    self.db.collection(config.mongodb.collections.raw, function(err, collection) {
        var t = collection.find({"processed":false}).toArray(function(err, items) {
            
            //console.log(items);
            
            // Do processing
        });
    });
    
}

var Tweet = {
    data      : null,
    mine_time : null,
    processed : false,
    
    save : function(db){
        var self = this;
        
        if (!self.data){
            tlog.error("Tweet data not set, can not save");
        }
        else{
            tlog.info("Saving tweet [" + self.data.user.id + " - " + self.data.user.screen_name + "]");
            
            this.mine_time = Date.now() / 1000;
            
            db.collection(config.mongodb.collections.raw, function(err, collection) {
                var t = collection.find({"data.id_str":self.data.id_str})
                        .count(function(err, count){
                            if (count == 0)
                            {
                                //console.log("DANEEL: inserting to", config.mongodb.collections.raw);
                                collection.insert({
                                    mine_time : self.mine_time,
                                    processed : self.processed,
                                    data      : self.data
                                });
                            }
                            else {
                                tlog.warn("tweet" + data.id_str + "exists, skipping");
                            }
                        });
            });
        }
        
        
    }
}


exports.Miner = Miner;
