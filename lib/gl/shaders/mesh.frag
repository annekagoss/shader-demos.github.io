#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying vec3 vBarycentric;
varying vec3 vVertexPosition;

uniform vec2 uResolution;
uniform int uMaterialType;

const float wireframeThickness = 0.01;
const vec3 wireframeColor = vec3(0.0);

/*
Adapted from Stylized Wireframe Rendering in WebGL
Matt DesLauriers
https://github.com/mattdesl/webgl-wireframes
https://www.pressreader.com/australia/net-magazine/20171005/282853666142801
*/
float antiAliasStep (float threshold, float dist) {
  return smoothstep(threshold - 0.001, threshold + 0.001, dist);
}

vec4 wireframe() {
	float barycentricSDF = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
	float edge = 1.0 - smoothstep(wireframeThickness - 0.01, wireframeThickness + 0.01, barycentricSDF);
	return vec4(wireframeColor, edge);
}

void main() {  
	if (uMaterialType == 0) {
		gl_FragColor = vec4(vVertexPosition, 1.0);
		return;
	} else if (uMaterialType == 1) {
		gl_FragColor = vec4(vLighting, 1.0);
	} else {
		gl_FragColor = wireframe();
	}
}