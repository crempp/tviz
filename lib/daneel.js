/*******************************************************************************
 * daneel
 *
 * Twitter mining bot
 *
 * Requirements:
 *     - ntwitter [https://github.com/AvianFlu/ntwitter]
 *     - mongodb [https://github.com/christkv/node-mongodb-native]
 *     - winston [https://github.com/flatiron/winston]
 *
*******************************************************************************/

/**
 * Initialization
*/

// Imports
var config   = require('./config'),
    dlog     = require('./dlog').dlog,
    minerMod = require('./miner');
    

dlog.notice("Initializing daneel...");

// Setup Daneel state
var dstate = {
    b_count:  0,
    d_count:  0
}

// Setup Miner
var miner = new minerMod.Miner({
    onlygeotweets : true,
    onlyseed      : true  
});
miner.run();
