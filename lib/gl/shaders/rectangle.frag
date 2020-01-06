#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uRectDimensions;

#pragma glslify: rectangle = require('./common/shapes.glsl');

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float value = rectangle(st, uRectDimensions);
	gl_FragColor = vec4(vec3(value), 1.0);
}
