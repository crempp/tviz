
tvizui = {
    build : function (){
        console.log("building gui")
        // Accordion containers
        $("#tviz-accordion").accordion({
            fillSpace: true
        });
        
        $(window).bind('clock-update', function(event, timer_data){
            console.log("gui clock update");
            var d = new Date(timer_data.curTick);
            
            var t_string = d.getFullYear() + '-' +
                           pad(d.getMonth()) + '-' +
                           pad(d.getDay()) + ' ' +
                           pad(d.getHours()) + ':' +
                           pad(d.getMinutes());
            
            $('#timer-clock').html(t_string);
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