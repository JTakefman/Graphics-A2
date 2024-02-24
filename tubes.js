/* Jordan Takefman 
   Assignment 1 Question 2
   300171459
*/

import * as THREE from 'three';
import { GUI } from "dat.gui";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
var globalT = 0;

/*
function a_x(t) {
	return t*2
}
function a_y(t) {
	return t*3
}
function a_s(t) {
	return t*5
}*/
let amplitudes = {a_s:1.0, a_y:1.0, a_x:1.0, alpha_s:1.0, alpha_y:1.0, alpha_x:1.0};

let frequencies = {w_s:0.0, w_x:0.0, w_y:0.0}
frequencies.w_s = 10;
frequencies.w_x = -1/2;
frequencies.w_y = 50;

let phase = {p_s:0.0, p_x:0.0, p_y:0.0}
phase.p_x = Math.PI;
phase.p_y = Math.PI;
phase.p_s = Math.PI;
var a_0 = 4;
var amplitudeCounter = 1;

class lissajousCurve extends THREE.Curve {
	constructor(w_x, w_y, w_s, p_x, p_y, p_s, scale) {
		super();
		// THREE.Curve.call(this);
		this.w_x = (w_x === undefined) ? 1 : w_x;
		this.w_y = (w_y === undefined) ? 1 : w_y;
		this.w_s = (w_s === undefined) ? 1 : w_s;

		this.p_x = (p_x === undefined) ? 3*Math.PI/2 : p_x;
		this.p_y = (p_y === undefined) ? 2*Math.PI : p_y;
		this.p_s = (p_s === undefined) ? 5*Math.PI : p_s;
		this.scale = (scale === undefined) ? 1 : scale;
	}
	getPoint(t) {
		var tx = Math.pow(amplitudes.alpha_x, amplitudeCounter)*a_0*Math.sin(this.w_x*t+this.p_x) + amplitudes.a_s*Math.sin(this.w_s*t+this.p_s);
		var ty = amplitudes.a_y*Math.sin(this.w_y*t+this.p_y);
		var tz = Math.cos(2 * t * Math.PI);
		return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
	}
};



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
renderer.autoClearColor = false;
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

var lissaPath = new lissajousCurve(frequencies.w_x, frequencies.w_y, frequencies.w_s);
var geometry = new THREE.TubeGeometry( lissaPath, segments, radius, radialSegments, false );
var lissajousMesh = new THREE.Mesh( geometry, material);

const headGeometry = new THREE.SphereGeometry( 0.125,100, 16);
var head = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial( { color: 0xADD8E6} ));
scene.add(head);


//Define and add the center sphere for the lookAt point
const lookAtPointGeometry = new THREE.SphereGeometry( 0.05,100, 16);
const lookAtMaterial = new THREE.MeshBasicMaterial({color: 0x0BDA51})
var lookAtPoint = new THREE.Mesh(lookAtPointGeometry, lookAtMaterial);

scene.add(lookAtPoint);
lookAtPoint.position.set(0,0,0);

//Define strucutres to hold data from certain guis
let orbitData = {radius:10, hAngle:0.0, vAngle:0.0};

//Create gui and add appropriate sliders
var gui= new GUI();

gui.add(amplitudes, "a_x", -10, 10).name("a_x");
gui.add(amplitudes, "a_y", -10, 10).name("a_y");
gui.add(amplitudes, "a_s", -10, 10).name("a_s");
gui.add(amplitudes, "alpha_x", 0, 1).name("alpha_x");
gui.add(amplitudes, "alpha_y", 0, 1).name("alpha_y");
gui.add(amplitudes, "alpha_s", 0, 1).name("alpha_s");

gui.add(frequencies, "w_x", -50, 50).name("w_x");
gui.add(frequencies, "w_y", -50, 50).name("w_y");
gui.add(frequencies, "w_s", -50, 50).name("w_s");
gui.add(phase, "p_s", -2*Math.PI, 2*Math.PI).name("p_x");
gui.add(phase, "p_y", -2*Math.PI, 2*Math.PI).name("p_y");
gui.add(phase, "p_s", -2*Math.PI, 2*Math.PI).name("p_s");

gui.add(lookAtPoint.position, "x", -10, 100).name("LookAtX");
gui.add(lookAtPoint.position, "y", -10, 10).name("LookAtY");
gui.add(lookAtPoint.position, "z", -10, 10).name("LookAtZ");
gui.add(orbitData, "radius", 0, 10).name("viewing radius");
gui.add(orbitData, "hAngle", -360, 360).name("horizontal angle");
gui.add(orbitData, "vAngle", -360, 360).name("vertical angle");

//const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(1,0,5);
camera2.position.set(2,5,3)
camera.lookAt(lookAtPoint.position);
camera2.lookAt(lookAtPoint.position);


function animate() {
	var curvePos = lissaPath.getPoint(globalT);
	//console.log("global T is ", globalT);
	//console.log("curvePos ", curvePos.x, curvePos.y, curvePos.z);
	head.position.set(curvePos.x, curvePos.y, curvePos.z);
	globalT = (globalT >= 1) ? 0 : globalT += 0.002;
	amplitudeCounter = (amplitudeCounter >= 1) ? 0 : amplitudeCounter += 0.002;
	//console.log("current w_s is ", frequencies.w_s, " and curve w_s is ", lissaPath.w_x);
	lissajousMesh.removeFromParent();
	//console.log("a_s: ", amplitudes.a_s);
	lissaPath.w_s = frequencies.w_s;
	lissaPath.w_x = frequencies.w_x;
	lissaPath.w_y = frequencies.w_y;

	lissaPath.p_s = phase.p_s;
	lissaPath.p_x = phase.p_x;
	lissaPath.p_y = phase.p_y;
	geometry = new THREE.TubeGeometry( lissaPath, segments, radius, radialSegments, false );
	lissajousMesh = new THREE.Mesh( geometry, material);
	//lissaGroup.add(lissajousMesh);
	renderer.setViewport(0, 0, window.innerWidth*.5, window.innerHeight*.5);
	renderer.setScissor(0, 0, window.innerWidth*.5, window.innerHeight*.5);
	renderer.setScissorTest( true );
	renderer.render( scene, camera );
	renderer.setViewport( window.innerWidth*.5, window.innerHeight*0.5, window.innerWidth*.5, window.innerHeight*0.5,)
	renderer.setScissor( window.innerWidth*.5, window.innerHeight*0.5, window.innerWidth*.5, window.innerHeight*0.5);
	renderer.setScissorTest( true );
	renderer.render( scene, camera2 );
	requestAnimationFrame( animate );
}

animate();