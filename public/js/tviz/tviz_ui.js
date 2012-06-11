
tvizui = {
    build : function (){
        // Accordion containers
        $("#tviz-accordion").accordion({
            fillSpace: true
        });
        
        $(window).bind('clock-update', function(event, timer_data){
            var d = new Date(timer_data.cursorTime);
            
            var t_string = d.getFullYear() + '-' +
                           pad(d.getMonth()) + '-' +
                           pad(d.getDate()) + ' ' +
                           pad(d.getHours()) + ':' +
                           pad(d.getMinutes());
            
            $('#timer-clock').html(t_string);
            
            if (timer_data.cursorTime != timer_data.currentTime) {
                if ( ! $('#timer-clock').hasClass('time-in-past')) {
                    $('#timer-clock').addClass('time-in-past');
                }
            } else {
                $('#timer-clock').removeClass('time-in-past');
            }
        });
        
        // Date slider
        $( "#tviz-ui-range" ).slider({
            orientation: "vertical",
            range: true,
            min: 0,
            max: 500,
            values: [ 75, 300 ],
            slide: function( event, ui ) {
                $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
            }
        });
    }
    
}

/**
 * Pad a two-digit number with a leading zero
 *
 * Time formatting helper
*/
function pad(number) {  
    var r = String(number);  
    if ( r.length === 1 ) {  
        r = '0' + r;  
    }  
    return r;  
}