#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uRectDimensions;
uniform float uTime;

#pragma glslify: rectangle = require('./common/shapes.glsl');

vec2 translate(vec2 st) {
	vec2 translation = vec2(cos(uTime*0.001), sin(uTime*0.001));
	return st + translation*0.2;
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	st = translate(st);
	float value = rectangle(st, uRectDimensions);
	gl_FragColor = vec4(vec3(value), 1.0);
}