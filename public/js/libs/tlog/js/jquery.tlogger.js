/**
 * jQuery Logging Plugin
 *
 * @version			0.1
 * @since			01/04/2010
 * @author			Chad Rempp
 *
 * logging levels
 *
 * 0 = silent
 * 1 = error
 * 2 = warn
 * 3 = notice
 * 4 = debug
 * 
 * Usage example:
 * -----------------------------------------------------------------------------
 * 
*/

(function($){
    $.tlogger = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        base._state = {
            numLines : 0,
            expanse : 0, // 0 = min, 1 = partial, 2 = full
        }
        
        // Add a reverse reference to the DOM object
        base.$el.data("tlogger", base);
        
        base.init = function(){
            base.options = $.extend({},$.tlogger.defaultOptions, options);
             
            var $this = $(this);
             
            // Build the logging window
            var $logDiv = $('#'+base.options.logdiv);
            $logDiv.addClass('tlog_log');
            
            if (! (typeof base.options.title == 'boolean' && base.options.title === false)){
                $logDiv.append($("<div class=\"tlog_header\">"+base.options.title+"<div id='tlog_expand' class='tlog_header_button'>e</div><div id='tlog_shrink' class='tlog_header_button'>s</div></div>"));
                
                // Setup header buttons
                $("#tlog_shrink").click(base.shrink);
                $("#tlog_expand").click(base.expand);
                //$("#tlog_shrink").addClass('tlog_header_button_disabled');
            }
            
            $logDiv.append($("<div class=\"tlog_scrolledcontent\"></div></div>"));
            
            if (base.options.height !== null){
               $logDiv.height(base.options.height);
            } else {
               base.options.height = $logDiv.height();
            }
            // Set the size of the scroller
            base.scrollHeight = base.options.height - $('#'+base.options.logdiv+' .tlog_header').height();
            $('#'+base.options.logdiv+' .tlog_scrolledcontent').height(base.scrollHeight);
            
            _setExpanse(base._state.expanse);
        };
        
        base.shrink = function(){
            _setExpanse(base._state.expanse - 1);
        }
        
        base.expand = function(){
            _setExpanse(base._state.expanse + 1);
        }
        
        base.log = function(msg, level, style){
            if (typeof level == 'undefined') level = 4;
            if (typeof style == 'undefined') style = 'tlog_log_notice';
            
            if (level <= base.options.level){
                if (base.options.timestamp) {
                    var d = new Date();
                    var timestamp = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds();
                    var logTime = $("<span class=\"tlog_logtimestamp\">"+timestamp+"</span>");
                } else {
                    var logTime = $("");
                }
                
                var logMessage
                if (typeof msg == 'string'){
                    logMessage = $("<span class='tlog_logmessage'>"+msg+"</span>").addClass(style);
                } else {
                    console.log(msg)
                    logMessage = $("<pre class='tlog_logmessage'>"+JSON.stringify(msg, null, 2)+"</pre>").addClass(style);
                }
                
                // create log line
                var logLine = $("<div class=\"line\"></div>")
                                  .append(logTime)
                                  .append(logMessage);
                
                // Append logged message to log window
                var scrollDiv = jQuery('#'+base.options.logdiv+' .tlog_scrolledcontent')
                
                scrollDiv.append(logLine);
                
                base.gotoBottom();
               
            }
        }
        
        base.gotoBottom = function(){
            var scrollDiv = jQuery('#'+base.options.logdiv+' .tlog_scrolledcontent')
            
            // Remove lines from the beginning if the console is too full
            var lines = jQuery(('#'+base.options.logdiv+' .tlog_scrolledcontent .line'));
            var numLines = lines.size();
            if (numLines > base.options.maxlines){
                scrollDiv.html(lines.slice(numLines - base.options.maxlines + 1, base.options.maxlines));
            }
            
            // Are we scrolled to the bottom of the log console?
            var atBottom = false;
            if (scrollDiv[0].scrollHeight - scrollDiv.scrollTop() == scrollDiv.outerHeight()){
                atBottom = true;
            }
            
            // Only scroll down if we're already at the bottom.
            // Otherwise it's impossible to read messages further up.
            if (!atBottom){
                scrollDiv.scrollTop(scrollDiv[0].scrollHeight);
                //scrollDiv.animate({scrollTop: scrollDiv[0].scrollHeight});
            }
        }
        
        var _setExpanse = function(expanse){
            // Clamp the expanse to [0, 2]
            base._state.expanse = Math.min(Math.max(0, expanse), 2);
            
            var animTime   = 500,
                h          = null,
                headHeight = $('#' + base.options.logdiv + ' .tlog_header').outerHeight();
            
            switch (base._state.expanse) {
                case 0: // Minimized
                    height = headHeight - 10;
                    // update buttons
                    //$("#tlog_expand").click(base.expand);
                    $("#tlog_expand").removeClass('tlog_header_button_disabled');
                    $("#tlog_shrink").addClass('tlog_header_button_disabled');
                    break;
                case 1: // Partial
                    height = base.options.height;
                    // update buttons
                    //$("#tlog_expand").click(base.expand);
                    $("#tlog_expand").removeClass('tlog_header_button_disabled');
                    $("#tlog_shrink").addClass('tlog_header_button_disabled');
                    //$("#tlog_shrink").click(base.shrink);
                    $("#tlog_shrink").removeClass('tlog_header_button_disabled');
                    $("#tlog_expand").addClass('tlog_header_button_disabled');
                    break;
                case 2: // Maximized
                    height = $(window).height() - 12;
                    // update buttons
                    //$("#tlog_shrink").click(base.shrink);
                    $("#tlog_shrink").removeClass('tlog_header_button_disabled');
                    $("#tlog_expand").addClass('tlog_header_button_disabled');
                    break;
                default:
                    // error
            }
            
            base.$el.animate({height: height+'px'}, animTime);
            $('#'+base.options.logdiv+' .tlog_scrolledcontent').animate({height: base.scrollHeight}, animTime, base.gotoBottom);
        }
        
        // Run initializer
        base.init();
    };
    
    $.tlogger.defaultOptions = {
        logdiv:   'logger',
        height :   null, //120,
        maxlines:  500,
        title:    'log',
        timestamp: true,
        level:     1
    };
     
    $.fn.tlogger = function(options){
        // This would be the correct way
        //return this.each(function(){
        //    (new $.tlogger(this, options));
        //});
        var logger = new $.tlogger(this, options)
        
        // This is the way that I found to allow for easy method calls
        return {
            log : function(message){
                    logger.log(message);
                },
            error : function(message){
                    logger.log(message,1,'tlog_log_error');
                },
            warn : function(message){
                    logger.log(message,2,'tlog_log_warn');
                },
            notice : function(message){
                    logger.log(message,3,'tlog_log_notice');
                },
            debug : function(message){
                    logger.log(message,4,'tlog_log_debug');
                }
        };
    };
    
})(jQuery);