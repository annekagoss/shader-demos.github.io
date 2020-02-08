#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D frameBufferTexture0;

float circle(vec2 st) {
	float dist = distance(st, vec2(0.5));
	return smoothstep(dist - 0.005, dist, 0.25);
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float value = circle(st);
	vec2 offset = vec2(0.25, 0.0);
	float frameBufferValue = texture2D(frameBufferTexture0, st + offset).r;
	gl_FragColor = vec4(vec3(value + frameBufferValue), 1.0);
}