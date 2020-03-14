precision mediump float;

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute float aTextureAddress;
attribute vec3 aBarycentric;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLeftLightMatrix;

uniform vec3 uLightPositionA;
uniform vec3 uLightPositionB;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;

uniform float uSpecular;

varying vec3 vLighting;
varying float vSpecular;
varying vec2 vTextureCoord;
varying float vTextureAddress;
varying vec3 vBarycentric;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vNormalDirection;
varying vec4 vPositionFromLeftLight;

const vec3 eye = vec3(0, 0, 6); // TODO pass in camera position as uniform

#pragma glslify: calculateLighting = require('./common/lighting.glsl');
#pragma glslify: calculateSpecular = require('./common/specular.glsl');

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vec4 normalDirection = normalize(uNormalMatrix * vec4(aVertexNormal, 1.));
	vec3 lighting = calculateLighting(
		normalDirection,
		uLightPositionA,
		uLightPositionB,
		uLightColorA,
		uLightColorB
	);
	float specular = calculateSpecular(
		normalDirection,
		lighting,
		eye,
		uSpecular
	);
	vLighting = lighting;
	vSpecular = specular;
	vTextureCoord = aTextureCoord;
	vTextureAddress = aTextureAddress;
	vBarycentric = aBarycentric;
	vNormal = aVertexNormal;
	vPositionFromLeftLight = uLeftLightMatrix * uModelViewMatrix * aVertexPosition;
	
	// TOON
	vPosition = aVertexPosition * uModelViewMatrix;
	vNormalDirection = normalDirection;
}