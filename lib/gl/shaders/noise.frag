#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform int uFractal;
uniform int uOctaves;

const float SCALE= 3.0;
const float SPEED = 0.00025;
#pragma glslify: simplexNoise3d = require('./common/simplexNoise3d.glsl');

float fractalNoise (vec2 st, float time, int fractal) {
	st *= SCALE;
	
	if (fractal == 0) {
		return 0.5 + 0.25*simplexNoise3d(vec3(st, time));
	}
	
	float fractNoise = 0.0;
	mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
	const int maxOctaves = 10;
	float octaveScale = 1.;
	
	for (int i = 0; i < maxOctaves; i++) {
		if (i <= uOctaves) {
			octaveScale *= 0.5;
			fractNoise += octaveScale * simplexNoise3d( vec3(st, time) );
			st = m*st;
		}
		
	}
	
	return 0.5 + 0.5*fractNoise; // normalize
 }

void main() {
	vec2 st = gl_FragCoord.xy/uResolution;
	float value = fractalNoise(st, uTime*SPEED, uFractal);
	gl_FragColor = vec4(vec3(value), 1.0);
}
