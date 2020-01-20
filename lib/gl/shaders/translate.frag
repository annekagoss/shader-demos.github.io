#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uRectDimensions;
uniform float uTime;
uniform vec2 uMouse;

#pragma glslify: rectangle = require('./common/rectangle.glsl');
#pragma glslify: circle = require('./common/circle.glsl');

vec2 translateInCircle(vec2 st) {
	vec2 translation = vec2(cos(uTime*0.001), sin(uTime*0.001));
	return st + translation*0.2;
}

vec2 translateWithMouse(vec2 st) {
	vec2 mouseSt = uMouse/uResolution;
	return st + (mouseSt * -1.) + vec2(.5, -.5);
}

vec3 overlapRectangles(float circleRect, float mouseRect) {
	if (mouseRect <= 0.0) return vec3(circleRect) * vec3(0, 0, 1);
	return vec3(mouseRect) * vec3(1, 0, 0);
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	vec2 circleSt = translateInCircle(st);
	vec2 mouseSt = translateWithMouse(st);
	float rect = rectangle(circleSt, uRectDimensions);
	float c = circle(mouseSt, vec2(.5), .25);
	vec3 color = overlapRectangles(rect, c);
	gl_FragColor = vec4(color, 1.0);
}