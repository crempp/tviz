
tvizui = {
    build : function (){
        // Accordion containers
        $("#tviz-accordion").accordion({
            fillSpace: true
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

