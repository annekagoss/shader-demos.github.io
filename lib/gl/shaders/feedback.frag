#ifdef GL_ES
precision mediump float;
#endif

const vec2 OFFSET = vec2(0.0, -0.01);
const float ALPHA = .9;

uniform vec2 uResolution;
uniform sampler2D frameBufferTexture0;

float circle(vec2 st) {
	float dist = distance(st, vec2(0.5));
	return smoothstep(dist - 0.005, dist, 0.25);
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float shape = circle(st);
	
	float frameBufferValue = texture2D(frameBufferTexture0, st + OFFSET).r * ALPHA;
	gl_FragColor = vec4(vec3(shape + frameBufferValue), 1.0);
}