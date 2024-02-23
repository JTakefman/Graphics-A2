/* Jordan Takefman 
   Assignment 1 Question 2
   300171459
*/

import * as THREE from 'three';
import { GUI } from "dat.gui";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
var globalT = 0;

class lissajousCurve extends THREE.Curve {
	constructor(aSpeed, bSpeed, delta, scale) {
		super();
		// THREE.Curve.call(this);
		this.aSpeed = (aSpeed === undefined) ? 1 : aSpeed;
		this.bSpeed = (bSpeed === undefined) ? 1 : bSpeed;
		this.delta = (delta === undefined) ? 0 : delta;
		this.scale = (scale === undefined) ? 1 : scale;
	}
	getPoint(t) {
		var tx = Math.cos(this.aSpeed * 2 * t * Math.PI + this.delta);
		var ty = Math.sin(this.bSpeed * 2 * t * Math.PI);
		var tz = Math.cos(2 * t * Math.PI);
		return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
	}
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Add axes to help visualization
var axes = new THREE.AxesHelper(20);
scene.add(axes);

var segments = 100;
var radius = 0.05;
var radialSegments = 8;
const material = new THREE.MeshBasicMaterial( { color: 0xFFA500} );

var lissaPath = new lissajousCurve( 5, 4 );
var geometry = new THREE.TubeGeometry( lissaPath, segments, radius, radialSegments, false );
var lissajousMesh = new THREE.Mesh( geometry, material);
scene.add(lissajousMesh);

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
gui.add(lookAtPoint.position, "x", -10, 10).name("LookAtX");
gui.add(lookAtPoint.position, "y", -10, 10).name("LookAtY");
gui.add(lookAtPoint.position, "z", -10, 10).name("LookAtZ");
gui.add(orbitData, "radius", 0, 10).name("viewing radius");
gui.add(orbitData, "hAngle", -360, 360).name("horizontal angle");
gui.add(orbitData, "vAngle", -360, 360).name("vertical angle");

//const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0,0,5);
camera.lookAt(lookAtPoint.position);

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

	var yAxis = new THREE.Vector3(0,1,0);
	var xAxis = new THREE.Vector3(1,0,0);

	//Adjust camera angle based on horizontal and vertical rotation angles
	//And adjust camera position accordingly
	var cameraOverwatch = new THREE.Vector3(0,0,orbitData.radius);
	
	cameraOverwatch.applyAxisAngle(xAxis, THREE.MathUtils.degToRad(-orbitData.vAngle))
	cameraOverwatch.applyAxisAngle(yAxis, THREE.MathUtils.degToRad(orbitData.hAngle))

	var lookAtPos = new THREE.Vector3();
	lookAtPoint.getWorldPosition(lookAtPos);

	cameraOverwatch.setX(cameraOverwatch.x+lookAtPos.x);
	cameraOverwatch.setY(cameraOverwatch.y+lookAtPos.y);
	cameraOverwatch.setZ(cameraOverwatch.z+lookAtPos.z);

	camera.position.set(cameraOverwatch.x, cameraOverwatch.y, cameraOverwatch.z);
	camera.lookAt(lookAtPoint.position);

	var curvePos = lissaPath.getPoint(globalT);
	//console.log("global T is ", globalT);
	//console.log("curvePos ", curvePos.x, curvePos.y, curvePos.z);
	head.position.set(curvePos.x, curvePos.y, curvePos.z);
	globalT = (globalT >= 1) ? 0 : globalT += 0.002;
	//console.log("global T is ", globalT);
}

animate();