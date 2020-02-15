#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform int uFractal;
uniform int uOctaves;

const float SCALE= 3.0;
const float SPEED = 0.00025;

#pragma glslify: fractalNoise = require('./common/fractalNoise.glsl');

void main() {
	vec2 st = gl_FragCoord.xy/uResolution;
	st.x *= uResolution.x/uResolution.y;
	float value = fractalNoise(st, uTime*SPEED, uFractal, SCALE, uOctaves);
	gl_FragColor = vec4(vec3(value), 1.0);
}
