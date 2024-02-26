/* Jordan Takefman 
   Assignment 2
   300171459
*/

import * as THREE from 'three';
import { GUI } from "dat.gui";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
var globalT = 0;

let amplitudes = {a_s:1.0, a_y:1.0, a_x:1.0, alpha_s:1.0, alpha_y:1.0, alpha_x:1.0, alpha_z:1.0, expoScale:1.0};
let frequencies = {w_x:-18, w_y:21, w_s:-10, w_z:16}
let phase = {p_s:Math.PI, p_x:Math.PI, p_y:Math.PI, p_z:Math.PI}
var a_0 = 1;

class lissajousCurve extends THREE.Curve {
	constructor(w_x, w_y, w_s, w_z, p_x, p_y, p_s, p_z, scale) {
		super();
		// THREE.Curve.call(this);
		this.w_x = (w_x === undefined) ? 1 : w_x;
		this.w_y = (w_y === undefined) ? 1 : w_y;
		this.w_s = (w_s === undefined) ? 1 : w_s;
		this.w_z = (w_z === undefined) ? 1 : w_z;

		this.p_x = (p_x === undefined) ? 3*Math.PI/2 : p_x;
		this.p_y = (p_y === undefined) ? 2*Math.PI : p_y;
		this.p_s = (p_s === undefined) ? 5*Math.PI : p_s;
		this.p_z = (p_z === undefined) ? 7*Math.PI : p_z;
		this.scale = (scale === undefined) ? 1 : scale;
	}
	getPoint(t) {
		var tx = Math.pow(amplitudes.alpha_x, amplitudes.expoScale*t)*a_0*Math.sin(this.w_x*t+this.p_x)
				+Math.pow(amplitudes.alpha_s, amplitudes.expoScale*t)*a_0*Math.sin(this.w_s*t+this.p_s);
		
		var ty = Math.pow(amplitudes.alpha_y, amplitudes.expoScale*t)*a_0*Math.sin(this.w_y*t+this.p_y);
		var tz = Math.pow(amplitudes.alpha_z, amplitudes.expoScale*t)*a_0*Math.cos(this.w_z*t+this.p_z);
		return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
	}
};



const scene = new THREE.Scene();
scene.background=  {color: 0xFFA500};
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Declare the renderer and adjust so it doesn't clear the screen
const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
renderer.autoClear = false;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Add axes to help visualization
var axes = new THREE.AxesHelper(20);
scene.add(axes);
var segments = 100;
var radius = 0.05;
var radialSegments = 8;
const material = new THREE.MeshBasicMaterial( { color: 0xFFA500} );

var lissaGroup = new THREE.Group();
scene.add(lissaGroup);

//Create curve and ball
var lissaPath = new lissajousCurve(frequencies.w_x, frequencies.w_y, frequencies.w_s, frequencies.w_z);
//var geometry = new THREE.TubeGeometry( lissaPath, segments, radius, radialSegments, false );
//var lissajousMesh = new THREE.Mesh( geometry, material);

const headGeometry = new THREE.SphereGeometry( 0.125,100, 16);
var head = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial( { color: 0xADD8E6} ));
scene.add(head);

//Create gui and add appropriate controls
var gui= new GUI();
gui.add(amplitudes, "alpha_x", 0, 1, 0.001).name("alpha_x");
gui.add(amplitudes, "alpha_y", 0, 1, 0.001).name("alpha_y");
gui.add(amplitudes, "alpha_s", 0, 1, 0.001).name("alpha_s");
gui.add(amplitudes, "alpha_z", 0, 1, 0.001).name("alpha_z");
gui.add(amplitudes, "expoScale", 1, 10).name("expoScale");

gui.add(frequencies, "w_x", -50, 50).name("w_x");
gui.add(frequencies, "w_y", -50, 50).name("w_y");
gui.add(frequencies, "w_s", -50, 50).name("w_s");
gui.add(frequencies, "w_z", -50, 50).name("w_z");
gui.add(phase, "p_x", -2*Math.PI, 2*Math.PI).name("p_x");
gui.add(phase, "p_y", -2*Math.PI, 2*Math.PI).name("p_y");
gui.add(phase, "p_s", -2*Math.PI, 2*Math.PI).name("p_s");
gui.add(phase, "p_z", -2*Math.PI, 2*Math.PI).name("p_z");

var resetFlag = false;

function setFlag() {
	resetFlag = true;
}

function reset() {
	//console.log("calling reset");
	renderer.setClearColor( 0x000000, 0 );
	renderer.clear();
	globalT = 0;
}

gui.add({setFlag}, 'setFlag').name('Reset');
//const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0,0,5);
camera2.position.set(0,5,0)
camera.lookAt(0,0,0);
camera2.lookAt(0,0,0);


function animate() {
	//Get the curve position and move the ball to match.
	if (resetFlag) {
		reset();
	}
	var curvePos = lissaPath.getPoint(globalT);
	head.position.set(curvePos.x, curvePos.y, curvePos.z);
	//conditional to check if we've reached the end of the curve
	globalT = (globalT >= 1) ? 0 : globalT += 0.002;

	//Update frequencies
	lissaPath.w_s = frequencies.w_s;
	lissaPath.w_x = frequencies.w_x;
	lissaPath.w_y = frequencies.w_y;
	lissaPath.w_z = frequencies.w_z;

	lissaPath.p_s = phase.p_s;
	lissaPath.p_x = phase.p_x;
	lissaPath.p_y = phase.p_y;
	lissaPath.p_z = phase.p_z;

	//Set the viewports for top and side view and perform reset as needed
	renderer.setViewport(0, 0, window.innerWidth*.5, window.innerHeight*.5);
	renderer.setScissor(0, 0, window.innerWidth*.5, window.innerHeight*.5);
	renderer.setScissorTest( true );
	if (resetFlag) {
		reset();
	}
	renderer.render( scene, camera );
	renderer.setViewport( window.innerWidth*.5, window.innerHeight*0.5, window.innerWidth*.5, window.innerHeight*0.5,)
	renderer.setScissor( window.innerWidth*.5, window.innerHeight*0.5, window.innerWidth*.5, window.innerHeight*0.5);
	renderer.setScissorTest( true );
	if (resetFlag) {
		reset();
	}
	resetFlag = false;
	renderer.render( scene, camera2 );
	requestAnimationFrame( animate );
}

animate();