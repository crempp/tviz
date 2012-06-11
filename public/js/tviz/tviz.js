//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var PI = 3.1415926535897932;
var TWO_PI = PI * 2;
var PI_2 = PI / 2;
var PI_4 = PI / 4;

var renderer, scene, stats;
var sphere, uniforms, attributes;
var vc1;
var conn;

var clock = new THREE.Clock();

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

// 
var VIZ_DEBUG = true;

var data = []

/**
 * init
 *
*/
function init() {
    connect(initializeViz);
}

function resizeScreen(){
    // Get current values
    var windowHeight = $(window).height(),
        windowWidth  = $(window).width(),
        logHeight    = $('#logContainer').outerHeight();
        
    // Set canvas
    
    // Set controls
    
    // Set logwindow
    
}



function initializeViz() {
    _log.notice("Initializing vizualization software...");
    
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
    
    // Start the timer
    Timer.start();
    
    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $viz_container = $('#viz_wrapper');
    
    // Build the scene
    scene = new THREE.Scene();
    
    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer();
    
    TimeLine.init();
    
    VizControls.initCamera();
    
    lighting();
    
    VizControls.init();
    
    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColorHex(0x000000, 1);
    
    // draw!
    //renderer.render(scene, camera);
    
    // attach the render-supplied DOM element
    $viz_container.append(renderer.domElement);
    
    stats = new Stats();
    
    // TODO: Move this to tviz_ui
    $('#stats-container').append( stats.domElement );
    
    animate(new Date().getTime());
    
}

