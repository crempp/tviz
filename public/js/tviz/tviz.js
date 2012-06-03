//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var PI = 3.1415926535897932;
var TWO_PI = PI * 2;
var PI_2 = PI / 2;
var PI_4 = PI / 4;

var renderer, scene, stats;
var sphere, uniforms, attributes;
var vc1;
var conn;

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
    
    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $viz_container = $('#viz_wrapper');
    
    // Build the scene
    scene = new THREE.Scene();
    
    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer();
    
    
    VizControls.initCamera();
    
    TimeLine.draw();
    
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
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.right = '0px';
    $viz_container.append( stats.domElement );
    
    animate(new Date().getTime());
    
}

/**
 * Timeline visualization structure
 *
*/
var TimeLine = {
    // Settings
    _map_h : 100,
    _map_w : 100 * (1357 / 758),
    _time_coord_scale : 7.500432774971116e-10,
    
    cursorTime : null,
    
    // Materials
    lineMaterial : new THREE.LineBasicMaterial({
        color: 0x000099,
        blending: THREE.AdditiveBlending,
        linewidth: 1
    }),
    cursorMapMaterial : new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture( "/assets/images/map_01.png" ),
        blending: THREE.AlphaBlending,
        transparent: true,
        color: 0x0000FF
    }),
    
    nowMapMaterial : new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture( "/assets/images/map_01.png" ),
        blending: THREE.AlphaBlending,
        transparent: true,
        color: 0x0000FF
    }),
    
    beginning_of_time : new Date(2012, 3, 1).getTime(),
    end_of_time : new Date().getTime(),
    
    /**
     * Draw the map and time axis
     *
     * 
    */
    draw : function(){
        // Container objects
        var timeAxis = new THREE.Object3D(),
            map = new THREE.Object3D();
        
        // Calculate the beginning and end coordinates
        var begin = -this.beginning_of_time * this._time_coord_scale,
            end = 0;
        
        // Calculate coordinates of the corners of the map.
        var h_2 = this._map_h/2,
            w_2 = this._map_w/2;
        var ul = {y:  h_2, z:  w_2},
            ur = {y:  h_2, z: -w_2},
            lr = {y: -h_2, z: -w_2},
            ll = {y: -h_2, z:  w_2};
        
        // Upper left
        var l1_geom = new THREE.Geometry();
        l1_geom.vertices.push(new THREE.Vector3(begin, ul.y, ul.z));
        l1_geom.vertices.push(new THREE.Vector3(end, ul.y, ul.z));
        l1 = new THREE.Line( l1_geom , this.lineMaterial );
        l1.dynamic = true;
        timeAxis.add(l1);
        // Upper right
        var l2_geom = new THREE.Geometry();
        l2_geom.vertices.push(new THREE.Vector3(begin, ur.y, ur.z));
        l2_geom.vertices.push(new THREE.Vector3(end, ur.y, ur.z));
        l2 = new THREE.Line( l2_geom , this.lineMaterial );
        l2.dynamic = true;
        timeAxis.add(l2);
        // Lower right
        var l3_geom = new THREE.Geometry();
        l3_geom.vertices.push(new THREE.Vector3(begin, lr.y, lr.z));
        l3_geom.vertices.push(new THREE.Vector3(end, lr.y, lr.z));
        l3 = new THREE.Line( l3_geom , this.lineMaterial );
        l3.dynamic = true;
        timeAxis.add(l3);
        // Lower left
        var l4_geom = new THREE.Geometry();
        l4_geom.vertices.push(new THREE.Vector3(begin, ll.y, ll.z));
        l4_geom.vertices.push(new THREE.Vector3(end, ll.y, ll.z));
        l4 = new THREE.Line( l4_geom , this.lineMaterial );
        l4.dynamic = true;
        timeAxis.add(l4);
        
        // Upper left to upper right
        var l12_geom = new THREE.Geometry();
        l12_geom.vertices.push(new THREE.Vector3(0, ul.y, ul.z));
        l12_geom.vertices.push(new THREE.Vector3(0, ur.y, ur.z));
        l12 = new THREE.Line( l12_geom , this.lineMaterial );
        l12.dynamic = true;
        map.add(l12);
        // Upper right to lower right
        var l23_geom = new THREE.Geometry();
        l23_geom.vertices.push(new THREE.Vector3(0, ur.y, ur.z));
        l23_geom.vertices.push(new THREE.Vector3(0, lr.y, lr.z));
        l23 = new THREE.Line( l23_geom , this.lineMaterial );
        l23.dynamic = true;
        map.add(l23);
        // Lower right to lower left
        var l34_geom = new THREE.Geometry();
        l34_geom.vertices.push(new THREE.Vector3(0, lr.y, lr.z));
        l34_geom.vertices.push(new THREE.Vector3(0, ll.y, ll.z));
        l34 = new THREE.Line( l34_geom , this.lineMaterial );
        l34.dynamic = true;
        map.add(l34);
        // Lower left to upper left
        var l41_geom = new THREE.Geometry();
        l41_geom.vertices.push(new THREE.Vector3(0, ll.y, ll.z));
        l41_geom.vertices.push(new THREE.Vector3(0, ul.y, ul.z));
        l41 = new THREE.Line( l41_geom , this.lineMaterial );
        l41.dynamic = true;
        map.add(l41);
        
        // Draw Map
        var map_geometry = new THREE.PlaneGeometry(this._map_w, this._map_h);
        var map_mesh = new THREE.Mesh(map_geometry, this.cursorMapMaterial);
        map_mesh.doubleSided = true;
        map_mesh.rotation.x =  PI_2;
        map_mesh.rotation.z = -PI_2;
        map.add(map_mesh);
        
        scene.add(map);
        scene.add(timeAxis);
    },
    
    /**
     * Update time axis with current time
    */
    tick : function(){
        var now = new Date.getTime();
        var nowCoord = now * this._time_coord_scale;
    }
};

