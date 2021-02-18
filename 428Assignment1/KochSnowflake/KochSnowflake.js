"use strict";

var gl;
var positions =[];

var numIterations = 5;


class Vector2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    scale(lamda){
        return new Vector2(this.x*lamda, this.y*lamda);
    }
}
class Position2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add_vector(vec){
        return new Position2(this.x + vec.x, this.y + vec.y);
    }
    subtract_pos(pos){
        var vx = this.x - pos.x;
        var vy = this.y - pos.y;
        return new Vector2(vx, vy);
    }
}
function d(A, B){
    return Math.sqrt( (A.y - B.y)*(A.y - B.y) + (A.x - B.x)*(A.x - B.x));
}
function interpolate(A, B, m){
    m = 1 - m;
    var x = m*A.x + (1-m)*B.x;
    var y = m*A.y + (1-m)*B.y;
    return new Position2(x, y);
}
function middle(A, B, C){
    var x = (A.x + B.x + C.x)/3;
    var y = (A.y + B.y + C.y)/3;
    return new Position2(x, y);
}

function lamda(alpha, v){
    return alpha / Math.sqrt(v.x*v.x + v.y*v.y);
}


class LineSegment{ //stores 2 vertices and the perpendicular direction that is 'outwards' relative to the fractal. 
    constructor(A, B, v){
        this.A = A;
        this.B = B;
        this.outwards_direction = v;
    }
    logvals(){
        //console.log("From (",this.A.x,", ",this.A.y,"), -> (",this.B.x,", ",this.B.y,") with outvector ",this.outwards_direction.x,", ",this.outwards_direction.y,".");
    }
}
function BreakupSegment(segment){
    var A = segment.A;
    var B = segment.B;
    var v = segment.outwards_direction;

    var t1 = interpolate(A, B, 1/3);
    var m = interpolate(A, B, 1/2);
    var t2 = interpolate(A, B, 2/3);

    var L = d(A, B)/3;
    var alpha = (Math.sqrt(3)/2) * L;
    var lamda = alpha / Math.sqrt(v.x*v.x + v.y*v.y);
    //console.log("L = ", L);
    //console.log("ALPHA ", alpha);
    //console.log("LAMDA ", lamda);
    var P = m.add_vector(v.scale(lamda));

    var newmiddle = middle(t1, t2, P);
    var v1 = interpolate(t1, P, 1/2).subtract_pos(newmiddle);
    var v2 = interpolate(t2, P, 1/2).subtract_pos(newmiddle);

    var newseg1 = new LineSegment(A, t1, v);
    var newseg2 = new LineSegment(t1, P, v1);
    var newseg3 = new LineSegment(P, t2, v2);
    var newseg4 = new LineSegment(t2, B, v);

    return [newseg1, newseg2, newseg3, newseg4];
}

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    //canvas.width = 600;
    //canvas.height = 600;
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );
    

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three positions.

    var p1 = new Position2(0, Math.sqrt(3) - 1);
    var p2 = new Position2(1, -1);
    var p3 = new Position2(-1, -1);
    p1.x = p1.x/2;
    p1.y = p1.y/2;
    p2.x = p2.x/2;
    p2.y = p2.y/2;
    p3.x = p3.x/2;
    p3.y = p3.y/2;

    var mid = middle(p1, p2, p3);

    var v1 = interpolate(p1, p2, 1/2).subtract_pos(mid);
    var v2 = interpolate(p2, p3, 1/2).subtract_pos(mid);
    var v3 = interpolate(p3, p1, 1/2).subtract_pos(mid);

    var seg1 = new LineSegment(p1, p2, v1);
    var seg2 = new LineSegment(p2, p3, v2);
    var seg3 = new LineSegment(p3, p1, v3);

    console.log("VECTOR V1",v1.x, v1.y);
    var newsegarr = BreakupSegment(seg1);
    newsegarr[0].logvals();
    newsegarr[1].logvals();
    newsegarr[2].logvals();
    newsegarr[3].logvals();

    if(1 == 1){
        //return;
    }

    var segment_queue = [];
    segment_queue.push(seg1);
    segment_queue.push(seg2);
    segment_queue.push(seg3);

    for(var i=0; i<numIterations; i++){
        var new_queue = [];
        while(segment_queue.length != 0){
            var newsegarr = BreakupSegment(segment_queue.shift());
            new_queue.push(newsegarr[0]);
            new_queue.push(newsegarr[1]);
            new_queue.push(newsegarr[2]);
            new_queue.push(newsegarr[3]);
        }
        segment_queue = new_queue;
    }

    while(segment_queue.length != 0){
        var seg = segment_queue.shift();
        var first_vertex = vec2(seg.A.x, seg.A.y);
       // var second_vertex = vec2(seg.B.x, seg.B.y);
        positions.push(first_vertex);

    }



    



    // Specify a starting positions p for our iterations
    // p must lie inside any set of three vertices

   // var u = add(vertices[0], vertices[1]);
   // var v = add(vertices[0], vertices[2]);



    
    /*
    var p = mult(0.25, add( u, v ));

    // And, add our initial positions into our array of points

    positions.push(p);

    // Compute new positions
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; positions.length < numPositions; ++i ) {
        var j = Math.floor(3*Math.random());

        p = add(positions[i], vertices[j]);
        p = mult(0.5, p);
        positions.push(p);
    }
    */
    
    //positions.push(vertices[0]);
    //positions.push(vertices[1]);


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINE_LOOP, 0, positions.length);
}
