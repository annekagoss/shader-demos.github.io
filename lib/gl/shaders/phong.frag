#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying float vSpecular;
varying vec2 vTextureCoord;
varying float vTextureAddress;
varying vec3 vBarycentric;

uniform vec2 uResolution;
uniform int uMaterialType;
uniform sampler2D uDiffuse0;
uniform sampler2D uDiffuse1;

const float wireframeThickness = 0.01;
const vec3 wireframeColor = vec3(0.0);
const vec3 specularColor = vec3(1.0);

const float contrast = 1.5;

#pragma glslify: wireframe = require('./common/wireframe.glsl');

vec4 readTextures() {
  if (vTextureAddress == 0.) {
	return texture2D(uDiffuse0, vTextureCoord);
  } else if (vTextureAddress == 1.) {
	return texture2D(uDiffuse1, vTextureCoord);
  } else {
    return vec4(vec3(0.), 1.);
  }
}

vec3 phongLighting() {
	vec3 lighting = vLighting;
	lighting.r = pow(lighting.r, contrast);
	lighting.g = pow(lighting.g, contrast);
	lighting.b = pow(lighting.b, contrast);
	return lighting + (max(vSpecular, 0.0) * vLighting);
}

void main() {  
	vec2 st = gl_FragCoord.xy/uResolution;
	//0 PHONG
	if (uMaterialType == 0) {
		gl_FragColor = vec4(phongLighting(), 1.0);
		return;
	} else if (uMaterialType == 1) {
		vec4 texelColor = readTextures();
		gl_FragColor = vec4(texelColor.xyz * phongLighting(), texelColor.w);
	}
	//1 WIREFRAME
	else {
		gl_FragColor = wireframe(vBarycentric);
	}
	// 2 TEXTURE
	// 3 SHADOW MAP
	// 4 SHINY GLITCH
}