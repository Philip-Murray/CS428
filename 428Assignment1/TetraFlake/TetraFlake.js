"use strict";

var canvas;
var gl;

var positions = [];
var colors = [];


var numIterations = 3;

var colormode = 3; /*
0 for standard color. 
1 for next succesive random color.
2 for unit-vector color. 
3 for sine/cosine sepearation of unit vector. */


class Vector3{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    scale(lamda){
        return new Vector3(this.x*lamda, this.y*lamda, this.z*lamda);
    }
}
class Position3{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add_vector(vec){
        return new Position3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    }
    subtract_pos(pos){
        var vx = this.x - pos.x;
        var vy = this.y - pos.y;
        var vz = this.z - pos.z;
        return new Vector3(vx, vy, vz);
    }
}
function d(A, B){
    return Math.sqrt( (A.y - B.y)*(A.y - B.y) + (A.x - B.x)*(A.x - B.x) + (A.z - B.z)*(A.z - B.z) );
}
function middle2(A, B){
    var x = (A.x + B.x)/2;
    var y = (A.y + B.y)/2;
    var z = (A.z + B.z)/2;
    return new Position3(x, y, z);
}
function middle3(A, B, C){
    var x = (A.x + B.x + C.x)/3;
    var y = (A.y + B.y + C.y)/3;
    var z = (A.z + B.z + C.z)/3;
    return new Position3(x, y, z);
}
function middle4(A, B, C, D){
    var x = (A.x + B.x + C.x + D.x)/4;
    var y = (A.y + B.y + C.y + D.y)/4;
    var z = (A.z + B.z + C.z + D.z)/4;
    return new Position3(x, y, z);
}

class TetraFace{ //stores 3 vertices and the perpendicular direction that is 'outwards' relative to the fractal. 
    constructor(A, B, C, v, color){
        this.A = A;
        this.B = B;
        this.C = C;
        this.outwards_direction = v;
        this.color = color;
    }
    logvals(){
        //console.log("(",this.A.x,", ",this.A.y,", ",this.A.z,"), -> (",this.B.x,", ",this.B.y,", ",this.B.z,") -> (",this.C.x,", ",this.C.y,", ",this.C.z,") with outvector ",this.outwards_direction.x,", ",this.outwards_direction.y,".");
    }
}
function BreakupSegment(segment){
    var A = segment.A;
    var B = segment.B;
    var C = segment.C;
    var v = segment.outwards_direction;
    var color = segment.color;

    var m = middle3(A, B, C);
    var t1 = middle2(A, B);
    var t2 = middle2(B, C);
    var t3 = middle2(C, A);

    var cf1 = new TetraFace(t3, A, t1, v, color);
    var cf2 = new TetraFace(t1, B, t2, v, color);
    var cf3 = new TetraFace(t2, C, t3, v, color);

    var alpha = d(A, B) / Math.sqrt(6);
    var lamda = alpha / Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);

    //console.log("L = ", L);
    //console.log("ALPHA ", alpha);
    //console.log("LAMDA ", lamda);
    var P = m.add_vector(v.scale(lamda));

    var newmiddle = middle4(t1, t2, t3, P);

    var v1 = middle3(t1, P, t2).subtract_pos(newmiddle);
    var v2 = middle3(t2, P, t3).subtract_pos(newmiddle);
    var v3 = middle3(t3, P, t1).subtract_pos(newmiddle);

    var nf1;
    var nf2;
    var nf3;

    if(colormode == 1){
        var rand = Math.random() * 10;
        rand = Math.round(rand);
        nf1 = new TetraFace(t1, P, t2, v1, rand + 1);
        nf2 = new TetraFace(t2, P, t3, v2, rand + 2);
        nf3 = new TetraFace(t3, P, t1, v3, rand + 3); 
    } else {
        nf1 = new TetraFace(t1, P, t2, v1, color + 1);
        nf2 = new TetraFace(t2, P, t3, v2, color + 2);
        nf3 = new TetraFace(t3, P, t1, v3, color + 3);
    }

    

    return [nf1, nf2, nf3, cf1, cf2, cf3];
}




