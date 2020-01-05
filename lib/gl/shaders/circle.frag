#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uRadius;
uniform vec2 uCenter;
uniform int uSmooth;

float circle(vec2 st) {
	float dist = distance(st, uCenter);
	if (uSmooth == 1) {
		return smoothstep(dist - 0.005, dist, uRadius);
	}
	return step(dist, uRadius);
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float value = circle(st);
	gl_FragColor = vec4(vec3(value), 1.0);
}