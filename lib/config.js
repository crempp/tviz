/*******************************************************************************
 * tviz config
 *
 * tviz configuration
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
if (typeof fs.existsSync == 'function') {
    // node 0.7.x
} else {
    // node < 0.6.x
    var path = require('path');
    fs.existsSync = path.existsSync;
}

var _ = require('cloneextend');

// Set environment. Default to production
var TVIZ_ENV = 'production'
if (typeof process.env.TVIZ_ENV !== 'undefined') {
    TVIZ_ENV = process.env.TVIZ_ENV;
}

// This is the default configuration
var config = {
    
    app_root: '/srv/tviz',
    
    server: {
        port:           8081,
        web_directory: 'public'
    },
    
    // Twitter configuration
    twitter: {
        consumer_key:        null,
        consumer_secret:     null,
        access_token_key:    null,
        access_token_secret: null
    },
    
    // Mongo configuration
    mongodb: {
        database_server:  'localhost',
        database_port:    27017,
        database_name:    'tviz',
        database_options: {auto_reconnect: true},
        collections:      {raw: 'raw',
                           processed: 'processed'
        }
    },
    
    // Miner configuration
    miner: {
        twitter_timeout: 5000,
        breadth:         10,
        depth:           10,
    },
    
    client: {
        io_url : '/',
        
        timeline : {
            map_image : '/assets/images/map_01.png',
        }
    }
};

// Load customized environment settings
if (fs.existsSync('./config_' + TVIZ_ENV + '.js')) {
    var env_config = require('./config_' + TVIZ_ENV + '.js');
    _.extend(config, env_config);
}

module.exports = config;
