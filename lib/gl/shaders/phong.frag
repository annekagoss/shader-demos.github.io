#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying float vSpecular;
// varying vec3 vBarycentric;

uniform vec2 uResolution;
uniform int uMaterialType;

const float wireframeThickness = 0.01;
const vec3 wireframeColor = vec3(0.0);
const vec3 specularColor = vec3(1.0);

#pragma glslify: wireframe = require('./common/wireframe.glsl');

void main() {  
	vec2 st = gl_FragCoord.xy/uResolution;
	// 0 PHONG
	if (uMaterialType == 0) {
		vec3 phongLighting = vLighting + (vSpecular * vLighting);
		gl_FragColor = vec4(phongLighting, 1.0);
		return;
	}
	// 1 WIREFRAME
	// } else {
	// 	gl_FragColor = wireframe(vBarycentric);
	// }
	// 2 TEXTURE
	// 3 SHADOW MAP
	// 4 SHINY GLITCH
}