var VizControls = {
    viewAngle : 45,
    aspect    : WIDTH / HEIGHT,
    near      : 0.1,
    far       : 10000,
    
    camera : null,
    
    initCamera : function(){
        this.camera = new THREE.PerspectiveCamera(
            this.viewAngle,
            this.aspect,
            this.near,
            this.far
        );
        // the camera starts at 0,0,0
        // so pull it back
        this.camera.position.z = 300;
        
        scene.add(this.camera);
    },
    init : function(){
        // Setup Controls
        controls = new THREE.TrackballControls( this.camera );
        
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        
        controls.noZoom = false;
        controls.noPan = false;
        
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        
        controls.keys = [ 65, 83, 68 ];
        
        controls.addEventListener( 'change', render );
        
        // Setup controls
        controls = new THREE.TrackballControls( this.camera, renderer.domElement );
        controls.target.set( 0, 0, 0 );
        
        window.addEventListener('DOMMouseScroll', this.onDocumentMouseWheel, false);
        window.addEventListener('mousewheel', this.onDocumentMouseWheel, false);
    },
    
    onDocumentMouseWheel : function ( event ) {
        console.log(event.wheelDeltaY);
        
        
        //var fov = VizControls.camera.fov - event.wheelDeltaY * 0.05;
        //VizControls.camera.projectionMatrix = THREE.Matrix4.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
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
    
    var zeroTime = 1333238400000, //Sun Apr 1 00:00:00 +0000 2012 GMT
        timeScale = 0.000000072, //
        timeOffset = 95993;
        
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
        //console.log(data[i].t)
        var scaledTime = ( data[i].t * timeScale ) - timeOffset;
        //console.log("   x = " + scaledTime);
        
        var sphere = new THREE.Mesh(
          new THREE.SphereGeometry(
            radius,
            segments,
            rings),
          sphereMaterial
        );
        
        //sphere.position.x = Math.floor((Math.random() * 200) + 1) - 100;
        //sphere.position.y = Math.floor((Math.random() * 200) + 1) - 100;
        //sphere.position.z = Math.floor((Math.random() * 200) + 1) - 100;
        
        //console.log(data[i].g.coordinates)
        sphere.position.x = -scaledTime;
        
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
        lonScale = 1;
    
    return [pos[0] * latScale,
            (5/4) * Math.log(Math.tan( (1/4) * PI + (2/5) * pos[1] )) * lonScale]
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
    // note: three.js includes requestAnimationFrame shim
    //requestAnimationFrame( animate );
    //render();
    
    //camera.position.x = Math.sin(t/1000)*300;
    //camera.position.y = Math.sin(t/1000)*300;//150;
    //camera.position.z = Math.cos(t/1000)*300;
    
    // you need to update lookAt every frame
    //camera.lookAt(scene.position);
    // renderer automatically clears unless autoClear = false
    
    
    renderer.render(scene, VizControls.camera);
    window.requestAnimationFrame(animate, renderer.domElement);
    controls.update();
    stats.update();
}

function render() {
    //data[0].rotation.x += 0.01;
    //data[0].rotation.y += 0.02;

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
    socket = io.connect('http://10.0.1.50');

    cb();
    
    socket.on('started', function (data) {
        _log.notice("IO socket connected");
        
        //console.log("asking for results");
        
        var query = {"data.geo" : {$ne: null}};
        
        //socket.emit('get_result', query);
    });
    
    socket.on('result', function (data) {
        //_log.debug("IO socket result recieved - " + data.length + " results");
        _log.debug("[IO] Received result <<result>>");
        
        drawData(data);
    });
    
    
    socket.on('res-time-sync', function (data) {
        _log.debug("[IO] Received result {res-time-sync}");
        console.log(data)
    });
}
