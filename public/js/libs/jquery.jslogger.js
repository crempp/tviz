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
 * To use the talogger in the eebrowser open the browser console and run
 *   frames.MaskF.contents.log.enableLog()
*/

(function($){
   $.talogger = function(el, options){
      // To avoid scope issues, use 'base' instead of 'this'
      // to reference this class from internal events and functions.
      var base = this;
      
      // Access to jQuery and DOM versions of element
      base.$el = $(el);
      base.el = el;
      
      // Add a reverse reference to the DOM object
      base.$el.data("talogger", base);
      
      base.init = function(){
         base.options = $.extend({},$.talogger.defaultOptions, options);
          
         var $this = $(this);
          
         // Build the logging window
         $('#'+base.options.logdiv).addClass('ta_log')
                                   .append($("<div class=\"ta_header\">"+base.options.title+"</div><div class=\"ta_scrolledcontent\"></div></div>"))
                                   .height(base.options.height);
                                   
         // Set the size of the scroller
         var scrollHeight = base.options.height - $('#'+base.options.logdiv+' .ta_header').height();
         $('#'+base.options.logdiv+' .ta_scrolledcontent').height(scrollHeight);
      };
      
      base.log = function(msg, level, style){
         if (typeof level == 'undefined') level = 4;
         if (typeof style == 'undefined') style = 'ta_log_notice';
         
         if (level <= base.options.level){
            if (base.options.timestamp) {
               var d = new Date();
               var timestamp = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds();
               var logTime = $("<span class=\"ta_logtimestamp\">"+timestamp+"</span>");
            } else {
               var logTime = $("");
            }
            
            var logMessage = $("<span class='ta_logmessage'>"+msg+"</span>").addClass(style);
            
            // create log line
            var logLine = $("<div class=\"line\"></div>")
                              .append(logTime)
                              .append(logMessage);
            
            // Append logged message to log window
            var scrollDiv = jQuery('#'+base.options.logdiv+' .ta_scrolledcontent')
            
            scrollDiv.append(logLine);
            
            // Remove lines from the beginning if the console is too full
            var lines = jQuery(('#'+base.options.logdiv+' .ta_scrolledcontent .line'));
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
      }
      
      // Run initializer
      base.init();
   };
    
   $.talogger.defaultOptions = {
      logdiv:   'logger',
      height :   120,
      maxlines:  500,
      title:    'log',
      timestamp: true,
      level:     1
   };
    
   $.fn.talogger = function(options){
      // This would be the correct way
      //return this.each(function(){
      //    (new $.talogger(this, options));
      //});
      var logger = new $.talogger(this, options)
      
      // This is the way that I found to allow for easy method calls
      return {
         log : function(message){
               logger.log(message);
            },
         error : function(message){
               logger.log(message,1,'ta_log_error');
            },
         warn : function(message){
               logger.log(message,2,'ta_log_warn');
            },
         notice : function(message){
               logger.log(message,3,'ta_log_notice');
            },
         debug : function(message){
               logger.log(message,4,'ta_log_debug');
            }
      };
   };
    
})(jQuery);

// Map log requests to logger
log = {
   enabled : false,
   window : null,
   log : function(message){
         if (this.enabled && this.window) this.window._log.log(message);
      },
   error : function(message){
         if (this.enabled && this.window) this.window._log.log(message,1,'ta_log_error');
      },
   warn : function(message){
         if (this.enabled && this.window) this.window._log.log(message,2,'ta_log_warn');
      },
   notice : function(message){
         if (this.enabled && this.window) this.window._log.log(message,3,'ta_log_notice');
      },
   debug : function(message){
         if (this.enabled && this.window) this.window._log.log(message,4,'ta_log_debug');
      },
   enableLog : function (logUrl){
      // Why do I not have a $version here
      //var logUrl = "<?php echo $_SERVER['HTTP_HOST'].'/eebrowser/frame/'.$version.'/libjs/logwindow.html'?>";
      
      //if (typeof logUrl == 'undefined') logUrl = "libjs/talogger/logwindow.html";
      if (typeof logUrl == 'undefined'){
         
         var taurl = window.location.protocol + "//" + window.location.host  + "/" +
                     window.location.pathname.split('/').slice(1,4).join('/');
         //console.log(window.location.pathname.split('/').slice(1,4).join('/'));
         //alert(window.location.pathname);
         logUrl = taurl + "/libjs/talogger/logwindow.html";
         //alert(logUrl);
      }
      this.window = window.open(logUrl,"ta_log",'height=255,width=600,menubar=no,personableBar=no,status=no,toolbar=no,location=no');
      this.enabled = true;
   }
};