/**
 * Timeline visualization structure
 *
*/
var TimeLine = {
    /**
     * Time line properties
     */
    properties : {
        /** Value to used to scale the timestamp for x coordinates */
        //time_coord_scale : 7.500432774971116e-10,
        time_coord_scale : 0.000000072,
        
        timeOffset : 95993,
        
        beginning_of_time : null,
        end_of_time : null,
        
        height : 100,
        width  : 100 * (1357 / 758),
        h_2    : null,
        w_2    : null,
        ul     : {y: null, z: null},
        ur     : {y: null, z: null},
        lr     : {y: null, z: null},
        ll     : {y: null, z: null},
        begin  : null,
        end    : null,
        
        // Materials
        lineMaterial : new THREE.LineBasicMaterial({
            color: 0x000099,
            blending: THREE.AdditiveBlending,
            linewidth: 3
        }),
        cursorMapMaterial : new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(config.timeline.map_image),
            blending: THREE.AlphaBlending,
            transparent: true,
            color: 0x0000FF
        }),
        nowMapMaterial : new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(config.timeline.map_image),
            blending: THREE.AlphaBlending,
            transparent: true,
            color: 0x0000FF
        }),
        
        calc : function() {
            this.beginning_of_time = new Date(2012, 3, 1).getTime();
            this.end_of_time = Timer.getTime();
            this.h_2   = this.height/2;
            this.w_2   = this.width/2;
            this.ul    = {y:  this.h_2, z:  this.w_2};
            this.ur    = {y:  this.h_2, z: -this.w_2};
            this.lr    = {y: -this.h_2, z: -this.w_2};
            this.ll    = {y: -this.h_2, z:  this.w_2};
            this.begin = - (TimeLine.convertTimeToX(this.beginning_of_time));
            this.end   = (TimeLine.convertTimeToX(this.end_of_time));
        }
    },
    
    cursorTime : null,
    
    cursorIsCurrent : true,
    
    mapNow    : null,
    mapCursor : null,
    
    init : function(){
        // Calculate the properties
        this.properties.calc();
        
        this.cursorTime = this.properties.end_of_time;
        
        // Setup events
        $(window).bind('clock-tick', $.proxy(this._handleTick, this));
        
        this.draw();
    },
    
    
    /**
     * Draw the timeline
     *
     * 
    */
    draw : function(){
        // Container objects
        var timeAxis = new THREE.Object3D();
        
        // Upper left
        var l1_geom = new THREE.Geometry();
        l1_geom.vertices.push(new THREE.Vector3(this.properties.begin, this.properties.ul.y, this.properties.ul.z));
        l1_geom.vertices.push(new THREE.Vector3(this.properties.end, this.properties.ul.y, this.properties.ul.z));
        l1 = new THREE.Line( l1_geom , this.properties.lineMaterial );
        l1.dynamic = true;
        timeAxis.add(l1);
        // Upper right
        var l2_geom = new THREE.Geometry();
        l2_geom.vertices.push(new THREE.Vector3(this.properties.begin, this.properties.ur.y, this.properties.ur.z));
        l2_geom.vertices.push(new THREE.Vector3(this.properties.end, this.properties.ur.y, this.properties.ur.z));
        l2 = new THREE.Line( l2_geom , this.properties.lineMaterial );
        l2.dynamic = true;
        timeAxis.add(l2);
        // Lower right
        var l3_geom = new THREE.Geometry();
        l3_geom.vertices.push(new THREE.Vector3(this.properties.begin, this.properties.lr.y, this.properties.lr.z));
        l3_geom.vertices.push(new THREE.Vector3(this.properties.end, this.properties.lr.y, this.properties.lr.z));
        l3 = new THREE.Line( l3_geom , this.properties.lineMaterial );
        l3.dynamic = true;
        timeAxis.add(l3);
        // Lower left
        var l4_geom = new THREE.Geometry();
        l4_geom.vertices.push(new THREE.Vector3(this.properties.begin, this.properties.ll.y, this.properties.ll.z));
        l4_geom.vertices.push(new THREE.Vector3(this.properties.end, this.properties.ll.y, this.properties.ll.z));
        l4 = new THREE.Line( l4_geom , this.properties.lineMaterial );
        l4.dynamic = true;
        timeAxis.add(l4);
        
        this.mapNow = Object.create(this.Map, {'_properties' : {value : this.properties, enumerable: false}});
        this.mapNow.draw();
        
        this.mapCursor = Object.create(this.Map, {'_properties' : {value : this.properties, enumerable: false}});
        this.mapCursor.draw();
        
        scene.add(timeAxis);
    },
    
    updateTimeline : function() {
        this.properties.calc();
        this.mapNow._mapObj.position.x = this.properties.end
    },
    
    updateCursor : function(delta) {
        var reasonableResolution = 60000 * 60 * 24; // One day
        
        if (delta > 0) {
            // Go forward in time
            var newTime = this.cursorTime + reasonableResolution;
            
            // Is new time in the same day as end_of_time?
            var eotDate = new Date(this.properties.end_of_time),
                newTimeDate = new Date(newTime);
            var newTimeIsEOTPlusOne = (
                eotDate.getFullYear() == newTimeDate.getFullYear() &&
                eotDate.getMonth() == newTimeDate.getMonth() &&
                (parseInt(eotDate.getDate(), 10) + 1) == (parseInt(newTimeDate.getDate(), 10))
            );
            
            if (! newTimeIsEOTPlusOne) {
                // newTime is not current
                var posDelta = this.convertTimeToX(newTime) - this.convertTimeToX(this.cursorTime);
                
                // Move cursor to new time
                this.mapCursor._mapObj.position.setX(this.mapCursor._mapObj.position.x + posDelta);
                
                // Set cursor time to new time
                this.cursorTime = newTime;
                
                $(window).trigger('clock-update', [{
                    cursorTime : this.cursorTime,
                    currentTime: Timer.getTime()
                }]);
                
                this.cursorIsCurrent = false;
            } else {
                this.cursorIsCurrent = true;
            }
            
        } else if (delta < 0) {
            // Go backward in time
            var newTime = this.cursorTime - reasonableResolution;
            
            if (newTime >= this.properties.beginning_of_time) {
                var posDelta = this.convertTimeToX(this.cursorTime) - this.convertTimeToX(newTime);
                this.mapCursor._mapObj.position.setX(this.mapCursor._mapObj.position.x - posDelta);
                
                this.cursorTime = newTime;
                $(window).trigger('clock-update', [{
                    cursorTime : this.cursorTime,
                    currentTime: Timer.getTime()
                }]);
            }
            
            this.cursorIsCurrent = false;
        }
        
        
    },
    
    updateNow : function(time) {
        
    },
    
    convertTimeToX : function (time) {
        return (( time) * this.properties.time_coord_scale) - this.properties.timeOffset;
    },
    
    _handleTick : function(event, timer_data) {
        
        // Extend the timeline
        this.updateTimeline();
        
        // Fire the clock update if the cursor is located at the end-of-time
        if (this.cursorIsCurrent) {
            this.cursorTime = timer_data.curTick;
            
            $(window).trigger('clock-update', [{
                cursorTime : this.cursorTime,
                currentTime: timer_data.curTick
            }]);
        }
    },
    
    /**
     * Map representation object
     */
    Map : {
        _properties : null,
        
        _time : null,
        
        _mapObj : null,
        
        draw : function(){
            self = this;
            
            this._mapObj = new THREE.Object3D();
            
            if (self._properties === null) {
                throw "No properties reference for map object. Did you forget to set the _properties property?"
                // Throw exception
            }
            
            // Upper left to upper right border
            var l12_geom = new THREE.Geometry();
            l12_geom.vertices.push(new THREE.Vector3(0, self._properties.ul.y, self._properties.ul.z));
            l12_geom.vertices.push(new THREE.Vector3(0, self._properties.ur.y, self._properties.ur.z));
            l12 = new THREE.Line( l12_geom , self._properties.lineMaterial );
            l12.dynamic = true;
            this._mapObj.add(l12);
            // Upper right to lower right border
            var l23_geom = new THREE.Geometry();
            l23_geom.vertices.push(new THREE.Vector3(0, self._properties.ur.y, self._properties.ur.z));
            l23_geom.vertices.push(new THREE.Vector3(0, self._properties.lr.y, self._properties.lr.z));
            l23 = new THREE.Line( l23_geom , self._properties.lineMaterial );
            l23.dynamic = true;
            this._mapObj.add(l23);
            // Lower right to lower left border
            var l34_geom = new THREE.Geometry();
            l34_geom.vertices.push(new THREE.Vector3(0, self._properties.lr.y, self._properties.lr.z));
            l34_geom.vertices.push(new THREE.Vector3(0, self._properties.ll.y, self._properties.ll.z));
            l34 = new THREE.Line( l34_geom , self._properties.lineMaterial );
            l34.dynamic = true;
            this._mapObj.add(l34);
            // Lower left to upper left border
            var l41_geom = new THREE.Geometry();
            l41_geom.vertices.push(new THREE.Vector3(0, self._properties.ll.y, self._properties.ll.z));
            l41_geom.vertices.push(new THREE.Vector3(0, self._properties.ul.y, self._properties.ul.z));
            l41 = new THREE.Line( l41_geom , self._properties.lineMaterial );
            l41.dynamic = true;
            this._mapObj.add(l41);
            
            // Draw Map
            var map_geometry = new THREE.PlaneGeometry(self._properties.width, self._properties.height);
            var map_mesh = new THREE.Mesh(map_geometry, self._properties.cursorMapMaterial);
            
            map_mesh.doubleSided = true;
            map_mesh.rotation.x =  PI_2;
            map_mesh.rotation.z = -PI_2;
            
            this._mapObj.add(map_mesh);
            
            this._mapObj.position.setX(self._properties.end);
            
            scene.add(this._mapObj);
        }
    },
    
    /**
     * Update time axis with current time
     */
    tick : function(){
        var now = new Date.getTime();
        var nowCoord = now * this.properties.time_coord_scale;
    }
};

