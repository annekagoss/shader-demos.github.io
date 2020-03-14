#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;
varying float vSpecular;
varying vec2 vTextureCoord;
varying float vTextureAddress;
varying vec3 vBarycentric;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec4 vNormalDirection;

varying vec4 vPositionFromLeftLight;

uniform vec2 uResolution;
uniform int uMaterialType;
uniform sampler2D uDiffuse0;
uniform sampler2D uDiffuse1;
uniform int uDepthEnabled;
uniform sampler2D uDepthMap;
uniform vec3 uLightColorA;

const float wireframeThickness = 0.01;
const vec3 wireframeColor = vec3(0.0);
const vec3 specularColor = vec3(1.0);

#pragma glslify: wireframe = require('./common/wireframe.glsl');
#pragma glslify: shadow = require('./common/shadow-map.glsl');

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
	return lighting + (max(vSpecular, 0.0) * vLighting);
}

const vec3 eye = vec3(0, 0, 6); // TODO pass in camera position as uniform
const vec3 lightPosition = vec3(1, 0, 0);
const float diffuseThreshold = 0.1;
const vec3 unlitColor = vec3(.3);
const vec3 litColor = vec3(.75);
const float unlitOutlineThickness = 0.3;
const float litOutlineThickness = 0.1;
const vec3 outlineColor = vec3(0);
const float levels = 5.0;
const vec3 diffuseColor = vec3(1.0);

vec4 toonShading() {
	vec3 normalDirection = vNormalDirection.xyz;
	vec3 viewDirection = normalize(eye - vPosition.xyz);
	float attenuation;
	
	// Directional light
	attenuation = 1.0;
	vec3 lightDirection = normalize(lightPosition);
	vec3 fragmentColor = unlitColor;
	
	// // Diffuse illumiation
	// if (attenuation * max(0.0, dot(normalDirection, lightDirection)) >= diffuseThreshold) {
	// 	fragmentColor = litColor;
	// }
	
	// // Outline
	// if (
	// 	dot(viewDirection, normalDirection) <
	// 	mix(unlitOutlineThickness, litOutlineThickness, max(0.0, dot(normalDirection, lightDirection)))
	// ) {
	// 	fragmentColor = outlineColor;
	// }
	
	// // Highlights
	// bool lightSourceOnRightSide = attenuation * 
	// 	pow(
	// 		max(0.0, 
	// 			dot(
	// 				reflect(-lightDirection, normalDirection),
	// 				viewDirection
	// 			)
	// 		), 
	// 	10.0) > 0.5;

	// if (dot(normalDirection, lightDirection) > 0.0 && lightSourceOnRightSide) {
	// 	fragmentColor = vec3(1);
	// }
	
	// float diffuse = max(0.0, dot(lightDirection, normalDirection));
	// vec3 diffuseColor = diffuseColor * floor(diffuse * levels) * 1.0 / levels;
	
	// float edgeDetection = (dot(viewDirection, normalDirection) > 0.4) ? 1.0 : 0.0;
	// fragmentColor = vec3(edgeDetection);
	
	
	
	float lambert = dot(normalDirection, lightDirection);
	float halfLambert = 0.5 * lambert + 0.5;
	float toon = 0.5 * smoothstep(0.3, 0.31, lambert) + 0.5 + 0.5 * smoothstep(0.3, 0.31, halfLambert) + 0.5;
	float outline = smoothstep(0.2, 0.21, normalDirection.z);
	fragmentColor = outline * toon * unlitColor;
	
	bool lightSourceOnRightSide = attenuation * 
		pow(
			max(0.0, 
				dot(
					reflect(-lightDirection, normalDirection),
					viewDirection
				)
			), 
		10.0) > 0.8;
	if (dot(normalDirection, lightDirection) > 0.0 && lightSourceOnRightSide) {
		fragmentColor = vec3(1);
	}
	
	return vec4(fragmentColor, 1.0);
}

void main() {  
	vec2 st = gl_FragCoord.xy/uResolution;
	
	// // 0 PHONG
	// if (uMaterialType == 0) {
	// 	gl_FragColor = vec4(phongLighting(), 1.0);
	// // 1 TEXTURE
	// } else if (uMaterialType == 1) {
	// 	vec4 texelColor = readTextures();
	// 	gl_FragColor = vec4(texelColor.xyz * phongLighting(), texelColor.w);
	// }
	// // 2 TOON
	// else if (uMaterialType == 2) {
		gl_FragColor = toonShading();
	// }
	// // 3 WIREFRAME
	// else {
	// 	gl_FragColor = wireframe(vBarycentric);
	// }

	// 4 SHINY GLITCH
}