window.onload = function init()
{

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    var delta = 0;
    var p1 = new Position3(0, (Math.sqrt(3) - 1 + delta)/2, 0);
    var p2 = new Position3(1/2, (-1 + delta)/2, 0);
    var p3 = new Position3(-1/2, (-1 + delta)/2, 0);

    var m = middle3(p1, p2, p3);
    var edge = d(p1, p2);
    var topdir = new Vector3(0, 0, 1);

    //console.log(edge);
    topdir = topdir.scale( (Math.sqrt(6)/3)  * edge);
    var p4 = m.add_vector(topdir);

    //console.log(p1)
    //console.log(p2)
    //console.log(p3)
    //console.log(p4)

    var c = middle4(p1, p2, p3, p4);


    var m1 = middle3(p1, p2, p3);
    var vdown = m1.subtract_pos(c);

    var m2 = middle3(p1, p4, p2);
    var v2 = m2.subtract_pos(c);

    var m3 = middle3(p2, p4, p3);
    var v3 = m3.subtract_pos(c);

    var m4 = middle3(p3, p4, p1);
    var v4 = m4.subtract_pos(c);


    var fdown = new TetraFace(p1, p2, p3, vdown, 0);
    var f1 = new TetraFace(p1, p4, p2, v2, 1);
    var f2 = new TetraFace(p2, p4, p3, v3, 2);
    var f3 = new TetraFace(p3, p4, p1, v4, 3);

    var segment_queue = [fdown, f1, f2, f3];


    for(var i=0; i<numIterations; i++){
        var new_queue = [];
        while(segment_queue.length != 0){
            var newsegarr = BreakupSegment(segment_queue.shift());
            while(newsegarr.length != 0){
                new_queue.push(newsegarr.shift());
            }
            /*
            new_queue.push(newsegarr[0]);
            new_queue.push(newsegarr[1]);
            new_queue.push(newsegarr[2]);
            new_queue.push(newsegarr[3]);
            new_queue.push(newsegarr[4]);
            new_queue.push(newsegarr[5]);
            */
        }
        segment_queue = new_queue;
    }

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),

        vec3(255/255,182/255,193/255),
        vec3(255/255,165/255,0),
        vec3(139/255,0,139/255),
        vec3(139/255,69/255,19/255),

        vec3(0.0, 0.0, 0.0)
    ];
    console.log("ALPHA");
    var faces = segment_queue;
    for(var i = 0; i<faces.length; i++){
        var A = faces[i].A;
        var B = faces[i].B;
        var C = faces[i].C;
        var color = faces[i].color;
        var va = vec3(A.x, A.y, A.z);
        var vb = vec3(B.x, B.y, B.z);
        var vc = vec3(C.x, C.y, C.z);
        positions.push(va);
        positions.push(vb);
        positions.push(vc);


        if(colormode == 0 || colormode == 1){

            colors.push(baseColors[color % baseColors.length]);
            colors.push(baseColors[color % baseColors.length]);
            colors.push(baseColors[color % baseColors.length]);

        } else {
            /* USE UNIT VECTORS FOR COLOR */
            var ovec = faces[i].outwards_direction;
            var mag = Math.sqrt( ovec.x*ovec.x + ovec.y*ovec.y + ovec.z*ovec.z);

            var veccolor = vec3(ovec.x/mag, ovec.y/mag, ovec.z/mag);

            if(colormode == 3){
                veccolor = vec3(Math.sin(ovec.x/mag), Math.cos(ovec.y/mag), ovec.z/mag);
            }

            colors.push(veccolor);
            colors.push(veccolor);
            colors.push(veccolor);
        }

    }
    console.log(positions);
    console.log(colors);
    console.log("BETA");
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // enable hidden-surface removal

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
}