var VizControls = {
    viewAngle : 45,
    aspect    : WIDTH / HEIGHT,
    near      : 0.1,
    far       : 10000,
    
    camera   : null,
    controls : null,
    
    initCamera : function(){
        this.camera = new THREE.PerspectiveCamera(
            this.viewAngle,
            this.aspect,
            this.near,
            this.far
        );
        
        // Set the camera's initial position.
        // The camera should follow the cursor but we cant trust that the
        // cursor has been initialized yet so we will put the camera near the
        // end-of-time position.
        this.camera.position.x = TimeLine.properties.end + 300;
        this.camera.position.y = 0;
        this.camera.position.z = 0;
        
        this.camera.lookAt(TimeLine.mapCursor._mapObj.position);
        
        scene.add(this.camera);
    },
    
    init : function(){
        // Setup controls
        this.controls = new THREE.TrackballControls( this.camera, renderer.domElement );
        
        this.controls.target.set(TimeLine.properties.end,
                                 TimeLine.mapCursor._mapObj.position.y,
                                 TimeLine.mapCursor._mapObj.position.z);
        
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed   = 1.2;
        this.controls.panSpeed    = 0.8;
        this.controls.noZoom      = false;
        this.controls.noPan       = false;
        this.controls.dynamicDampingFactor = 0.1;
        this.controls.keys        = [ 65, 83, 68 ];
        
        window.addEventListener('DOMMouseScroll', this.onDocumentMouseWheel, false);
        window.addEventListener('mousewheel', this.onDocumentMouseWheel, false);
    },
    
    onDocumentMouseWheel : function ( event ) {
        TimeLine.updateCursor(event.wheelDeltaY);
    }
};

