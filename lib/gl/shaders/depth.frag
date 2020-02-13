#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying vec3 vBarycentric;

uniform vec2 uResolution;
uniform int uMaterialType;

const float wireframeThickness = 0.01;
const vec3 wireframeColor = vec3(0.0);


float antiAliasStep (float threshold, float dist) {
  return smoothstep(threshold - 0.001, threshold + 0.001, dist);
}

/*
Adapted from Stylized Wireframe Rendering in WebGL
Matt DesLauriers
https://github.com/mattdesl/webgl-wireframes
https://www.pressreader.com/australia/net-magazine/20171005/282853666142801
*/
vec4 wireframe() {
	float barycentricSDF = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
	float edge = 1.0 - smoothstep(wireframeThickness - 0.01, wireframeThickness + 0.01, barycentricSDF);
	return vec4(wireframeColor, edge);
}

void main() {  
	if (uMaterialType == 0) {
		gl_FragColor = vec4(vLighting, 1.0);
		return;
	} else if (uMaterialType == 1) {
		gl_FragColor = wireframe();
	} else {
		vec2 st = gl_FragCoord.xy/uResolution;
		gl_FragColor = vec4(st.x, st.y, 0.5, 1.0);
	}
}