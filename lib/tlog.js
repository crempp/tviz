/*******************************************************************************
 * tviz logger
 *
 * Custom Winston logger
 *
 *
*******************************************************************************/

var winston  = require('winston');

var winstonConfig = {
    level: 'debug',
    levels : {
      debug:   0,
      info:    1,
      notice:  2,
      warning: 3,
      error:   4,
      crit:    5,
      alert:   6,
      emerg:   7
    },
    colors : {
      debug:   'blue',
      info:    'green',
      notice:  'yellow',
      warning: 'red',
      error:   'red',
      crit:    'red',
      alert:   'yellow',
      emerg:   'red'
    },
    file : {
        enabled: false,
        path: '/tmp/daneel.log'
    }
  };

// Setup logging for pretty printing
//winston.cli();

// Create logging instance
var tlog = new (winston.Logger)({
    //levels: winstonConfig.levels,
});

tlog.setLevels(winstonConfig.levels);

// Add console transport
tlog.add(winston.transports.Console, {colorize: true, timestamp: true, level: winstonConfig.level});
// Add file transport
if (winstonConfig.file.enabled){
    logger.add(winston.transports.File, { filename: winstonConfig.file.path });
}

winston.addColors(winstonConfig.colors);


exports.tlog = tlog;