function drawDebug()
{
    
}

function drawData(data)
{
    _log.debug("Drawing data");
    //console.log(data)
    // create the sphere's material
    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xCC0000
    });
    
    // set up the sphere vars
    var radius   = 2,
        segments = 8,
        rings    = 8;
    
    // Group data by timestamp
    //var groups = {};
    //for (var i = 0; i < data.length; i++){
    //    if ( ! (data[i].t in groups) ){
    //        groups[data[i].t] = [];
    //    }
    //    groups[data[i].t].push(data[i]);
    //}
    
    //for (var ts in groups){
    //    //console.log(ts + " - " + groups[ts].length + " items");
    //    for (var i = 0; i < groups[ts].length; i++){
    //        //console.log("    " + groups[ts][i].i);
    //    }
    //}
    
    //console.log(data.length + " tweets")
    for (var i = 0; i < data.length; i++){
        var scaledTime = TimeLine.convertTimeToX(data[i].t);
        
        var sphere = new THREE.Mesh(
          new THREE.SphereGeometry(
            radius,
            segments,
            rings),
          sphereMaterial
        );
        
        sphere.position.x = TimeLine.convertTimeToX(data[i].t);
        
        newPos = MillerCylindricalToXY(data[i].g.coordinates)
        
        sphere.position.y = newPos[0];
        sphere.position.z = newPos[1];
        
        //data.push(sphere);
        // add the sphere to the scene
        scene.add(sphere);
        
    }
    
}

function MillerCylindricalToXY(pos){
    var latScale = 1,
        lonScale = 20;
    
    return [pos[0] * latScale,
            (5/4) * Math.log(Math.tan( (1/4) * PI + (2/5) * pos[1] )) * lonScale];
}

function lighting()
{
    // create a point light
    var pointLight1 = new THREE.PointLight(0xFFFFFF);
    // set its position
    pointLight1.position.x = 10;
    pointLight1.position.y = 50;
    pointLight1.position.z = 130;
    
    // add to the scene
    scene.add(pointLight1);
    
    // create a point light
    var pointLight2 = new THREE.PointLight(0xFFFFFF);
    // set its position
    pointLight2.position.x = -10;
    pointLight2.position.y = -50;
    pointLight2.position.z = -50;
    
    // add to the scene
    scene.add(pointLight2);
}

