#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uScale;

#pragma glslify: SDFPentagon = require('./common/pentagon.glsl');

mat2 matScale(vec2 scale){
    return mat2(
		scale.x, 0.0,
        0.0, scale.y
	);
}

vec2 scale(vec2 _st, vec2 scale) {
	_st -= vec2(.5);
	_st = matScale(1.0 / scale) * _st;
	_st += vec2(.5);
	return _st;
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	st = scale(st, uScale);
	float pentagon = abs(SDFPentagon(st, .25)) - .01;
	float value = smoothstep(-0.0025, 0.0025, -pentagon);
	gl_FragColor = vec4(vec3(value), 1.0);
}