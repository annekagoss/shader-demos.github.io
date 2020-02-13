precision mediump float;

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform vec3 uLightPositionA;
uniform vec3 uLightPositionB;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;

varying vec3 vLighting;

vec3 calculateLighting() {
	vec4 normal = uModelViewMatrix * vec4(aVertexNormal, 1.);
	vec3 a = uLightColorA * max(dot(normal.xyz, normalize(uLightPositionA)), 0.0);
	vec3 b = uLightColorB * max(dot(normal.xyz, normalize(uLightPositionB)), 0.0);
	return a + b;
}

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vLighting = calculateLighting();
}