function animate(t) {
    
    // Update the trackball control target so the rotation, zooming and
    // panning make sense
    VizControls.controls.target.setX(TimeLine.mapCursor._mapObj.position.x)
    
    // Update the camera view direction to continue looking at the cursor
    VizControls.camera.lookAt(TimeLine.mapCursor._mapObj.position);
    
    renderer.render(scene, VizControls.camera);
    
    window.requestAnimationFrame(animate, renderer.domElement);
    
    VizControls.controls.update(clock.getDelta());
    
    stats.update(clock.getDelta());
}

function render() {
    renderer.render( scene, camera );
}

function error(msg)
{
    $('#viz_error .message').html(msg)
    $('#viz_error').show();
    
    $('#viz_wrapper').click(function () {
        $(this).hide();
        
    });
}

// Global the socket for testing
var socket = 0;

var serverTimeDelta = 0;
function connect(cb){
    _log.notice("Connecting to IO socket...");

    // Global the socket for testing
    //var socket = io.connect('http://localhost');
    socket = io.connect(config.io_url,{
        // Options
    });

    cb();
    
    socket.on('started', function (data) {
        _log.notice("IO socket connected");
        
        //console.log("asking for results");
        
        var query = {"data.geo" : {$ne: null}};
        
        socket.emit('get-result', query);
    });
    
    socket.on('result', function (data) {
        //_log.debug("IO socket result recieved - " + data.length + " results");
        _log.debug("[IO] Received result <<result>>");
        
        drawData(data);
    });
    
    
    //socket.on('res-time-sync', function (data) {
    //    _log.debug("[IO] Received result {res-time-sync}");
    //    console.log(data)
    //});
}

/**
 * The timer
 *
 * There is an intention to make the timer resolution configurable and sync to
 * the server periodically. This proved to be difficult so currently the timer
 * only does one sync at startup and only has a resolution of one minute.
*/
var Timer = {
    // Remeber if we've been started
    _started : false,
    
    // Timer resolution (milliseconds)
    _resolution : 60000, // 1 mintute
    
    // Inverval between server syncronizations (milliseconds)
    //_syncinterval : 180000, // 3 minutes
    _syncinterval : 0, // 30 seconds
    
    // Last time a server sync occurred
    _lastsync : null,
    
    // The time from the most recent clock tick
    _curTick : null,
    
    // Timeout reference
    _to : null,
    
    // Is there an outstanding request?
    _waitingOnReq : false,
    
    /**
     * Start the timer
    */
    start : function() {
        if ( ! this._started ) {
            // Setup communication handlers
            socket.on('res-time-sync', this._sync.bind(this));
            
            // Start the timer
            this._tick(this);
            
            this._started = true;
            
            // Since we're just starting out force a GUI update
            $(window).trigger('clock-update', [{
                cursorTime : this._curTick,
                currentTime: this._curTick
            }]);
        }
    },
    
    getTime : function () {
        return this._curTick;
    },
    
    getResolution : function () {
        return this._resolution;
    },
    
    /**
     * Tick the timer clock
    */
    _tick : function(self) {
        // Update time
        self._curTick = self._nowModResolution();
        
        // Initiate a server sync if it's time
        if (self._lastsync === null ||
            self._curTick - self._lastsync > self._syncinterval) {
            
            // Update sync time
            self._lastsync = self._curTick;
            
            if ( ! self._waitingOnReq ) {
                socket.emit('req-time-sync', {ts: Date.now()});
            
                // Remeber that we have an outstanding request so we don't send a
                // request flood
                self._waitingOnReq = true;
            }
        }
        
        // Fire tick event
        $(window).trigger('clock-tick', [{curTick : self._curTick}]);
        
        self._to = window.setTimeout(self._tick, self._timeToNextInterval(), self);
    },
    
    _nowModResolution : function() {
        var now = new Date();
        
        var nowModRes = (new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes()
        )).getTime();
        
        return nowModRes;
    },
    
    /**
     * Handle a server syncronization response
    */
    _sync : function(data) {
        self._waitingOnReq = false;
        
        this._curTick = (data.ts + data.tco);
    },
    
    _timeToNextInterval : function(){
        return (60 - (new Date()).getSeconds()) * 1000;
    }
}