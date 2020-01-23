#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;

#pragma glslify: SDFHexagram = require('./common/hexagram.glsl');

mat2 matRotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

vec2 rotate(vec2 _st, float angle) {
	_st -= vec2(.5);
	_st = matRotate2d(angle) * _st;
	_st += vec2(.5);
	return _st;
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float speedMultiplier = -0.001 * uSpeed;
	st = rotate(st, uTime*speedMultiplier);
	float pentagon = abs(SDFHexagram(st, .15)) - .01;
	float value = smoothstep(-0.0025, 0.0025, -pentagon);
	gl_FragColor = vec4(vec3(value), 1.0);
}